"""O cérebro do Alfred atrás de uma porta só: pensar(mensagens, ferramentas).

Trocar de cérebro (modelo local pelo Ollama hoje; Groq ou Claude depois) é
escrever outro adaptador com o mesmo pensar(). O resto do Alfred não muda.

Mensagens têm o formato comum a todos os provedores:
    [{"role": "system" | "user" | "assistant" | "tool", "content": "..."}]
"""
from __future__ import annotations

import http.client
import ipaddress
import json
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Any, Callable, Protocol
from urllib.parse import urlsplit


class ErroCerebro(Exception):
    """Falha ao falar com o cérebro. A mensagem é escrita para a pessoa ler."""

    def __init__(self, mensagem: str, codigo: int | None = None, detalhe: str = "") -> None:
        super().__init__(mensagem)
        self.codigo = codigo    # código HTTP, quando o cérebro chegou a responder
        self.detalhe = detalhe  # o que o cérebro disse, sem tradução


@dataclass
class Resposta:
    texto: str
    modelo: str
    chamadas: list[dict[str, Any]] = field(default_factory=list)  # ferramentas que o modelo pediu
    tokens_entrada: int = 0
    tokens_saida: int = 0
    custo_usd: float = 0.0
    segundos: float = 0.0
    motivo_parada: str = ""


class Cerebro(Protocol):
    nome: str
    modelo: str

    def pensar(
        self,
        mensagens: list[dict[str, Any]],
        ferramentas: list[dict[str, Any]] | None = None,
        ao_trecho: Callable[[str], None] | None = None,
    ) -> Resposta: ...

    def checar(self) -> dict[str, Any]: ...


# O Ollama mora neste computador: a conversa com ele nunca passa por proxy.
_SEM_PROXY = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def _eh_deste_computador(url: str) -> bool:
    host = urlsplit(url).hostname or ""
    if host == "localhost":
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


def _com_tag(nome: str) -> str:
    return nome if ":" in nome.rsplit("/", 1)[-1] else nome + ":latest"


