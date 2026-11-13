// Manda um aviso curto para o SEU Telegram (um bot que você criou). Serve como "controle remoto" do dono:
// avisar que uma rotina terminou, que deu erro ou que algo precisa de aprovação.
// Uso:  node scripts/avisar-telegram.mjs "Relatório semanal pronto em saidas/rotinas/"
//       node scripts/avisar-telegram.mjs --teste "mensagem"     (mostra o que enviaria, sem enviar)
// Configuração (variáveis de ambiente, NUNCA no código nem no Git):
//   TELEGRAM_BOT_TOKEN  (crie o bot conversando com @BotFather no Telegram)
//   TELEGRAM_CHAT_ID    (o seu chat: mande uma mensagem ao bot e abra https://api.telegram.org/bot<TOKEN>/getUpdates)
// Este script só ENVIA aviso para você. Não recebe ordens: o Telegram não comanda os agentes.
const teste = process.argv[2] === "--teste";
const texto = (teste ? process.argv.slice(3) : process.argv.slice(2)).join(" ").trim();
if (!texto) { console.error('Uso: node scripts/avisar-telegram.mjs "mensagem"'); process.exit(2); }
const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
if (teste) { console.log(`Enviaria ao chat ${chat || "(TELEGRAM_CHAT_ID não definido)"}: ${texto.slice(0, 500)}`); process.exit(0); }
if (!token || !chat) { console.error("Defina TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID no ambiente."); process.exit(2); }
try {
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text: texto.slice(0, 3500), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) { console.error("Telegram respondeu", r.status); process.exit(1); }
  console.log("Aviso enviado.");
} catch (e) { console.error("Falha ao enviar:", e.message); process.exit(1); }
