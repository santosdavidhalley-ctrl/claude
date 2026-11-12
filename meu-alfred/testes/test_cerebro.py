"""Testes do cérebro local. Rodam sem internet, contra um Ollama de mentira."""
from __future__ import annotations

import unittest

from alfred.cerebro import CerebroOllama, ErroCerebro, criar
from testes.ollama_falso import OllamaFalso, porta_fechada

PERGUNTA = [{"role": "user", "content": "Diga oi em uma frase curta."}]


class Conversa(unittest.TestCase):
    def test_responde_de_uma_vez(self) -> None:
        with OllamaFalso(resposta="Oi! Eu sou o Alfred.") as falso:
            r = CerebroOllama("qwen3:4b", falso.url).pensar(PERGUNTA)
        self.assertEqual(r.texto, "Oi! Eu sou o Alfred.")
        self.assertEqual((r.tokens_entrada, r.tokens_saida), (12, 7))
        self.assertEqual(r.custo_usd, 0.0)
        self.assertEqual(r.motivo_parada, "stop")
        self.assertEqual(falso.pedidos[0]["messages"], PERGUNTA)
        self.assertIs(falso.pedidos[0]["stream"], False)

    def test_entrega_a_resposta_aos_poucos(self) -> None:
        trechos: list[str] = []
        with OllamaFalso(resposta="Oi! Eu sou o Alfred.") as falso:
            r = CerebroOllama("qwen3:4b", falso.url).pensar(PERGUNTA, ao_trecho=trechos.append)
        self.assertGreater(len(trechos), 1)
        self.assertEqual("".join(trechos), "Oi! Eu sou o Alfred.")
        self.assertEqual(r.texto, "Oi! Eu sou o Alfred.")
        self.assertEqual(r.tokens_saida, 7)

    def test_raciocinio_nao_entra_na_resposta(self) -> None:
        for aos_poucos in (False, True):
            trechos: list[str] = []
            with OllamaFalso(resposta="Oi!", raciocinio="A pessoa quer um oi.") as falso:
                r = CerebroOllama("qwen3:4b", falso.url).pensar(
                    PERGUNTA, ao_trecho=trechos.append if aos_poucos else None
                )
            self.assertEqual(r.texto, "Oi!")
            self.assertNotIn("quer um oi", "".join(trechos))

    def test_le_pedido_de_ferramenta(self) -> None:
        pedido = [{"function": {"name": "listar_pasta", "arguments": {"pasta": "Downloads"}}}]
        ferramentas = [{"type": "function", "function": {"name": "listar_pasta", "parameters": {}}}]
        for aos_poucos in (False, True):
            with OllamaFalso(resposta="", chamadas=pedido) as falso:
                r = CerebroOllama("qwen3:4b", falso.url).pensar(
                    PERGUNTA, ferramentas, ao_trecho=(lambda _: None) if aos_poucos else None
                )
            self.assertEqual(r.chamadas, [{"nome": "listar_pasta", "argumentos": {"pasta": "Downloads"}}])
            self.assertEqual(falso.pedidos[0]["tools"], ferramentas)

    def test_argumentos_em_texto_viram_dados(self) -> None:
        pedido = [{"function": {"name": "listar_pasta", "arguments": '{"pasta": "Downloads"}'}}]
        with OllamaFalso(resposta="", chamadas=pedido) as falso:
            r = CerebroOllama("qwen3:4b", falso.url).pensar(PERGUNTA)
        self.assertEqual(r.chamadas[0]["argumentos"], {"pasta": "Downloads"})


class AjusteDeRaciocinio(unittest.TestCase):
    def test_manda_o_ajuste_quando_configurado(self) -> None:
        with OllamaFalso() as falso:
            CerebroOllama("qwen3:4b", falso.url, pensar=False).pensar(PERGUNTA)
            CerebroOllama("qwen3:4b", falso.url).pensar(PERGUNTA)
        self.assertIs(falso.pedidos[0]["think"], False)
        self.assertNotIn("think", falso.pedidos[1])

    def test_modelo_que_nao_aceita_o_ajuste_responde_mesmo_assim(self) -> None:
        with OllamaFalso(recusa_think=True) as falso:
            cerebro = CerebroOllama("qwen3:4b", falso.url, pensar=False)
            r = cerebro.pensar(PERGUNTA)
            cerebro.pensar(PERGUNTA)
        self.assertEqual(r.texto, "Oi! Eu sou o Alfred.")
        # 1ª tentativa com o ajuste, 2ª sem; depois disso ele não insiste mais.
        self.assertEqual(["think" in p for p in falso.pedidos], [True, False, False])


