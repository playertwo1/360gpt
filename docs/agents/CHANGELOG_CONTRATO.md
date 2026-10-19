# Changelog do contrato — AGENTS.md (Diretor 360)

> Movido verbatim do `AGENTS.md` da raiz em 2026-10-19 (reestruturação documental; ver `AGENTS.md` → Índice). Conteúdo não alterado.

## Changelog

### v2.8 — Camada Conversacional Contextual do Diretor 360 (Telegram)

- Homologada e ativada a Camada Conversacional Contextual no Telegram com o modelo `gemini-3.6-flash`, eliminando em 100% das mensagens livres o fallback prematuro no menu estático (`🎛️ Painel Operacional Ativo...`).
- Implementado Context Builder executivo com dados operacionais reais da agência 6895 (VJ-São Fidélis): fechamento de agosto (77,45 pts regulares / 109,29% com aceleradores), metas de setembro aguardando publicação da Matriz e pendências materiais conhecidas (Consórcio Expert +0,33 pt no ServiceNow, Bradesco Expresso 0,75 pt até o 5º dia útil).
- Gestão de sessão e continuidade multi-turno: persistência atômica de `current_state` e `session_context` (`pending_question`, `pending_action`, `pending_data`) na tabela `conversation_threads`, permitindo resolver respostas monossilábicas ou curtas ("Sim", "Não", "Rotativo", "Pode") com base na interação anterior.
- Migration 24 aplicada: índice rápido `idx_conversation_threads_chat_id`, tabela `operational_candidate_facts` com constraint `chk_provenance_owner` e RPC `record_operational_fact` com `SECURITY DEFINER`. Fatos operacionais livres acolhidos com proveniência estrita `OWNER_PROVIDED`.
- Preservação estrita dos 34 comandos e menu de atalhos operacionais (`/menu`, `/comandos`), bem como do pipeline documental assíncrono (Docling TableFormer CPU / PyMuPDF e Gemini Vision) na rota `DOCUMENT`.
- Suíte de 10 testes obrigatórios (`tests/conversational-core-ten-cases.test.mjs`) adicionada ao `npm test`: 10/10 casos aprovados, exit code 0.

### v2.7 — Ativação Canônica do WF-104 e Homologação do Flywheel com Governança Soberana

- Homologado e ativado o `WF-104` como controlador operacional canônico para reflexão semanal (`0 18 * * 5`), cálculo determinístico de DUR e consolidação do Flywheel no n8n.
- Desbloqueada soberanamente a flag `AUTO_PROMOTION_ENABLED` no PostgreSQL (`system_flags` e `runtime_feature_flags`) e configurada no container n8n.
- Migration 22 aplicada: suporte simétrico a `system_flags` (`key/value` e `flag_name/flag_value`), cadastro prévio do chat_id de Rafael na `owner_channel_allowlist` e `sovereign_approval_allowlist`, implementação de `insert_flywheel_audit_event` (`SECURITY DEFINER`) e sobrecargas transacionais para `claim_next_inbound_event`, `complete_inbound_event`, `fail_inbound_event` e `insert_structured_memory`.
- Filtros estritos de autopromoção consolidados no nó de decisão do WF-104: categorias em allowlist, `score >= 0.75`, `frequency >= 2`, risco estritamente `LOW`, proibição total de escopo `GLOBAL` autônomo (mantendo submissão como `MANUAL_REVIEW` para aprovação soberana via `/aprovardiretriz <UUID>`).
- Suíte de validação: 56/56 suítes verdes, 7/7 ataques adversariais contidos, 16/16 testes unitários aprovados, exit code 0.

### v2.6 — Sexta Remediação: Inbound RPCs, Assinatura Soberana Canônica e Desbloqueio WF-100/101

- Implementadas RPCs `SECURITY DEFINER` na Migration 18 (`ingest_channel_update`, `claim_next_inbound_event`, `complete_inbound_event`, `fail_inbound_event`), eliminando denial of service gerado por revogação de DML direto sem quebrar o princípio do menor privilégio para `visao360_app`.
- WF-100 refatorado no nó 03 para ingestão segura via `ingest_channel_update(...)`, sincronizado no n8n (`workflow_entity` e `workflow_history`) com paridade estrita (`nodes_match = true`).
- Migration 19 unifica assinatura soberana `approve_promotion_by_rafael(p_candidate_id uuid, p_inbound_event_id uuid)` com verificação estrita de correspondência de ID no comando `/aprovardiretriz <UUID>` e recálculo obrigatório de hash SHA-256 com proteção contra adulteração de payload.
- `activate_structured_memory` atualizada para verificar integridade e existência do nó no Evidence Graph (`evidence_nodes`).

### v2.5 — Quinta Remediação: Gates N7/N7A — Lockdown Transacional e Validação Soberana

