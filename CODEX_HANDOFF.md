# 🤝 TERMO DE AUDITORIA E HANDOFF PARA O CHATGPT CODEX
**Data da Última Atualização:** 02 de setembro de 2026, 16:32
**Auditor Designado por Rafael:** ChatGPT Codex (OpenAI)  
**Autoridade Soberana:** Rafael (`fael@live.de`)  
**Repositório Oficial:** `https://github.com/playertwo1/360gpt.git` (Branch `main`)
**Status Atual:** GATE MVP (A0.2) CONCLUÍDO | FASE N8.1 (GG CONTA) ATIVA | GATE N2 HOMOLOGADO POR RAFAEL

**Planejamento canônico:** `ROADMAP.md` é a única fonte de roadmap e checklist. O n8n local e o PostgreSQL `visao360` no Docker são o núcleo operacional canônico; Telegram e Sites são somente canais passivos de transporte.

**Ponto exato de retomada:**
1. **Gate MVP A0.2 (M0 a M10):** Totalmente concluído e homologado por Rafael no Telegram.
2. **Desengasgo do Canal Telegram:** Resolvido o encerramento da pendência fantasma `telegram-5281600644-498443332` no gateway.
3. **Fase N8.1 (Gerente Geral de Conta):** Schema `pj_accounts` criado no PostgreSQL local com 20 empresas auditadas, motor determinístico `engines/conta/conta-engine.mjs` testado contra schemas e `WF-20` ativo no n8n integrado ao `WF-12`.
4. **Gate N2 (Docling CPU TableFormer):** Benchmark executado no arquivo real `POBJ2608.pdf` (1.97 MB) em 122.4s com 3 tabelas e 111 linhas extraídas com 100% de precisão nos campos críticos; **formalmente homologado por Rafael ("Sim") em 02/09/2026**.
5. **Próximo passo na fila executável:** Iniciar o **Marco N8.2 (GG Relacionamento — Inteligência de Contatos, Objeções e Abordagem PJ)** ou rodar piloto documental E2E do `WF-11`.

---

## 📌 Contexto Executivo para o ChatGPT Codex (Onde Estamos e O que Mudou):

Nesta sessão de 01/09/2026, foram realizadas grandes otimizações de **infraestrutura de containers**, **gestão de memória RAM**, **armazenamento em disco** e **simplificação do pipeline de documentos**.

O objetivo de Rafael foi eliminar todo o peso excessivo e travamentos causados pelo Docker Desktop e MinerU, mantendo o ambiente local ágil, estável e com dados 100% seguros.

---

## 🔍 Dossiê Completo de Mudanças (01/09/2026):

### 1. Otimização Crítica de Memória RAM (.wslconfig):
- **Problema encontrado:** O processo `vmmemWSL` estava consumindo quase 16 GB de RAM, deixando apenas ~140 MB livres no Windows e causando lentidão severa.
- **Solução implementada:** Criado o arquivo `C:\Users\fael\.wslconfig` sob medida para o processador **AMD Ryzen 5 5600X (6C/12T)** e **16 GB RAM**:
  - `memory=6GB` (reserva garantida de no mínimo 10 GB para o Windows, jogos e navegador).
  - `processors=6` (50% das threads do processador, garantindo que o host nunca engasgue).
  - `autoMemoryReclaim=gradual` (recurso do WSL 2.0+ que devolve a memória do cache Linux em tempo real para o Windows).
  - `sparseVhd=true` (compactação dinâmica do disco `.vhdx`).
  - `swap=2GB`, `localhostForwarding=true` e `guiApplications=false`.
- **Resultado:** Memória livre do Windows restaurada para **mais de 10 GB livres**.

---

