# 🧭 PROTOCOLO OPERACIONAL CANARY SUPERVISIONADO — DIRETOR 360
## Guia de Ingestão Assistida e Rollout Gradual (1–3 → 5 → 10 Casos)

**Versão:** 1.0.0  
**Autoridade Decisória:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  
**Status:** 🟢 HOMOLOGADO & OPERACIONAL  

---

## 🎯 1. Premissas e Governança

1. **Escopo Autorizado Obrigatório:** Toda empresa inserida na esteira Canary deve possuir autorização formal de tratamento cadastral e financeiro.
2. **Quatro Olhos & Human-in-the-Loop:** O Diretor 360 e seus Gerentes Gerais analisam, calculam e sugerem. Apenas **Rafael** autoriza a concessão de crédito, formalização ou contato externo.
3. **Evidence Graph & Laudo PDF:** Todo caso gera um Laudo Executivo em PDF de 3 páginas arquivado com hash SHA-256 antes da decisão final.
4. **Rastreabilidade de Overrides:** Se Rafael ajustar limites sugeridos ou solicitar novas garantias, o motivo do ajuste é registrado deterministicamente para recalibração de políticas.

---

## 🌊 2. As Três Ondas de Progressão Canary

### 🔹 Onda 1: Canary Inicial (1 a 3 Casos Sintéticos)
* **Objetivo:** Validar a integridade ponta a ponta da esteira de ingestão e geração de Laudo PDF.
* **Volume:** 3 fixtures sintéticas selecionadas.
* **Critério de Saída da Onda:** 100% de cálculos e schemas válidos, zero mutações/efeitos externos e validação manual de Rafael. A decisão humana nunca é simulada ou fabricada.

### 🔹 Onda 2: Expansão Controlada (4 a 5 Casos Sintéticos)
* **Objetivo:** Validar a conciliação de extratos bancários múltiplos e detecção de apontamentos cadastrais.
* **Volume:** Expansão acumulada para 5 empresas.
* **Critério de Saída da Onda:** Roteamento FinOps com economia $> 70\%$ e zero bloqueios falsos.

### 🔹 Onda 3: Piloto Consolidado (6 a 10 Casos Sintéticos)
* **Objetivo:** Atingir volume representativo para cálculo de SLA e taxa de override humano.
* **Volume:** 10 empresas processadas.
* **Critério de Saída da Onda:** **Human Override Rate $\le 10\%$** (concordância $\ge 90\%$ com as recomendações do Diretor 360).

---

## 📋 3. Fluxo Operacional na Mesa do Revisor (`/reviews`)

1. **Intake:** Caso ingerido via Telegram, API ou upload no Dashboard.
2. **Processamento:** Model Router aciona os 4 Gerentes Gerais e constrói o Evidence Graph.
3. **Geração do Laudo:** PDF de 3 páginas diagramado e disponibilizado para download.
4. **Despacho de Rafael:** Na Mesa do Revisor (`/reviews`), Rafael seleciona uma decisão real; o sistema não pode preenchê-la por simulação:
   - `[APROVAR CONFORME RECOMENDADO]`
   - `[APROVAR COM AJUSTE DE LIMITE / GARANTIA]`
   - `[SOLICITAR SANEAMENTO / DOCUMENTOS]`
   - `[RECUSAR COM JUSTIFICATIVA]`
5. **Auditoria:** Gravação imutável do Decision Record com hash SHA-256.
