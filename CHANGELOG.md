# Changelog

### v2.0 — AGENTS do Diretor Geral 360 consolidado

- Publicada a identidade do Diretor como parceiro executivo, integrador crítico e orquestrador dos quatro Gerentes Gerais.
- Formalizadas as abas individuais de Conta, Performance, Financeiro e Relacionamento.
- Instituídos desafio construtivo, provocação respeitosa, agenda executiva, memória em camadas e promoção governada de conhecimento.
- Atualizada a parceria prioritária Conta–Performance e os modos Conversa Direta, Visão do Diretor e Evento.
- Separados placar oficial, produção pendente, cenários, impacto financeiro e valor de carteira.
- Mantidas as regras técnicas de proveniência, segurança, resiliência, auditoria, homologação e rollback.
- Documento promovido para v2.0 `APPROVED_DESIGN`; runtime permanece inativo até implementação e avaliação.

## Não publicado — Gerente Geral Financeiro v2.0 aprovado

> Gerente Geral e cinco especialistas aprovados por Rafael em 27/08/2026. Runtime permanece inativo.

- `dashboard-pj` adotado somente como referência funcional; dados demonstrativos, fórmulas, thresholds e recomendações fixas não foram homologados.
- GDAD reconhecido como fonte oficial de orçamento, realizado, saldo médio, spread, resultado, volume e variação.
- Snapshot oficial histórico de julho de 2026 registrado como primeira linha de base real, preservando hierarquia e impedindo dupla contagem.
- Cálculos permanecem determinísticos e valores publicados prevalecem sobre recálculos de validação.
- Diagnóstico aprovado nas filas `PROTECT`, `RECOVER`, `INVESTIGATE`, `MONITOR` e `LEARN`.
- Cenários e atribuição separados do oficial, com linha de base sem ação, risco, canibalização e POBJ em bloco próprio.
- Aprendizado usa `LOW_SAMPLE`, escopo, evidência, validade e proibição de generalização automática.
- Cinco especialistas aprovados: Fontes e Reconciliação; Cálculo e Estado; Diagnóstico e Concentração; Cenários e Atribuição; Desfechos e Aprendizado.
- Máximo de quatro especialistas por execução; nenhum contato ou operação externa é autorizado.

## 2026-08-27 — GG Conta 4.38.0: catálogo de especialistas concluído

- Concluída e aprovada a especificação do especialista `CONTA_CREDITO_APRENDIZADO` 1.0.0.
- Adicionados 29 códigos fechados de snapshot, decisão, contratação, utilização, desempenho, padrões, hipóteses, leakage, drift e abstenção.
- `reason-codes.yaml` avançou para 1.6.0.
- Formalizados integração, handoff canônico e 28 critérios de aceite do especialista de crédito.
- Os seis especialistas do GG Conta estão especificados e aprovados na versão 1.0.0.
- GG Conta 4.38.0 marcado como domínio aprovado, pendente de implementação técnica, contratos especializados e testes integrados.

## 2026-08-27 — GG Conta 4.37.0: governança do aprendizado de crédito

- Especialista `CONTA_CREDITO_APRENDIZADO` avançou para 0.5.0.
- Criados registro e sete estados de hipótese.
- Formalizados doze requisitos para eventual promoção a modelo.
- Incluídos calibração, análise de erros, drift, abstenção, validade, rollback, monitoramento e kill switch.
- Qualquer estimativa futura deverá ser rotulada como analítica e sem valor de aprovação institucional.

## 2026-08-27 — GG Conta 4.36.0: métricas de aprendizado de crédito

- Especialista `CONTA_CREDITO_APRENDIZADO` avançou para 0.4.0.
- Formalizadas métricas de decisão, contratação, utilização, prazo, condições e desempenho.
- Aprovadas faixas configuráveis: menos de 3, 3–29 e 30 ou mais decisões comparáveis.
- Incluídos controles para dependência entre tentativas, mudança de política, desbalanceamento, incerteza e maturação temporal.
- Reforçada proteção contra exposição de grupos pequenos e reidentificação.

## 2026-08-27 — GG Conta 4.35.0: resultado e desempenho de crédito

