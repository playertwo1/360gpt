# -*- coding: utf-8 -*-
import os, sys, json, time, subprocess, urllib.request, urllib.parse, urllib.error

BOT_TOKEN = "8882434974:AAEVIg_7mqjZexzMQjQMniAYgDtvKjrbrXo"
ALLOWED_CHATS = ["5281600644"]
API_BASE = f"https://api.telegram.org/bot{BOT_TOKEN}"

print("========================================================================")
print("   PC COMPANION BOT — CONTROLE REMOTO DO COMPUTADOR                    ")
print("   Bot: @Pccasa_fael_bot | Autorizado: Rafael (5281600644)             ")
print("========================================================================")
print("   * Comandos: /iniciar_docker, /parar_docker, /docker, /pc, /menu     ")
print("   * Status: OUVINDO COMANDOS DO TELEGRAM EM TEMPO REAL...             ")
print("========================================================================")

def send_message(chat_id, text, parse_mode="HTML"):
    url = f"{API_BASE}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": parse_mode}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status == 200
    except Exception as e:
        try:
            payload_plain = json.dumps({"chat_id": chat_id, "text": text}).encode("utf-8")
            req_plain = urllib.request.Request(url, data=payload_plain, headers={"Content-Type": "application/json; charset=utf-8"})
            with urllib.request.urlopen(req_plain, timeout=15) as resp:
                return resp.status == 200
        except Exception:
            print(f"[ERRO] Falha ao enviar mensagem: {e}")
            return False

def exec_docker_start():
    try:
        subprocess.run(["wsl", "-d", "Ubuntu-24.04", "-u", "root", "--", "systemctl", "start", "docker.socket", "docker.service"], check=True, timeout=15)
        res = subprocess.run(["wsl", "-d", "Ubuntu-24.04", "-u", "fael", "--", "docker", "ps", "--format", "• <b>{{.Names}}</b>: <i>{{.Status}}</i>"], capture_output=True, text=True, timeout=15)
        containers = res.stdout.strip() or "<i>Nenhum container rodando no momento.</i>"
        return (
            "🟢 <b>DOCKER ENGINE INICIADO COM SUCESSO NO SEU PC!</b>\n\n"
            "• <b>Status:</b> Ativo e Operacional (WSL Ubuntu-24.04)\n"
            "• <b>Containers Ativos:</b>\n" + containers + "\n\n"
            "💡 <i>Você já pode rodar seus workflows e agentes no n8n!</i>"
        )
    except Exception as e:
        return f"❌ <b>Erro ao iniciar Docker no PC:</b> <code>{e}</code>"

def exec_docker_stop():
    try:
        subprocess.run(["wsl", "-d", "Ubuntu-24.04", "-u", "fael", "--", "bash", "-c", "docker stop $(docker ps -q) 2>/dev/null"], timeout=20)
        subprocess.run(["wsl", "-d", "Ubuntu-24.04", "-u", "root", "--", "systemctl", "stop", "docker.service", "docker.socket"], timeout=15)
        subprocess.run(["wsl", "--shutdown"], timeout=15)
        return (
            "🔴 <b>DOCKER ENGINE E WSL DESLIGADOS TOTALMENTE!</b>\n\n"
            "• <b>Status:</b> Desativado\n"
            "• <b>Memória RAM:</b> 100% liberada no seu computador\n"
            "• <b>Processos em 2º plano:</b> 0 ativos\n\n"
            "💡 <i>Para reativar quando precisar, envie /iniciar_docker</i>"
        )
    except Exception as e:
        return f"❌ <b>Erro ao desligar Docker:</b> <code>{e}</code>"

def exec_docker_status():
    try:
        res = subprocess.run(["wsl", "-d", "Ubuntu-24.04", "-u", "fael", "--", "docker", "ps", "--format", "• <b>{{.Names}}</b>: <i>{{.Status}}</i>"], capture_output=True, text=True, timeout=10)
        if res.returncode == 0:
            containers = res.stdout.strip() or "<i>Nenhum container ativo.</i>"
            return (
                "📊 <b>STATUS DO DOCKER NO SEU PC:</b>\n\n"
                "• <b>Docker Engine:</b> 🟢 ATIVO\n"
                "• <b>Containers:</b>\n" + containers
            )
        else:
            return (
                "📊 <b>STATUS DO DOCKER NO SEU PC:</b>\n\n"
                "• <b>Docker Engine:</b> 🔴 INATIVO / DESLIGADO\n"
                "• <b>Memória:</b> Liberada\n\n"
                "💡 <i>Envie /iniciar_docker para ligar.</i>"
            )
    except Exception:
        return (
            "📊 <b>STATUS DO DOCKER NO SEU PC:</b>\n\n"
            "• <b>Docker Engine:</b> 🔴 INATIVO / DESLIGADO (WSL desligado)\n\n"
            "💡 <i>Envie /iniciar_docker para ligar.</i>"
        )

