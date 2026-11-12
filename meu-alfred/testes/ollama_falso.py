"""Um Ollama de mentira, só para os testes rodarem sem internet e sem modelo.

Imita o que a documentação do Ollama descreve para /api/version, /api/tags e
/api/chat (com e sem streaming). Não substitui o teste com o Ollama de verdade.
"""
from __future__ import annotations

import json
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any


class OllamaFalso:
    def __init__(
        self,
        modelos: tuple[str, ...] = ("qwen3:4b",),
        resposta: str = "Oi! Eu sou o Alfred.",
        raciocinio: str = "",
        chamadas: list[dict[str, Any]] | None = None,
        atraso_s: float = 0.0,
        recusa_think: bool = False,
        erro_no_meio: str = "",
        corta_antes_do_fim: bool = False,
    ) -> None:
        self.modelos = modelos
        self.resposta = resposta
        self.raciocinio = raciocinio
        self.chamadas = chamadas or []
        self.atraso_s = atraso_s
        self.recusa_think = recusa_think
        self.erro_no_meio = erro_no_meio
        self.corta_antes_do_fim = corta_antes_do_fim
        self.pedidos: list[dict[str, Any]] = []
        self._servidor: ThreadingHTTPServer | None = None

    def __enter__(self) -> "OllamaFalso":
        falso = self

        class Atendente(BaseHTTPRequestHandler):
            def log_message(self, *args: Any) -> None:  # silêncio nos testes
                pass

            def _json(self, codigo: int, corpo: dict[str, Any]) -> None:
                dados = json.dumps(corpo).encode("utf-8")
                self.send_response(codigo)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(dados)))
                self.end_headers()
                self.wfile.write(dados)

            def do_GET(self) -> None:
                if self.path == "/api/version":
                    self._json(200, {"version": "0.0.0-falso"})
                elif self.path == "/api/tags":
                    self._json(200, {"models": [{"name": m, "model": m} for m in falso.modelos]})
                else:
                    self._json(404, {"error": "not found"})

            def do_POST(self) -> None:
                corpo = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                falso.pedidos.append(corpo)
                if self.path != "/api/chat":
                    return self._json(404, {"error": "not found"})
                modelo = corpo.get("model", "")
                if modelo not in falso.modelos:
                    return self._json(404, {"error": f"model '{modelo}' not found"})
                if falso.recusa_think and "think" in corpo:
                    return self._json(400, {"error": f'"{modelo}" does not support thinking'})
                if falso.atraso_s:
                    time.sleep(falso.atraso_s)

                fim = {
                    "model": modelo,
                    "done": True,
                    "done_reason": "stop",
                    "prompt_eval_count": 12,
                    "eval_count": 7,
                }
                if not corpo.get("stream", True):
                    mensagem: dict[str, Any] = {"role": "assistant", "content": falso.resposta}
                    if falso.raciocinio:
                        mensagem["thinking"] = falso.raciocinio
                    if falso.chamadas:
                        mensagem["tool_calls"] = falso.chamadas
                    return self._json(200, {**fim, "message": mensagem})

                self.send_response(200)
                self.send_header("Content-Type", "application/x-ndjson")
                self.end_headers()

                def linha(obj: dict[str, Any]) -> None:
                    self.wfile.write(json.dumps(obj).encode("utf-8") + b"\n")
                    self.wfile.flush()

                if falso.raciocinio:
                    linha({"model": modelo, "message": {"role": "assistant", "content": "", "thinking": falso.raciocinio}, "done": False})
                palavras = falso.resposta.split(" ")
                for i, palavra in enumerate(palavras):
                    trecho = palavra if i == len(palavras) - 1 else palavra + " "
                    linha({"model": modelo, "message": {"role": "assistant", "content": trecho}, "done": False})
                    if falso.erro_no_meio and i == 0:
                        return linha({"error": falso.erro_no_meio})
                if falso.chamadas:
                    linha({"model": modelo, "message": {"role": "assistant", "content": "", "tool_calls": falso.chamadas}, "done": False})
                if falso.corta_antes_do_fim:
                    return
                linha({**fim, "message": {"role": "assistant", "content": ""}})

        class Servidor(ThreadingHTTPServer):
            def handle_error(self, request: Any, client_address: Any) -> None:
                pass  # quem perguntou desistiu de esperar: é o que alguns testes provocam

        self._servidor = Servidor(("127.0.0.1", 0), Atendente)
        threading.Thread(target=self._servidor.serve_forever, kwargs={"poll_interval": 0.01}, daemon=True).start()
        return self

    def __exit__(self, *args: Any) -> None:
        assert self._servidor is not None
        self._servidor.shutdown()
        self._servidor.server_close()

    @property
    def url(self) -> str:
        assert self._servidor is not None
        return f"http://127.0.0.1:{self._servidor.server_address[1]}"


def porta_fechada() -> str:
    """Um endereço local onde ninguém atende."""
    import socket

    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return f"http://127.0.0.1:{s.getsockname()[1]}"