- Especialista `CONTA_CREDITO_APRENDIZADO` avançou para 0.3.0.
- Separados resultado da tentativa, contratação, utilização e desempenho posterior.
- Formalizados estados, campos e horizontes de acompanhamento.
- Aprovação deixou de ser tratada automaticamente como bom resultado e negativa não implica preparação inadequada.
- Criadas salvaguardas explícitas contra vazamento temporal e alteração retroativa do snapshot.

## 2026-08-27 — GG Conta 4.34.0: snapshot de tentativa de crédito

- Especialista `CONTA_CREDITO_APRENDIZADO` avançou para 0.2.0.
- Aprovado snapshot anterior à decisão com proposta, risco, conta, situação econômica, políticas e qualidade.
- Snapshot tornou-se imutável após submissão; correções geram versões vinculadas.
- Resultado posterior não pode ser gravado como informação conhecida antes da decisão.
- Definidos dados mínimos comparáveis com lacunas explícitas, sem preenchimento por suposição.

## 2026-08-27 — GG Conta 4.33.0: missão de Crédito e Aprendizado

- Criada a versão 0.1.0 do especialista `CONTA_CREDITO_APRENDIZADO`.
- Aprovadas missão, pergunta principal, responsabilidades, objetos, comparabilidade, resultados, níveis de aprendizado e salvaguardas.
- Aprendizado inicial limitado a casos individuais e padrões descritivos.
- Proibidas sondagem do motor, contorno de controles, garantia de resultado e alteração automática de políticas.

## 2026-08-27 — GG Conta 4.32.0: Risco e Elegibilidade 1.0.0

- Concluída e aprovada a especificação do especialista `CONTA_RISCO_ELEGIBILIDADE` 1.0.0.
- Adicionados 22 códigos fechados de Rating, Sale, restrições, políticas, elegibilidade, reprocessamento e exceção humana.
- `reason-codes.yaml` avançou para 1.5.0 sem duplicar códigos existentes.
- Formalizados integração, handoff canônico e 24 critérios de aceite.
- Especialista marcado como pronto para implementação e testes, sem autoridade para aprovar crédito ou executar alteração institucional.

## 2026-08-27 — GG Conta 4.31.0: gates e revisão de risco

- Especialista `CONTA_RISCO_ELEGIBILIDADE` avançou para 0.4.0.
- Gates passaram a usar apenas `PASS` e `MANUAL_REVIEW_REQUIRED`, sem rótulo genérico de bloqueio.
- Exigido menor escopo possível entre cliente, produto, operação e ação.
- Formalizados requisitos de PASS, conteúdo da revisão, saneamento e reprocessamento.
- Resolução de pendência passou a exigir nova execução e preservação do gate anterior.

## 2026-08-27 — GG Conta 4.30.0: regularização e histórico de risco

- Especialista `CONTA_RISCO_ELEGIBILIDADE` avançou para 0.3.0.
- Separadas baixa confirmada e primeira observação sem restrição.
- Criados estados pós-regularização sem linguagem de liberação automática.
- Formalizados reincidência, preservação histórica, nova análise legítima e divergência entre fontes.
- Proibidas tentativas destinadas a sondar o motor ou contornar controles.

## 2026-08-27 — GG Conta 4.29.0: Rating, Sale e restrições

- Especialista `CONTA_RISCO_ELEGIBILIDADE` avançou para 0.2.0.
- Rating e Sale passaram a preservar valor bruto e depender de tabela oficial versionada para interpretação direcional.
- Formalizados dados e oito estados de restrição, deterioração combinada e precedência de fontes.
- Escala 1–7 registrada como política condicionada à confirmação institucional antes do uso com dados reais.
- Melhora ou baixa não produzem aprovação automática e piora combinada eleva cuidado sem decidir crédito.

## 2026-08-27 — GG Conta 4.28.0: missão de Risco e Elegibilidade

- Criada a versão 0.1.0 do especialista `CONTA_RISCO_ELEGIBILIDADE`.
- Aprovadas missão, pergunta principal, responsabilidades, estados, gate por escopo, salvaguardas e resultado esperado.
- Separados risco, restrição, elegibilidade, decisão do motor, decisão humana e execução.
- Formalizado que impedimento confirmado afeta somente cliente, produto, operação ou ação alcançada pela regra.

## 2026-08-27 — GG Conta 4.27.0: Atividade e Centralização 1.0.0

