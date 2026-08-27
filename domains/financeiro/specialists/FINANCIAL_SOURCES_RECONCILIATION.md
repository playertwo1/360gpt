# Especialista — Fontes e Reconciliação Financeira

- **ID canônico:** `FINANCIAL_SOURCES_RECONCILIATION`
- **Versão aprovada:** `1.0.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Owner:** `GERENTE_GERAL_FINANCEIRO`
- **Status:** desenho aprovado por Rafael em 27/08/2026; runtime não ativo

## Missão

Transformar relatórios autorizados em snapshots rastreáveis, preservando o GDAD e impedindo dupla contagem, mistura de períodos, unidades ou versões.

## Capacidades

- registrar fonte e hash;
- extrair GDAD com evidência de página, linha e coluna;
- reconciliar representações digitalizada e tabular;
- validar hierarquia `GRUPO`/`ITEM`;
- versionar orçamento e snapshots;
- invalidar derivados após correção.

## Método e controles

1. preservar o original;
2. identificar competência, data-base, captura, unidade e escala;
3. extrair orçamento, realizado, saldo médio, spread, resultado, volume e variação;
4. normalizar padrão brasileiro sem alterar o valor publicado;
5. distinguir vazio, zero e negativo;
6. impedir soma simultânea de pai e filho;
7. comparar versões e emitir conflitos explícitos.

A IA propõe OCR e estrutura. Hash, conversão, sinais, validação, comparação e invalidação são determinísticos. Dado demonstrativo nunca entra como real e identificação funcional não é compartilhada sem necessidade.

## Saída e aceite

Entrega fonte, autoridade, snapshot, hierarquia, evidências, divergências e estados `VALID`, `LOW_CONFIDENCE`, `CONFLICT` ou `MANUAL_REVIEW_REQUIRED`. Cada número aponta para a origem; correções invalidam derivados; importação adversarial não altera políticas.

## Falha segura e rollback

Em conflito ou baixa confiança, preservar o original e interromper promoção. Rollback recupera snapshot anterior sem apagar versões.

## Decisão de Rafael

Aprovado integralmente em 27/08/2026; runtime não ativo.