class CerebroOllama:
    """Modelo local servido pelo Ollama. Nada sai do computador."""

    nome = "ollama"

    def __init__(
        self,
        modelo: str,
        url: str = "http://127.0.0.1:11434",
        tempo_limite_s: float = 300,
        pensar: bool | str | None = None,
        permitir_remoto: bool = False,
    ) -> None:
        partes = urlsplit(url)
        if partes.scheme not in ("http", "https") or not partes.hostname:
            raise ErroCerebro(f"Endereço do Ollama inválido: {url!r}. O padrão é http://127.0.0.1:11434.")
        if not permitir_remoto and not _eh_deste_computador(url):
            raise ErroCerebro(
                f"O cérebro local precisa estar neste computador, mas o endereço configurado é {url}. "
                "Se eu usasse esse endereço, suas conversas sairiam do seu PC. "
                "Volte para http://127.0.0.1:11434 no config.toml."
            )
        self.modelo = modelo
        self.url = url.rstrip("/")
        self.tempo_limite_s = tempo_limite_s
        self.pensar_modo = pensar

    # ---- conversa com o Ollama -------------------------------------------------

    def _abrir(self, caminho: str, corpo: dict[str, Any] | None = None):
        dados = json.dumps(corpo).encode("utf-8") if corpo is not None else None
        pedido = urllib.request.Request(
            self.url + caminho,
            data=dados,
            headers={"Content-Type": "application/json"},
            method="POST" if dados is not None else "GET",
        )
        return _SEM_PROXY.open(pedido, timeout=self.tempo_limite_s)

    def _erro_http(self, e: urllib.error.HTTPError) -> ErroCerebro:
        try:
            detalhe = str(json.loads(e.read().decode("utf-8", "replace")).get("error", ""))
        except Exception:
            detalhe = ""
        if e.code == 404 and "not found" in detalhe.lower():
            return ErroCerebro(
                f"O modelo {self.modelo} não está baixado neste computador. "
                f"Para baixar, rode: ollama pull {self.modelo}",
                codigo=e.code,
                detalhe=detalhe,
            )
        return ErroCerebro(
            f"O Ollama respondeu com erro {e.code}: {detalhe or e.reason}", codigo=e.code, detalhe=detalhe
        )

    def _erro_rede(self, e: Exception) -> ErroCerebro:
        motivo = getattr(e, "reason", e)
        if isinstance(motivo, TimeoutError) or isinstance(e, TimeoutError):
            return ErroCerebro(
                f"O cérebro demorou mais de {self.tempo_limite_s:g} segundos e eu parei de esperar. "
                "O modelo pode ser pesado demais para este computador."
            )
        if isinstance(motivo, ConnectionRefusedError):
            return ErroCerebro(
                f"Não consegui falar com o Ollama em {self.url}. Ele está aberto? "
                "Abra o Ollama pelo menu Iniciar e tente de novo."
            )
        return ErroCerebro(f"A conversa com o Ollama em {self.url} falhou: {motivo}")

    def _json(self, caminho: str) -> dict[str, Any]:
        try:
            with self._abrir(caminho) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            raise self._erro_http(e) from None
        except (urllib.error.URLError, OSError, http.client.HTTPException) as e:
            raise self._erro_rede(e) from None
        except json.JSONDecodeError:
            raise ErroCerebro(f"O que atendeu em {self.url} não parece ser o Ollama.") from None

    def _conversar(
        self, corpo: dict[str, Any], ao_trecho: Callable[[str], None] | None
    ) -> tuple[dict[str, Any], str, list[dict[str, Any]]]:
        """Devolve (último pedaço com as contagens, texto completo, chamadas de ferramenta)."""
        texto: list[str] = []
        brutas: list[dict[str, Any]] = []
        final: dict[str, Any] = {}
        try:
            with self._abrir("/api/chat", corpo) as r:
                for linha in r:
                    linha = linha.strip()
                    if not linha:
                        continue
                    parte = json.loads(linha.decode("utf-8"))
                    if parte.get("error"):
                        raise ErroCerebro(f"O Ollama parou no meio da resposta: {parte['error']}")
                    msg = parte.get("message") or {}
                    trecho = msg.get("content") or ""
                    if trecho:
                        texto.append(trecho)
                        if ao_trecho is not None:
                            ao_trecho(trecho)
                    brutas.extend(msg.get("tool_calls") or [])
                    if parte.get("done"):
                        final = parte
        except urllib.error.HTTPError as e:
            raise self._erro_http(e) from None
        except (urllib.error.URLError, OSError, http.client.HTTPException) as e:
            raise self._erro_rede(e) from None
        except json.JSONDecodeError:
            raise ErroCerebro("O Ollama mandou uma resposta que eu não consegui ler.") from None
        if not final:
            raise ErroCerebro("O Ollama cortou a resposta antes do fim.")
        return final, "".join(texto), [_chamada(c) for c in brutas]

    # ---- a porta única ---------------------------------------------------------

    def pensar(
        self,
        mensagens: list[dict[str, Any]],
        ferramentas: list[dict[str, Any]] | None = None,
        ao_trecho: Callable[[str], None] | None = None,
    ) -> Resposta:
        corpo: dict[str, Any] = {
            "model": self.modelo,
            "messages": mensagens,
            "stream": ao_trecho is not None,
        }
        if ferramentas:
            corpo["tools"] = ferramentas
        if self.pensar_modo is not None:
            corpo["think"] = self.pensar_modo

        inicio = time.monotonic()
        try:
            final, texto, chamadas = self._conversar(corpo, ao_trecho)
        except ErroCerebro as e:
            # Nem todo modelo aceita o ajuste de raciocínio. Se foi isso, tenta sem ele.
            if "think" not in corpo or e.codigo != 400 or "think" not in e.detalhe.lower():
                raise
            corpo.pop("think")
            self.pensar_modo = None
            final, texto, chamadas = self._conversar(corpo, ao_trecho)

        return Resposta(
            texto=texto,
            modelo=final.get("model") or self.modelo,
            chamadas=chamadas,
            tokens_entrada=int(final.get("prompt_eval_count") or 0),
            tokens_saida=int(final.get("eval_count") or 0),
            custo_usd=0.0,  # modelo local: não há cobrança por uso
            segundos=time.monotonic() - inicio,
            motivo_parada=str(final.get("done_reason") or ""),
        )

    def checar(self) -> dict[str, Any]:
        """Confere se o Ollama atende e se o modelo configurado está baixado."""
        versao = str(self._json("/api/version").get("version", "?"))
        modelos = [m.get("name") or m.get("model") or "" for m in self._json("/api/tags").get("models", [])]
        alvo = _com_tag(self.modelo)
        return {
            "versao": versao,
            "modelos": modelos,
            "modelo_ok": any(_com_tag(m) == alvo for m in modelos if m),
        }


def _chamada(bruta: dict[str, Any]) -> dict[str, Any]:
    funcao = bruta.get("function") or {}
    argumentos = funcao.get("arguments") or {}
    if isinstance(argumentos, str):
        try:
            argumentos = json.loads(argumentos)
        except json.JSONDecodeError:
            raise ErroCerebro("O modelo pediu uma ferramenta com argumentos que eu não consegui ler.") from None
    return {"nome": funcao.get("name", ""), "argumentos": argumentos}


def criar(cfg: dict[str, Any]) -> Cerebro:
    """Monta o cérebro a partir da seção [cerebro] do config.toml."""
    provedor = cfg.get("provedor", "ollama")
    if provedor != "ollama":
        raise ErroCerebro(f"Não conheço o cérebro {provedor!r}. Por enquanto só existe \"ollama\".")
    if not cfg.get("modelo"):
        raise ErroCerebro("Falta escolher o modelo na seção [cerebro] do config.toml.")
    return CerebroOllama(
        modelo=cfg["modelo"],
        url=cfg.get("url", "http://127.0.0.1:11434"),
        tempo_limite_s=cfg.get("tempo_limite_s", 300),
        pensar=cfg.get("pensar"),
        permitir_remoto=bool(cfg.get("permitir_remoto", False)),
    )