- Concluída e aprovada a especificação do especialista `CONTA_ATIVIDADE_CENTRALIZACAO` 1.0.0.
- Adicionados 25 códigos fechados de atividade, movimentação, centralização, produtos e limites.
- `reason-codes.yaml` avançou para 1.4.0 sem duplicar códigos já existentes.
- Formalizados integração, handoff canônico e 20 critérios de aceite.
- Especialista marcado como pronto para implementação e testes, sem autoridade para conceder crédito, calcular retorno, pontos ou abordagem.

## 2026-08-27 — GG Conta 4.26.0: limites e uso responsável

- Especialista `CONTA_ATIVIDADE_CENTRALIZACAO` avançou para 0.5.0.
- Criados dez estados de limite e eventos de concessão, utilização, revisão e vencimento.
- Separados pré-aprovação, limite ativo e elegibilidade definitiva.
- Formalizado que crédito somente pode ser considerado diante de necessidade, viabilidade, risco e benefício plausível.
- Proibida sugestão de endividamento apenas para geração de meta.

## 2026-08-27 — GG Conta 4.25.0: produtos e profundidade

- Especialista `CONTA_ATIVIDADE_CENTRALIZACAO` avançou para 0.4.0.
- Separados contratação, ativação e utilização de produtos.
- Criados dez estados de uso e seis níveis de profundidade.
- Produto sem uso passou a exigir investigação antes de gerar alerta ou oportunidade.
- Cobertura e saturação passaram a utilizar somente a base elegível como denominador.

## 2026-08-27 — GG Conta 4.24.0: centralização e share

- Especialista `CONTA_ATIVIDADE_CENTRALIZACAO` avançou para 0.3.0.
- Separadas centralização confirmada, estimada, somente interna e desconhecida.
- Share passou a exigir fluxo, período, numerador, denominador, fonte, cobertura e confiança.
- Centralização passou a ser avaliada por tipo de fluxo, sem percentual geral enganoso.
- Formalizado que fluxo externo somente representa oportunidade potencial quando houver necessidade, benefício, adequação e elegibilidade.

## 2026-08-27 — GG Conta 4.23.0: métricas de atividade

- Especialista `CONTA_ATIVIDADE_CENTRALIZACAO` avançou para 0.2.0.
- Criados cinco níveis de atividade e oito tendências de movimentação.
- Formalizados métricas, períodos comparáveis, fluxos e tratamento de sazonalidade.
- Queda passou a considerar materialidade absoluta, relativa, histórica e contextual.
- Adiadas regras numéricas até calibração com dados reais e aprovação de Rafael.

## 2026-08-27 — GG Conta 4.22.0: missão de Atividade e Centralização

- Criada a versão 0.1.0 do especialista `CONTA_ATIVIDADE_CENTRALIZACAO`.
- Aprovadas missão, pergunta principal, responsabilidades, sete dimensões, salvaguardas e resultado esperado.
- Separada contratação de uso efetivo e quantidade de produtos de profundidade real.
- Formalizado que share externo depende de dado autorizado e que limite ocioso não representa problema isoladamente.

## 2026-08-27 — GG Conta 4.21.0: Ciclo de Vida e Saúde 1.0.0

- Concluída e aprovada a especificação do especialista `CONTA_CICLO_VIDA_SAUDE` 1.0.0.
- Adicionados 26 códigos fechados de checkpoint, saúde, recuperação, atividade, risco, atrito, concentração, saturação e oxigenação.
- `reason-codes.yaml` avançou para 1.3.0.
- Formalizados handoff canônico e 24 critérios de aceite.
- Especialista marcado como pronto para implementação e testes, sem autoridade para executar ações ou substituir outros domínios.

## 2026-08-27 — GG Conta 4.20.0: visão coletiva da carteira

- Especialista `CONTA_CICLO_VIDA_SAUDE` avançou para 0.6.0.
- Aprovado painel coletivo de composição, saúde, risco, atividade, concentração, saturação, capacidade futura e atrito.
- Exigidos período, data-base, numerador, denominador, cobertura, confiança e rastreabilidade.
- Proibida combinação de fontes ou períodos incompatíveis e exposição de itens sem autorização.
- Adiada criação de score único até haver histórico e calibração suficientes.

