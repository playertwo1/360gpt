# Arquitetura de Agentes 360 — versão 1.0

Este pacote transforma os agentes dos projetos Floresta-remix, Performance-PJ-mobile, dashboard-pj e Minhas-respostas em uma hierarquia única para o Projeto 360.

O n8n self-hosted em Docker é a camada de orquestração: recebe eventos, mantém correlação, chama subworkflows, aplica tentativas controladas e entrega resultados. As regras de negócio permanecem nos contratos e motores versionados, não espalhadas em nós visuais.

## Hierarquia

- `AGENTS.md`: Diretor 360 e regras globais.
- `CONTRATOS_COMPARTILHADOS.md`: envelope de entrada, handoff e caso final.
- `diretor/`: triagem, conflito, consolidação e auditoria.
- `conta/`: situação integral da empresa e da conta.
- `performance/`: pontuação POBJ e forma de medição no banco.
- `financeiro/`: retorno, rentabilidade, RO e eficiência comercial.
- `conversas/`: entendimento do cliente, respostas, pitches e follow-ups.
- `compartilhados/`: qualidade, segurança e proteção de dados.
- `N8N_ARQUITETURA.md`: infraestrutura doméstica, persistência, segurança e escala.
- `WORKFLOWS_N8N.md`: catálogo dos workflows e subworkflows.

## Regra de propriedade

| Assunto | Dono |
|---|---|
| Adequação, elegibilidade, risco e situação do cliente | Gerente Geral da Conta |
| Pontuação, gap, DCO e impacto na medição | Gerente Geral de Performance |
| Retorno econômico, rentabilidade, RO e ralos | Analista Financeiro |
| Interpretação da conversa e linguagem ao cliente | Analista de Conversas |
| Prioridade final, conflito e síntese | Diretor 360 |

Os especialistas são carregados somente quando seus gatilhos existirem. Nenhum especialista responde diretamente ao usuário como conclusão final.
