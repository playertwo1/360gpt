# Plano de Implementação da Fase 2 — Diretor 360
## Operação em Produção Assistida, Nuvem e Expansão

**Data:** 26 de agosto de 2026  
**Status:** Aprovado e em Execução  
**Versão Atual:** v1.0.0-assisted-prod  

> **Princípio da Fase 2:** O playbook nasce da evidência empírica coletada em operação assistida, não de suposições *a priori*.

---

## 1. Visão Geral dos Marcos da Fase 2

| Marco | Título | Objetivo Principal | Entregáveis Chave |
|:---:|---|---|---|
| **16** | **Sessão Prática de Operação Assistida com Casos Complexos** | Submeter cenários sintéticos de borda e avaliar a esteira analítica dos 4 Gerentes Gerais e da Mesa do Revisor. | scripts/test-assisted-operations.ps1, fixtures de casos complexos, relatório de acurácia e atrito. |
| **17** | **Manual e Playbook Operacional do Revisor 360** | Codificar as regras de decisão humana, reason codes e inspeção de evidências com base nas lições do Marco 16. | docs/PLAYBOOK_REVISOR_360.md, matriz fechada de desempates, checklist do revisor. |
| **18** | **Alertas Proativos de SLA e Telemetria FinOps** | Notificar analistas em 80% do SLA e monitorar consumo de tokens, latência e unit economics. | Módulo de alertas Telegram/E-mail, métricas de observabilidade. |
| **19** | **Infraestrutura Cloud & Deploy em Produção Hospedada** | Publicar a aplicação no Cloudflare Pages/Workers + D1 e n8n em VPS com SSL e plano de rollback. | Deploy automatizado, runbook de rollback (DNS/banco/contêiner). |
| **20** | **Ativação dos Canais Oficiais de Produção** | Conectar Bot Telegram oficial e canais de entrada com webhooks autenticados. | Webhooks de produção ativos, suporte a áudio/PDF/planilhas ao vivo. |

---

## 2. Detalhamento do Marco 16 (Marco Atual)

### A. Cenários Sintéticos de Borda

1. **Caso Alfa (case-alfa-divergencia-faturamento)**:
   - **Descrição**: Empresa declara R$ 12M/ano no ERP, mas extratos bancários conciliados apontam R$ 8.5M/ano.
   - **Comportamento Esperado**: Gerentes Gerais de Financeiro e Conta detectam divergência material, gerando DIVERGENCIA_DE_DADOS com envelope MANUAL_REVIEW_REQUIRED.

2. **Caso Beta (case-beta-restricao-parcial-garantia)**:
   - **Descrição**: Restrição cartorária de baixo valor contestada judicialmente, solicitando R$ 500k com garantia real de R$ 2M.
   - **Comportamento Esperado**: Gate de elegibilidade de Conta delimitado (não-veto genérico), encaminhamento para revisão com recomendação de condicionamento de garantia.

3. **Caso Gama (case-gama-compromisso-reciprocidade)**:
   - **Descrição**: Cliente solicita isenção tarifária, mas possui 2 compromissos de reciprocidade vencidos no domínio de Relacionamento.
   - **Comportamento Esperado**: Detecção de pendência de reciprocidade com recomendação de contraproposta comercial estruturada.

### B. Plano de Verificação e Homologação
- Execução automatizada via scripts/test-assisted-operations.ps1.
- Inspeção de proveniência no Evidence Graph (nós FINDING, OBSERVATION, RECOMMENDATION).
- Registro da resolução simulada na Mesa do Revisor (RESOLVED_CONFIRMED / RESOLVED_REJECTED).
- Validação contínua com 
pm run lint e 
pm run build.

---

## 3. Protocolo Obrigatório por Marco
1. **Backup**: Geração de arquivo compactado .zip a cada etapa concluída.
2. **Git**: Commit e push na branch main do GitHub.
3. **Workspace Sync**: Sincronização automática em c:\Users\fael\Downloads\A.
4. **Relatório**: Envio de e-mail formal com changelog para ael@live.de.
