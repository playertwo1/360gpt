# 📘 LIVRO MESTRE DO PROJETO: DIRETOR 360 (v3.1.0)
## Guia Completo de Negócio, Arquitetura, Governança e Evolução

**Autoridade Decisória do Projeto:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  
**Versão Atual:** `v3.1.0-confianca`  
**Data de Publicação:** 26 de agosto de 2026  
**Status do Sistema:** 🟢 100% Homologado (13/13 Testes Certificados)  
**Repositório GitHub:** `https://github.com/playertwo1/360.git` (Branch `main`)  

---

## 🎯 1. Visão Executiva: O Que É o Diretor 360?

O **Diretor 360** é uma plataforma multiagente corporativa de **Inteligência, Análise e Governança de Crédito e Relações PJ (Pessoa Jurídica)**.

### O Problema que ele Resolve:
Na rotina bancária e de crédito PJ tradicional, analisar uma empresa exige abrir dezenas de telas, consultar bureaus (SERASA, Receita, CADIN, CNDs), tabular extratos bancários de 12 meses, calcular margens financeiras e redigir laudos em PDF manualmente. Esse processo leva horas, gera erros manuais e custa caro.

### A Solução do Diretor 360:
O sistema automatiza a triagem, cálculo e consolidação das empresas em **menos de 3 segundos**:
1. **Fontes governam:** Ingestão de dados oficiais (Receita, DREs, extratos bancários, cartões, certidões).
2. **Motores calculam:** Código puro calcula faturamento anual, liquidez, score e limites sugeridos sem risco de alucinação de IA.
3. **Especialistas analisam:** Quatro Gerentes Gerais de IA emitem pareceres setoriais isolados.
4. **Evidence Graph comprova:** Cada afirmação é rastreada com hash criptográfico SHA-256 (zero afirmações inventadas).
5. **Laudo Diagramado:** Emissão em 1 clique de um **Laudo Executivo de 3 páginas em PDF** pronto para comitê de crédito.
6. **Rafael decide:** **Nenhum robô aprova crédito sozinho.** Toda recomendação passa pelo crivo de Rafael na Mesa do Revisor (`/reviews`).

---

## 🏛️ 2. Arquitetura dos Agentes e Princípio da Menor Autonomia

A estrutura organizacional do Diretor 360 foi desenhada inspirada na governança de bancos de investimento:

```
                      [ RAFAEL (Autoridade Decisória Final) ]
                                         ▲
                                         │ Despacho Humano (/reviews ou Telegram)
                                         │
                             [ DIRETOR 360 ] (Governador)
                                         │ Declara necessidades e escopo
                   ┌─────────────────────┼─────────────────────┐
                   ▼                     ▼                     ▼
          [ GG CONTA ]         [ GG PERFORMANCE ]     [ GG FINANCEIRO ]    [ GG RELACIONAMENTO ]
          (Cadastro, limites,  (Metas comerciais,     (Margem, liquidez,   (Histórico, conversas,
           apontamentos, CNDs)  produção, pontuação)   rentabilidade, DRE)  compromissos, perfil)
                   │                     │                     │                     │
                   └─────────────────────┼─────────────────────┘
                                         ▼
                           [ MOTOR DE CONSOLIDAÇÃO 360 ]
                                         │ Valida Schemas Draft 2020-12
                                         │ Constrói o Evidence Graph SHA-256
                                         ▼
                            [ ESTADO 360 IMUTÁVEL ]
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
       [ LAUDO EXECUTIVO EM PDF ]              [ ASSESSOR EXECUTIVO 360 ]
       (3 Páginas Platypus ReportLab)          (Resumos e Telegram Bot @Diretor_360bot)
```

### Papel de Cada Agente:

| Agente | Responsabilidade Principal | O Que Ele NÃO Pode Fazer |
|---|---|---|
| **Diretor 360** | Governar o fluxo, verificar autorizações e coordenar dependências. | Aprovar crédito, inventar dados ou consolidar manualmente. |
| **GG Conta** | Verificar cadastro, sócios, restrições, certidões e elegibilidade. | Opinar sobre financeiro ou decidir pelo cliente. |
| **GG Performance** | Avaliar metas atingidas, esteira comercial e projeções. | Alterar limites ou aprovar operações. |
| **GG Financeiro** | Analisar faturamento 12M, margem, liquidez, endividamento e DRE. | Conceder crédito sem comprovação documental. |
| **GG Relacionamento** | Analisar histórico de conversas, perfil do cliente e pontualidade. | Ignorar restrições cadastrais apontadas pelo GG Conta. |
| **Motor de Consolidação** | Unir os dados por regras matemáticas e gerar o Evidence Graph. | Usar IA generativa para resolver conflitos entre fontes. |
| **Assessor Executivo** | Explicar o laudo, sintetizar o painel e responder no Telegram. | Alterar o Estado 360 ou tomar decisões transacionais. |
| **Rafael** | **Autoridade máxima humana.** Aprovar, rejeitar ou ajustar propostas. | — |

---

## 📜 3. Histórico e Fases do Roadmap de Confiança

O projeto foi construído sobre uma esteira de 8 fases rigorosamente testadas:

1. **Fase 0 (Baseline & Contratos):** Padronização formal com JSON Schema Draft 2020-12 e Manifesto de Release imutável.
2. **Fase 1 (Reliability Foundation):** 10 Workflows n8n, Webhook Telegram, Fila DLQ, recuperação com RTO 3m12s e RPO 0s, atalhos de 1-clique.
3. **Fase 2 (Observability & Evals):** Suíte canônica com 20 casos empresariais sintéticos avaliando 4 camadas (L1 Matemática 100%, L2 Extração F1 1.00, L3 Raciocínio 100%, L4 Decisão 100%).
4. **Fase 3 (Radar Comercial & Entity Resolution):** Adiada para o futuro por decisão estratégica de Rafael.
5. **Fase 4 (Decision Intelligence & Laudo PDF):** Criação do contrato `DecisionRecord` e do motor `core/pdf_report_generator.py` que gera o laudo de 3 páginas.
6. **Fase 5 (LLMOps & FinOps):** Model Router em 5 tiers economizando **79.1% de custos de tokens**.
7. **Fase 6 (Security, LGPD & PRR):** Suíte de Red Teaming contra injeções, motor DLP com mascaramento de CPF e aprovação dos 10/10 gates do PRR.
8. **Fase 7 (Canary Rollout):** Protocolo operacional supervisionado de 1 a 10 casos com taxa de ajuste humano de 10%.
9. **Fase 8 (Escala & VPS Linux):** Script `scripts/provision-vps-server.sh` pronto para ativação 24h em nuvem sob demanda.

---

## 💻 4. Guia Prático de Operação (Dia a Dia de Rafael)

### Como Usar no Computador:
1. **Ligar o Sistema (1-Clique):** Duplo clique em `iniciar-diretor-360.bat`. O navegador abre no Dashboard e na Mesa do Revisor (`http://localhost:3000`).
2. **Ligar o Telegram Bot:** Duplo clique em `iniciar-telegram-bot.bat`. O bot `@Diretor_360bot` responde em tempo real no seu celular.
3. **Despachar Casos:** Na Mesa do Revisor (`/reviews`), visualize as empresas analisadas e clique em **Aprovar**, **Ajustar Limite** ou **Solicitar Saneamento**.
4. **Baixar Laudos:** Clique em "Download Laudo PDF" para obter o documento pronto.
5. **Encerrar o Dia:** Duplo clique em `parar-diretor-360.bat`.

---

## 🛠️ 5. Como Modificar o Sistema no Futuro (Para Humanos)

### A. Como Alterar as Regras de um Gerente Geral Existente:
- Os contratos e prompts dos agentes ficam em `domains/<dominio>/`.
- Exemplo: Para alterar as regras do GG Conta, edite `domains/conta/GERENTE_GERAL_CONTA.md` e a respectiva política em `policies/`.

### B. Como Criar um Novo Agente no Futuro:
1. Nunca crie agentes dinamicamente em tempo de execução.
2. Defina o novo agente em `domains/<novo_dominio>/GERENTE_GERAL_<DOMINIO>.md`.
3. Registre suas capacidades em `policies/capability-registry.yaml`.
4. Adicione seu schema em `contracts/` e atualize o Motor de Consolidação em `core/`.
5. Execute `powershell -File scripts/run-all-hybrid-tests.ps1` para validar que nenhum teste quebrou.