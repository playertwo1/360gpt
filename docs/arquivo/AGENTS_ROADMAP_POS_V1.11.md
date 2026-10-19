# ARQUIVADO — Roadmap de implementação após v1.11 (AGENTS.md)

> Arquivado verbatim do `AGENTS.md` em 2026-10-19. Histórico desatualizado; o planejamento vigente é `ROADMAP.md`.

## Roadmap de implementação após v1.11

Cada alteração futura neste documento deve criar nova versão, novo nome de arquivo e entrada própria no topo do Changelog. O roadmap abaixo não muda o status de prontidão até que seus itens aplicáveis tenham evidência versionada e aprovação registrada.

- Materializar os JSON Schemas Draft 2020-12 de handoff, Estado 360 e resposta do Assessor.
- Materializar os schemas de roteamento, revisão manual, autorização e evento de auditoria, reutilizando as definições comuns.
- Criar o registro de schemas, a matriz de compatibilidade produtor-consumidor e testes de contrato na integração contínua.
- Fechar o catálogo de `reason_code` por domínio.
- Definir SLA de atualidade por campo e fonte.
- Homologar fórmula do motor de prioridade P0–P3.
- Formalizar autorização por canal e matriz de perfis.
- Definir política de retenção e descarte de auditoria.
- Definir metas numéricas dos SLOs, janelas, orçamentos de erro e alertas por ambiente e criticidade.
- Definir baselines e critérios mensuráveis para autorizar aumento de autonomia.
- Materializar o schema de decisão de roteamento, o catálogo de capacidades e o registro de agentes.
- Calibrar por intenção os limiares do roteamento assistido e os critérios de abertura de `CAPABILITY_GAP`.
- Construir conjuntos de avaliação representativos e homologar perfis de confiança por domínio, intenção, modelo e prompt.
- Materializar o change set do Estado 360, a política de precedência de fontes e o contrato de armazenamento versionado.
- Definir retenção, compactação, reconstrução, watermarks e critérios formais de `last_known_good_version`.
- Materializar gates de release, datasets dourados, estágios shadow/canário, kill switches e runbooks de incidente e rollback.
- Materializar classificação de dados, matriz de acesso, gateway de ferramentas, DLP, política de egress e threat model agentic.
- Homologar isolamento por tenant, identidades de workload, cofre de segredos, inventário de componentes e testes adversariais.
- Materializar contratos de pedido e resolução, catálogo fechado de `reason_code`, políticas de SLA, filas, escalonamento e runbook da Central de Revisão 360.
- Definir metas de backlog, tempo de atribuição, resolução, reabertura e violação de SLA por categoria e severidade.
- Materializar Registro de Fontes, matriz de autoridade, Evidence Graph, eventos de linhagem e política de qualidade por campo.
- Homologar cobertura mínima de linhagem, tolerâncias de reconciliação e propagação de correção, degradação e revogação.
- Materializar o read model, o contrato de consulta, o projetor determinístico e os testes de consistência entre Estado 360, Dashboard e Assessor.
- Definir TTL por classificação, política de invalidação, metas de latência de projeção e critérios de acessibilidade do Dashboard.
- Materializar eventos de uso, orçamentos, política de modelos, cotas, filas e painéis de custo por resultado válido.
- Executar testes de carga, saturação, backpressure e não regressão de qualidade para cada otimização proposta.
- Homologar RTO/RPO por componente, inventário de dependências, estratégia de backup e ordem de recuperação.
- Executar restauração completa, teste de perda regional/dependência e exercício de retorno sem duplicidade.
- Materializar RACI, processo de mudanças, ADRs, manifesto de release, checklist de prontidão e pacote de evidências.
- Automatizar validação de links, versões, hashes, schemas, policies, registries e drift entre documentação e implantação.

