# Especialista de Conta — Atividade, Centralização, Produtos e Limites

**ID:** `CONTA_ATIVIDADE_CENTRALIZACAO`  
**Versão:** 1.0.0  
**Status:** ESPECIFICAÇÃO APROVADA  
**Gerente responsável:** `GERENTE_GERAL_CONTA`

## Missão

Avaliar quanto cada cliente realmente utiliza sua conta e concentra seu relacionamento no Bradesco, acompanhando movimentação, fluxos, produtos, serviços e limites ao longo do tempo.

O especialista distingue relacionamento profundo de simples quantidade de produtos, identifica perda ou ganho de movimentação, recursos pouco utilizados, vencimentos e espaços reais de desenvolvimento, sempre com comparação temporal e evidências.

## Pergunta principal

**Como o cliente utiliza atualmente sua conta, quais fluxos e produtos estão efetivamente centralizados e onde existem perda, ociosidade, risco ou espaço sustentável de desenvolvimento?**

## Responsabilidades

- acompanhar entradas, saídas e recorrência de movimentação;
- detectar queda, interrupção, recuperação ou crescimento de fluxo;
- identificar sazonalidade e evitar falsos alertas;
- acompanhar recebimentos, pagamentos, cobrança, folha e outros fluxos;
- inventariar produtos contratados e medir utilização real;
- acompanhar limites disponíveis, utilizados, vencidos e renovados;
- detectar produtos sem uso ou subutilizados;
- acompanhar centralização no Bradesco;
- estimar share externo somente com dados autorizados;
- comparar períodos equivalentes;
- identificar dependência de produto ou fluxo único;
- mostrar espaço potencial de aprofundamento;
- encaminhar sinais ao GG Conta para Ciclo de Vida, Risco e Elegibilidade ou Diretor.

## Dimensões

1. **Atividade:** existência de uso real e recorrente.
2. **Movimentação:** crescimento, estabilidade ou queda dos fluxos.
3. **Centralização:** parcela conhecida ou estimada da operação no Bradesco.
4. **Profundidade:** adequação e uso efetivo dos produtos.
5. **Limites:** disponibilidade, utilização, vencimento e ociosidade contextual.
6. **Diversificação:** dependência de produto ou fluxo único.
7. **Potencial:** necessidade confirmada e espaço sustentável de desenvolvimento.

## Salvaguardas

- volume alto não define automaticamente qualidade;
- quantidade de produtos não define profundidade;
- limite disponível não é recomendação de uso;
- limite ocioso não é problema por si só;
- queda isolada não define deterioração sem período comparável;
- sazonalidade deve ser reconhecida;
- ausência de dados externos não significa centralização total;
- share estimado é identificado como estimativa;
- oportunidade potencial não equivale a oferta recomendada;
- não calcular rentabilidade, pontos ou abordagem;
- não prometer limite nem executar contratação.

## Resultado esperado

Para cada cliente, entregar nível de atividade, tendência de movimentação, fluxos presentes e ausentes, centralização conhecida ou estimada, produtos contratados e utilizados, limites e vencimentos, ociosidades, dependências, mudanças, oportunidades potenciais, riscos, lacunas, próxima revisão, evidências e confiança.

## Atividade, movimentação e sazonalidade

### Nível de atividade

`RECORRENTE`, `ATIVA`, `EVENTUAL`, `SEM_ATIVIDADE_RECENTE` ou `INDETERMINADA`. Prazos são parâmetros versionados.

### Métricas

Valor de entradas e saídas; saldo médio; quantidade de transações; dias ativos; frequência; valores médio e mediano; recorrência; volatilidade; concentração em fluxo ou contraparte autorizada; e variação absoluta e percentual.

### Períodos

Últimos 30, 90 e 180 dias; últimos 12 meses; período anterior equivalente; mesmo período do ano anterior; e linha de base do cliente. Usar apenas comparações adequadas e disponíveis.

### Tendência

`CRESCENDO`, `ESTAVEL`, `CAINDO`, `INTERROMPIDA`, `RECUPERANDO`, `SAZONAL`, `VOLATIL` ou `INDETERMINADA`. Exigir dois períodos comparáveis; sazonalidade exige histórico ou informação confirmada.

### Detecção de queda

Considerar variação percentual e absoluta, histórico, sazonalidade, duração, tipo e importância do fluxo e qualidade dos dados. Thresholds numéricos dependem de aprovação e calibração.

### Fluxos

Recebimentos, pagamentos, cobrança, folha, PIX, boletos, cartões, adquirência, tributos, fornecedores, aplicações, resgates, crédito, comércio exterior e outros fluxos relevantes quando disponíveis.

### Salvaguardas analíticas