## 2026-08-27 — GG Conta 4.19.0: atrito e clientes-chave

- Especialista `CONTA_CICLO_VIDA_SAUDE` avançou para 0.5.0.
- Atrito passou a ser medido por eventos objetivos e percepção humana identificada.
- Cliente-chave passou a considerar valor financeiro, comercial, regional, relacional e dificuldade de reposição.
- Criada matriz valor × atrito com revisão humana obrigatória para eventual saída.
- Deterioração de cliente-chave passou a gerar prioridade de cuidado e necessidade de oxigenação.

## 2026-08-27 — GG Conta 4.18.0: sinais e prioridade de cuidado

- Especialista `CONTA_CICLO_VIDA_SAUDE` avançou para 0.4.0.
- Aprovados sinais negativos e positivos de maturação, atividade, risco, acompanhamento e recuperação.
- Criadas prioridades qualitativas P0–P3 e revisão manual, sem pesos arbitrários.
- Formalizado ciclo do alerta com evidência, prazo, conclusão verificável, cooldown e reabertura.
- Mantida separação entre prioridade de cuidado e prioridade de Performance.

## 2026-08-27 — GG Conta 4.17.0: saúde e tendência

- Especialista `CONTA_CICLO_VIDA_SAUDE` avançou para 0.3.0.
- Separadas condição atual de saúde e tendência temporal.
- Criados oito estados de saúde e cinco tendências.
- Exigidos períodos comparáveis para determinar tendência.
- Formalizado que melhora de Rating, Sale ou restrição não representa liberação automática.
- Permitidas combinações como saudável em piora e frágil em recuperação para evitar classificações simplistas.

## 2026-08-27 — GG Conta 4.16.0: checkpoints de Ciclo de Vida

- Especialista `CONTA_CICLO_VIDA_SAUDE` avançou para 0.2.0.
- Formalizados D0, D30, D60, D90 e D120 com objetivos e resultados verificáveis.
- D0 passou a preservar a linha de base de Rating, Sale e restrições.
- D120 passou a produzir classificação explícita de maturidade e condição.
- Contas maduras receberam monitoramento contínuo, revisão mensal de sinais e revisão estrutural trimestral.
- Eventos críticos podem antecipar revisão sem apagar o histórico dos checkpoints.

## 2026-08-27 — GG Conta 4.15.0: missão de Ciclo de Vida e Saúde

- Criada a versão 0.1.0 do especialista `CONTA_CICLO_VIDA_SAUDE` para construção conjunta com Rafael.
- Aprovadas missão, pergunta principal, saúde multidimensional, resultados esperados e limites.
- Incorporado acompanhamento histórico de entrada, baixa e reincidência de restrições e de melhora, estabilidade ou piora de Sale e Rating interno.
- Separadas detecção e prioridade de cuidado, em Ciclo de Vida, da avaliação técnica de elegibilidade, em Risco e Elegibilidade.

## 2026-08-27 — GG Conta 4.14.0: Prospecção e Oxigenação 1.0.0

- Concluída e aprovada a especificação do especialista `CONTA_PROSPECCAO_OXIGENACAO` 1.0.0.
- Adicionados 22 códigos fechados para prospect, pré-aprovação, abertura, ativação e handoff D0.
- `reason-codes.yaml` avançou para 1.2.0.
- Formalizados handoff canônico e 18 critérios de aceite.
- Especialista marcado como pronto para implementação e testes, sem autorização automática para contato ou abertura.

## 2026-08-27 — GG Conta 4.13.0: handoff de abertura e ativação

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.7.0.
- Criado handoff em duas etapas: abertura inicia D0; ativação transfere a responsabilidade principal para Ciclo de Vida.
- Formalizados critérios válidos e eventos que não comprovam ativação isoladamente.
- Definido conteúdo mínimo do histórico transferido e tratamento de situações especiais.
- Ausência ou conflito de regra oficial de ativação passou a exigir revisão manual.

## 2026-08-27 — GG Conta 4.12.0: atualidade do funil

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.6.0.
- Criados alertas configuráveis de 30, 60 e 90 dias sem atualização.
- Formalizadas validade de pré-aprovações, pausa, perda, descarte, ausência de retorno, reativação e retenção.
- Proibidos descarte e exclusão automáticos por baixo potencial, ausência de resposta ou condição vencida.
- Exigida preservação do histórico em perda, expiração e reativação.

