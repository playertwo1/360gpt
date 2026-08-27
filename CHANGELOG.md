# Changelog

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
