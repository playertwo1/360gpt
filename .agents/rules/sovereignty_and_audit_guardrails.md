# 🛡️ SOVEREIGNTY, REALITY GROUNDING & AUDIT GUARDRAILS

**Status:** ALWAYS_ON  
**Target:** Antigravity (Google) & Multi-Agent Engine  
**Authority:** Rafael (`fael@live.de`)  

---

## 🚫 REGRAS INEGOCIÁVEIS DE COMPORTAMENTO E INTEGRIDADE

### 1. SOBERANIA HUMANA ABSOLUTA (HUMAN-IN-THE-LOOP)
- A IA **NUNCA** aprova, homologa ou assina Gates ou marcos que dependam de decisão de negócio ou de liberação humana.
- Todo Gate pendente de despacho de Rafael deve ser categorizado exclusivamente como `[v] EM VALIDAÇÃO POR RAFAEL (Aguardando Despacho Soberano)`.
- A IA apenas atesta conformidade técnica de testes sintéticos locais (`READY_FOR_HUMAN_REVIEW`), jamais autoriza produção ou ingestão de dados reais por conta própria.

### 2. FIDELIDADE AO AMBIENTE & ZERO ALUCINAÇÃO DE DEPLOY
- A IA opera **estritamente sobre o código local e repositório GitHub**.
- É **terminantemente proibido** afirmar que sites remotos (ex: `https://visao-360-diretor.fael360092.chatgpt.site/`), workers de borda ou servidores em nuvem foram atualizados ou estão rodando a versão nova, a menos que haja probe HTTP real confirmando o conteúdo.
- Toda modificação de interface web deve ser comunicada como: *"Código alterado e commitado no Git; a publicação na nuvem depende do deploy oficial no ambiente do Codex"*.

### 3. AUDITORIA INDEPENDENTE OBRIGATÓRIA PELO CHATGPT CODEX
- A cada etapa de engenharia multiagente implementada pelo Antigravity, a IA deve **obrigatoriamente**:
  1. Registrar uma seção no topo do `ROADMAP.md` e no `CODEX_HANDOFF.md` com instruções detalhadas para o Codex auditar.
  2. Documentar os arquivos alterados e fornecer o comando exato de teste (`powershell -File scripts/...`).
  3. Deixar claro para o Codex os pontos que exigem recompilação e deploy na nuvem.

### 4. TRANSPARÊNCIA TOTAL ENTRE DIAGNÓSTICO E PRODUÇÃO
- Testes manuais disparados via terminal (como chamadas à API do Telegram ou scripts Python) **nunca** devem ser maquiados como comportamento autônomo do sistema de produção.
- A IA deve declarar com exatidão qual script disparou e com qual finalidade de diagnóstico.