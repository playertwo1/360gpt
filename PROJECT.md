# PROJECT — Diretor 360 (Visão 360)

Contrato de visão. Atualize quando o projeto nasce e quando a visão muda; o resto (marcos, estado) fica em `ROADMAP.md` e `STATE.md`. Resumo extraído do `ROADMAP.md` (§2) e do `README.md`; em divergência, o `ROADMAP.md` §2 prevalece até ser revisado.

## Problema
Arquivos, mensagens, metas, resultados e conversas da gestão de carteira empresarial chegam espalhados; consolidar riscos, oportunidades, tarefas e evidências à mão é lento e sem rastreabilidade.

## Para quem
Rafael, uso privado e pessoal, recebendo e consultando informação pelo Telegram e por um cockpit/dashboard privado.

## MVP — até três fluxos que entregam valor
1. Entrada pelo Telegram (texto, PDF, JPG, PNG, XLSX, CSV) com registro durável no núcleo local n8n + PostgreSQL `visao360`.
2. Leitura documental (Docling CPU/TableFormer; PyMuPDF só para texto digital) e análise de POBJ, metas, atingimento, pontos, gaps, cenários e recomendações pelo Diretor + GG Performance.
3. Estado 360 mínimo com evidências, perguntas a Rafael em dúvida material e resposta rastreável no mesmo chat.

## Fora do MVP (escrito para não voltar escondido)
- GG Conta, Financeiro e Relacionamento no runtime real; visão multidomínio completa (até o gate N7).
- Contatos ou ações externas automáticas; aprendizado autônomo sem aprovação.
- VPS/alta disponibilidade; expansão visual sem relação com o primeiro fluxo útil.

## Restrições
- Plataforma/ambiente: Windows 11 + WSL2 com Docker Engine nativo; n8n 2.36.7 e PostgreSQL 17.6 locais; frontend Next/vinext (`package.json`).
- Dados sensíveis e privacidade: segredos nunca no Git; dados reais exigem finalidade, minimização, rastreabilidade e retenção (POBJ: 24 meses detalhado, backups até 90 dias). Efeitos externos proibidos, exceto a resposta Telegram solicitada e ações autorizadas com Human-in-the-Loop.
- Custos, licenças, integrações obrigatórias: Telegram Bot API, Google Gemini, Docling. n8n é a autoridade operacional exclusiva (`docs/arquitetura-agentes-360/ADR-002-N8N-NUCLEO-LOCAL.md`).

## Como saberemos que funcionou
Gate N7 do `ROADMAP.md`: Telegram ponta a ponta com resposta rastreável, evidências e revisão de Rafael.

## Autoridade de produto
Rafael — "Fontes governam. Motores calculam. Especialistas investigam. Gerentes Gerais interpretam. O Diretor integra e desafia. Rafael decide."

## Alternativas consideradas
Arquiteturas substituídas registradas no `ROADMAP.md` §5.3 e em `docs/arquitetura-agentes-360/`.
