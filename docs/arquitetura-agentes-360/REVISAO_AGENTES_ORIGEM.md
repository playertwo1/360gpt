# Revisão dos agentes de origem

## Melhorias transversais

1. Padronizar todos os handoffs; hoje apenas o Floresta possui contrato maduro.
2. Adicionar `correlation_id`, `idempotency_key`, versão de schema, fonte e data-base.
3. Separar propriedade do problema: Conta valida adequação e risco; Performance mede pontos; Financeiro mede retorno; Conversas define linguagem.
4. Proibir fallback fictício e exigir estado explícito de falha.
5. Persistir cada etapa para permitir retomada e auditoria no n8n.
6. Carregar somente especialistas necessários; arquivos de teste não entram na execução normal.

## Floresta-remix

Pontos fortes: melhor roteamento, precedência, contratos, confiança e separação fato/cálculo/inferência/recomendação.  
Melhorias: retirar Dados e Qualidade da duplicação local e tratá-lo como serviço compartilhado; incluir idempotência e correlação; separar linguagem comercial do diagnóstico de oportunidade; registrar timeout e retomada de subworkflow.

## Performance-PJ-mobile

Pontos fortes: fonte normativa, motor determinístico, distinção entre zero e ausência, DCO, elegibilidade e segurança.  
Melhorias: o arquivo legado `agente.md` está grande e mistura metodologia, comandos e saída; foi dividido em Fontes/Vigência, Cálculo/Estado, Gap/Risco, DCO/Executabilidade e Otimização/Plano. O orquestrador fica responsável apenas por integrar.

## dashboard-pj

Pontos fortes: foco em ROI, RO, ralos e custo de tempo.  
Melhorias: substituir a expressão “dado oficial é verdade absoluta” por fonte oficial válida e contextualizada; separar grupo/item e qualidade antes da análise; retirar cálculos do prompt; criar motor financeiro; separar Rentabilidade, Ralos e Retorno/Eficiência; trocar prioridades fixas de produto por parâmetros versionados e sujeitos a adequação.

## Minhas-respostas

Pontos fortes: importação de WhatsApp, contexto, sentimento, respostas, tags e follow-up.  
Melhorias obrigatórias: remover chave Gemini do aplicativo; impedir logs de conversa/prompt/resposta; eliminar respostas fictícias em falha; retirar seleção aleatória de cliente; obter consentimento e minimizar PII; separar sentimento, necessidade, resposta, pitch e compromissos; exigir parecer da Conta antes de oferta e confirmação humana antes de envio.

## Resultado da divisão

A arquitetura passa a ter quatro responsáveis de domínio, quatro especialistas internos do Diretor, dois controles compartilhados e especialistas pequenos por função. Isso reduz prompts gigantes, evita sobreposição e permite que o n8n execute apenas o necessário em cada caso.
