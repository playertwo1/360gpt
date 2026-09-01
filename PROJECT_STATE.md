# PROJECT STATE

Version: 3.8.0-docling-candidate
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: N2/M1 — homologação objetiva do leitor documental
Current task: corrigir desalinhamentos de células Docling nos layouts POBJ reais antes de republicar WF-11
Status: IN_PROGRESS

Last completed: migração técnica para Docling CPU, contrato 1.1.0, tabelas estruturadas, fallback leve, reserva manual MinerU e proteção de ambiguidade implementados
Next task: comparar e corrigir a estrutura das 3 tabelas POBJ até passar o gate de 100% dos campos críticos; depois republicar WF-11 e retomar M5.9/M5.10

Last validation: 32/32 regressões PASS; gate funcional Docling PARTIAL — saudável em CPU, pico observado 1,96 GiB/3 GiB e PDFs em 124–198 s, mas células unidas/desalinhadas em POBJ2608, POBJ2708 e POBJ2808
Last commit: 35a69da (`feat: migrate local runtime to WSL Docker Engine`)

Blockers:
- Docker Desktop foi abandonado em favor do Docker Engine nativo no Ubuntu/WSL2 para reduzir RAM; não tentar reparar ou iniciar o Desktop.
- Ubuntu 26.04 foi movido para `G:\Docker\Ubuntu`; Engine, imagens e volumes novos ficam no VHDX dessa distribuição.
- Dump PostgreSQL restaurado com 129 tabelas n8n e 8 tabelas visao360; 13 workflows e 2 credenciais confirmados.
- WF-11 está despublicado preventivamente; WF-12/WF-13 atualizados no n8n, sem ativação externa, até a homologação do leitor.
- Sete jobs reais permanecem órfãos em PROCESSING/terceira tentativa; a versão 40 pode recuperá-los, mas o Docker/n8n precisa estar operacional antes de executar `/destravar`.
- Docling reconstruiu corretamente uma parte das tabelas, mas uniu peso/métrica e alguns valores nas páginas complexas; nenhuma dessas associações pode ser oficializada silenciosamente.
- MinerU está preservado e parado; uso exige `scripts/start-mineru-manual.ps1 -Protocol ... -Reason ...` e gera auditoria local.
- Benchmark detalhado: `docs/audits/DOCLING_MIGRATION_2026-09-01.md`.
- Backup anterior à migração: `C:\Users\fael\Desktop\backup-diretor360-pre-docling-20260901-141052.bundle` (SHA-256 `F07F8764A83795948DCF67EFBD1E623F0053E591119018F9054575F48F20D5CB`).

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-09-01 14:48

Resume instruction:
Continue o `ROADMAP.md` pelo gate N2/M1: melhorar a reconstrução das tabelas POBJ e repetir o benchmark real. Não republicar WF-11 enquanto os campos críticos não atingirem 100% de associação correta.

Resume commands:
- `pwsh -NoProfile -File scripts/test-docling-integration.ps1`
- `pwsh -NoProfile -File scripts/test-document-worker.ps1`
- `node scripts/test-wf13-performance-runtime.mjs`
- Depois do ajuste, repetir POBJ2608, POBJ2708 e POBJ2808 com `python -m app.real_file_probe` no container de teste.
- Somente após o gate real: importar WF-11/WF-12/WF-13, publicar WF-11 e reiniciar n8n.
