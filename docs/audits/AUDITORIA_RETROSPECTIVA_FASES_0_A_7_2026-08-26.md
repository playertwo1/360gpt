# Auditoria Retrospectiva — Fases 0 a 7

**Data:** 26 de agosto de 2026  
**Release auditada:** `v3.1.0-confianca`  
**Modo da execução:** `OFFLINE_EVAL`, dados sintéticos  
**Auditor:** ChatGPT Codex  
**Escopo:** código, schemas JSON Draft 2020-12, workflows n8n, regras dos quatro Gerentes Gerais, segurança/LGPD, testes e documentação.

## Resumo executivo

A bateria geral terminou com **13/13 testes e código 0** (`ALL_HYBRID_TESTS_PASS`) e o build/lint terminou sem erros de compilação ou lint. A auditoria, porém, encontrou uma diferença entre “teste aprovado” e “comprovação de comportamento em runtime”: vários testes são verificações estruturais ou simulações determinísticas. Eles são úteis como smoke tests, mas não sustentam sozinhos afirmações de produção real, qualidade de extração ou RTO/RPO medidos.

Foram aplicadas duas correções objetivas durante esta auditoria:

1. três schemas tinham a chave `$id` corrompida para uma chave vazia e não declaravam `$schema` Draft 2020-12;
2. as APIs de FinOps, Canary e laudo PDF não exigiam autenticação privada do Dashboard.

As demais questões estão registradas como melhorias ou gates pendentes para não alterar o comportamento aprovado sem uma suíte de regressão adequada.

## Evidências executadas

| Verificação | Resultado |
|---|---|
| `powershell -File scripts/run-all-hybrid-tests.ps1` | PASS — 13/13 |
| `npm run build` | PASS |
| `npm run lint` | PASS — 0 erros, 3 avisos de UI existentes |
| Compilação Python (`core`, `evals`, `compliance`) | PASS |
| Parse dos 11 schemas contratuais | PASS após correção de metadados |
| Docker PostgreSQL/n8n | containers saudáveis no início da auditoria |

## Achados e correções aplicadas

### A-01 — Metadados de três schemas inválidos — corrigido — alta

`contracts/backpressure.schema.json`, `contracts/finops-metrics.schema.json` e `contracts/release-manifest.schema.json` continham uma propriedade `""` no lugar de `$id` e não declaravam `$schema`. Isso impedia validação confiável como Draft 2020-12.

**Correção:** adicionados `$schema: https://json-schema.org/draft/2020-12/schema` e `$id` válido nos três arquivos. O teste H3 agora verifica metadados em todos os schemas, impedindo regressão.

### A-02 — APIs de telemetria e laudo sem autenticação — corrigido — crítico

`app/api/metrics/finops/route.ts`, `app/api/canary/route.ts` e `app/api/reports/laudo-pdf/route.ts` podiam ser chamados diretamente sem a allowlist do Dashboard.

**Correção:** as três rotas agora exigem usuário ChatGPT autenticado e e-mail presente na allowlist privada. A geração do laudo continua sem efeito transacional.

### A-03 — Erros de lint escondidos pelo status — corrigido — médio

Havia três usos de `any` que quebravam `npm run lint`, apesar de a documentação afirmar “0 erros”.

**Correção:** erros tipados como `unknown`, mensagens de erro tratadas de forma segura e parâmetros não usados removidos. Permanecem três avisos de variáveis de UI não utilizadas em `app/page.tsx`, sem falha de lint.

## Limitações importantes encontradas

### A-04 — Evals L2 usam o gabarito como parte da “extração” — alta

Em `evals/eval_engine.py`, `extracted_entities` começa com `case["name"]` e `case["cnpj"]` e copia entidades adicionais do próprio caso. O F1 de 1.0000 mede a consistência do fixture, não uma extração independente.

**Melhoria proposta:** criar `raw_input` separado de `expected_entities`, executar um extrator real ou uma função deliberadamente independente e comparar somente depois. Adicionar casos negativos, entidades ausentes, variações de formatação e ruído.

### A-05 — Cobertura L3 verifica apenas existência de nós — alta

O motor L3 considera a evidência coberta quando `len(evidence_nodes) > 0`; não verifica se cada afirmação material aponta para um nó autorizado, se existe caminho até a origem ou se há hash e relação PROV válidos.

**Melhoria proposta:** validar o grafo contra `evidence-graph.schema.json`, percorrer cada finding/recommendation, exigir caminho até `SOURCE_ARTIFACT` e falhar diante de nó órfão ou fonte revogada.

### A-06 — Concordância L4 depende de regras e gabaritos sintéticos — alta

O L4 deriva decisões com heurísticas no mesmo motor que calcula o resultado e compara com `ground_truth_decision` dos fixtures. Isso não substitui avaliação cega por revisão humana independente.

**Melhoria proposta:** separar gerador, política de decisão e conjunto de avaliação; congelar gabaritos assinados por revisor; medir falsos positivos, falsos negativos e intervalos por domínio.

### A-07 — Canary é simulação, não operação real — alta

`core/canary_monitor.py` seleciona os dez primeiros JSONs, fixa o override no índice 4 e calcula tempos artificiais. O teste valida o simulador, não casos reais autorizados nem o canal Telegram.