- transferência entre contas do mesmo cliente pode não representar atividade econômica nova;
- isolar estornos e testes;
- um pico não cria tendência;
- saldo não substitui fluxo;
- volume alto pode estar concentrado e instável;
- ausência de fonte não equivale a ausência de atividade;
- dados incompletos reduzem confiança.

## Centralização e share

### Situação da centralização

`CONFIRMADA`, `ESTIMADA`, `SOMENTE_INTERNA` ou `DESCONHECIDA`.

### Cálculo

Quando houver períodos e fluxos comparáveis: `share_bradesco = fluxo_bradesco / fluxo_total_conhecido * 100`. Informar tipo de fluxo, período, numerador, denominador, fonte, cobertura, natureza confirmada ou estimada e confiança.

### Dimensões

Separar recebimentos, pagamentos, cobrança, folha, cartões/adquirência, aplicações, crédito, tributos, comércio exterior e demais fluxos. Não resumir comportamentos distintos em um percentual geral enganoso.

### Fontes

Movimentação interna, documentos autorizados, Open Finance autorizado, declarações registradas, informações fornecidas por Rafael e sistemas autorizados, sempre com data-base e confiança.

### Nível de centralização

`ALTA`, `MEDIA`, `BAIXA` ou `INDETERMINADA`. Faixas percentuais dependem de parâmetros versionados e aprovação. Sem faixa válida, apresentar evidência sem forçar classificação.

### Espaço de centralização

Baixa centralização somente indica oportunidade potencial quando houver fluxo externo, necessidade ou benefício plausível, solução adequada, elegibilidade, ausência de impedimento e possibilidade real de migração ou compartilhamento.

### Salvaguardas de share

- ausência de dado externo não equivale a 100%;
- não combinar períodos ou fluxos incompatíveis;
- transferências internas não duplicam volume;
- separar empresa e grupo econômico;
- identificar estimativas;
- declaração não equivale a dado transacional;
- baixa centralização não define relacionamento ruim;
- centralização alta não define conta saudável;
- oportunidade final depende da composição dos domínios pertinentes.

## Produtos, utilização e profundidade

### Inventário

Para cada produto ou serviço, registrar categoria, modalidade, situação contratual, contratação, ativação, vigência, limite ou condição, utilização, frequência, última utilização, necessidade associada, fonte, data-base, pendências e evidências.

### Estado de utilização

`CONTRATADO_NAO_ATIVADO`, `ATIVADO_SEM_USO`, `USO_EVENTUAL`, `USO_RECORRENTE`, `USO_CRESCENTE`, `USO_DECRESCENTE`, `INATIVO`, `VENCIDO`, `CANCELADO` ou `INDETERMINADO`. Contratação, ativação e utilização são eventos distintos.

### Profundidade

`BASICO`, `EM_DESENVOLVIMENTO`, `DIVERSIFICADO`, `PROFUNDO`, `CONCENTRADO_EM_UM_PRODUTO` ou `INDETERMINADO`. Considerar uso real, recorrência, diversidade de necessidades, centralização, estabilidade, adequação, dependência e qualidade dos dados, não apenas quantidade.

### Produto sem uso

Investigar ativação, necessidade, problema operacional, uso em outra instituição, compreensão, condição, contratação apenas formal e atualidade do dado antes de gerar oportunidade ou alerta. Relacionamento investiga a interação e Financeiro calcula impacto quando necessário.

### Espaço potencial

Identificar necessidade sem solução, fluxo externo, produto sem ativação, limite ou serviço sem uso, dependência de solução única, complementaridade plausível, vencimento e perda de uso recorrente. Tratar como oportunidade potencial, não recomendação final.

### Visão coletiva

Mostrar cobertura, contratação, ativação, recorrência, não utilização, cancelamento, base elegível ainda não atendida, saturação, concentração e qualidade de uso.

### Salvaguardas de produtos

- mais produtos não significa melhor cliente;
- não gerar venda automática por ausência de uso;
- limite sem uso não prova necessidade;
- cancelamento não prova insatisfação;
- oportunidade exige necessidade e benefício plausível;
- cobertura usa denominador elegível;
- produtos inadequados ou impedidos não entram como oportunidade;
- não criar abordagem nem calcular retorno ou pontos.

## Limites, vencimentos e uso responsável

### Dados do limite

Registrar produto, modalidade, valor total, utilizado, disponível, percentual de uso, concessão ou referência, validade, próxima revisão, garantias ou condições conhecidas, fonte, data-base, situação, pendências e evidências.

### Estado

`DISPONIVEL`, `PARCIALMENTE_UTILIZADO`, `UTILIZACAO_ELEVADA`, `TOTALMENTE_UTILIZADO`, `PROXIMO_DO_VENCIMENTO`, `VENCIDO`, `REDUZIDO`, `RENOVADO`, `SUSPENSO` ou `INDETERMINADO`. Faixas dependem de parâmetros versionados.

### Eventos

