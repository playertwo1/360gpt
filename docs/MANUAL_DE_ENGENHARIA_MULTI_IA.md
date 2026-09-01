# 🤖 MANUAL DE ENGENHARIA & GOVERNANÇA MULTI-IA — DIRETOR 360
## Guia Canônico para Agentes Autônomos (Antigravity, ChatGPT Codex, Claude & Outros LLMs)

**Versão da Arquitetura:** `v3.1.0-confianca` (Baseada no `AGENTS.md` v1.11)  
**Autoridade Decisória do Repositório:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  
**Repositório Oficial:** `https://github.com/playertwo1/360gpt.git` (Branch `main`)  
**Workspace Primário:** `C:\Users\fael\Documents\Codex\2026-08-24\vamos-criar-um-progama-360-de`  
**Workspace Secundário (Sync):** `c:\Users\fael\Downloads\A`  

---

## ⚡ 1. Inicialização Rápida & Invariantes de Máquina (Machine Context)

Se você é uma Inteligência Artificial assumindo este repositório, execute esta ordem canônica de leitura:
1. **`AGENTS.md`** $\rightarrow$ Contrato mestre e regras de execução.
2. **`PROJECT_STATE.md`** $\rightarrow$ Estado operacional e ponto exato de retomada.
3. **`ROADMAP.md`** $\rightarrow$ Único planejamento e checklist, com caminho N0–N9.
4. **`CHANGELOG.md`** $\rightarrow$ Histórico permanente de mudanças.
5. **`SESSION_STATE.json`** $\rightarrow$ Estado leve para automações e alternância.
6. **`CODEX_HANDOFF.md`** $\rightarrow$ Contexto complementar de transferência.

---

## 🛡️ 2. Regras Invioláveis de Arquitetura (Leis do Diretor 360)

1. **Segregação de Funções & Quatro Olhos:**
   - Nenhum modelo de IA aprova crédito, altera cadastros ou movimenta valores.
   - Propor $\neq$ Validar $\neq$ Decidir $\neq$ Executar $\neq$ Auditar.
   - Todo conflito, dúvida ou limite a aprovar gera `MANUAL_REVIEW_REQUIRED` para despacho de **Rafael**.
2. **Governança de Contratos Draft 2020-12:**
   - 100% dos payloads trocados entre agentes validam contra schemas JSON Draft 2020-12 em `contracts/*.schema.json`.
3. **Evidence Graph 360 & Linhagem W3C PROV:**
   - Nenhuma afirmação material pode existir sem nó de origem (`SOURCE_ARTIFACT`) e hash SHA-256.
   - Evidência sem linhagem é classificada como `ORPHAN_EVIDENCE` e bloqueada do estado `READY`.
4. **Princípio da Menor Autonomia Necessária:**
   - Ordem de preferência: `Regra Determinística > Chamada LLM Estruturada > Especialista > Multiagente`.
   - Profundidade máxima de delegação: `Diretor → Gerente Geral → Especialista`. Delegação lateral proibida.
   - **Proibida a criação dinâmica de agentes em tempo de execução.**
5. **Model Router FinOps Invariant:**
   - Tarefas de código/matemática usam `deterministic` (Custo $0,00).
   - Extração leve usa `flash_lite`. Análises dos GGs usam `flash`. Síntese do Diretor usa `pro`.
   - A taxa de redução de custo FinOps deve permanecer sempre $\ge 70\%$ (atual: 79.1%).

---

## 🗺️ 3. Árvore de Diretórios e Mapa de Componentes