- Migrations 13–16 aplicadas ao PostgreSQL (Gates N7 e N7A).
- Migration 15 implementa funções transacionais seguras (`insert_structured_memory`, `activate_structured_memory`, `insert_flywheel_audit_event`, `insert_golden_exemplar`) com bloqueio de memória global inferida via `SECURITY DEFINER`.
- Migration 16 implementa `validate_rafael_approval_event` (evento real do Telegram, hash recomputado, uso único), `approve_promotion_by_rafael` e tabela `system_flags` com semântica fail-closed.
- `learning-engine.mjs` exporta `isAuthenticatedRafaelApproval` delegando validação ao PostgreSQL.
- `reflexion-engine.mjs` exporta `findRealRafaelApprovalEvent` consultando tabela real de eventos.
- WF-101 nó 09 corrigido para não marcar DOCUMENT/IMAGE como `COMPLETED` prematuramente.
- `update-wf-101.mjs` corrigido: dados POBJ dinâmicos via `state_snapshots`, fatos confirmados via `inserted_fact_id`, secret por variável de ambiente.
- `state_snapshots` substituiu definitivamente `daily_snapshots` em todo o sistema.
- Suíte de testes expandida para 56/56 suítes (`npm test: PASS, exit 0`).

### v2.4 — Quarta Remediação: AUTO Restrito a Preferências Estruturadas e Menor Privilégio

- Restringido o modo `AUTO` estritamente a preferências estruturadas enumeradas (`RESPONSE_LENGTH`, `TABLE_PREFERENCE`, `TONE`, `SECTION_ORDER`), eliminando 100% de texto livre na autopromoção.
- Aplicada a Migration 12 no PostgreSQL: revogado DML direto da role `visao360_app` sobre `promoted_knowledge` e criadas funções `SECURITY DEFINER` com auditoria atômica transacional.
- Invariantes em nível de schema: constraints `chk_no_auto_textual` e `chk_no_inferred_global_active` garantindo proteção matemática contra bypass semântico e promoção indevida de regras globais.
- WF-101 ativado, publicado e consolidado como controlador operacional canônico no n8n 2.x, com recuperação automática de leases expirados, verificação dinâmica de saúde operacional e rota documental com Docling TableFormer CPU.
- `WF-104` e `AUTO_PROMOTION_ENABLED` mantidos inativos até autorização expressa e conclusão de homologação.

- Formalizada a decisão soberana de Rafael sobre os modos de promoção de aprendizado (`AUTO`, `OWNER_EXPLICIT`, `MANUAL_REVIEW`).
- Implementada autopromoção controlada exclusivamente para regras reversíveis de baixo risco (`LOW`) e categorias em allowlist positiva, com score >= 0.75 e frequência >= 2.
- Bloqueada terminantemente a autopromoção de regras globais, limites de crédito, taxas, compliance, sigilo bancário, privacidade, retenção de dados, fórmulas oficiais do POBJ e efeitos externos.
- Instituídos comandos soberanos no Telegram para supervisão contínua (`/diretrizes`, `/aprovardiretriz`, `/suspenderdiretriz`, `/revogardiretriz`).
- Proibida autoalteração de arquivos de sistema (`AGENTS.md`, System Prompts, políticas ou código); todo conhecimento promovido reside em tabelas dedicadas no PostgreSQL e é injetado como dados de contexto subordinados.

### v2.2 — n8n como autoridade operacional exclusiva

- Tornado o n8n o único controlador canônico de entrada, roteamento, agentes, decisões, perguntas, aprendizagem, estado e saída.
- Proibidos fluxos paralelos de negócio em Sites, Telegram, scripts, APIs, workers ou serviços auxiliares.
- Limitados canais a transporte/exibição, Docling a extração e PostgreSQL a persistência/consulta transacional.
- Instituído inventário versionado de exceções legadas, que ficam congeladas e não podem receber nova funcionalidade.
- Determinado que código escrito fora do n8n não constitui implementação concluída de uma capacidade operacional.

### v2.1 — Execução autônoma, estado e histórico

- Instituídos `ROADMAP.md`, `PROJECT_STATE.md`, `CHANGELOG.md` e `AGENTS.md` como arquivos obrigatórios e sincronizados.
- Formalizados retomada automática, critérios de `DONE`, continuidade e checkpoints.
- Definidos HARD BLOCKERS e notificação segura de interrupção para Rafael.
- Tornada obrigatória a validação do estado declarado contra código, testes, Git e roadmap.

### v2.0 — Diretor parceiro executivo e nova estrutura 360

- Diretor reposicionado como parceiro executivo de Rafael, integrador crítico e orquestrador dos quatro Gerentes.
- Formalizadas provocação respeitosa, autoridade final de Rafael e apoio após decisão.
- Atualizados Conta, Performance, Financeiro e Relacionamento conforme desenhos aprovados.
- Formalizadas abas individuais, pacotes de contexto e promoção governada de conhecimento.
- Instituída parceria prioritária Conta–Performance.
- Criados modos Conversa Direta, Visão do Diretor e Evento.
- Parecer executivo compacto substitui retorno limitado a sinais técnicos.
- Criadas Agenda Executiva, memória em camadas, aprendizado por contraste e hierarquia de evidências.
- Preservadas segurança, proveniência, idempotência, resiliência, auditoria e homologação da v1.11.
- Desenho aprovado por Rafael; runtime permanece inativo até implementação, avaliação e promoção explícita.


