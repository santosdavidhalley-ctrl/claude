# Legal e ética para agentes de IA — detalhes e fontes

Complemento de `guia/08-legal-e-etica-br.md` (resumo e checklist). **Não é aconselhamento jurídico.** Verificado em 27 de outubro de 2026 (correções em 28/10/2026). Normas mudam: confirme na fonte antes de agir.

Cada bloco traz um selo do que o kit realmente conferiu:
- **[norma]** lei ou resolução publicada, conferida pelo kit.
- **[espelho]** conferido só em cópia da norma (site que reproduz o texto); confirme no Diário Oficial.
- **[veículos]** só veículos que citam a fonte; leia o original antes de decidir.
- **[a confirmar]** número, data ou texto exato não conferidos.
- **[em tramitação]** ainda não é lei.
- **[não localizado]** o kit não encontrou norma específica.

Próxima revisão: quando o PL 2338/2023 for votado ou quando CFC/CFO publicarem normas sobre IA.

---

## A. Norma publicada

### LGPD (Lei 13.709/2018) [norma]
- **Bases legais (art. 7º):** só se trata dado pessoal com uma base do art. 7º. As mais comuns para agentes: art. 7º, V, contrato (execução de contrato do qual a pessoa é parte); art. 7º, IX, interesse legítimo (do controlador).
- **Direitos do titular (art. 18):** confirmação de que seus dados são tratados; acesso; correção de dados incompletos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários ou em desacordo com a lei; portabilidade (transferência dos dados a outro provedor); eliminação dos dados processados com consentimento revogado; informação sobre com quem os dados foram compartilhados; ciência sobre as consequências de negar consentimento; revogação do consentimento a qualquer momento.
- **Prazo de resposta (art. 19, I e II):** confirmação da existência de tratamento de forma imediata e em formato simplificado; declaração completa em até **15 dias**, contados do requerimento.
- **Decisão automatizada (art. 20):** o titular tem o **direito de solicitar a revisão** de decisões tomadas **unicamente com base em tratamento automatizado** de dados pessoais que afetem seus interesses, incluindo as destinadas a definir perfil pessoal, profissional, de consumo e de crédito. O controlador deve fornecer, quando solicitado, **informações claras e adequadas sobre os critérios e os procedimentos** usados (§1º). Se não o fizer alegando segredo comercial, a ANPD pode realizar auditoria (§2º).
- **Atenção:** a lei NÃO proíbe a decisão automatizada. A exigência de que a revisão seja feita por pessoa natural foi retirada da redação em 2019; ainda assim, a revisão humana é a boa prática mais segura.

Fonte: planalto.gov.br, Lei 13.709/2018, arts. 7º, 18, 19 e 20.

### Incidente de segurança (LGPD art. 48; Res. CD/ANPD nº 15/2024) [espelho]
A Resolução CD/ANPD nº 15, de 24 de abril de 2024 (publicada em 26 de abril de 2024), regulamenta a comunicação de incidente de segurança conforme o art. 48 da LGPD.
- **Quando comunicar:** só se o incidente puder causar **risco relevante ou dano** aos direitos fundamentais dos titulares (ex.: dados sensíveis, de autenticação, de menores de idade, em larga escala).
- **Prazo:** **3 dias úteis** para comunicar a ANPD (a contar do momento em que o controlador toma conhecimento de que o incidente afetou dados pessoais) e também para comunicar os titulares afetados (art. 9º).
- **Dois estágios:** sem todas as informações no prazo, envia-se comunicação preliminar; a complementação à ANPD pode vir em até **20 dias úteis** adicionais.
- **Pequeno porte:** agente de pequeno porte tem esses prazos **em dobro**.
- **Registro interno:** todo incidente, comunicado ou não, é registrado e guardado por no mínimo **5 anos**.
- **Conferência:** feita em espelho da norma (normasbrasil.com.br); confira o texto no DOU antes de uso jurídico.

Fonte: Resolução CD/ANPD nº 15/2024; LGPD art. 48.

