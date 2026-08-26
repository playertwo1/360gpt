# Wrapper PowerShell para envio de e-mails
param(
    [string]$Subject = "Notificacao Diretor 360",
    [string]$Body = "Atualizacao concluida.",
    [string]$Recipient = "fael@live.de"
)

python scripts/send-notification-email.py $Subject $Body $Recipient
