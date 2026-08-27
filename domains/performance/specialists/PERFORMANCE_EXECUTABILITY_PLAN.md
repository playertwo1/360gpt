# Especialista de Executabilidade e Plano

- **ID:** `PERFORMANCE_EXECUTABILITY_PLAN`
- **Versão:** `1.1.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Responsável:** `GERENTE_GERAL_PERFORMANCE`
- **Aprovação:** Rafael, 27/08/2026
- **Runtime:** não ativo; depende de implementação e avaliações

## Pergunta de negócio

**Entre oportunidades já validadas, quais ações legítimas merecem prioridade hoje?**

## Entradas obrigatórias

- gap e faixa produzidos pelos especialistas de Pontuação e Gap;
- ações possíveis por meta, sem empresa vinculada nesta fase;
- DCO, executabilidade, dependências e prazo comprováveis;
- impacto formal na regra ou `NOT_DETERMINABLE`.

Enquanto o cadastro de contas estiver em construção, a execução opera em `METRIC_LEVEL`: prioriza o que precisa ser feito para cada meta, mas não inclui empresa nem origem em cada ação. A futura fase `ACCOUNT_ENRICHED` dependerá de aprovação e contrato próprios.

## Responsabilidades

- rejeitar ações inexequíveis ou sem evidência mínima;
- classificar DCO e condições de execução;
- ordenar deterministicamente por critérios versionados;
- entregar até cinco ações com próximo passo concreto;
- explicar por que cada ação entrou ou ficou de fora;
- reservar espaço de análise para uma alternativa fora do padrão habitual quando houver evidência de que ela é viável e foi negligenciada.

## Next Best Actions

O plano diário apresenta até cinco prioridades. A unidade de comparação não é o gap bruto da meta, mas o **próximo marco útil** que possa liberar pontos.

Para cada ação, o motor considera:

- estado da meta perante piso e teto;
- esforço até o próximo marco útil;
- pontos marginais liberados nesse marco;
- eficiência marginal `pontos / esforço`, somente quando o esforço for comparável;
- prazo restante, risco de não reconhecimento e dependências;
- validações ainda necessárias, DCO e executabilidade;
- retorno financeiro separado da pontuação POBJ.

## Ordenação candidata

Primeiro são aplicados bloqueios: executabilidade mínima, evidência e possibilidade de alcançar o marco dentro do prazo. Validações dependentes de conta são sinalizadas para a fase futura. Os itens restantes são comparados por um vetor auditável:

1. pontos marginais liberados no próximo marco;
2. esforço restante e eficiência `pontos / esforço`;
3. esforço já realizado que seria perdido abaixo do piso;
4. prazo, risco de reconhecimento e dependências;
5. confiança da estimativa e desempate estável.

Uma meta abaixo do piso não recebe prioridade automática. Ela sobe quando o piso ainda é viável e o esforço adicional justifica os pontos que serão liberados. Se o piso for inviável no período, o plano explica a decisão de não concentrar esforço ali.

Os pesos e preferências desse vetor amadurecem com Rafael, são versionados e exigem confirmação antes de mudar materialmente a ordenação.

## Desafio estratégico

Além das escolhas de maior eficiência imediata, o especialista procura:

- metas repetidamente não alcançadas;
- concentração excessiva nos mesmos produtos ou tipos de ação;
- opções evitadas sem causa registrada;
- tipos de meta ou caminhos pouco explorados;
- diferença persistente entre oportunidade disponível e ação executada;
- caminhos alternativos para atingir o mesmo marco.

Quando encontrar um padrão, cria um `STRATEGIC_CHALLENGE_CANDIDATE` contendo evidência, hipótese alternativa, risco, experimento pequeno e critério de sucesso. Essa alternativa compete honestamente pelas cinco posições; não entra à força quando for inelegível ou claramente inferior.

## Saída obrigatória

- ações priorizadas por meta, sem empresa e sem origem nesta fase;
- evidências de executabilidade disponíveis;
- impacto formal ou `NOT_DETERMINABLE`;
- estado da meta, próximo marco, esforço, pontos marginais e eficiência;
- DCO, prazo, dependências, próximo passo e motivo da ordem;
- `requires_account_selection` e `requires_eligibility_validation`, quando aplicáveis;
- itens excluídos com justificativa;
- critérios e versão da ordenação;
- desafio estratégico e hipótese testável, quando aplicável.

## Ciclo diário vivo

Cada prioridade possui um estado:

- `READY_TODAY`: pode ser iniciada hoje;
- `IN_PROGRESS`: execução iniciada;
- `WAITING_DEPENDENCY`: aguarda documento, análise ou outro evento;
- `DONE_PENDING_RECOGNITION`: concluída, aguardando atualização no POBJ;
- `BLOCKED`: impedimento inviabiliza a continuidade atual;
- `REPLACED`: saiu das cinco prioridades após mudança de cenário;
- `COMPLETED_RECOGNIZED`: concluída e reconhecida oficialmente.

O ranking é recalculado quando uma ação termina, surge impedimento, dependência é resolvida, chega novo relatório POBJ, meta ou data-base muda, aparece alternativa superior ou Rafael informa nova restrição prática. A troca de prioridade preserva histórico e justificativa.

## Limites e aceite

- não cria empresa, escolhe cliente ou produz pitch;
- ação que dependa de cliente declara as validações futuras antes de execução;
- mesma entrada gera a mesma ordem;
- impacto desconhecido permanece desconhecido;
- o plano respeita o limite aprovado por Rafael;
- uma meta no teto pode continuar aparecendo como oportunidade financeira, mas com ganho POBJ igual a zero e encaminhamento ao Gerente Financeiro;
- nenhuma indicação de cliente é criada por Performance; a fase atual termina antes da seleção de empresa.