### Transferência internacional (Res. CD/ANPD nº 19/2024) [norma]
A Resolução CD/ANPD nº 19, de 23 de agosto de 2024 (publicada no Diário Oficial em 23/08/2024), regulamenta a transferência internacional de dados para países sem decisão de adequação da ANPD (ex.: EUA).
- **Mecanismos:** para os EUA não há decisão de adequação, então valem os outros mecanismos do art. 33 da LGPD. O mais usado por empresa pequena são as **Cláusulas-Padrão Contratuais (SCCs)** do Anexo II da Resolução, que **devem ser adotadas integralmente, sem modificações**. Existem também cláusulas específicas, normas corporativas globais e consentimento específico e destacado do titular (art. 33, VIII).
- **Prazo de adequação:** o art. 2º, parágrafo único, deu **12 meses** a partir da publicação (23/08/2024) para incorporar as cláusulas-padrão aos contratos. **Venceu em 23/08/2025**: hoje é exigência, não transição.
- **Na prática (leitura do kit):** quem usa Claude API, Supabase (EUA), Stripe ou outro provedor baseado nos EUA precisa das SCCs do Anexo II ou de outro mecanismo do art. 33 no contrato de serviço.
- **Sanção:** multa de até **2% do faturamento** no Brasil no último exercício, limitada a **R$ 50 milhões por infração** (art. 52, II da LGPD), além de advertência, publicização e bloqueio dos dados.

Fonte: Resolução CD/ANPD nº 19/2024, Anexo II (Cláusulas-Padrão Contratuais).

### CDC (Lei 8.078/1990) [norma]
- **Art. 6º, III:** direito à "informação adequada e clara sobre os diferentes produtos e serviços, com especificação correta de quantidade, características, composição, qualidade, tributos incidentes e preço, bem como sobre os riscos que apresentem."
- **Art. 31:** "A oferta e apresentação de produtos ou serviços devem assegurar informações corretas, claras, precisas, ostensivas e em língua portuguesa sobre suas características, qualidades, quantidade, composição, preço, garantia, prazos de validade e origem, entre outros dados, bem como sobre os riscos que apresentam à saúde e segurança dos consumidores."
- **Art. 39, III:** "É vedado ao fornecedor… enviar ou entregar ao consumidor, sem solicitação prévia, qualquer produto, ou fornecer qualquer serviço."

Fonte: planalto.gov.br, Lei 8.078/1990, arts. 6, 31, 39.

### Marco Civil da Internet (Lei 12.965/2014) [norma]
- **Art. 7º, II:** direito à confidencialidade dos fluxos de comunicação na internet, "salvo por ordem judicial".
- **Art. 7º, VII:** o provedor não pode repassar dados pessoais a terceiros "sem que o titular dos dados tenha consentido previamente".
- **Art. 7º, IX:** direito a "consentimento expresso sobre coleta, uso, armazenamento e tratamento de dados pessoais", que deve ser separado de outras condições de contrato.

Fonte: planalto.gov.br, Lei 12.965/2014, art. 7º.

---

## B. Conforme veículos, fonte secundária ou a confirmar

### WhatsApp Business Platform: provedores de IA [veículos]
A Meta atualizou a política da WhatsApp Business Platform em **outubro de 2025**, com efeito em **15 de janeiro de 2026**.
- **Proibido:** provedores de IA cujo produto principal é IA generativa (ex.: ChatGPT, Perplexity). A Meta decide o que conta como "produto principal" ("as determined by Meta in its sole discretion"). Também é proibida a reutilização de dados do Business Solution para treinar ou melhorar outros modelos de IA.
- **Permitido:** bots estruturados de tarefa específica (agendamento, confirmação, FAQ) e IA própria integrada a negócios (banco, e-commerce, clínica, agência de viagens) para suporte a clientes, **desde que a IA não seja a funcionalidade principal**.
- **Exemplos citados pela imprensa:** ChatGPT, Perplexity, Luzia e Poke.
- **Termos da Meta:** a seção 4.7 ("Provedores de IA") proíbe quando a IA é a funcionalidade principal, não quando é auxiliar.
- **CADE [a confirmar]:** no Brasil essa regra foi questionada no CADE em 2026; o kit não tem a fonte. Confira a situação atual.

Fonte: política da Meta para a WhatsApp Business Platform (atualização de outubro de 2025, vigência 15/01/2026), conforme veículos que a citam (ex.: respond.io, Gulf News). Leia o texto original nos termos oficiais da Meta antes de decidir.

### CONAR: publicidade com IA [veículos]
O CONAR atualizou o Guia de Marketing e Publicidade por Influenciadores Digitais em **maio de 2026**, com efeitos a partir de **1º de junho de 2026** (conforme divulgado; confirme no site do CONAR).
- Conteúdos, avatares e influenciadores virtuais criados com IA devem ser transparentes.
- A identificação publicitária deve ser clara e imediata.
- Vale também para personas virtuais, animais, avatares ou personagens criados com IA.
- Perfis virtuais entram na definição de "influenciador digital".
- Links de afiliação com comissão passam a ser publicidade.
- Qualquer benefício não financeiro (doação, produto grátis etc.) ligado a conteúdo é publicidade.