## 2026-08-27 — GG Conta 4.11.0: priorização de prospects

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.5.0.
- Separados potencial estratégico de Conta e impacto fornecido por Performance.
- Criadas classificações qualitativas iniciais sem pesos arbitrários.
- Definidas matriz de tratamento, oito critérios de desempate e salvaguardas.
- Mantida a decisão consolidada no Diretor e a decisão operacional em Rafael.

## 2026-08-27 — GG Conta 4.10.0: funil de prospecção

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.4.0.
- Formalizados doze estágios do recebimento ao handoff D0 e seis estados laterais.
- Diferenciadas abertura institucional e ativação efetiva.
- Permitido avanço não linear quando sustentado por evidência, sem tornar visita obrigatória.
- Exigidos motivo, responsável, data e evidência para cada transição, pausa, perda, descarte ou reativação.

## 2026-08-27 — GG Conta 4.9.0: dados progressivos de prospecção

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.3.0.
- Separados dados mínimos de entrada, dados de qualificação, condições bancárias e acompanhamento comercial.
- Permitido ingresso simples no funil sem exigir dados que ainda serão obtidos durante a qualificação.
- Formalizados histórico de estágio, próxima ação, prazo, responsável e evidências das atualizações.
- Proibido preenchimento de dados ausentes por suposição.

## 2026-08-27 — GG Conta 4.8.0: origens de prospecção

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.2.0.
- Aprovadas dez origens de candidatos, incluindo indicações internas, prospecção própria, referências, bases empresariais, novas empresas, ex-clientes e grupos relacionados.
- Exigidos origem, recebimento, data-base, validade, responsável, finalidade e restrições de uso.
- Registrado que origem autorizada não substitui validação de identidade, qualidade, atualidade ou legitimidade de uso.

## 2026-08-27 — GG Conta 4.7.0: missão de Prospecção e Oxigenação

- Criada a versão 0.1.0 do especialista `CONTA_PROSPECCAO_OXIGENACAO` para construção conjunta com Rafael.
- Aprovadas missão, pergunta principal, conceito de oxigenação, definição de sucesso e limites iniciais.
- Separados os marcos de conversão, ativação e qualidade inicial.
- Formalizado o handoff futuro para Ciclo de Vida com preservação do histórico.

## 2026-08-27 — GG Conta 4.6.0: Identidade e Qualidade 1.0.0

- Criada a especificação canônica do especialista `CONTA_IDENTIDADE_QUALIDADE`.
- Formalizados entradas, suficiência contextual, validação, normalização, deduplicação, precedência, conflitos, saída e critérios de aceite.
- Mantida continuidade de registros válidos quando parte do lote estiver inválida.
- Determinada revisão manual somente para o escopo materialmente afetado.
- Adicionados 14 códigos fechados de identidade, qualidade, fonte, período, OCR e instrução embutida; `reason-codes.yaml` avançou para 1.1.0.

## 2026-08-27 — GG Conta 4.5.0: especialistas aprovados

- Aprovado catálogo com seis especialistas e limite de quatro acionamentos por execução.
- Formalizados Identidade e Qualidade; Prospecção e Oxigenação; Ciclo de Vida; Atividade e Centralização; Risco e Elegibilidade; Crédito e Aprendizado.
- Definidos gatilhos de roteamento, precedências e dependências internas.
- Removida do GG Conta toda dependência do Bibliotecário ou de um GG Conhecimento transversal.
- Regras de Conta passam a vir de políticas oficiais versionadas disponíveis no sistema; ausência, vencimento ou conflito gera `MANUAL_REVIEW_REQUIRED`.
- A migração do antigo Bibliotecário para subagente de Performance será tratada na revisão daquele domínio, sem alteração concorrente neste trabalho.

## 2026-08-27 — GG Conta 4.4.0: fronteiras entre domínios

