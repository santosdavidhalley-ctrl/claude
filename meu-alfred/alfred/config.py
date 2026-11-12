"""Lê a configuração do Alfred.

config.toml (no projeto) traz o padrão. dados/config.toml (só no computador da
pessoa, fora do git) pode trocar qualquer valor.
"""
from __future__ import annotations

import tomllib
from pathlib import Path
from typing import Any

RAIZ = Path(__file__).resolve().parent.parent
DADOS = RAIZ / "dados"


def _ler(arquivo: Path) -> dict[str, Any]:
    with arquivo.open("rb") as f:
        return tomllib.load(f)


def carregar(raiz: Path = RAIZ) -> dict[str, Any]:
    cfg = _ler(raiz / "config.toml")
    local = raiz / "dados" / "config.toml"
    if local.exists():
        for secao, valores in _ler(local).items():
            if isinstance(valores, dict) and isinstance(cfg.get(secao), dict):
                cfg[secao] = {**cfg[secao], **valores}
            else:
                cfg[secao] = valores
    return cfg