Fonte: CONAR, Guia de Marketing e Publicidade por Influenciadores Digitais (maio de 2026).

### Medicina: CFM Resolução 2.454/2026 [norma publicada; a proibição vem de resumo secundário]
O Conselho Federal de Medicina publicou a Resolução nº 2.454 em **11 de fevereiro de 2026**, no Diário Oficial em **27 de fevereiro de 2026**, com vigência em **26 de agosto de 2026**.
- A IA é **ferramenta de apoio** e não substitui o médico.
- O médico continua responsável por diagnóstico, prognóstico e conduta terapêutica.
- **Proibido:** delegar à IA, sem mediação humana, a comunicação de diagnóstico, prognóstico ou decisão terapêutica ao paciente (resumo de fonte secundária; confira o texto do CFM).
- O paciente deve ser informado se a IA foi apoio relevante na decisão.
- Governança obrigatória: instituições devem estabelecer governança, classificar a IA por nível de risco e documentar; auditoria e monitoramento contínuo.

Fonte: CFM, Resolução 2.454/2026, publicada em 27/02/2026.

### Advocacia: parecer do TED da OAB-SP [a confirmar]
O Tribunal de Ética e Disciplina da OAB-SP divulgou, em **maio de 2026**, parecer sobre o uso de IA na prática jurídica. **Número e data exatos a confirmar.** O kit também registra uma decisão da OAB-SP de **16/04/2026**; a relação entre as duas datas não foi confirmada. O kit não abriu o texto integral.
- Revisão cuidadosa de qualquer resultado gerado por IA antes de usar.
- **Proibido:** confiar exclusivamente em resultados automatizados para argumentação.
- Análise humana obrigatória antes de submeter qualquer peça aos tribunais.
- Supervisão do uso de IA por associados, estagiários e assistentes.
- Boa prática (não está na decisão da OAB-SP de 16/04/2026): informar o cliente quando a IA foi usada e permitir que ele recuse.

Fonte: OAB-SP (texto e numeração no site da OAB-SP).

---

## C. Em tramitação e sem norma localizada

### PL 2338/2023, Marco Legal de IA [em tramitação]
- Aprovado pelo Senado em **dezembro de 2024** e enviado à Câmara dos Deputados em **17 de março de 2025**.
- **Status em 27/10/2026:** ainda em análise na Câmara; **sem confirmação de votação em plenário**. As últimas notícias encontradas são de maio/junho de 2026, quando a votação era "esperada", mas não estava agendada.
- Modelo baseado em **risco**, semelhante ao AI Act europeu (UE). Cria o Sistema Nacional de IA (SIA).
- Pendente há mais de um ano na Câmara: acompanhe a tramitação, pois pode sofrer alterações substanciais antes de ser votado.

Fonte: congressonacional.leg.br, tramitação oficial do PL 2338/2023.

### Contabilidade: CFC [não localizado]
Nenhuma resolução do CFC sobre IA publicada até outubro de 2026 foi localizada. O CFC mencionou planejar o uso de IA em buscas normativas, mas não há norma regulamentando o uso de IA por contadores ou empresas de contabilidade. Contate o CFC (cfc.org.br) ou um contador especializado em conformidade.

### Odontologia: CFO [não localizado]
Nenhuma resolução do CFO específica sobre IA foi localizada até outubro de 2026. Aplique por analogia os critérios da CFM Resolução 2.454/2026 (IA como apoio, revisão humana) e confirme com o conselho estadual de odontologia.

---

## D. Boas práticas e leitura do kit (opinião, não é lei)

- **Avisar que é IA.** No início de qualquer interação:
  ```
  "Olá! Sou um assistente automático. Posso ajudar com agendamento,
  FAQ, suporte e confirmações. Se preferir falar com uma pessoa,
  digite 'humano' ou 'quero falar com alguém'."
  ```
  Base: CDC art. 6º (informação clara). Ocultar que é IA viola esse direito.
