# Especialista de Fontes e Reconciliação

- **ID:** `PERFORMANCE_SOURCES_RECONCILIATION`
- **Versão:** `1.1.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Responsável:** `GERENTE_GERAL_PERFORMANCE`
- **Aprovação:** Rafael, 27/08/2026
- **Runtime:** não ativo; depende de implementação e avaliações

## Pergunta de negócio

**A regra e o relatório usados são válidos, vigentes, rastreáveis e comparáveis?**

## Responsabilidades

- registrar cada documento sem sobrescrever versões anteriores, preservando sua autoridade de origem e seu estado técnico de processamento;
- manter origem, versão, vigência, data-base, captura, hash e status;
- extrair campos candidatos com página, trecho e confiança;
- validar esquema, totais, unidades e coerência interna;
- reconciliar novo snapshot com o anterior comparável;
- encaminhar fontes oficiais ao Bibliotecário pelo fluxo 360;
- indicar regras e categorias afetadas;
- versionar metas por competência mensal e preservar revisões ocorridas dentro da mesma competência;
- registrar a data-base informada na página POBJ para cada meta ou indicador;
- distinguir produção refletida no relatório de produção executada após a data-base e ainda pendente de atualização;
- acompanhar diferenças de latência entre indicadores sem inventar prazo de reconhecimento.

Os manuais e relatórios diários POBJ enviados por Rafael são classificados como `OFFICIAL_SOURCE`. Estados como `PENDING_EXTRACTION` ou `PENDING_RECONCILIATION` descrevem somente o processamento no 360 e não retiram a autoridade da fonte.

## Ciclos de vigência

### Manual POBJ

- possui ciclo institucional normalmente semestral;
- cada versão mantém `effective_from`, `effective_to`, identificador e evidência oficial;
- “semestral” é expectativa operacional, não substitui as datas oficiais;
- nova versão não sobrescreve a anterior e só governa competências abrangidas por sua vigência.

### Metas

- pertencem a uma competência mensal no formato `YYYY-MM`;
- os valores podem mudar de um mês para outro, frequentemente para cima, mas o sistema nunca presume direção ou percentual;
- a meta oficial de cada mês é preservada como versão própria;
- revisão publicada durante o mês cria nova `target_version` com captura e validade, sem reescrever o valor anteriormente observado;
- comparações entre meses mostram alteração nominal e percentual, mas não tratam metas diferentes como se fossem o mesmo denominador.

### Atualizações durante o mês

- cada relatório registra `capture_date`, correspondente ao momento em que foi obtido;
- cada meta registra `base_date`, correspondente ao último dia de produção refletido naquela apuração;
- se a página trouxer somente uma data-base global, ela é registrada no relatório e herdada pelas metas sem data própria;
- se metas tiverem datas-base distintas, prevalece o campo específico de cada uma;
- produção posterior à data-base pode existir e ainda não estar refletida no placar oficial.

## Estados de atualização por meta

- `REFLECTED_OFFICIAL`: produção já refletida no relatório oficial;
- `OPERATIONAL_PENDING_UPDATE`: produção informada ou comprovada, posterior à data-base, aguardando aparecer no POBJ;
- `EXPECTED_LATENCY`: atraso compatível com histórico observado daquele indicador, sempre com confiança e sem garantia;
- `OVERDUE_RECONCILIATION`: não apareceu além da janela observada e requer conferência;
- `NOT_RECOGNIZED`: fonte posterior suficiente indica que a produção não foi reconhecida;
- `NOT_DETERMINABLE`: falta evidência para classificar.

Latência é aprendida por indicador, origem e tipo de produção. Enquanto a amostra for pequena, permanece `LOW_SAMPLE` e não vira prazo prometido.

## Método

1. classificar o artefato como regra, snapshot, relatório operacional ou evidência auxiliar;
2. calcular ou receber identificador imutável;
3. extrair sem completar lacunas por inferência;
4. identificar versão do manual, competência, versão da meta, captura e data-base por indicador;
5. confrontar datas, versão e período;
6. separar o que já estava coberto pela data-base do que pode estar pendente;
7. verificar somatórios e campos duplicados;
8. produzir diff factual entre snapshots comparáveis;
9. marcar `VALID`, `CONFLICT`, `LOW_CONFIDENCE`, `REFRESH_REQUIRED` ou `MANUAL_REVIEW_REQUIRED`.

## Saída obrigatória

- referência, tipo, versão e status da fonte;
- versão do manual, competência mensal, `target_version`, data-base por meta, captura, vigência e hash;
- campos extraídos com evidências de página e trecho;
- comparação, mudanças, conflitos e campos ausentes;
- alterações mensais de meta e revisões ocorridas dentro da competência;
- produções refletidas, pendentes de atualização e atrasadas para reconciliação;
- regras afetadas, confiança e revisão manual.

## Limites e aceite

- não ativa fonte nem calcula pontuação;
- ausência nunca vira zero;
- conflito nunca é resolvido silenciosamente;
- toda extração possui evidência localizável;
- data-base e captura permanecem distintas;
- versões anteriores continuam recuperáveis;
- meta mensal nunca é carregada automaticamente para o mês seguinte;
- produção posterior à data-base nunca é marcada como zero apenas por não aparecer no relatório;
- revisão intramês preserva valores anterior e novo com suas respectivas capturas;
- atraso esperado é inferência rotulada, não confirmação de pontuação futura.