```
├── contracts/                  # Schemas JSON Draft 2020-12 (State 360, Evidence Graph, Decision Record)
├── core/                       # Motores centrais em Python (Model Router, PDF Generator, Canary Monitor, Bot Worker)
├── domains/                    # Especificações e prompts dos 4 Gerentes Gerais (Conta, Performance, Financeiro, Relacionamento)
├── evals/                      # Motor de avaliação contínua L1-L4 e cálculo de métricas F1 / Concordância
├── compliance/                 # Suíte de segurança adversária, DLP e PRR Checklist (10/10 gates)
├── docs/                       # Manuais humanos, livro do projeto e relatórios de auditoria
├── n8n/workflows/              # 10 workflows corporativos n8n (wf-00 a wf-09) com DLQ
├── app/                        # Frontend Next.js / React (Dashboard, Mesa do Revisor /reviews, Rotas de API Edge)
├── scripts/                    # 13 testes automatizados em PowerShell e scripts de infraestrutura
├── test-data/                  # 20 casos sintéticos de avaliação, fixtures multimodais e payloads de Red Teaming
├── SESSION_STATE.json          # Estado instantâneo de máquina para alternância multi-IA
├── ROADMAP.md                  # Planejamento e checklist unificados
├── status.md                   # Relatório executivo de status e matriz de workflows
├── CODEX_HANDOFF.md            # Guia de transição e orientações para o ChatGPT Codex
├── trocar-de-agente.bat        # Automação de 1-clique para teste, backup no Google Drive, Git commit/push
├── iniciar-diretor-360.bat     # Inicializador de 1-clique do Dashboard e Mesa do Revisor
└── iniciar-telegram-bot.bat    # Inicializador de 1-clique do Bot Worker em tempo real
```

---

## 🛠️ 4. Playbooks Passo a Passo para Evolução do Código

### 📖 Playbook A: Como Modificar um Agente Existente
1. Localize o arquivo do agente em `domains/<dominio>/GERENTE_GERAL_<DOMINIO>.md`.
2. Se a mudança incluir novos campos de saída, altere o schema correspondente em `contracts/<dominio>-handoff.schema.json`.
3. Ajuste a matriz de regras em `policies/`.
4. Atualize os 20 casos sintéticos em `test-data/evals/cases/`.
5. Execute `python evals/eval_engine.py` e certifique que as 4 camadas (L1 a L4) atingiram 100%.

### 📖 Playbook B: Como Criar um Novo Domínio ou Agente
1. **Contrato:** Crie `contracts/<novo_dominio>-handoff.schema.json` validando em Draft 2020-12.
2. **Registro de Capacidades:** Declare as capacidades em `policies/capability-registry.yaml`.
3. **Especificação:** Crie `domains/<novo_dominio>/GERENTE_GERAL_<NOVO_DOMINIO>.md`.
4. **Motor de Consolidação:** Adicione o parse do novo domínio em `core/MOTOR_CONSOLIDACAO_360.md`.
5. **Model Router:** Registre as tarefas do novo agente em `policies/model-router.yaml` e `core/model_router.py`.
6. **Laudo PDF & Dashboard:** Adicione a seção do novo domínio em `core/pdf_report_generator.py` e `app/page.tsx`.
7. **Testes:** Crie `scripts/test-domain-<novo_dominio>.ps1` e integre no `scripts/run-all-hybrid-tests.ps1`.

### 📖 Playbook C: Como Alterar Políticas de Crédito ou Reason Codes
1. Reason codes fechados ficam em `policies/reason-codes.yaml`.
2. Matriz de precedência de dados fica em `policies/source-precedence.yaml`.
3. Limites de autonomia ficam em `policies/autonomy-budget.yaml`.
4. Toda alteração de política deve atualizar a versão semântica no cabeçalho do arquivo YAML.

---

## 🧪 5. Protocolo de Verificação e Handoff Multi-IA

Sempre que concluir qualquer modificação ou melhoria:
1. **Executar a Bateria Completa de Testes:**
   ```powershell
   powershell -File scripts/run-all-hybrid-tests.ps1
   ```
   *Certifique-se de obter `ALL_HYBRID_TESTS_PASS` (13/13 testes aprovados).*
2. **Atualizar o Estado de Sessão:**
   - Atualize `SESSION_STATE.json` (com o último commit e timestamp).
   - Atualize o checklist dentro de `ROADMAP.md` (marcando `[x]` somente nos itens homologados).
3. **Executar a Sincronização em 1-Clique:**
   ```cmd
   .\trocar-de-agente.bat
   ```
   *Isso executará os testes, criará um ZIP com timestamp nas duas pastas do Google Drive (`Google Drive\360` e `Meu Drive\360`), fará commit no Git, push no GitHub e espelhamento em `Downloads/A`.*
