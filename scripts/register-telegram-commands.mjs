import fs from 'node:fs';

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  const env = {};
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          env[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  }
  return env;
}

function loadCommands() {
  const content = fs.readFileSync('./lib/telegram-messages.ts', 'utf8');
  const match = content.match(/export const TELEGRAM_COMMANDS = (\[[\s\S]*?\]) as const;/);
  if (!match) throw new Error('TELEGRAM_COMMANDS não encontrado');
  // Evaluate the array
  const jsonLike = match[1]
    .replace(/(\w+):/g, '"$1":')
    .replace(/'/g, '"')
    .replace(/,\s*\]/, ']');
  return JSON.parse(jsonLike);
}

const env = loadEnv();
const token = env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN não encontrado em .env.local ou .env');
  process.exit(1);
}

const commands = loadCommands();
console.log(`Registrando ${commands.length} comandos na API do Telegram...`);

const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ commands }),
});

const data = await response.json();
if (data.ok) {
  console.log('✅ Menu de comandos atualizado com sucesso na API do Telegram!');
  console.log('Comandos registrados:');
  for (const c of commands) {
    console.log(`  /${c.command} - ${c.description}`);
  }
} else {
  console.error('❌ Erro ao registrar comandos:', data);
  process.exit(1);
}
