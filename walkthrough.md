# Walkthrough — Marco 24

O Marco 24 conclui a automação de implantação do Diretor 360. A VPS Ubuntu 24.04 passa a ser preparada por um único script, com firewall, Docker, PostgreSQL, n8n, Caddy e HTTPS automático. O frontend continua hospedado separadamente e recebe o webhook oficial do Telegram.

## Fluxo operacional

1. DNS aponta o subdomínio do n8n para a VPS.
2. `provision-vps-server.sh` instala e valida a infraestrutura.
3. O operador preenche `.env.prod` fora do Git.
4. Caddy obtém o certificado TLS e publica o n8n.
5. `test-cloud-deployment.ps1 -Live` valida frontend e n8n públicos.
6. `activate-telegram-webhook.ps1 -WhatIf` mostra a ação planejada.
7. O mesmo script, sem `-WhatIf`, registra e confirma o webhook.

## Evidência local

- Build de produção: aprovado.
- Readiness Gate: aprovado.
- Testes de carga, ingestão multimodal, idempotência e Evidence Graph: aprovados.
- Manifesto cloud e segurança do Telegram: aprovados.
- Teste estrutural do Marco 24 e `docker compose config`: aprovados.

## Pendência operacional

O go-live real não foi executado nesta estação porque domínio, VPS e credenciais de produção não foram fornecidos. Esse bloqueio não afeta a implementação, mas impede afirmar que DNS, TLS público e webhook real estejam homologados.

## Decisão posterior ao Marco 24

Rafael optou por adiar a VPS e avançar com uma arquitetura híbrida: site, fila e último Estado 360 hospedados; processamento por Docker, PostgreSQL, n8n e agentes no computador local. A execução e as evidências das próximas fases devem ser registradas em `ROADMAP_HIBRIDO.md`, começando por H1 — acesso privado ao site.

H1, H2 e H3 foram concluídas em 26 de agosto de 2026. As duas contas autorizadas acessaram o site, a persistência permaneceu disponível com Docker desligado e a ponte processou um novo caso sintético após rotação coordenada do segredo. O Telegram permaneceu desativado. A próxima fase é H4 — inicialização local com um clique.
