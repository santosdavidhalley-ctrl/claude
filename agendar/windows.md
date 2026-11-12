# Agendador de Tarefas do Windows

Jeito mais fácil: `node scripts/agendar.mjs bom-dia "/bom-dia" --hora 9:07` imprime o comando certo para a sua máquina.

À mão, no PowerShell (ajuste os caminhos; use o caminho completo do `node` e da pasta do escritório). Segunda a sexta, 9h07:

```
schtasks /Create /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST 09:07 /TN "EscritorioIA-bom-dia" /TR "cmd /c cd /d C:\Users\VOCE\escritorio && node scripts\rodar-rotina.mjs bom-dia /bom-dia --max-usd 0.5 >> estado\agendador.log 2>&1"
```

- Testar agora: `schtasks /Run /TN "EscritorioIA-bom-dia"`
- Ver: `schtasks /Query /TN "EscritorioIA-bom-dia"`
- Desligar: `schtasks /Delete /TN "EscritorioIA-bom-dia" /F`
- Se o `claude` não for encontrado, defina a variável `CLAUDE_BIN` com o caminho completo (comando `where claude`).
- Recomendado: rode o escritório no **WSL2**. No Windows nativo o isolamento de comandos (sandbox) não existe e as travas de terminal valem menos (veja `guia/07`).
- Nota honesta: o autor do kit não testou o agendamento no Windows. Rode o comando à mão primeiro.
