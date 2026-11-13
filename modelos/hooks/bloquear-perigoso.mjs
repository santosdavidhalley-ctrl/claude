// Hook PreToolUse (ferramenta Bash): lê o comando que o Claude quer rodar e BLOQUEIA o que é perigoso.
// Código de saída 2 = negar. A mensagem em stderr volta para o Claude.
// Regra do Claude Code: hooks rodam sempre, mesmo que o modelo "queira" outra coisa.
let entrada = "";
process.stdin.on("data", (d) => (entrada += d));
process.stdin.on("end", () => {
  let comando = "";
  // entrada que não dá para ler = bloqueia (trava de segurança falha fechada)
  try { comando = JSON.parse(entrada).tool_input?.command ?? ""; } catch { console.error("BLOQUEADO: não consegui ler o comando para conferir."); process.exit(2); }
  const proibidos = [
    [/\brm\b[^|;&]*\s(-[a-z]*r[a-z]*|--recursive)(\s|$)/i, "apagar pastas inteiras (rm -r / rm -rf / --recursive)"],
    [/\bsudo\b/, "comando como administrador (sudo)"],
    [/(curl|wget)[^|]*\|\s*(ba|z)?sh/i, "baixar e executar script da internet"],
    [/git\s+push\s+.*(--force|-f\b)/, "git push forçado"],
    [/(^|[\s'"=\/<>|;&(])\.env(?!\.(example|sample|template)\b)(\.[\w-]+)?(?=$|[\s'"\/;&|)<>])/, "mexer em arquivo .env"],
    [/chmod\s+-R\s+777/, "liberar permissão total"],
  ];
  for (const [regra, motivo] of proibidos) {
    if (regra.test(comando)) {
      console.error(`BLOQUEADO pela regra da casa: ${motivo}. Peça ao dono para fazer isso manualmente, se for mesmo necessário.`);
      process.exit(2);
    }
  }
  process.exit(0);
});