- Formalizado que o GG Conta é proprietário da saúde do cliente e da carteira, sem absorver cálculos e interpretações especializados de outros domínios.
- Ampliadas as proibições relativas a metas, rentabilidade, abordagem, normas, crédito, ações externas, bloqueio amplo e julgamento subjetivo de atrito.
- Definidas as responsabilidades de Conta, Performance, Financeiro, Relacionamento, Conhecimento e Diretor na composição do Estado 360.
- Separadas prioridade de cuidado e prioridade de performance como eixos independentes e simultaneamente visíveis.
- Criada a regra de composição de oportunidades: Conta confirma situação e elegibilidade; os demais domínios complementam; Diretor consolida; Rafael decide.

## 2026-08-27 — GG Conta 4.3.0: escopo principal aprovado

- Aprovados oito eixos de atuação: identidade e dados; ciclo de vida; atividade; centralização; risco e crédito; saúde coletiva; atrito; cuidado e priorização.
- Formalizado o acompanhamento contínuo da carteira, da prospecção à eventual saída.
- Diferenciada abertura cadastral de ativação efetiva e relacionamento sustentável.
- Incluídas análises temporais de movimentação, profundidade, centralização, concentração, saturação e capacidade comercial futura.
- Incorporado atrito como indicador operacional baseado em evidências, sem rotulação subjetiva do cliente.
- Delimitadas as interfaces: Conta identifica a necessidade; Relacionamento prepara a abordagem; Financeiro calcula impacto; Performance conecta oportunidades às metas.

## 2026-08-27 — GG Conta 4.2.0: candidatos a novas contas

- Incluída a gestão de candidatos a novas contas sugeridos pelo banco, inclusive com produtos ou limites pré-aprovados.
- Formalizados identificação, origem, deduplicação, vigência das condições e classificação do vínculo do prospect.
- Definido o funil de acompanhamento do recebimento à abertura e ativação.
- Conectada a aquisição de novos clientes à oxigenação, diversificação, redução de concentração e capacidade comercial futura da carteira.
- Estabelecida a continuidade obrigatória após a abertura pelo ciclo D0–D120 e carteira madura.
- Registrado que pré-aprovação é condição informada e datada, não garantia de contratação ou aprovação definitiva.

## 2026-08-27 — GG Conta 4.1.0: missão aprovada

- Reposicionado o GG Conta de validador predominantemente cadastral para guardião e desenvolvedor ativo da carteira PJ.
- Incorporado o acompanhamento integral do ciclo de relacionamento: prospecção, abertura, ativação, maturação, manutenção, desenvolvimento, recuperação e eventual saída.
- Incluída a responsabilidade de acompanhar saúde coletiva, oxigenação, concentração, dependência de clientes-chave, cobertura de produtos, saturação comercial e capacidade futura de gerar oportunidades.
- Formalizada a integração prioritária entre GG Conta e GG Performance, preservando as responsabilidades próprias de cada domínio.
- Registrado que dados de Financeiro, Relacionamento, Conhecimento e Performance alimentam o parecer de Conta por meio do Diretor, sem delegação lateral.
- Missão, pergunta principal e princípio operacional aprovados por Rafael; escopo e especialistas permanecem em revisão.

## Não publicado — Gerente Geral de Relacionamento v2.0 aprovado

> Desenho aprovado por Rafael em 27/08/2026. Especialistas ainda serão revisados individualmente e o runtime permanece inalterado.