- **Contato ativo.** Mensagens ativas (marketing, notificações) exigem consentimento expresso prévio; enviar mensagem ou conteúdo sem consentimento é abusivo. Guarde a prova de opt-in (data, aceite clicado, checkbox marcado), inclusive para WhatsApp, SMS e e-mail. Base: Marco Civil art. 7º; CDC art. 39, III.
- **Base legal por cliente.** Registre qual é: contrato (com cliente assinado), consentimento expresso (checkbox aceito, data registrada) ou interesse legítimo (documente o interesse, ex.: "avisar o cliente do status do pedido" numa loja). **Atenção, dado de saúde (clínica, consultório):** é dado sensível e segue o **art. 11** da LGPD, que **não aceita interesse legítimo**; use consentimento específico e destacado ou uma das hipóteses do art. 11, II (ex.: tutela da saúde em procedimento feito por profissional de saúde). Facilita auditoria e defesa em eventual disputa.
- **Decisão automatizada.** Se o agente recomenda preço, desconto, reembolso, aprovação ou recusa: defina o limite automático (ex.: reembolso até R$ 50), escale para uma pessoa acima dele, deixe o critério registrado, ofereça canal para pedir revisão e informe ao cliente que há limite e quando uma pessoa revisa. Base: LGPD art. 20.
- **Armazenamento.** Defina prazo de retenção (ex.: histórico guardado por 6 meses) e apague depois. Se usa provedor dos EUA (Supabase, Claude API via terceiro), confirme que o contrato inclui as SCCs da Res. ANPD 19/2024. Base: LGPD art. 6º (minimização).
- **Acesso, exclusão e portabilidade.** Ofereça formulário acessível no site ou app para o cliente pedir cópia dos dados, eliminação e transferência a outro provedor. Treine o agente a reconhecer o pedido e escalar para uma pessoa. Base: LGPD art. 18.
- **Incidente de segurança.** Plano em 5 passos: detectar (acessos não autorizados, vazamentos, falhas de autenticação); notificar a ANPD; comunicar os titulares afetados; corrigir a falha e documentar; guardar o relatório. Os prazos estão em A. Falha em comunicar = multa. Base: LGPD art. 48; Res. ANPD 15/2024.
- **WhatsApp.** Use bot de tarefa específica (agendamento, confirmação, FAQ estruturada). Não ofereça assistente de IA de propósito geral como o PRODUTO no WhatsApp. Atendente de IA da SUA empresa, com escopo fechado (agenda, FAQ, status) e opt-in, continua permitido. Reconheça "quero falar com humano" e escale. Base: política da Meta (jan/2026); LGPD art. 7º; Marco Civil art. 7º.
- **Publicidade com IA.** Identifique claramente ("Criado com IA", "Avatar gerado por IA"), com o aviso no início do vídeo ou post (primeiros 3 segundos). Em influenciador virtual ou avatar, o aviso deve ser tão claro quanto a marca. Base: CONAR, maio de 2026.
- **Voz e rosto sintetizados.** Com voz ou rosto de pessoa real: autorização escrita, com escopo definido (ex.: "autorizo uso em vídeo de marketing por 1 ano em redes sociais"); não reutilize além do escopo; considere pagar pela licença de imagem e voz. Base: Código Civil, art. 20 (direito de imagem é autônomo; direito de voz é reconhecido; violação gera indenização).
- **Medicina (leitura do kit).** O agente pode consolidar o histórico do paciente e sugerir diagnóstico diferencial (o médico revisa e aprova). NÃO pode fazer diagnóstico final, informar o resultado ao paciente nem alterar prescrição sem revisão médica.
- **Advocacia (leitura do kit).** O agente pode pesquisar jurisprudência, fazer rascunho de peça e alertar sobre prazos. NÃO pode assinar petição sem revisão humana, captar cliente nem decidir a argumentação.

---

## E. Links oficiais

- **LGPD:** https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- **CDC:** https://www.planalto.gov.br/ccivil_03/leis/l8078.htm
- **Marco Civil:** https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
- **Código Civil (art. 20, direito de imagem), Lei 10.406/2002:** https://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm
- **ANPD** (Res. 15/2024, incidentes, publicada em 26/04/2024; Res. 19/2024, transferência internacional e cláusulas-padrão, publicada em 23/08/2024): https://www.gov.br/anpd/pt-br (o kit só tem o endereço do site, sem link direto das resoluções)
- **CFM** (Res. 2.454/2026): https://portal.cfm.org.br
- **OAB-SP** (parecer do TED, maio de 2026): https://www.oabsp.org.br
- **Meta / WhatsApp** (política de provedores de IA, outubro de 2025, efeito em janeiro de 2026): https://developers.facebook.com/docs/whatsapp/
- **CONAR** (guia de influenciadores, maio de 2026, vigência em 1º de junho de 2026): https://conar.org.br
- **Câmara dos Deputados** (PL 2338/2023): https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2487262
- **Senado Federal:** https://www25.senado.leg.br