class ErrosClaros(unittest.TestCase):
    def test_ollama_fechado(self) -> None:
        with self.assertRaises(ErroCerebro) as erro:
            CerebroOllama("qwen3:4b", porta_fechada()).pensar(PERGUNTA)
        self.assertIn("Não consegui falar com o Ollama", str(erro.exception))

    def test_modelo_nao_baixado(self) -> None:
        with OllamaFalso(modelos=("outro:1b",)) as falso:
            with self.assertRaises(ErroCerebro) as erro:
                CerebroOllama("qwen3:4b", falso.url).pensar(PERGUNTA)
        self.assertIn("ollama pull qwen3:4b", str(erro.exception))

    def test_demora_demais(self) -> None:
        with OllamaFalso(atraso_s=1.5) as falso:
            with self.assertRaises(ErroCerebro) as erro:
                CerebroOllama("qwen3:4b", falso.url, tempo_limite_s=0.3).pensar(PERGUNTA)
        self.assertIn("demorou mais de 0.3 segundos", str(erro.exception))

    def test_erro_no_meio_da_resposta(self) -> None:
        with OllamaFalso(erro_no_meio="out of memory") as falso:
            with self.assertRaises(ErroCerebro) as erro:
                CerebroOllama("qwen3:4b", falso.url).pensar(PERGUNTA, ao_trecho=lambda _: None)
        self.assertIn("out of memory", str(erro.exception))

    def test_resposta_cortada(self) -> None:
        with OllamaFalso(corta_antes_do_fim=True) as falso:
            with self.assertRaises(ErroCerebro) as erro:
                CerebroOllama("qwen3:4b", falso.url).pensar(PERGUNTA, ao_trecho=lambda _: None)
        self.assertIn("cortou a resposta", str(erro.exception))

    def test_outro_erro_do_ollama_nao_vira_segunda_tentativa(self) -> None:
        with OllamaFalso(modelos=("outro:1b",)) as falso:
            with self.assertRaises(ErroCerebro):
                CerebroOllama("qwen3:4b", falso.url, pensar=False).pensar(PERGUNTA)
        self.assertEqual(len(falso.pedidos), 1)


class NadaSaiDoComputador(unittest.TestCase):
    def test_recusa_endereco_de_fora(self) -> None:
        for url in ("http://example.com:11434", "http://192.168.0.10:11434", "https://api.exemplo.com"):
            with self.assertRaises(ErroCerebro) as erro:
                CerebroOllama("qwen3:4b", url)
            self.assertIn("sairiam do seu PC", str(erro.exception))

    def test_aceita_este_computador(self) -> None:
        for url in ("http://127.0.0.1:11434", "http://localhost:11434", "http://[::1]:11434"):
            CerebroOllama("qwen3:4b", url)

    def test_recusa_endereco_torto(self) -> None:
        for url in ("127.0.0.1:11434", "ftp://127.0.0.1", ""):
            with self.assertRaises(ErroCerebro):
                CerebroOllama("qwen3:4b", url)


class Checagem(unittest.TestCase):
    def test_modelo_baixado(self) -> None:
        with OllamaFalso(modelos=("qwen3:4b", "outro:1b")) as falso:
            estado = CerebroOllama("qwen3:4b", falso.url).checar()
        self.assertEqual(estado, {"versao": "0.0.0-falso", "modelos": ["qwen3:4b", "outro:1b"], "modelo_ok": True})

    def test_modelo_faltando(self) -> None:
        with OllamaFalso(modelos=("outro:1b",)) as falso:
            self.assertFalse(CerebroOllama("qwen3:4b", falso.url).checar()["modelo_ok"])

    def test_nome_sem_etiqueta_vale_latest(self) -> None:
        with OllamaFalso(modelos=("qwen3:latest",)) as falso:
            self.assertTrue(CerebroOllama("qwen3", falso.url).checar()["modelo_ok"])
            self.assertFalse(CerebroOllama("qwen3:4b", falso.url).checar()["modelo_ok"])

    def test_ollama_fechado(self) -> None:
        with self.assertRaises(ErroCerebro) as erro:
            CerebroOllama("qwen3:4b", porta_fechada()).checar()
        self.assertIn("Não consegui falar com o Ollama", str(erro.exception))


class Fabrica(unittest.TestCase):
    def test_monta_pelo_config(self) -> None:
        cerebro = criar({"provedor": "ollama", "modelo": "qwen3:4b", "pensar": False, "tempo_limite_s": 9})
        self.assertIsInstance(cerebro, CerebroOllama)
        self.assertEqual((cerebro.modelo, cerebro.url, cerebro.tempo_limite_s), ("qwen3:4b", "http://127.0.0.1:11434", 9))

    def test_provedor_desconhecido(self) -> None:
        with self.assertRaises(ErroCerebro) as erro:
            criar({"provedor": "magia", "modelo": "x"})
        self.assertIn("magia", str(erro.exception))

    def test_sem_modelo(self) -> None:
        with self.assertRaises(ErroCerebro):
            criar({"provedor": "ollama"})


if __name__ == "__main__":
    unittest.main()
