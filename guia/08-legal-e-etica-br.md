# Legal e Ética para Agentes de IA — Kit Brasil 2026

**AVISO IMPORTANTE:** Este guia apresenta informações gerais sobre regulação de IA no Brasil. NÃO constitui aconselhamento jurídico. Consulte advogado especializado em LGPD/CDC antes de colocar um agente em produção com clientes reais.

**Data de verificação:** 27 de outubro de 2026 (correções em 28/10/2026). Fontes: normas oficiais e veículos que as citam; o selo de cada item está em `guia/08-referencias.md`. Normas mudam: confirme na fonte antes de agir.

---

## RESUMO PARA A IA (leia só isto; o resto é referência para o dono)
1. Diga ao cliente que é atendimento automático e ofereça humano quando ele pedir.
2. Base legal de cada uso de dado anotada (LGPD art. 7º). Dado de saúde e outros sensíveis: art. 11, sem "interesse legítimo".
3. Colete o mínimo e apague o que não precisa (art. 6º).
4. Dados para fora do Brasil (Claude API, Supabase, Stripe): cláusulas-padrão da Res. ANPD 19/2024 ou outro mecanismo do art. 33. O prazo de adequação venceu em 23/08/2025.
5. Incidente com risco: comunicar ANPD e titulares em 3 dias úteis (pequeno porte: em dobro).
6. Nada de promessa de resultado, preço inventado ou propaganda enganosa (CDC).
7. Saúde: a IA não comunica diagnóstico nem conduta; quem decide é o profissional.
8. Advocacia: revisão humana integral de tudo que a IA produz; nunca confiar só no automático.
9. WhatsApp: API oficial, opt-in para mensagens ativas, IA como atendente da sua empresa (não como produto).
10. Contato ativo: só com lista do dono e opção de sair (veja `cerebro/processos/contato-ativo.md`).
11. Decisão automatizada que afeta a pessoa: ela pode pedir revisão (art. 20).
12. Em dúvida: rascunho para o dono, nunca envio. Não é aconselhamento jurídico: o dono consulta um advogado.

## CHECKLIST DO DONO (antes de o agente falar com cliente real)
Uma linha por item: o que conferir, a norma e o link oficial.

- [ ] **1. Consentimento:** há política de privacidade ou aceite (checkbox) registrado? Marco Civil, art. 7º, IX — https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
- [ ] **2. Transparência:** o agente avisa que é IA no início da conversa? CDC, art. 6º, III — https://www.planalto.gov.br/ccivil_03/leis/l8078.htm
- [ ] **3. Escalação:** o cliente consegue pedir uma pessoa e o agente passa a conversa? LGPD, art. 20 (revisão por pessoa é boa prática) — https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- [ ] **4. Base legal:** cada uso de dado tem base anotada (saúde: art. 11)? LGPD, arts. 7º e 11 — https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- [ ] **5. Guarda e EUA:** prazo de guarda definido e contrato do provedor com cláusulas-padrão? LGPD, art. 6º; Res. CD/ANPD 19/2024 — https://www.gov.br/anpd/pt-br
- [ ] **6. Decisão automatizada:** há limite, critério registrado e canal para pedir revisão? LGPD, art. 20 — https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- [ ] **7. Profissão regulada:** IA só como apoio, com revisão humana e sem ato privativo? CFM Res. 2.454/2026 (vigência 26/08/2026) — https://portal.cfm.org.br; OAB-SP, parecer do TED (número e data a confirmar) — https://www.oabsp.org.br; CFC e CFO: sem norma específica localizada
- [ ] **8. WhatsApp:** só clientes da empresa, escopo fechado, API oficial, opt-in para mensagem ativa? Política da Meta (vigência 15/01/2026; conforme veículos) — https://developers.facebook.com/docs/whatsapp/
- [ ] **9. Acesso e exclusão:** há formulário ou e-mail para cópia, eliminação e portabilidade? LGPD, art. 18 (resposta completa em até 15 dias, art. 19) — https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- [ ] **10. Incidente:** há plano para avisar ANPD e titulares no prazo do item 5 do resumo? Res. CD/ANPD 15/2024 (LGPD, art. 48) — https://www.gov.br/anpd/pt-br
- [ ] **11. Publicidade com IA:** conteúdo ou avatar de IA está identificado? CONAR, guia de influenciadores (maio/2026, vigência 01/06/2026; conforme divulgado) — https://conar.org.br
- [ ] **12. Voz e rosto:** há autorização escrita da pessoa? Código Civil, art. 20 — https://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm

**Ainda não é lei:** PL 2338/2023 (Marco Legal de IA), em análise na Câmara em 27/10/2026 — https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2487262

Detalhes e fontes: guia/08-referencias.md
