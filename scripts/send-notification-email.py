# Script de Disparo e Registro de Notificações por E-mail do Diretor 360
# Autoridade: Rafael (fael@live.de / rafa.pedrosa1@gmail.com)

import os, sys, datetime, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def dispatch_email(subject, body_markdown, recipient="fael@live.de"):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    file_timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_subj = "".join(c if c.isalnum() else "_" for c in subject)[:40]
    report_path = f"docs/email-reports/EMAIL_{file_timestamp}_{safe_subj}.md"
    
    report_content = f"""# Relatório de Notificação por E-mail
**Data/Hora:** {timestamp}  
**Destinatário:** {recipient}  
**Assunto:** {subject}  
**Remetente:** Diretor 360 (Orquestrador Oficial)  

---

### Conteúdo da Mensagem:

{body_markdown}

---
*Relatório registrado e arquivado permanentemente no repositório Diretor 360.*
"""
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)
    
    print(f"  [OK] Notificacao arquivada permanentemente em: {report_path}")
    
    # Tentativa de despacho SMTP ativo caso configurado em variaveis de ambiente
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = os.environ.get("SMTP_PORT", "587")
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASS")
    
    if smtp_host and smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart()
            msg["From"] = smtp_user
            msg["To"] = recipient
            msg["Subject"] = f"[DIRETOR 360] {subject}"
            msg.attach(MIMEText(body_markdown, "plain", "utf-8"))
            
            with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            print(f"  [OK] E-mail SMTP transmitido com sucesso para {recipient}!")
        except Exception as e:
            print(f"  [AVISO] Servidor SMTP remoto indisponivel ({e}). Relatorio preservado localmente.")
    else:
        print(f"  [INFO] SMTP remoto nao configurado. O e-mail foi registrado e salvo em docs/email-reports/.")

if __name__ == "__main__":
    subj = sys.argv[1] if len(sys.argv) > 1 else "Notificacao Geral do Sistema"
    body = sys.argv[2] if len(sys.argv) > 2 else "Atualizacao do Diretor 360."
    recip = sys.argv[3] if len(sys.argv) > 3 else "fael@live.de"
    dispatch_email(subj, body, recip)