**Melhoria proposta:** renomear explicitamente para `canary_simulation`, criar um adaptador de eventos reais em ambiente separado e só chamar de operação real após evidência de autorização, logs e amostra auditável.

### A-08 — RTO/RPO no teste H9 são valores declarados — alta

`scripts/test-h9-backup-recovery.ps1` imprime RTO de 3m12s e RPO 0s, mas não executa restauração nem mede o cronômetro. O script de backup faz dump, porém a aceitação de recuperação não é exercitada pela bateria.

**Melhoria proposta:** restaurar em banco temporário isolado, comparar contagens/hashes, medir `Stopwatch` do início ao serviço saudável e registrar o timestamp do último evento incluído.

### A-09 — Rotas usam `child_process` e filesystem em ambiente hospedado — alta

As rotas de FinOps, Canary e laudo PDF chamam Python via `execFile` e gravam em `process.cwd()`. O build passa, mas Sites/Cloudflare Workers não oferecem um processo Python persistente nem filesystem local durável como um servidor tradicional.

**Melhoria proposta:** mover cálculo para job local n8n ou serviço Node autorizado, publicar artefatos em D1/R2 e tornar as rotas hospedadas somente leitura. Manter a execução Python apenas no ambiente local até essa migração.

### A-10 — Sanitização de `case_id` pode causar colisões — média

O laudo remove caracteres inválidos de `case_id`. Entradas diferentes podem virar o mesmo identificador normalizado; isso dificulta auditoria e pode retornar um caso diferente do solicitado.

**Melhoria proposta:** aceitar somente o padrão completo `^[A-Za-z0-9_-]+$` e retornar `400 invalid_case_id` quando houver qualquer alteração, em vez de normalizar silenciosamente.

### A-11 — Dashboard contém métricas e versões estáticas — média

`app/page.tsx` exibe valores fixos como `Release v2.2.0`, R$ 0,08, 1.840 tokens e R$ 142,50, embora busque telemetria. Isso pode induzir decisão incorreta quando o snapshot mudar.

**Melhoria proposta:** renderizar a resposta autenticada de FinOps, mostrar “indisponível” quando ausente e exibir `snapshot_at`/fonte em cada cartão.

### A-12 — “Ver Origem” não abre o achado selecionado — média

O botão dos achados chama `setSelectedFinding`, mas não existe renderização de `selectedFinding` no modal. A affordance promete drill-down, porém não produz efeito observável.

**Melhoria proposta:** abrir um painel de evidência do finding com `evidence_ids`, hash, fonte, vigência e caminho PROV; ou remover o botão até a interação existir.

### A-13 — Artefatos de teste não são herméticos — média

O teste de laudo reescreve `test-data/laudo_executivo_360_sample.pdf`, alterando o working tree com timestamps. Os testes de eval, FinOps e Canary também atualizam arquivos `*_latest.json`.

**Melhoria proposta:** usar diretório temporário por execução, comparar conteúdo sem timestamp ou manter fixtures imutáveis e gravar relatórios em `artifacts/test-runs/<run_id>`.

### A-14 — Documentação mistura autorização declarada e modo OFFLINE_EVAL — alta

`status.md`, `ROADMAP.md`, `checklist.md` e `CODEX_HANDOFF.md` afirmam autorização institucional e “casos reais”, enquanto o código e os testes executados usam `OFFLINE_EVAL` e simuladores. A aprovação deste documento não constitui prova de autorização, conforme `AGENTS.md`.

**Melhoria proposta:** arquivar a evidência formal da autorização com escopo, finalidade, período, responsáveis e controles; até lá, usar a classificação “simulação sintética” e manter bloqueado qualquer dado real.

## Edge cases prioritários para a próxima suíte

- schema com `$id` ausente, duplicado ou URI inválida;
- `case_id` vazio, Unicode, colisão após sanitização e tentativa de traversal;
- PDF/XLSX com MIME correto e assinatura binária incorreta;
- Telegram com `from.id` diferente de `chat.id`, grupo, update duplicado e update fora de ordem;
- lease expirado durante upload, complete repetido e falha após gravação em R2;
- duas restaurações concorrentes e dump incompleto;
- fonte revogada depois de um snapshot publicado;
- finding sem caminho PROV, hash divergente ou documento superado;
- telemetria ausente, vencida ou com custo negativo;
- APIs de laudo, FinOps e Canary sem cabeçalho de autenticação.

## Plano recomendado

1. Concluir a correção do contrato de evidências e tornar L2/L3/L4 independentes do gabarito.
2. Trocar H9 por restauração mensurável em ambiente temporário.
3. Remover dados estáticos do Dashboard e corrigir o drill-down de evidências.
4. Separar claramente simulação Canary de operação real.
5. Formalizar o Gate institucional antes de qualquer dado real.
6. Só depois decidir se a VPS 24 horas é necessária.

## Conclusão

O caminho básico do piloto está operacional e os testes smoke estão verdes. Os achados A-04 a A-14 impedem interpretar os números atuais como prova independente de qualidade, operação real ou produção bancária. A correção A-01, A-02 e A-03 foi feita sem quebrar os 13 testes; as melhorias restantes devem ser implementadas em fases pequenas, com regressão e evidência própria.