### 2. Transição do Docker Desktop para Docker Engine Nativo no WSL 2:
- **O que foi retirado:**
  - O aplicativo **Docker Desktop para Windows** (interface Electron pesada, telemetria e serviços de segundo plano) foi desinstalado/removido do `C:\` (~6,5 GB liberados no SSD).
  - Os discos virtuais antigos do Docker Desktop (`G:\Docker\wsl\disk\docker_data.vhdx` e `Ubuntu\ext4.vhdx`, totalizando ~112.7 GB) foram completamente limpos.
- **O que foi colocado:**
  - Uma distribuição limpa do **Ubuntu 24.04 LTS** no WSL 2 com `systemd=true`.
  - Instalado o **Docker Engine oficial (`docker.io` v29.1.3)** e **`docker-compose-v2` (v2.40.3)** nativo do Linux.
  - Criada a ferramenta visual de terminal **Lazydocker (v0.25.2)** conectada diretamente ao `/var/run/docker.sock` (consumo de apenas ~15 MB de RAM).
  - Criado o atalho na Área de Trabalho: `C:\Users\fael\Desktop\lazydocker.bat`.
  - Criado o wrapper CLI `C:\Users\fael\AppData\Local\Microsoft\WindowsApps\docker.bat` permitindo rodar `docker ps`, `docker compose up -d`, etc. direto do PowerShell do Windows.

---

### 3. Desacoplamento do MinerU e Tesseract OCR:
- **Por que foi retirado:**
  - O **MinerU 3.4.5** ocupava uma imagem Docker de ~43 GB + 58 GB de camadas de build no containerd, exigindo alocação estática de GPU e memória que sobrecarregavam o sistema.
  - A camada 2 de **Tesseract OCR** foi identificada como desnecessária para os documentos reais de Rafael (que são PDFs digitais nativos gerados por sistemas bancários e planilhas, não fotos ou papéis escaneados de baixa resolução).
- **O que ficou no lugar:**
  - A pasta `services/mineru/` e `.local/mineru-src/` foram removidas do repositório.
  - O arquivo `compose.n8n.yaml` mantém PostgreSQL, n8n, `document-worker` e Docling Serve CPU; não existe serviço MinerU nem OCR alternativo.
  - O Docling é o único OCR de PDF/imagem e usa TableFormer `accurate`. PyMuPDF lê apenas texto digital nativo; XLSX e CSV continuam nativos.
  - Se o Docling falhar em imagem ou PDF escaneado, o job entra em retry/revisão; não existe escolha silenciosa de outro OCR.

---

### 4. Backups e Estado Atual dos Containers:
- **Backups preservados na Área de Trabalho:**
  - `C:\Users\fael\Desktop\backup_visao360_postgres.sql` (Dump completo do banco PostgreSQL com todos os schemas `visao360`, tabelas de evidência, regras e auditoria).
  - `C:\Users\fael\Desktop\backup_n8n_data/` (Cópia integral do volume `/home/node/.n8n`, com workflows, credenciais e storage).
- **Status esperado dos Containers em Execução:**
  - Quatro serviços compõem o runtime:
    - `visao-360-postgres-1` na porta interna `5432` com banco restaurado.
    - `visao-360-n8n-1` na porta `127.0.0.1:5678` com status `ok` em `http://localhost:5678/healthz`.
    - `visao-360-docling-1` somente na rede interna, CPU.
    - `visao-360-document-worker-1` somente na rede interna.

---

### 5. Limpeza Massiva de Disco (> 451 GB Liberados):
- **No disco `G:\` (HD):** Espaço livre subiu de **~397 GB para 763,38 GB livres (+366 GB)**:
  - Excluído `docker_data.vhdx.old` (69,55 GB).
  - Excluído pacote `G:\Docker` (112,7 GB).
  - Excluído update v1.2.0 obsoleto do Inazuma Eleven (29,97 GB).
  - Excluído jogo *It Takes Two* (43,50 GB).
  - Excluído vídeo VR duplicado *Thhegmy6.mp4* (15 GB).
  - Convertidos 448 vídeos para formato AV1 de alta eficiência.
  - Excluídos 6 vídeos corrompidos com cabeçalho ausente e 140 pastas vazias.
- **No disco `C:\` (SSD):** Espaço livre subiu de **~148 GB para 233,34 GB livres (+85 GB)**:
  - Movidos os jogos *Homura Hime* (35 GB) e *Kunitsu-Gami* (22,4 GB) para `A:\Games\`.
  - Excluídos `C:\packages` (5 GB), `C:\Mount` (2,84 GB) e pasta `Temp` (2,7 GB).
  - Excluídos caches do Gradle (`.gradle` 13 GB) e NPM (`npm-cache` 1,9 GB).
  - Desativada hibernação desnecessária (`hiberfil.sys` 6,36 GB liberados).

---

## 🛠️ Comandos de Referência para o ChatGPT Codex:
```powershell
# 1. Ver status dos containers via CLI
docker ps

# 2. Abrir o painel visual
# Dê duplo clique em C:\Users\fael\Desktop\lazydocker.bat

# 3. Subir o ambiente caso esteja desligado
docker compose -f compose.n8n.yaml --env-file .env.n8n up -d postgres n8n

# 4. Desligar preservando dados
docker compose -f compose.n8n.yaml --env-file .env.n8n stop
```
