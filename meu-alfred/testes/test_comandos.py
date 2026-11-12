"""Testes dos comandos do terminal e das regras de arquivo da Fase 0."""
from __future__ import annotations

import contextlib
import io
import subprocess
import tempfile
import unittest
from pathlib import Path

from alfred import config
from alfred.__main__ import main
from testes.ollama_falso import OllamaFalso, porta_fechada

RAIZ = Path(__file__).resolve().parent.parent


def rodar(comando: str, url: str, modelo: str = "qwen3:4b") -> tuple[int, str]:
    saida = io.StringIO()
    with contextlib.redirect_stdout(saida):
        codigo = main([comando], cfg={"cerebro": {"provedor": "ollama", "modelo": modelo, "url": url}})
    return codigo, saida.getvalue()


class ComandoOi(unittest.TestCase):
    def test_passa_quando_o_cerebro_responde(self) -> None:
        with OllamaFalso(resposta="Oi! Tudo bem?") as falso:
            codigo, saida = rodar("oi", falso.url)
        self.assertEqual(codigo, 0)
        self.assertIn("Alfred: Oi! Tudo bem?", saida)
        self.assertIn("custo: US$ 0,00 (local)", saida)
        self.assertIn("PASSOU", saida)

    def test_falha_com_resposta_vazia(self) -> None:
        with OllamaFalso(resposta="") as falso:
            codigo, saida = rodar("oi", falso.url)
        self.assertEqual(codigo, 1)
        self.assertIn("FALHOU", saida)
        self.assertNotIn("PASSOU", saida)

    def test_falha_com_mensagem_clara_se_o_ollama_esta_fechado(self) -> None:
        codigo, saida = rodar("oi", porta_fechada())
        self.assertEqual(codigo, 1)
        self.assertIn("FALHOU: Não consegui falar com o Ollama", saida)
        self.assertNotIn("Traceback", saida)

    def test_falha_se_o_modelo_nao_foi_baixado(self) -> None:
        with OllamaFalso(modelos=()) as falso:
            codigo, saida = rodar("oi", falso.url)
        self.assertEqual(codigo, 1)
        self.assertIn("ollama pull qwen3:4b", saida)


class ComandoChecar(unittest.TestCase):
    def test_tudo_pronto(self) -> None:
        with OllamaFalso() as falso:
            codigo, saida = rodar("checar", falso.url)
        self.assertEqual(codigo, 0)
        self.assertIn("Ollama: OK", saida)
        self.assertIn("Modelo do Alfred (qwen3:4b): OK", saida)

    def test_falta_baixar_o_modelo(self) -> None:
        with OllamaFalso(modelos=("outro:1b",)) as falso:
            codigo, saida = rodar("checar", falso.url)
        self.assertEqual(codigo, 1)
        self.assertIn("FALTA BAIXAR", saida)
        self.assertIn("ollama pull qwen3:4b", saida)

    def test_ollama_fechado(self) -> None:
        codigo, saida = rodar("checar", porta_fechada())
        self.assertEqual(codigo, 1)
        self.assertIn("FALHOU: Não consegui falar com o Ollama", saida)


class Configuracao(unittest.TestCase):
    def test_config_do_projeto_aponta_para_este_computador(self) -> None:
        cerebro = config.carregar()["cerebro"]
        self.assertEqual(cerebro["provedor"], "ollama")
        self.assertEqual(cerebro["url"], "http://127.0.0.1:11434")

    def test_config_local_vale_mais(self) -> None:
        with tempfile.TemporaryDirectory() as pasta:
            raiz = Path(pasta)
            (raiz / "config.toml").write_text('[cerebro]\nmodelo = "a"\nurl = "http://127.0.0.1:11434"\n', encoding="utf-8")
            self.assertEqual(config.carregar(raiz)["cerebro"]["modelo"], "a")
            (raiz / "dados").mkdir()
            (raiz / "dados" / "config.toml").write_text('[cerebro]\nmodelo = "b"\n', encoding="utf-8")
            cerebro = config.carregar(raiz)["cerebro"]
        self.assertEqual(cerebro, {"modelo": "b", "url": "http://127.0.0.1:11434"})


class NadaSeuVaiParaOGit(unittest.TestCase):
    def test_git_ignora_dados_e_segredos(self) -> None:
        for caminho in ("dados/memoria.db", "dados/config.toml", "dados/perfil.md", ".env", ".env.local", ".venv/x"):
            r = subprocess.run(["git", "check-ignore", "-q", caminho], cwd=RAIZ)
            self.assertEqual(r.returncode, 0, f"{caminho} deveria ser ignorado pelo git")

    def test_git_nao_ignora_o_codigo(self) -> None:
        r = subprocess.run(["git", "check-ignore", "-q", "alfred/cerebro.py"], cwd=RAIZ)
        self.assertEqual(r.returncode, 1)


if __name__ == "__main__":
    unittest.main()
