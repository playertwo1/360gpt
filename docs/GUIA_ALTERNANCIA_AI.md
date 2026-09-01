# 🔄 GUIA DE ALTERNÂNCIA: ANTIGRAVITY ↔ CHATGPT CODEX
## Protocolo Oficial de Pair Programming Multi-IA — Diretor 360

**Data:** 26 de agosto de 2026  
**Versão:** 3.1.0-confianca  
**Autoridade Decisória:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  

---

## 🎯 Objetivo
Permitir que Rafael alterne o desenvolvimento entre o **Antigravity (Google)** e o **ChatGPT Codex (OpenAI)** a qualquer momento, com **zero perda de contexto**, garantindo que ambas as IAs compreendam instantaneamente onde o projeto está e o que deve ser feito a seguir.

---

## 🗂️ Arquivos do Kit de Suporte à Alternância

| Arquivo | Finalidade | Como Usar |
|---|---|---|
| **`SESSION_STATE.json`** | Estado de máquina leve e legível por IA em 1 chamada rápida | Lido no início de cada sessão para saber fase, tarefa e commit atual |
| **`ROADMAP.md`** | Planejamento e checklist granular únicos, com status `[ ]`, `[~]`, `[x]` | Fonte oficial de sequência e aceite |
| **`PROJECT_STATE.md`** | Estado operacional validado e instrução de retomada | Conferido contra código, testes e Git |
| **`status.md`** | Relatório executivo com KPIs, saúde e matriz de workflows | Visão macro de alto nível para Rafael |
| **`CODEX_HANDOFF.md`** | Guia textual detalhado com o que existe vs. o que não existe | Referência rápida para o ChatGPT Codex |
| **`trocar-de-agente.bat`** | Script de 1 clique para fechar a sessão, testar e salvar | Executado por Rafael antes de mudar de ferramenta |

---

## 📋 Protocolo de 3 Passos para Trocar de Assistente

### 🔹 Passo 1: Antes de Sair do Assistente Atual (Fechar a Sessão)
Diga para a IA atual:
> *"Vou alternar para o outro assistente. Execute o script de handoff, faça o backup no Google Drive, suba para o GitHub e atualize ROADMAP.md, PROJECT_STATE.md, CHANGELOG.md e status.md."*

Ou simplesmente dê duplo clique no arquivo:
```powershell
.\trocar-de-agente.bat
```

### 🔹 Passo 2: Ao Abrir o Novo Assistente (Abrir a Sessão)
Copie e cole um dos **Prompts Prontos** abaixo no chat do novo assistente:

#### 📝 Prompt para colar no ChatGPT Codex:
```text
Olá, Codex! Estou retomando o projeto Diretor 360 v3.1.0.
Por favor, leia os arquivos nesta ordem:
1. AGENTS.md
2. PROJECT_STATE.md
3. ROADMAP.md
4. CHANGELOG.md recente
5. SESSION_STATE.json e CODEX_HANDOFF.md
Valide contra Git e me informe o marco atual e o próximo passo exato.
```

#### 📝 Prompt para colar no Antigravity:
```text
Olá, Antigravity! Trabalhei pelo Codex e estou voltando por aqui.
Por favor, leia AGENTS.md, PROJECT_STATE.md, ROADMAP.md e CHANGELOG.md recente.
Valide o estado contra Git e avance para o próximo item elegível do roadmap.
```

---

## 🛠️ Regras de Ouro para Ambas as IAs (Codex & Antigravity)

1. **Nunca inventar regras de negócio:** Sempre seguir `AGENTS.md` e `ROADMAP.md`.
2. **Ambiente Windows / PowerShell:** Todos os scripts de teste e execução usam PowerShell (`.ps1`) ou batch (`.bat`).
3. **Schemas JSON:** Sempre no padrão `Draft 2020-12` em `contracts/*.schema.json`.
4. **Segurança Zero-Trust:** Nunca versionar arquivos `.env` com senhas reais no Git.
5. **Asserções Concretas:** Nenhum teste pode ser "fake"; deve sempre validar arquivos, schemas, rotas e nós reais.
6. **Sincronização Obrigatória:** Sempre commitar no GitHub (`origin main --tags`) e copiar o `.zip` para `Google Drive/360` e `Meu Drive/360`.

---
*Kit oficial de suporte à alternância de assistentes IA — Diretor 360.*