def exec_pc_status():
    try:
        # Consulta via PowerShell nativo
        ps_cmd = "$os = Get-CimInstance Win32_OperatingSystem; $free = [math]::Round($os.FreePhysicalMemory / 1024 / 1024, 1); $total = [math]::Round($os.TotalVisibleMemorySize / 1024 / 1024, 1); \"$free|$total\""
        res = subprocess.run(["powershell", "-NoProfile", "-Command", ps_cmd], capture_output=True, text=True, timeout=10)
        parts = res.stdout.strip().split("|")
        free_ram = parts[0] if len(parts) > 0 else "?"
        total_ram = parts[1] if len(parts) > 1 else "?"
        
        return (
            "🖥️ <b>STATUS DO COMPUTADOR (PC CASA):</b>\n\n"
            f"• <b>Memória RAM Livre:</b> {free_ram} GB de {total_ram} GB\n"
            f"• <b>Status PC:</b> 🟢 Ligado e Conectado\n"
            f"• <b>Sistema:</b> Windows 11 / WSL Ubuntu-24.04\n\n"
            "💡 <i>Envie /docker para ver status dos containers.</i>"
        )
    except Exception as e:
        return f"🖥️ <b>Status PC:</b> Online. (Detalhes: {e})"

def process_update(update):
    msg = update.get("message", {})
    chat_id = str(msg.get("chat", {}).get("id", ""))
    sender_name = msg.get("from", {}).get("first_name", "Rafael")
    text = (msg.get("text", "") or "").strip()

    if ALLOWED_CHATS and chat_id not in ALLOWED_CHATS:
        print(f"[BLOQUEIO] Chat ID não autorizado: {chat_id}")
        return

    cmd = text.lower()
    print(f"[RECEBIDO @Pccasa_fael_bot] {sender_name}: '{text}'")

    if cmd in ["/iniciar_docker", "/docker_start", "/iniciar docker", "iniciar docker", "/docker_on", "ligar docker"]:
        send_message(int(chat_id), "⏳ <i>Iniciando Docker Engine nativo no seu computador...</i>")
        resp = exec_docker_start()
        send_message(int(chat_id), resp)
        return

    if cmd in ["/parar_docker", "/docker_stop", "/parar docker", "parar docker", "/docker_off", "desligar docker"]:
        send_message(int(chat_id), "⏳ <i>Parando containers e liberando memória RAM do PC...</i>")
        resp = exec_docker_stop()
        send_message(int(chat_id), resp)
        return

    if cmd in ["/docker", "/status_docker", "status docker", "/docker_status"]:
        resp = exec_docker_status()
        send_message(int(chat_id), resp)
        return

    if cmd in ["/pc", "/status_pc", "/status", "pc"]:
        resp = exec_pc_status()
        send_message(int(chat_id), resp)
        return

    if cmd in ["/start", "/help", "/menu", "ajuda", "comandos"]:
        menu = (
            f"🖥️ <b>Olá, {sender_name}! Bem-vindo ao @Pccasa_fael_bot.</b>\n\n"
            "Este é o seu bot dedicado para controle e monitoramento do seu computador.\n\n"
            "🎮 <b>COMANDOS DISPONÍVEIS:</b>\n"
            "• 🟢 <code>/iniciar_docker</code> — Liga o Docker Engine e containers no PC\n"
            "• 🔴 <code>/parar_docker</code> — Desliga o Docker e encerra WSL (libera 100% da RAM)\n"
            "• 📊 <code>/docker</code> — Mostra o status dos containers ativos\n"
            "• 🖥️ <code>/pc</code> — Mostra o status do seu computador\n\n"
            "💡 <i>Basta tocar em qualquer comando acima para executar!</i>"
        )
        send_message(int(chat_id), menu)
        return

    send_message(int(chat_id), f"Comando não reconhecido. Envie <code>/menu</code> para ver as opções de controle do seu PC.")

def main():
    last_update_id = 0
    # Envia mensagem inicial de boas-vindas
    send_message(5281600644, "🖥️ <b>Bot de Controle do PC Online (@Pccasa_fael_bot)!</b>\n\nEnvie <code>/menu</code> para ver os comandos de controle do seu computador.")
    
    while True:
        try:
            url = f"{API_BASE}/getUpdates?offset={last_update_id + 1}&timeout=5"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("ok"):
                    for upd in data.get("result", []):
                        last_update_id = upd["update_id"]
                        process_update(upd)
        except Exception:
            time.sleep(1)
        time.sleep(0.5)

if __name__ == "__main__":
    main()