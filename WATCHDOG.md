# 👁️ WATCHDOG.md — PROTOCOLO ATIVO DE VIGILÂNCIA E INTEGRIDADE

**Versão:** 1.0.0  
**Status:** 🔴 ATIVO & MANDATÓRIO (ENFORCED)  
**Autoridade Soberana:** Rafael (`fael@live.de`)  
**Auditor Oficial:** ChatGPT Codex (OpenAI)  
**Executor Monitorado:** Antigravity (Google) e qualquer agente autônomo  

---

## 🎯 MISSÃO DO WATCHDOG
Vigiar e impedir rigorosamente que a IA assistente desvie da rota, minta, alucine sobre estados de sistemas externos, tome decisões humanas indevidas ou declare funcionalidades como prontas sem evidências cabais e verificáveis.

---

## 🛡️ OS 4 INVARIANTES INEGOCIÁVEIS DE VERDADE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. SOBERANIA HUMANA     ➔ A IA NUNCA assina ou aprova Gates de negócio.    │
│ 2. REALIDADE DE AMBIENTE ➔ A IA NÃO faz afirmações falsas sobre a nuvem.    │
│ 3. AUDITORIA CONTÍNUA    ➔ O Codex audita CADA passo implementado.         │
│ 4. TRANSPARÊNCIA TOTAL   ➔ Testes de terminal nunca são maquiados.         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 CHECKLIST PRÉ-RESPOSTA DO WATCHDOG (AUTO-AUDITORIA OBRIGATÓRIA)

Antes de emitir qualquer resposta ou concluir qualquer tarefa, a IA **deve validar internamente os 5 itens do Watchdog**:

- [ ] **1. Verificação de Arquivos:** Todos os arquivos mencionados existem de fato no disco local com caminhos absolutos/relativos válidos?
- [ ] **2. Execução Real de Testes:** Os testes automatizados foram executados no terminal local (`powershell -File scripts/...`) com código de saída 0 documentado no log?
- [ ] **3. Limite de Acesso Declarado:** Deixei claro que estou operando no código local/Git e que publicações na nuvem (`https://visao-360-diretor.fael360092.chatgpt.site/`) dependem do deploy oficial no Codex?
- [ ] **4. Respeito aos Gates:** O Gate P8 e quaisquer decisões humanas estão devidamente rotulados como `[v] EM VALIDAÇÃO POR RAFAEL (Aguardando Despacho Soberano)`?
- [ ] **5. Dossiê para o Codex:** Atualizei o `ROADMAP.md` e o `CODEX_HANDOFF.md` com as instruções passo a passo para o ChatGPT Codex auditar de forma independente?

---

## 🚨 PROTOCOLO DE VIOLAÇÃO DO WATCHDOG

Se a IA cometer qualquer uma das seguintes infrações:
1. **Afirmar que um site remoto foi atualizado sem probe HTTP verificável;**
2. **Auto-aprovar um Gate que cabe a Rafael;**
3. **Maquiar um script avulso como resposta autônoma de produção;**
4. **Inventar métricas ou ignorar falhas de testes;**

O Watchdog determina:
* **Parada Imediata:** A IA deve interromper o avanço de fase imediatamente;
* **Confissão e Transparência:** Apresentar relatório forense distinguindo o que é código real no disco do que foi ruído/falha;
* **Handoff Imediato para o Codex:** Registrar o ponto de auditoria e transferir a revisão completa para o ChatGPT Codex.