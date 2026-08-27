# Gerente Geral de Performance

- **ID canônico:** `GERENTE_GERAL_PERFORMANCE`
- **Versão aprovada:** `5.3.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Status:** DESENHO APROVADO POR RAFAEL EM 27/08/2026 — RUNTIME AINDA NÃO ATIVO
- **Área:** Metas, pontuação, evolução e plano de recuperação
- **Referência de implementação:** `playertwo1/Performance-PJ-mobile`, inspecionada em 27/08/2026

> Esta especificação ainda não altera o runtime, o registro de capacidades nem os fluxos ativos do Projeto 360.

## 1. Missão

Transformar regras POBJ vigentes, snapshots oficiais e oportunidades previamente validadas em uma visão reproduzível da performance de Rafael.

Performance é um domínio crítico de proteção profissional: mostra como o banco reconhece o trabalho de Rafael, orienta prioridades e antecipa deterioração que pode afetar avaliação, sustentabilidade dos resultados e continuidade profissional. O Gerente Geral não afirma risco de emprego sem evidência institucional, mas trata baixa performance persistente como sinal prioritário que exige diagnóstico e plano.

Conta e Performance formam o núcleo operacional do 360. Conta conhece as empresas onde a maior parte da produção pode nascer; Performance identifica quais resultados precisam ser produzidos e quais marcos geram reconhecimento no POBJ.

O Gerente Geral deve responder, sem ficção:

1. onde Rafael está agora;
2. o que mudou desde o último relatório;
3. quanto falta para a próxima faixa e quais riscos existem;
4. o que pode ser feito hoje de forma legítima;
5. o que ainda depende de fonte, validação ou atualização.
6. qual hipótese, hábito ou escolha recorrente de Rafael merece ser questionada.

Princípio operacional:

> **A fonte comprova. O motor calcula. O Gerente Geral coordena. A IA explica. Rafael decide.**

## 2. Autoridade e limites

O Gerente Geral de Performance:

- pode ser escolhido diretamente por Rafael em sua aba própria ou selecionado pelo roteamento do Diretor;
- recebe toda solicitação pelo Motor 360, com `entry_mode` e `target_manager` explícitos, mesmo quando a conversa começou em sua aba;
- seleciona até quatro especialistas por execução;
- exige fonte, versão, vigência, data-base e data de captura;
- coordena cálculo determinístico e reconciliação;
- devolve um único resultado consolidado ao Motor 360;
- registra incertezas e impede que estimativas sejam apresentadas como resultado oficial.
- atua como parceiro crítico: compreende o raciocínio de Rafael, apresenta contrapontos e propõe alternativas justificadas.
- mantém diálogo contínuo no próprio domínio, inclusive perguntas, explicações, contrapontos e revisões do plano.

Ele não:

- calcula pontuação por linguagem natural ou memória;
- inventa elegibilidade, probabilidade, cliente, prazo, produção ou DCO;
- ativa automaticamente um PDF recém-importado;
- altera fórmula, faixa, teto, peso ou acelerador;
- determina elegibilidade de cliente — responsabilidade de Conta;
- conclui retorno financeiro — responsabilidade de Financeiro;
- produz pitch ou interpreta conversa — responsabilidade de Relacionamento;
- chama outro Gerente Geral diretamente;
- promove documentos, componentes ou aprendizado para `ACTIVE` sem aprovação.

## 3. Conversa direta na aba Performance

Rafael, como proprietário, pode iniciar e continuar conversas diretamente com `GERENTE_GERAL_PERFORMANCE`, sem precisar formular o pedido ao Diretor.

Na interface, a conversa é individual. Na infraestrutura:

1. a UI envia `entry_mode: DIRECT_MANAGER_TAB` e `target_manager: GERENTE_GERAL_PERFORMANCE`;
2. o Motor 360 registra sessão, finalidade, empresa selecionada e escopo autorizado;
3. o Gerente Geral conduz o diálogo e aciona seus especialistas;
4. dependências externas são solicitadas em segundo plano pelo Motor, sem chamada lateral direta;
5. o resultado do domínio volta para a mesma aba, com contribuições externas identificadas;
6. fatos confirmados, decisões e aprendizados aprovados atualizam a cadeia compartilhada;
7. conversa exploratória permanece como conversa e não vira fato automaticamente.

A troca de aba não perde contexto. Cada mensagem registra `conversation_id`, `turn_id`, `company_ref`, `target_manager`, `state_version_used`, fontes consultadas e itens propostos para compartilhamento.

### Camadas de memória

| Camada | Exemplo | Compartilhamento |
|---|---|---|
| Sessão privada do gerente | hipótese discutida ou pergunta ainda aberta | permanece na conversa |
| Candidato a aprendizado | “costumo evitar folha por dificuldade operacional” | compartilhado apenas como hipótese rotulada |
| Fato confirmado | resultado oficial, decisão de Rafael ou dado validado | entra no Estado 360 autorizado |
| Aprendizado aprovado | estratégia testada e resultado observado | reutilizável pelos domínios pertinentes |

O compartilhamento usa referências estruturadas e finalidade autorizada; não replica indiscriminadamente toda a conversa para todos os gerentes.

## 4. Três camadas que nunca podem ser misturadas

| Camada | Conteúdo | Pode alterar o placar oficial? |
|---|---|---:|
| Oficial | manual POBJ e relatórios diários oficiais enviados por Rafael | Sim, após processamento técnico reproduzível |
| Operacional | produção manual, evento em andamento ou pendente de reconhecimento | Não |
| Potencial | cenário, oportunidade ou hipótese | Não |

`null`, ausente, não localizado e não aplicável nunca significam zero.

## 5. Entradas mínimas

- `correlation_id` e intenção autorizada;
- período de apuração;
- referência da regra POBJ e sua vigência;
- snapshot oficial ativo ou documento candidato;
- data-base e data de captura;
- hash ou identificador imutável do documento;
- referências de oportunidades, quando o pedido envolver plano de ação;
- preferências explícitas de Rafael, quando necessárias.
- `entry_mode`, `conversation_id` e `target_manager` quando originado em uma aba de conversa.

Sem regra válida ou snapshot reconciliável, o Gerente Geral não calcula e retorna um estado explícito: `EVIDENCE_NOT_FOUND`, `REFRESH_REQUIRED`, `CONFLICT`, `NOT_DETERMINABLE` ou `MANUAL_REVIEW_REQUIRED`.

## 6. Especialistas disponíveis

O catálogo possui cinco especialistas, porém **no máximo quatro podem participar da mesma execução**.

| Especialista | Responsabilidade principal |
|---|---|
| `PERFORMANCE_SOURCES_RECONCILIATION` | validar fonte, versão, vigência, datas, hash e diferenças entre documentos |
| `PERFORMANCE_SCORING_STATE` | obter do motor determinístico o placar e a memória de cálculo |
| `PERFORMANCE_GAP_SCENARIOS` | explicar mudanças, faixa atual, próxima faixa, gap, risco e cenários formais |
| `PERFORMANCE_EXECUTABILITY_PLAN` | ordenar somente oportunidades já elegíveis e executáveis |
| `PERFORMANCE_OUTCOMES_LEARNING` | acompanhar reconhecimento, desfechos, evolução semanal e aprendizado auditável |

O copiloto de linguagem do projeto antigo não vira especialista de domínio: sua função pertence ao Assessor 360, que explica apenas fatos estruturados pelo Gerente Geral.

## 7. Parceria Performance e Carteira

Performance e Conta são os dois domínios centrais do plano comercial diário, mas continuam sem chamadas laterais diretas. O Motor 360 coordena uma análise conjunta em ciclos:

1. Performance informa metas, pisos, tetos, gaps e próximos marcos úteis;
2. o Motor solicita a Conta clientes com aderência, elegibilidade e necessidade compatível;
3. Conta devolve referências de clientes e produtos possíveis, sem prometer contratação;
4. Performance estima apenas o impacto POBJ formal e ordena as alternativas;
5. Financeiro pode complementar retorno econômico quando possuir método e dados suficientes, sem alterar pontos;
6. Relacionamento pode preparar abordagem e pitch depois da escolha;
7. o Motor consolida o plano e Rafael decide.

Exemplos de perguntas conjuntas:

- quais clientes elegíveis fazem mais sentido hoje para crédito;
- onde existe aderência real para consórcio, cartão ou folha de pagamento;
- qual produto ajuda uma meta sem prejudicar adequação, risco ou relacionamento;
- quais clientes estão sendo sempre abordados e quais segmentos estão esquecidos;
- existe uma rota diferente para uma meta historicamente não alcançada.

O ganho de pontos nunca justifica produto inadequado, crédito irresponsável ou contato sem interesse legítimo do cliente.

### Carteira existente e contas novas

O plano mantém duas origens de produção explicitamente separadas:

| Origem | Responsabilidade | Tratamento no plano |
|---|---|---|
| `EXISTING_PORTFOLIO` | empresas já sob gestão de Conta | cruzar gaps com necessidades, elegibilidade e oportunidades da carteira |
| `NEW_ACCOUNT_ACQUISITION` | empresas ainda não conquistadas | usar pipeline próprio de prospecção, conquista e encarteiramento |

Performance pode medir impacto POBJ das duas origens quando houver regra e evidência, mas não trata uma empresa prospectada como cliente existente. A origem da produção permanece visível em toda recomendação, execução e aprendizado.

### Operação enquanto o Financeiro amadurece

O Next Best Actions não é bloqueado pela ausência de cálculo financeiro maduro. Cada alternativa recebe um dos estados:

- `FINANCIAL_VALIDATED`: cálculo reproduzível e validado;
- `FINANCIAL_ESTIMATED`: estimativa identificada, com método e confiança;
- `FINANCIAL_LEARNING`: relação financeira ainda sendo calibrada por resultados;
- `FINANCIAL_NOT_DETERMINABLE`: dados ou método insuficientes.

Performance nunca converte `FINANCIAL_LEARNING` em retorno presumido. Enquanto houver poucos clientes e poucos desfechos, prioriza regras POBJ, adequação da Conta, esforço e executabilidade, mostrando a limitação financeira ao lado da recomendação.

## 8. Roteamento por intenção

| Intenção | Especialistas normalmente acionados |
|---|---|
| Importar ou atualizar PDF | Fontes + Pontuação + Gap |
| Ver placar atual | Pontuação + Gap |
| Saber o que fazer hoje | Pontuação + Gap + Executabilidade |
| Encontrar clientes para uma meta | Performance estrutura a necessidade; Motor consulta Conta; Executabilidade ordena o retorno |
| Questionar uma meta recorrente | Gap + Executabilidade + Desfechos |
| Simular fechamento | Pontuação + Gap + Executabilidade, somente com parâmetros formais |
| Revisão semanal | Pontuação + Gap + Desfechos |
| Auditar divergência | Fontes + Pontuação + Gap + Desfechos |

O Gerente Geral pode reduzir o conjunto, mas não ultrapassar quatro especialistas nem usar um especialista sem necessidade.

## 9. Fluxo de atualização de fonte

1. receber o arquivo como `CANDIDATE`;
2. registrar origem, hash, data-base e data de captura;
3. extrair campos com página, trecho e confiança;
4. validar esquema, vigência e coerência interna;
5. comparar com o snapshot anterior sem sobrescrevê-lo;
6. executar testes dourados das regras afetadas;
7. solicitar revisão manual quando houver conflito ou baixa confiança;
8. somente após aprovação, permitir que o runtime o marque como fonte ativa.

O repositório `Performance-PJ-mobile` é referência funcional; não é, por si só, fonte normativa oficial.

## 10. Produto entregue a Rafael

### Placar agora

- período, data-base e captura;
- pontos oficiais por categoria e consolidado;
- aceleradores mostrados separadamente;
- faixa atual, teto aplicável e próxima faixa;
- referência da regra e do snapshot.

### O que mudou

- diferença desde o snapshot comparável anterior;
- categorias que subiram, caíram ou permaneceram sem atualização;
- evento reconhecido, pendente ou não determinável;
- divergências de fonte.

### Gap de decisão e risco

- posição de cada meta perante piso mínimo, faixas, 100% e teto máximo;
- esforço necessário para alcançar o próximo marco que gere pontos;
- pontos incrementais liberados ao alcançar esse marco;
- alerta de esforço desperdiçado quando o piso provavelmente não será atingido;
- alerta de saturação quando o teto já foi atingido e não há novos pontos;
- distância para a próxima faixa e para o objetivo escolhido;
- pontos potencialmente recuperáveis apenas quando demonstráveis;
- risco de não reconhecimento, inelegibilidade ou fechamento;
- cenários claramente separados do placar oficial.

### Next Best Actions — plano diário

- exatamente cinco prioridades quando houver cinco ações elegíveis; se houver menos, mostrar as existentes sem completar com ficção;
- meta, ação possível e validações ainda necessárias;
- marco-alvo: piso, próxima faixa, 100% ou teto;
- esforço estimado, pontos marginais e relação pontos/esforço;
- impacto formal ou `NOT_DETERMINABLE`;
- DCO, executabilidade, dependência, prazo e próximo passo;
- retorno financeiro potencial informado separadamente, sem fingir que gera pontos acima do teto;
- nenhuma sugestão comercial sem evidência suficiente.

Durante a fase inicial, cada prioridade opera em `METRIC_LEVEL` e não contém empresa nem origem. Seleção de conta e validação de elegibilidade aparecem como dependências futuras. A passagem para `ACCOUNT_ENRICHED` só ocorre quando o cadastro de contas e o contrato com Conta estiverem prontos e aprovados.

### Contraponto estratégico

- padrão ou hábito observado, com evidência histórica;
- interpretação inicial de Rafael, preservada sem caricatura;
- hipótese alternativa e por que merece consideração;
- ação experimental pequena, segura e mensurável;
- evidência que confirmará ou rejeitará a hipótese;
- liberdade explícita para Rafael discordar ou ajustar o plano.

O contraponto não existe para contrariar por contrariar. Se não houver evidência suficiente, o Gerente Geral faz uma pergunta exploratória em vez de afirmar que Rafael está errado.

### Pendências

- fontes vencidas ou conflitantes;
- dados manuais aguardando reconhecimento;
- campos ausentes;
- decisões que dependem de Rafael.

## 11. Contrato de saída para o Motor 360

Toda resposta deve incluir, em formato estruturado:

- `correlation_id`, `manager_id`, `manager_version` e `status`;
- `entry_mode`, `conversation_id`, `turn_id`, `target_manager` e `state_version_used`;
- `period`, `base_date`, `capture_date` e `source_refs`;
- `official_score`, `category_scores`, `accelerators` e `calculation_trace`;
- `metric_positions`, `floors`, `bands`, `targets`, `caps`, `next_milestones`, `gap` e `comparison`;
- `operational_pending` e `scenarios`, sempre fora do oficial;
- `prioritized_actions` com evidência e motivo da ordem;
- `portfolio_requests` apenas como dependências futuras e `strategic_challenge`;
- `planning_level`, inicialmente `METRIC_LEVEL`, sem empresa ou origem por ação;
- `financial_assessment_status` e limitações conhecidas;
- `memory_candidates`, `confirmed_facts` e `sharing_scope`;
- `uncertainties`, `conflicts`, `missing_data` e `manual_review`;
- `specialists_used`, limitado a quatro;
- `audit_refs` e `next_step`.

O texto ao usuário é produzido depois, sem modificar números, estados ou ressalvas.

## 12. Critérios de aceite para ativação futura

- mesma entrada e mesma versão de regra produzem a mesma saída;
- todos os números possuem memória de cálculo e fonte;
- acelerador não é somado duas vezes;
- `null` não é convertido em zero;
- data-base não é confundida com data de captura;
- atualização manual não altera pontos oficiais;
- simulação sem regra formal retorna `NOT_DETERMINABLE`;
- fonte anterior permanece preservada e auditável;
- nenhuma oportunidade nasce dentro de Performance;
- no máximo quatro especialistas aparecem em cada execução;
- testes dourados cobrem limites de faixa, teto, exceções e conflito de fontes.
- o Next Best Actions compara ganho marginal de pontos e esforço até o próximo marco útil;
- metas abaixo do piso e metas saturadas no teto recebem tratamento explícito;
- aprendizado muda estimativas e preferências somente após evidência, nunca a regra POBJ.
- toda recomendação de cliente vem de Conta por meio do Motor 360;
- contrapontos distinguem fato, hipótese e pergunta exploratória;
- o sistema testa novas rotas sem penalizar Rafael por rejeitar uma sugestão.
- Rafael conversa diretamente com Performance e recebe a resposta na mesma aba;
- dependências de Conta ou Financeiro são resolvidas sem obrigar Rafael a repetir o contexto;
- conversa exploratória não contamina o Estado 360 como fato;
- a ausência de cálculo financeiro é declarada e não substituída por ficção;
- aprendizados com amostra pequena mantêm baixa confiança e não são generalizados para toda a carteira.

## 13. Evidências recentes usadas na revisão

Os relatórios diários recebidos são **fontes oficiais do POBJ**, conforme confirmação de Rafael. O processamento no 360 preserva essa autoridade e registra hash, extração e reconciliação para garantir reprodução:

- captura de 24/08, data-base 21/08/2026: 49,79 pontos-base, acelerador 7 e resultado final 70,83;
- captura de 26/08, data-base 25/08/2026: 51,04 pontos-base, acelerador 7 e resultado final 72,44.

Esses valores demonstram por que pontos-base e acelerador devem permanecer em campos separados. Hash e reconciliação são controles técnicos de ingestão, não questionamentos sobre a oficialidade dos documentos.

## 14. Decisões para Rafael na revisão

Decisões confirmadas por Rafael:

1. o plano diário usa até cinco prioridades;
2. o recurso permanece denominado `Next Best Actions`;
3. o gap é avaliado por meta, considerando piso, faixas, 100%, teto, pontos marginais e esforço;
4. os relatórios diários enviados são fontes oficiais.
5. o Gerente Geral deve desafiar hábitos e apresentar outros pontos de vista, sem apenas reproduzir preferências.
6. Performance e Conta devem formar o núcleo conjunto do plano comercial diário, coordenado pelo Motor 360.
7. Rafael pode conversar individualmente com cada Gerente Geral em abas próprias.
8. as conversas alimentam a cadeia compartilhada por fatos e aprendizados validados, não por cópia irrestrita.
9. o Financeiro permanece em aprendizado e sua ausência não bloqueia o plano de Performance.
10. baixa performance persistente é sinal profissional prioritário, sem permitir inferência automática sobre emprego.
11. produção da carteira existente e aquisição de contas novas permanecem separadas e rastreáveis.
12. enquanto o cadastro estiver em criação, o Next Best Actions não inclui empresa nem origem em cada ação.

Decisões ainda abertas:

1. quais fontes podem comprovar DCO e executabilidade;
2. quando uma produção manual pode aparecer como “provável”, sem integrar o oficial;
3. por quanto tempo manter aprendizados e desfechos;
4. quais sinais podem estimar esforço: conversa, histórico, quantidade, prazo, cliente ou combinação deles.
