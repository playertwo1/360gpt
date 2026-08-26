# 📱 GUIA PRÁTICO: CONECTANDO SEU BOT DO TELEGRAM AO DIRETOR 360

## 🚀 Como Criar e Conectar seu Bot em 2 Minutos

### Passo 1: Criar o Bot no Telegram
1. No seu Telegram, busque pelo contato oficial **`@BotFather`** (verificado com selo azul).
2. Envie a mensagem: `/newbot`
3. O BotFather vai pedir um **Nome** (Ex: `Diretor 360 - Rafael`).
4. Em seguida, vai pedir um **Username** terminado em `bot` (Ex: `diretor360_rafael_bot`).
5. O BotFather vai te entregar um **Token HTTP API** parecendo com: `7123456789:AAFlkjhGFD...`

### Passo 2: Configurar no Diretor 360
1. Dê um duplo clique no arquivo **`configurar-telegram-bot.bat`** (ou rode `powershell -File scripts/setup-telegram-bot.ps1`).
2. Cole o Token do seu bot.
3. Se você souber seu Chat ID (pode descobrir falando com `@userinfobot`), digite-o. Se não souber, pode deixar em branco.
4. Pronto! Ele salva no seu `.env.local` com segurança.

### Passo 3: Iniciar o Bot
1. Dê um duplo clique no arquivo **`iniciar-telegram-bot.bat`**.
2. Abra o seu bot no Telegram e mande `/start`.
3. Teste mandar:
   - `/status`
   - `/analisar Metalúrgica Santa Rita`
   - `/laudo`
   - Ou arraste um arquivo PDF / Excel diretamente na conversa!
