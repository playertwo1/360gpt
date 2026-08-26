# ⚡ GUIA RÁPIDO DE INICIALIZAÇÃO & DEMONSTRAÇÃO (QUICKSTART 360)
## Como Iniciar, Testar e Navegar no Diretor 360 em 2 Minutos

**Versão da Release:** 2.0.1  
**Autoridade Decisória:** Rafael (ael@live.de / 
afa.pedrosa1@gmail.com)  
**Data:** 26 de agosto de 2026  

---

## 1. Como Iniciar Todos os Serviços em 1 Minuto

Abra o terminal do PowerShell na pasta do projeto e execute:

`powershell
# 1. Subir os servicos de backend (n8n + PostgreSQL)
docker compose -f compose.n8n.yaml --env-file .env.n8n up -d

# 2. Iniciar a aplicacao Web (Dashboard & Mesa do Revisor)
npm run dev
`

---

## 2. Script de Demonstração Interativa em 1-Clique

Criamos um script que roda uma simulação executiva completa e abre automaticamente o navegador nas telas certas:

`powershell
powershell -File scripts/demo-live-showcase.ps1
`

O script irá:
1. Injetar um caso complexo de cliente PJ (*Divergência de Faturamento + Restrição Parcial com Imóvel Ofertado*).
2. Acionar os 4 Gerentes Gerais (Conta, Performance, Financeiro e Relacionamento).
3. Gerar a pendência na **Mesa do Revisor 360**.
4. Abrir automaticamente o Dashboard (http://localhost:3000) e a Mesa do Revisor (http://localhost:3000/reviews) no seu navegador!

---

## 3. Guia de Navegação Visual: Onde Ver Cada Recurso

### 🖥️ A. Dashboard Principal (http://localhost:3000)
- **Cards dos 4 Domínios:** Veja em tempo real o diagnóstico da empresa dividido em Conta, Performance, Financeiro e Relacionamento.
- **Síntese do Assessor Executivo:** Resumo executivo em linguagem natural no topo da página.
- **Botão 🔒 Evidence Graph 360:** Clique para abrir o modal de auditoria gráfica e visualizar a linhagem PROV ponta a ponta (Origem -> Regra -> Achado -> Resolução).

### ⚖️ B. Mesa do Revisor 360 (http://localhost:3000/reviews)
- **Fila de Pendências:** Veja os tickets classificados por prioridade (P0_CRITICAL, P1_HIGH, P2_NORMAL).
- **Lock de Atendimento (10 min):** Clique em um caso para assumir a análise com exclusividade.
- **Formulário de Decisão Humana:** Selecione a decisão (RESOLVED_CONFIRMED ou RESOLVED_REJECTED), insira uma justificativa e clique em **Gravar Resolução**.
- **Assinatura Digital SHA-256:** O sistema gera o hash imutável na hora e grava no Evidence Graph.

### 📊 C. Telemetria FinOps & SLAs (http://localhost:3000/api/metrics/finops)
- Visualize o consumo de tokens de IA, custo por análise PJ em centavos e alertas preventivos aos **80% do SLA**.

### ⚙️ D. Orquestrador n8n (http://localhost:5678)
- **Usuário:** dmin | **Senha:** (definida em .env.n8n).
- Visualize a execução visual dos 10 workflows ativos em tempo real.

---

## 4. Comandos Úteis de Teste e Homologação

`powershell
# Executar todos os testes de carga e integridade (Readiness Gate)
powershell -File scripts/test-release-readiness.ps1

# Executar bateria de operacao assistida com casos complexos
powershell -File scripts/test-assisted-operations.ps1

# Executar teste de telemetria FinOps e guardiao de SLA
powershell -File scripts/test-sla-alerts-finops.ps1
`

---

**Bom retorno para casa, Rafael! O sistema está 100% pronto para você explorar.**
