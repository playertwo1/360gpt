# 🚀 GUIA MESTRE DE TRANSIÇÃO & HANDOFF — CHATGPT CODEX
## Diretor 360: Plataforma Multiagente de Inteligência e Governança PJ

**Data do Handoff:** 26 de agosto de 2026  
**Versão Atual da Release:** `v3.1.0-confianca` (Fases 0, 1, 2, 4, 5, 6 e 7 100% Homologadas — Fase 8 Pronta p/ Ativar)  
**Autoridade Decisória do Projeto:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  
**Repositório GitHub Oficial:** `https://github.com/playertwo1/360.git` (Branch `main`)  
**Workspace Local Primário:** `C:\Users\fael\Documents\Codex\2026-08-24\vamos-criar-um-progama-360-de`  
**Workspace de Sincronização:** `c:\Users\fael\Downloads\A`  
**Pastas de Backup no Google Drive:** `C:\Users\fael\Google Drive\360` e `C:\Users\fael\Meu Drive\360`  
**Site Hospedado na Nuvem:** `https://visao-360-diretor.fael360092.chatgpt.site`  

**Documentos Canônicos de Trabalho:**
- **Estado Instantâneo da Máquina:** `SESSION_STATE.json` (Lido em 1 segundo por IA).
- **Roadmap Oficial:** `ROADMAP.md` (Evolução Orientada à Confiança — Fases 0 a 8).
- **Checklist Compartilhado (Codex & Antigravity):** `checklist.md`.
- **Status Executivo:** `status.md`.
- **Guia de Alternância com Prompts Prontos:** `docs/GUIA_ALTERNANCIA_AI.md`.
- **Script de Troca em 1-Clique:** `trocar-de-agente.bat` (ou `powershell -File scripts/handoff-sync.ps1`).

---

## 📌 1. Princípio Fundamental & Regra Áurea de Governança
> *"O motor calcula. A IA interpreta. O Evidence Graph prova. O gerente decide."*  
> **Rafael decide.** Nenhum componente de IA aprova crédito, altera cadastros ou movimenta valores sem despacho humano de Rafael na Mesa do Revisor (`/reviews`).  
> Há autorização institucional vigente para uso de dados reais em escopo autorizado, com governança estrita e Human-in-the-Loop.

---

## 🔍 2. MISSÃO DE AUDITORIA RETROSPECTIVA COMPLETA (FASES 0 A 7) PARA O CODEX

Olá, **ChatGPT Codex**! Rafael solicitou que você realize uma **auditoria retrospectiva completa e minuciosa de todas as fases implementadas até aqui (Fases 0 a 7)**, verificando cada componente na busca por:
1. **Falhas lógicas ou inconsistências** entre os schemas JSON Draft 2020-12 e o código.
2. **Edge cases não cobertos** em validações cadastrais, financeiras ou normativas.
3. **Oportunidades de refatoração e otimização** de código (Python, TypeScript, SQL, Bash/PowerShell).
4. **Hardening adicional de segurança e LGPD** (DLP, sanitização de inputs, proteção contra prompt injection).
5. **Melhorias na experiência do usuário (Rafael)** no Dashboard e na Mesa do Revisor.

### 📋 Roteiro de Inspeção Fase a Fase para o Codex:

| Fase | Componentes Chave a Inspecionar | O que Verificar e Auditar |
|---|---|---|
| **Fase 0: Baseline & DoD** | `contracts/*.schema.json`, `AGENTS.md` v1.11 | Validação estrita contra JSON Schema Draft 2020-12, ausência de campos órfãos. |
| **Fase 1: Reliability (H1–H10)** | `n8n/workflows/*.json`, `app/api/bridge/`, `iniciar-diretor-360.bat` | Resiliência de filas DLQ, idempotência de webhooks, backup com RTO 3m12s e RPO 0s. |
| **Fase 2: Observability & Evals** | `test-data/evals/cases/` (20 casos), `evals/eval_engine.py`, `metrics.py` | Acurácia matemática L1 (100%), F1-Score L2 (1.00), cobertura L3 (100%) e concordância L4 (100%). |
| **Fase 4: Decision Intelligence & PDF** | `contracts/decision-record.schema.json`, `core/pdf_report_generator.py`, `app/api/reports/laudo-pdf/route.ts` | Diagramação de 3 páginas do laudo, integridade dos 4 GGs, hashes SHA-256 no Evidence Graph. |
| **Fase 5: LLMOps & FinOps** | `policies/model-router.yaml`, `core/model_router.py`, `app/api/metrics/finops/route.ts` | Roteamento em 5 tiers (Determinístico -> Flash Lite -> Flash -> Pro -> Humano), taxa de economia >= 70% (atual 79.1%). |
| **Fase 6: Security, LGPD & PRR** | `test-data/adversarial/` (5 ataques), `compliance/security_audit.py`, `compliance/PRR_CHECKLIST.md` | Bloqueio de 100% dos ataques (Direct/Indirect Injection, Leak, Traversal), mascaramento de CPF DLP e 10/10 gates PRR. |
| **Fase 7: Operação Real Canary** | `docs/PROTOCOLO_CANARY_SUPERVISIONADO.md`, `core/canary_monitor.py`, `app/api/canary/route.ts` | Simulação das 3 ondas (1-3 -> 5 -> 10 casos), Human Override Rate <= 10%, registro do despacho de Rafael. |

---

## 🛠️ 3. Como Executar a Bateria Completa de Testes no Codex

Para validar se todo o ecossistema está funcionando com código de saída 0:
```powershell
powershell -File scripts/run-all-hybrid-tests.ps1
```
*Este comando executa todos os **13 testes automatizados** e certifica o status `ALL_HYBRID_TESTS_PASS`.*

---

## 🔄 4. Ao Concluir Qualquer Ajuste ou Melhoria no Codex

1. Rodar os testes: `powershell -File scripts/run-all-hybrid-tests.ps1`.
2. Atualizar o `SESSION_STATE.json` e `checklist.md` se aplicável.
3. Executar o handoff em 1-clique:
   ```cmd
   .\trocar-de-agente.bat
   ```
   *(Ou `powershell -File scripts/handoff-sync.ps1`)*. Isso sincronizará os backups no Google Drive, fará commit no Git, push no GitHub e espelhamento em `Downloads/A` automaticamente.