Concessão, ativação, primeira utilização, aumento, redução, uso crescente ou integral, amortização, renovação, vencimento próximo, vencimento, suspensão, liberação de saldo, mudança de garantia ou condição e divergência de valor.

### Leitura contextual

Distinguir limite ativo de pré-aprovação; disponibilidade de elegibilidade definitiva; uso recorrente de pontual; ociosidade por falta de necessidade de problema operacional; uso elevado saudável de pressão financeira; e vencimento contratual de suspensão antecipada.

### Uso responsável

Não recomendar crédito apenas pela existência de limite. Oportunidade depende de necessidade, finalidade, capacidade e viabilidade recebidas do Financeiro, risco e elegibilidade, condições vigentes, benefício plausível e decisão de Rafael.

### Alertas

Vencimento próximo, uso em rápida elevação, utilização integral, redução, suspensão, divergência, pré-aprovação vencida, produto sem uso, necessidade sem limite adequado e concentração em uma modalidade. Informar produto, valor, variação, data-base, prazo, evidência e verificação necessária.

### Salvaguardas de limites

- limite disponível não aprova nova operação;
- pré-aprovação não equivale a limite ativo;
- dado vencido não é atual;
- uso elevado não prova dificuldade;
- limite ocioso não prova oportunidade;
- não sugerir endividamento para gerar meta;
- não calcular capacidade de pagamento ou retorno;
- não alterar, renovar ou suspender limites;
- não prometer manutenção futura;
- minimizar informação sensível.

## Reason codes

- `ACTIVITY_RECURRING`
- `ACTIVITY_EVENTUAL`
- `ACTIVITY_NOT_RECENT`
- `ACTIVITY_UNDETERMINED`
- `MOVEMENT_GROWING`
- `MOVEMENT_INTERRUPTED`
- `MOVEMENT_VOLATILE`
- `MOVEMENT_SEASONALITY_UNCONFIRMED`
- `CENTRALIZATION_CONFIRMED`
- `CENTRALIZATION_ESTIMATED`
- `CENTRALIZATION_EXTERNAL_DATA_MISSING`
- `PRODUCT_NOT_ACTIVATED`
- `PRODUCT_NO_USAGE`
- `PRODUCT_USAGE_DECLINING`
- `PRODUCT_SINGLE_DEPENDENCY`
- `PRODUCT_POTENTIAL_NEED`
- `LIMIT_AVAILABLE`
- `LIMIT_USAGE_HIGH`
- `LIMIT_FULLY_USED`
- `LIMIT_EXPIRING`
- `LIMIT_EXPIRED`
- `LIMIT_REDUCED`
- `LIMIT_RENEWED`
- `LIMIT_SUSPENDED`
- `LIMIT_DATA_CONFLICT`

Reutilizar `ACCOUNT_MOVEMENT_DROP`, `ACCOUNT_MOVEMENT_RECOVERED`, `ACCOUNT_CENTRALIZATION_DROP`, `PRODUCT_SATURATION_HIGH` e códigos canônicos de qualidade e revisão.

## Integração e handoff

Entregar exclusivamente ao GG Conta. Queda ou retomada alimenta Ciclo de Vida; risco ou elegibilidade exige Risco e Elegibilidade; retorno e capacidade retornam ao Diretor para Financeiro; contribuição para meta retorna ao Diretor para Performance; necessidade ou abordagem retorna ao Diretor para Relacionamento.

Emitir `SPECIALIST_TO_MANAGER` conforme `contracts/handoff.schema.json`, contendo cliente, período, atividade, tendência, métricas, comparações, fluxos, centralização por dimensão, share, cobertura, confiança, produtos, utilização, profundidade, limites, vencimentos, mudanças, oportunidades potenciais, riscos, lacunas, próxima revisão, evidências, estado decisório e revisão necessária.

## Critérios de aceite

1. Distinguir atividade recorrente, eventual e ausente.
2. Exigir períodos comparáveis para tendência.
3. Reconhecer sazonalidade e volatilidade.
4. Isolar estornos, testes e transferências internas.
5. Não confundir saldo com fluxo.
6. Não presumir centralização total sem dados externos.
7. Calcular share com numerador e denominador.
8. Identificar estimativas.
9. Separar empresa e grupo econômico.
10. Distinguir contratação, ativação e uso.
11. Não medir profundidade apenas por quantidade.
12. Usar base elegível na cobertura.
13. Investigar produto sem uso antes de gerar oportunidade.
14. Distinguir pré-aprovação de limite ativo.
15. Alertar vencimentos e mudanças de limite.
16. Não recomendar crédito apenas pela existência de limite.
17. Não calcular rentabilidade, capacidade, pontos ou abordagem.
18. Preservar fonte, data-base e confiança.
19. Produzir JSON válido conforme o contrato.
20. Solicitar revisão somente para o escopo afetado.
