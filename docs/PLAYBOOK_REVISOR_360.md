# MANUAL E PLAYBOOK OPERACIONAL DO REVISOR 360
## Procedimentos Padrão Operacionais (SOP) da Mesa do Revisor

**Versão:** 1.0.0  
**Data de Publicação:** 26 de agosto de 2026  
**Autoridade Decisória:** Rafael (ael@live.de / 
afa.pedrosa1@gmail.com)  
**Público-Alvo:** Revisores Humanos Autorizados na Central de Revisão 360  
**Inspiração de Mercado:** ISO/IEC 42001 (Governança de IA) & NIST AI RMF (Gestão de Riscos)  

---

## 1. Identidade, Mandato e Segregação de Funções

> **Princípio Central:** Fontes governam. Motores calculam e consolidam. Especialistas analisam. Gerentes Gerais coordenam. O Assessor sintetiza. O Diretor governa. **Rafael decide.**

Nenhum agente automatizado, modelo de IA ou fluxo do n8n pode aprovar concessões de crédito, relevar restrições cadastrais, perdoar reciprocidades comerciais ou tomar decisões finais sobre o cliente. A autonomia da IA encerra-se na emissão do parecer fundamentado; **a decisão é prerrogativa exclusiva do Revisor Humano**.

### Segregação Estrita de Funções
- **Propor:** Especialistas e Gerentes Gerais de Domínio analisam e sugerem ações.
- **Validar:** Motor de Consolidação 360 e Validador JSON Schema aplicam filtros e deduplicação.
- **Decidir:** Revisor Humano Autorizado na Mesa do Revisor (/reviews).
- **Executar:** Executor Transacional após autorização humana formal.
- **Auditar:** Trilha de auditoria append-only no Evidence Graph 360.

---

## 2. Ciclo de Vida do Ticket de Revisão (State Machine)

Todo ticket na Mesa do Revisor segue uma máquina de estados estritamente determinística:

`
[ PENDING_TRIAGE ]
       │
       ▼ (Atribuição do Revisor)
  [ ASSIGNED ]
       │
       ▼ (Início da Análise)
 [ IN_REVIEW ]
       │
       ├─────────────────────────┬─────────────────────────┐
       ▼                         ▼                         ▼
[ RESOLVED_CONFIRMED ]    [ RESOLVED_REJECTED ]    [ MORE_DATA_REQUIRED ]
`

### Regras de Transição e Prazos (SLAs)
- **Lease / Lock de Exclusividade:** Ao assumir um ticket (ASSIGNED), o revisor recebe um lock de **10 minutos**, renovável, impedindo que outro analista edite o mesmo caso simultaneamente.
- **Prioridade e Prazos Máximos:**
  * **P0_CRITICAL (1 hora):** Impedimentos regulatórios graves ou divergências críticas de liquidez.
  * **P1_HIGH (4 horas):** Divergências materiais de faturamento ou restrições parciais com operações pendentes.
  * **P2_NORMAL (24 horas):** Quebras de reciprocidade comercial, dúvidas cadastrais ou triagens ambíguas.

---

## 3. Matriz Definitiva de Reason Codes & Critérios de Decisão

| Reason Code | Categoria | Descrição do Problema | Procedimento Padrão do Revisor |
|---|---|---|---|
| DIVERGENCIA_DE_DADOS | CONFLICT | Incompatibilidade entre fontes declaradas (ex: Faturamento ERP vs. Extratos Bancários). | **1.** Inspecionar o extrato no Evidence Graph.<br>**2.** Adotar o menor valor comprovado.<br>**3.** Emitir RESOLVED_REJECTED ou redimensionar proposta comercial. |
| ELEGIBILIDADE_CONDICIONAL | CONTA | Restrição cadastral de pequeno valor ou sob discussão judicial, com garantias reais robustas. | **1.** Verificar valor e status judicial da restrição.<br>**2.** Validar avaliação da garantia.<br>**3.** Emitir RESOLVED_CONFIRMED com cláusula expressa de gravame/alienação. |
| RECIPROCIDADE_PENDENTE | RELACIONAMENTO | Cliente solicita isenção de tarifas ou taxa reduzida, mas possui compromissos de folha/produtos vencidos. | **1.** Avaliar histórico de relacionamento.<br>**2.** Emitir RESOLVED_CONFIRMED condicionado à portabilidade da folha em 30 a 60 dias ou RESOLVED_REJECTED. |
| DIVERGENCIA_NORMATIVA | CONFLICT | Conflito entre normas internas ou regulamentos vigentes. | **1.** Não decidir por inferência.<br>**2.** Acionar parecer jurídico/compliance.<br>**3.** Registrar MORE_DATA_REQUIRED. |
| DIVERGENCIA_INTERNA | CONFLICT | Especialistas de domínios diferentes emitiram pareceres contraditórios. | **1.** Aplicar a Hierarquia de Precedência.<br>**2.** Escolher a fundamentação de maior autoridade probatória.<br>**3.** Registrar a justificativa no despacho. |

---

## 4. Hierarquia de Precedência para Desempate

Quando houver fontes ou pareceres divergentes, o revisor deve aplicar a ordem mandatória de autoridade:

1. **Normas Legais e Regulatórias Vigentes (LGPD, BACEN, Compliance):** Prevalecem sobre qualquer política interna ou parecer de IA.
2. **Apontamentos Cadastrais e Restrições Oficiais Confirmadas:** Prevalecem sobre declarações informais do cliente.
3. **Dados Autorizados e Recentes (Extratos bancários conciliados, DRE auditada):** Prevalecem sobre estimativas de ERP não conciliadas.
4. **Derivações de Motores Determinísticos:** Prevalecem sobre inferências de linguagem natural do LLM.
5. **Pareceres de Especialistas de Domínio:** Fornecem contexto consultivo, mas não possuem força de veto automático.

---

## 5. Roteiro de Inspeção do Evidence Graph 360

Antes de emitir qualquer resolução, o revisor deve obrigatoriamente realizar a checagem visual de evidências:

1. **Acessar o Painel de Linhagem:** No Dashboard principal ou na Mesa do Revisor, clicar no botão **🔒 Evidence Graph 360** ou **🔒 Ver Linhagem / Evidence Graph**.
2. **Verificar os Três Vértices PROV:**
   - **Nó de Origem (SOURCE_ARTIFACT):** Conferir arquivo original (PDF, XLSX, JSON) e timestamp de recepção.
   - **Nó de Transformação (TRANSFORMATION / OBSERVATION):** Conferir regra determinística aplicada e valores calculados.
   - **Nó de Achado (FINDING):** Conferir a fundamentação do Gerente Geral de Domínio.
3. **Conferir Integridade Criptográfica:** Garantir que o content_hash do artefato (sha256:...) está íntegro e que não houve mutações nos nós históricos.

---

## 6. Protocolo de Assinatura Digital Imutável

Ao concluir uma revisão na Mesa do Revisor:

1. O revisor preenche as **Notas de Resolução** justificando a decisão de negócio de forma clara e objetiva.
2. O sistema gera automaticamente a **Assinatura Digital SHA-256** do despacho.
3. A resolução é gravada de forma **append-only** na tabela 
eview_resolutions e no nó REVIEW_RESOLUTION do Evidence Graph.
4. **Garantia de Imutabilidade:** Triggers no banco de dados rejeitam qualquer comando de UPDATE ou DELETE sobre a resolução, assegurando que o histórico permaneça 100% auditável perante auditorias internas e regulatórias.

---

**Aprovado por:** Rafael (ael@live.de / 
afa.pedrosa1@gmail.com)  
**Status Operacional:** Ativo na Release v1.0.0
