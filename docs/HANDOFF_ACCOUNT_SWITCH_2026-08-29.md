# Handoff para troca de conta — Diretor 360

## Estado atual

- Repositório oficial: `https://github.com/playertwo1/360gpt.git`, branch `main`.
- Repositório anterior: `https://github.com/playertwo1/360.git`, remoto local `360-legacy`.
- Site: versão 36 publicada em `https://visao-360-diretor.fael360092.chatgpt.site`.
- Roadmap canônico: `ROADMAP.md`.
- Fase atual reconciliada: `N2 — homologação objetiva do leitor documental`.
- Status: `IN_PROGRESS`.

## Componentes prontos

- R1: intake assíncrono no site e Telegram, protocolo, deduplicação e polling.
- WF-11: Orquestrador Mestre do MVP, ID `9eb8e86a-84b8-4aa9-97e4-360000000011`, importado no n8n e ainda inativo.
- `document-worker`: saudável no Docker, interno, acessível pelo n8n em `http://document-worker:8787`.
- Extração: PDF nativo, PDF escaneado por OCR, JPG/PNG por OCR, CSV e XLSX.
- Contrato: `contracts/document-extraction.schema.json` Draft 2020-12.
- Segurança: conteúdo `UNTRUSTED`, hash validado e efeitos externos proibidos.

## Validações aprovadas

```powershell
powershell -File scripts/test-wf11-n8n-master.ps1
powershell -File scripts/test-document-worker.ps1
npm run lint
npm run build
```

Foram aprovados: estrutura e importação do WF-11, saúde do worker, conexão n8n→worker, endpoint multipart, OCR JPG, extração PDF nativa, lint e build.

## Próximo passo exato

Executar manualmente o WF-11 com um arquivo já autorizado, inspecionar a extração retornada pelo `document-worker` e corrigir o encadeamento antes de ativar o agendamento. Não pedir novo upload antes desse teste.

## Ordem de retomada na nova conta

1. Ler `AGENTS.md`.
2. Ler `SESSION_STATE.json`.
3. Ler `PROJECT_STATE.md`.
4. Ler `ROADMAP.md`.
5. Ler `status.md` e `CHANGELOG.md`.
6. Ler este handoff.
7. Executar `git status` e preservar alterações paralelas.

## Artefatos paralelos preservados

- `n8n/workflows/wf-360gemini.json`: criado em trabalho paralelo, não homologado; contém somente uma chave falsa de teste como fallback, não uma credencial real.
- `docs/email-reports/EMAIL_20260829_054928_Sincronizacao_de_Handoff_Multi_IA_Conclu.md`.

Esses arquivos foram incluídos no checkpoint para não perder informação, mas não devem ser ativados sem auditoria.