### v1.11 — Governança final de produção

- Instituídos RACI, proprietários de controles, decisões arquiteturais, classificação de mudanças e princípio de quatro olhos.
- Criados manifesto imutável de release, revisões periódicas, processo de desativação e pacote de evidências de conformidade.
- Definidos critérios de entrada, saída e prontidão para impedir que documentação aprovada seja confundida com implementação homologada.

### v1.10 — Continuidade e recuperação

- Definidos criticidade, RTO e RPO por componente, ordem segura de recuperação e critérios de operação degradada.
- Instituídos backups verificáveis, checkpoints duráveis, restauração transacional, testes de desastre e runbooks de dependência.
- Proibida reconstrução por memória de agente ou fail-open após perda de política, identidade, auditoria ou evidência.

### v1.9 — Eficiência, capacidade e custos

- Instituídos orçamento multidimensional por execução, atribuição de custos e roteamento de modelos por menor capacidade suficiente.
- Definidos backpressure, prioridades de serviço, cache/batching seguros, limites de concorrência e tratamento explícito de estouros.
- Integrados unit economics, SLOs e orçamento de erro sem permitir degradação silenciosa de qualidade ou segurança.

### v1.8 — Dashboard 360 e camada de consulta

- Transformado o Dashboard em read model imutável e versionado, derivado exclusivamente do Estado 360.
- Criados contratos de projeção, cartões, consultas e respostas ancoradas no mesmo snapshot.
- Definidos cache seguro por tenant e perfil, atualização seletiva, controle de desatualização, drill-down de evidências, redação prévia e requisitos de acessibilidade.

### v1.3 — Arquitetura revisada

- Substituído o veto genérico de **Conta** por um gate de elegibilidade com escopo, evidência e `reason_code` obrigatórios.
- Removida a dependência residual “Risco antes de Oferta”; não existe agente automatizado de Risco ou Fraude nesta arquitetura.
- Separados `status` técnico, confiança analítica e estado decisório.
- Corrigida a regra de baixa confiança: incerteza isolada exige revisão, mas não produz impedimento regulatório automático.
- Definidos `run_id`, `correlation_id` e `idempotency_key`, com ciclo de vida e composição mínima.
- Adicionados contratos para evidência, lacunas, conflitos e saída consolidada.
- Criadas regras de atualidade do dado, liberação parcial, retries, segurança, observabilidade e testes de aceitação.
- Corrigida a exigência de `data_gaps`: domínio não necessário e corretamente não acionado não é lacuna.
- Definida orquestração hierárquica: Diretor → Gerentes Gerais → especialistas.
- Retirada do Diretor a consolidação operacional dos pareceres.
- Introduzidos o **Motor de Consolidação 360**, responsável pela junção determinística e pelo payload do Dashboard, e o **Assessor Executivo 360**, responsável por sínteses, explicações e respostas em linguagem natural.
- Eliminado o estado automático de impedimento; todo conflito, restrição ou problema não resolvido gera `MANUAL_REVIEW_REQUIRED` com explicação estruturada.
- Adotado o **Princípio da Menor Autonomia Necessária**, com preferência por regras e workflows determinísticos, profundidade máxima de delegação, orçamento operacional e condições explícitas de parada.
- Formalizada a segregação entre propor, validar, decidir, executar e auditar; o Diretor verifica autorizações, mas nunca as concede, e o Motor apenas detecta conflitos.
- Adotado roteamento por capacidades: o Diretor declara a necessidade, cada Gerente Geral seleciona somente implementações ativas e o contexto é minimizado por domínio.
- Instituído ciclo de vida controlado para novos agentes; lacunas de capacidade podem originar propostas de projeto, mas nunca criação dinâmica durante uma execução.
- Padronizada a governança de contratos com JSON Schema Draft 2020-12, validação em toda fronteira, versionamento semântico, compatibilidade explícita e quarentena de mensagens inválidas.
- Substituídos limites globais de confiança por avaliação multidimensional de evidência, completude, inferência, elegibilidade e risco, com calibração específica por domínio e finalidade.
- Transformado o Estado 360 em snapshots imutáveis e versionados, com proveniência por campo, controle de concorrência, atualização parcial explícita e uso restrito de último estado válido.

### v1.4 — Homologação e operação segura

- Instituídos gates de homologação, implantação gradual, SLOs, monitoramento de drift, rollback e kill switches hierárquicos para agentes, capacidades, domínios e sistema.

### v1.5 — Segurança agentic

- Adotada segurança em profundidade para IA agentic, com classificação de dados, isolamento por tenant, autorização contextual, gateway de ferramentas, defesa contra prompt injection, DLP e cadeia de fornecimento verificável.

### v1.6 — Revisão manual

- Estruturada a Central de Revisão 360 com fila determinística, reason codes fechados, propriedade, SLA, escalonamento, deduplicação, resolução imutável e reprocessamento mínimo.

### v1.7 — Governança de fontes e evidências

- Instituídos Registro de Fontes e Evidence Graph, com autoridade por campo e finalidade, linhagem ponta a ponta, tempo bitemporal, correção e revogação propagadas aos itens dependentes.

---
