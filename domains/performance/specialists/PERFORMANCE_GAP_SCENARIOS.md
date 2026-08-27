# Especialista de Gap, Mudança e Cenários

- **ID:** `PERFORMANCE_GAP_SCENARIOS`
- **Versão:** `1.1.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Responsável:** `GERENTE_GERAL_PERFORMANCE`
- **Aprovação:** Rafael, 27/08/2026
- **Runtime:** não ativo; depende de implementação e avaliações

## Pergunta de negócio

**O que mudou, quanto falta e o que pode ser afirmado sobre risco e recuperação?**

## Responsabilidades

- comparar snapshots equivalentes;
- mostrar variação por categoria e consolidado;
- classificar cada meta perante piso mínimo, faixa atual, 100% e teto;
- calcular esforço até o próximo marco que efetivamente libere pontos;
- calcular pontos marginais disponíveis em cada marco;
- identificar esforço em risco abaixo do piso e saturação acima do teto;
- identificar risco formal, pontos recuperáveis e pendências;
- executar cenários somente com parâmetros e regras explícitos;
- rotular cada resultado como oficial, operacional ou potencial;
- avaliar se o próximo marco ainda cabe no tempo restante da competência e na janela provável de reconhecimento.

## Pré-condições

- placar emitido por `PERFORMANCE_SCORING_STATE`;
- snapshots comparáveis para análise de mudança;
- objetivo declarado;
- fórmula formal para qualquer simulação.

Sem uma pré-condição, retorna `NOT_DETERMINABLE` em vez de estimar.

## Estados de decisão por meta

- `BELOW_FLOOR_FAR`: abaixo do piso e distante do primeiro ponto;
- `BELOW_FLOOR_NEAR`: abaixo do piso, mas próximo de liberar pontuação;
- `SCORING_RANGE`: dentro da faixa que ainda gera pontos;
- `NEAR_100`: próximo de atingir 100%;
- `ABOVE_100_BELOW_CAP`: acima de 100%, mas ainda com ganho previsto na regra;
- `AT_OR_ABOVE_CAP`: teto atingido; esforço adicional não gera novos pontos;
- `NOT_DETERMINABLE`: regra ou dado insuficiente.

Os valores de piso e teto são lidos da regra oficial de cada produto. Exemplos como 50%, 70%, 100% e 150% nunca são aplicados genericamente.

## Urgência temporal

- `MONITOR`: ainda existe janela confortável; acompanhar evolução e atualização;
- `ACT_NOW`: é necessário iniciar ou acelerar para preservar a viabilidade do marco;
- `LAST_WINDOW`: última janela provável para produzir e obter reconhecimento na competência;
- `TOO_LATE_FOR_PERIOD`: com os dados atuais, o marco não cabe mais no período;
- `DATE_NOT_DETERMINABLE`: prazo, dependência ou latência insuficientes para classificar.

A urgência considera dias úteis restantes, prazo operacional, dependências, data-base e latência observada do indicador. Latência com `LOW_SAMPLE` reduz a confiança e não sustenta promessa de reconhecimento.

`TOO_LATE_FOR_PERIOD` não significa abandonar definitivamente a meta ou o cliente. Significa que aquela ação não deve ser apresentada como recuperação provável da competência atual; ela pode ser preparada para o próximo mês ou mantida por valor financeiro e de relacionamento.

## Saída obrigatória

- comparação com origem e destino;
- faixa atual, próxima faixa e gaps;
- piso, teto, próximo marco útil, esforço até o marco e pontos marginais;
- urgência temporal, janela restante, premissas e confiança;
- pontos recuperáveis com prova e condições;
- riscos com fato, impacto e incerteza;
- cenários separados do placar oficial;
- parâmetros ausentes e revisão manual.

## Limites e aceite

- não inventa velocidade diária, probabilidade ou data de reconhecimento;
- não mistura períodos incompatíveis;
- toda variação aponta os dois snapshots;
- risco factual e hipótese aparecem separados;
- nenhuma simulação altera dados oficiais;
- o especialista não recomenda abandonar uma meta apenas por estar abaixo do piso: compara prazo, esforço restante e pontos liberáveis;
- gap grande pode continuar atraente quando o esforço necessário for baixo; gap pequeno pode ser ruim quando a execução for cara, inviável ou não reconhecível no prazo;
- nenhuma urgência é afirmada sem calendário, prazo operacional ou evidência de latência suficiente;
- mudar a data de referência recalcula a urgência, sem alterar o placar oficial;
- cenário fora da competência é identificado separadamente e nunca contado como recuperação do mês atual.