- Projeto `Minhas-respostas` adotado como referência funcional, sem copiar exemplos estáticos, heurísticas de sentimento ou mistura de responsabilidades.
- Criados três modos de trabalho: `UNDERSTAND`, `PREPARE` e `RESPOND`.
- Formalizada separação entre fato textual, necessidade, objeção, inferência, hipótese, pergunta de descoberta, compromisso e sugestão de abordagem.
- Gerente passa a atuar como memória de conversas, guardião de compromissos, preparador consultivo e parceiro crítico de interpretação.
- Rascunhos permanecem em `PENDING_HUMAN_APPROVAL`; nenhum contato externo é enviado automaticamente.
- Prevista conversa direta na aba Relacionamento com compartilhamento apenas de fatos e aprendizados promovidos ao Estado 360.
- Proposto catálogo de cinco especialistas, limitado a quatro por execução.
- Criadas as cinco especificações candidatas em `SANDBOX`: Fontes e Linha do Tempo; Necessidades, Objeções e Descoberta; Compromissos e Follow-up; Estratégia e Redação; Desfechos e Aprendizado.
- Especialistas receberam IDs canônicos, contratos de entrada e saída, fronteiras sem sobreposição, revisão humana, trilha de auditoria, critérios de aceite, falha segura e rollback.
- Conteúdo importado passou a ser tratado como dado não confiável, com isolamento contra instruções embutidas; ferramentas de envio externo permanecem indisponíveis.
- Formalizada a divisão entre interpretação por IA e controles determinísticos para hashes, versões, datas, estados, alertas e invalidações.
- Especialista `RELATIONSHIP_SOURCES_TIMELINE` aprovado por Rafael em 27/08/2026; desenho promovido para `APPROVED`, mantendo o runtime inativo.
- Os cinco especialistas do Gerente Geral de Relacionamento foram aprovados integralmente por Rafael em 27/08/2026 e promovidos para `APPROVED`; nenhum foi ativado no runtime.
- Aprovadas fontes controladas da primeira fase: texto, WhatsApp exportado, notas, áudio, e-mail, PDF, imagem e registro manual.
- Definida preservação do original e estados `LINKED`, `UNRESOLVED`, `MULTIPLE_CANDIDATES` e `PORTFOLIO_GENERAL`, sem vínculo silencioso.
- Aprovada gestão de compromissos por responsável, estados de follow-up, prazo explícito prioritário e alerta de ausência de contato após 60 dias com exceções.
- Aprovada preparação estruturada com leituras alternativas, perguntas, abordagem, rascunhos e critério de sucesso, adaptada por canal e tom sem alterar fatos.
- Aprovado aprendizado relacional baseado em desfechos, sem confundir silêncio, rapidez, sentimento, correlação ou rejeição de produto com intenção comprovada.

## Não publicado — Gerente Geral de Performance v5.3 aprovado

> Desenho do Gerente Geral e dos cinco especialistas aprovado por Rafael em 27/08/2026. O runtime continua inalterado até implementação, avaliações e promoção próprias para `ACTIVE`.

- Gerente Geral de Performance redesenhado a partir do projeto `Performance-PJ-mobile`, do manual POBJ e dos relatórios diários oficiais fornecidos por Rafael.
- Performance e Conta definidos como núcleo prioritário do plano comercial: Performance mede reconhecimento e risco profissional; Conta identifica onde a produção pode acontecer na carteira.
- Criado catálogo de cinco especialistas de Performance, limitado a quatro por execução: Fontes e Reconciliação, Pontuação e Estado, Gap e Cenários, Executabilidade e Plano, Desfechos e Aprendizado.
- `Next Best Actions` preservado com até cinco prioridades, comparando piso, faixas, 100%, teto, pontos marginais, esforço, prazo, elegibilidade, DCO e executabilidade.
- Incluído desafio estratégico para questionar hábitos, metas cronicamente baixas e caminhos pouco explorados, sem contrariar Rafael sem evidência.
- Relatórios diários POBJ enviados por Rafael classificados como fontes oficiais; hash, extração e reconciliação permanecem controles técnicos de ingestão.
- Especialista de Fontes e Reconciliação aprovado com manual normalmente semestral, metas mensais versionadas, revisões intramês, data-base por indicador e controle de produção ainda não refletida.
- Especialista de Pontuação e Estado aprovado com separação obrigatória entre placar oficial, produção pendente de atualização e cenário determinístico após reconhecimento.
- Especialista de Gap, Mudanças e Cenários aprovado com classificação de urgência temporal, considerando dias úteis, execução, data-base e janela provável de reconhecimento da competência mensal.
- Especialista de Executabilidade e Plano aprovado com fila diária viva e até cinco prioridades; na fase inicial opera por meta, sem empresa ou origem por ação, até o cadastro de contas e a integração com Conta estarem prontos.
- Especialista de Desfechos e Aprendizado aprovado com reconciliação entre execução e reconhecimento, operação inicial sem empresa por ação, tratamento `LOW_SAMPLE` e horizontes mensal, recorrente e estratégico.
- Separados placar oficial, produção operacional pendente e cenários potenciais; IA não calcula pontos nem altera regras POBJ.
- Formalizada parceria Performance–Conta por dependências mediadas pelo Motor 360, sem chamadas laterais entre gerentes.
- Diferenciadas produção originada na carteira existente e aquisição de contas novas, com pipelines e evidências próprios.
- Proposta arquitetura de abas individuais para conversa direta com cada Gerente Geral, mantendo Diretor para visão transversal e Motor 360 para auditoria e compartilhamento.
- Conversas passam a gerar contexto de sessão, candidatos a aprendizado, fatos confirmados e aprendizados aprovados, impedindo que hipótese vire fato automaticamente.
- Adotado tratamento `LOW_SAMPLE` para o início com poucas empresas e poucos desfechos.
- Financeiro reconhecido como domínio em amadurecimento, com estados `NOT_AVAILABLE`, `LEARNING`, `ESTIMATED` e `VALIDATED`; sua ausência não fabrica retorno nem bloqueia Conta e Performance.
- Registrada necessidade de versionar `AGENTS.md`, base dos Gerentes Gerais, schemas, políticas de memória e UI antes da ativação.

