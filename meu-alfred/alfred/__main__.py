"""Comandos do Alfred no terminal.

    python -m alfred checar   confere se o cérebro está pronto
    python -m alfred oi       faz a chamada de teste da Fase 0
"""
from __future__ import annotations

import argparse
import sys
from typing import Any

from . import config
from .cerebro import ErroCerebro, criar

PERGUNTA_DE_TESTE = "Diga oi em uma frase curta."


def _numero(valor: float, casas: int = 1) -> str:
    return f"{valor:.{casas}f}".replace(".", ",")


def _checar(cfg: dict[str, Any]) -> int:
    cerebro = criar(cfg["cerebro"])
    estado = cerebro.checar()
    print(f"Ollama: OK (versão {estado['versao']}) em {cfg['cerebro'].get('url', 'http://127.0.0.1:11434')}")
    print("Modelos baixados: " + (", ".join(estado["modelos"]) or "nenhum"))
    if not estado["modelo_ok"]:
        print(f"Modelo do Alfred ({cerebro.modelo}): FALTA BAIXAR")
        print(f"Para baixar, rode: ollama pull {cerebro.modelo}")
        return 1
    print(f"Modelo do Alfred ({cerebro.modelo}): OK")
    return 0


def _oi(cfg: dict[str, Any]) -> int:
    cerebro = criar(cfg["cerebro"])
    print(f"Cérebro: {cerebro.nome} · modelo {cerebro.modelo}")
    print(f'Perguntei: "{PERGUNTA_DE_TESTE}"')
    print("Esperando a resposta. A primeira vez demora mais: ele carrega o modelo na memória.")
    print("Alfred: ", end="", flush=True)

    def mostrar(trecho: str) -> None:
        print(trecho, end="", flush=True)

    try:
        resposta = cerebro.pensar([{"role": "user", "content": PERGUNTA_DE_TESTE}], ao_trecho=mostrar)
    finally:
        print()
    print(
        f"Tempo: {_numero(resposta.segundos)} s · tokens: {resposta.tokens_entrada} de entrada, "
        f"{resposta.tokens_saida} de saída · custo: US$ {_numero(resposta.custo_usd, 2)} (local)"
    )
    if not resposta.texto.strip():
        print("FALHOU: o cérebro atendeu, mas a resposta veio vazia.")
        return 1
    print("PASSOU: o cérebro local respondeu.")
    return 0


def main(argv: list[str] | None = None, cfg: dict[str, Any] | None = None) -> int:
    for saida in (sys.stdout, sys.stderr):
        if hasattr(saida, "reconfigure"):
            saida.reconfigure(encoding="utf-8", errors="replace")

    leitor = argparse.ArgumentParser(prog="alfred", description="Alfred, seu assistente pessoal.")
    comandos = leitor.add_subparsers(dest="comando", required=True)
    comandos.add_parser("checar", help="confere se o cérebro está pronto")
    comandos.add_parser("oi", help="faz a chamada de teste: o Alfred diz oi")
    args = leitor.parse_args(argv)

    try:
        cfg = cfg if cfg is not None else config.carregar()
        return {"checar": _checar, "oi": _oi}[args.comando](cfg)
    except ErroCerebro as e:
        print(f"FALHOU: {e}")
        return 1
    except KeyboardInterrupt:
        print("\nParado por você.")
        return 130


if __name__ == "__main__":
    sys.exit(main())
