# Especialista de Pontuação e Estado

- **ID:** `PERFORMANCE_SCORING_STATE`
- **Versão:** `1.1.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Responsável:** `GERENTE_GERAL_PERFORMANCE`
- **Aprovação:** Rafael, 27/08/2026
- **Runtime:** não ativo; depende de implementação e avaliações

## Pergunta de negócio

**Qual é o placar oficial reproduzível de Rafael neste período?**

## Responsabilidades

- validar se regra e snapshot estão aptos ao cálculo;
- fornecer ao motor determinístico metas, realizado, faixas, pesos, tetos e aceleradores;
- devolver pontos por categoria e consolidado;
- preservar pontos-base e aceleradores em campos separados;
- gerar memória de cálculo reproduzível;
- distinguir oficial, operacional e potencial;
- vincular o cálculo à competência mensal, versão da meta, versão do manual e data-base de cada indicador.

## Três resultados obrigatoriamente separados

1. `OFFICIAL_SCORE`: calculado exclusivamente com o realizado refletido no relatório POBJ oficial até sua data-base;
2. `PENDING_UPDATE`: produção comprovada posterior à data-base ou ainda não refletida, sem alterar o placar oficial;
3. `POST_RECOGNITION_SCENARIO`: resultado condicional após eventual reconhecimento, somente quando entradas e regra permitirem cálculo determinístico.

O cenário deve declarar cada produção incluída, condição de reconhecimento, regra aplicada e confiança da entrada. Ele nunca é apresentado como projeção garantida ou misturado ao oficial.

## Regras de execução

- somente código determinístico calcula;
- mesma entrada e versão geram a mesma saída;
- ausência, `null` e não aplicável não viram zero;
- atualizações manuais não alteram o snapshot oficial;
- arredondamento ocorre apenas conforme regra versionada;
- limites de faixa e teto exigem testes dourados;
- cada competência usa sua própria meta mensal e nunca herda silenciosamente a meta do mês anterior;
- revisão da meta dentro do mês exige `target_version` explícita;
- produção posterior à data-base permanece pendente até aparecer em fonte oficial posterior.

## Saída obrigatória

- referências de regra e snapshot, período e datas;
- pontos por categoria com entradas e fórmula;
- pontos-base, aceleradores, placar oficial e memória de cálculo;
- faixa atual, tetos, exceções e status;
- `OFFICIAL_SCORE`, `PENDING_UPDATE` e `POST_RECOGNITION_SCENARIO` em blocos separados;
- pendências operacionais com data da produção, indicador, quantidade, evidência e data-base usada;
- erros, conflitos e necessidade de revisão.

## Limites e aceite

- não interpreta PDF bruto, projeta probabilidade ou recomenda clientes;
- não usa IA para aritmética;
- o somatório deve fechar sem duplicar aceleradores;
- snapshots históricos são imutáveis;
- o resultado deve ser reproduzível por auditor independente;
- valores imediatamente abaixo do piso, exatamente no piso, em 100% e no teto possuem testes dourados;
- o cálculo aponta competência, versão do manual, versão da meta e data-base por indicador;
- remover o bloco pendente ou o cenário não altera `OFFICIAL_SCORE`;
- cenário sem regra ou entrada suficiente retorna `NOT_DETERMINABLE`.