## 2026-08-26 — Correção do canal Telegram real

- Diagnosticado webhook sem URL ativa e ingestão hospedada desabilitada, com mensagens pendentes no Telegram.
- Site v9 publicado e webhook oficial ativado na rota hospedada autenticada.
- Confirmação imediata habilitada para cada mensagem aceita.
- Conclusão da ponte passou a responder ao chat Telegram de origem com status, achados, ações, lacunas e protocolo.
- Resposta final protegida por registro de auditoria para reduzir duplicidade e permitir retry após falha.
- Teste real comprovou ingestão, armazenamento protegido de PDF, reserva da fila, download pela ponte, processamento no n8n, publicação do Estado 360 e resposta final no Telegram.
- Fila pendente anterior drenada sem erro; processamento permanece sequencial, em ciclos de aproximadamente um minuto.

## 2026-08-26 — Base canônica dos Gerentes Gerais

- Formalizadas quatro áreas de acompanhamento: Conta, Performance, Financeiro e Relacionamento.
- Conhecimento/Bibliotecário classificado como função transversal de suporte, não como quinta área de resultado.
- Criados documentos canônicos ausentes para Financeiro e Relacionamento.
- Conta, Performance e Conhecimento reestruturados com fronteiras, dependências, entregas e pontos para refinamento de Rafael.
- Performance passou a exigir mínimo de pontuação, faixas, fórmula, itens computáveis, teto, realizado, gap, projeção e memória de cálculo.
- Documento histórico de arquitetura marcado explicitamente como legado.
- Limite alinhado em quatro especialistas acionados por domínio.

## 2026-08-26 — Evals L2–L4 independentes do gabarito

- Campos de gabarito passaram a ser removidos antes de qualquer inferência avaliada.
- L2 foi delimitado explicitamente à extração de identidade PJ: razão social e CNPJ.
- Adicionada prova negativa de invariância: adulterar `entities`, `expected_status` ou `ground_truth_decision` não pode mudar a previsão.
- L3 passou a rejeitar referências de evidência vazias, duplicadas, malformadas ou com caracteres de caminho.
- Relatório dos Evals atualizado para `2.1.0-independent-ground-truth`.

## 2026-08-26 — Endurecimento da verificação de backups

- O teste H9 passou a abrir cada backup ZIP e confirmar que ele contém entradas válidas.
- O teste deixou de apresentar RTO/RPO fixos como se fossem medição; agora sinaliza corretamente que a medição operacional depende de restauração controlada.
- Bateria geral mantida em 13/13 testes aprovados.

## 2026-08-26 — Auditoria retrospectiva Fases 0–7

- Bateria híbrida executada com 13/13 testes aprovados.
- Auditoria retrospectiva registrada em `docs/audits/AUDITORIA_RETROSPECTIVA_FASES_0_A_7_2026-08-26.md`.
- Contratos JSON corrigidos para declarar `$schema` Draft 2020-12 e `$id` válido.
- Endpoints de canário, FinOps e laudo PDF protegidos por autenticação e autorização do usuário do Dashboard.
- Erros de lint nos endpoints corrigidos; build e compilação Python validados.
- Registradas limitações que permanecem: avaliações L2–L4 com risco de leakage, canário e recuperação ainda simulados, rotas com dependência de runtime Node, métricas do Dashboard estáticas e necessidade de evidência formal para dados reais.
- Ambiente mantido em `OFFLINE_EVAL`; nenhuma integração externa ou dado real foi ativado.
