# Registro de autorização para dados reais

**Estado:** AUTORIZAÇÃO PARCIALMENTE REGISTRADA — nenhuma fonte real conectada ou consultada.  
**Regra:** preencher e aprovar este registro antes de C1; o preenchimento não promove agentes para `ACTIVE`.

## Registro obrigatório por operação

| Campo | Valor aprovado |
|---|---|
| Operação e finalidade | Acompanhar e analisar metas POBJ |
| Domínio e capacidade | GG Performance; `PERFORMANCE_SCORING_STATE` e parecer consultivo em leitura controlada |
| Fonte e campos mínimos | Pendente — nenhuma fonte real pode ser conectada antes de definir origem e somente os campos necessários |
| Tenant e público autorizado | Usuários autorizados por e-mail ou convite, com autenticação e auditoria |
| Período de vigência | Indeterminado, até revogação expressa de Rafael; revisão periódica recomendada |
| Retenção e descarte | Retenção indefinida solicitada por Rafael; **não operacional até registrar critério de minimização, necessidade e descarte/revisão** |
| Responsável de negócio | Rafael |
| Data steward / segurança | Rafael como autoridade inicial; responsável técnico operacional ainda deve ser designado antes de conectar fonte real |
| Evidência da autorização | Declaração registrada de Rafael em 28/08/2026: autorização institucional vigente para a finalidade descrita |
| Limites de consulta e classificação LGPD | Somente leitura, mínimo necessário, acesso autenticado/autorizado e auditoria; classificação detalhada depende dos campos da fonte |
| Efeitos externos | Proibidos |
| Condição de pausa e rollback | `DISABLE_CAPABILITY` + preservação de auditoria |

## Pendências antes de dados reais

1. Registrar a fonte autorizada e os campos mínimos necessários para POBJ.
2. Converter a retenção indefinida solicitada em critério documentado de necessidade, revisão e descarte, compatível com minimização.
3. Designar responsável técnico operacional/data steward quando a fonte real for conectada.

Enquanto estas pendências existirem, o canary permanece exclusivamente sintético e nenhuma consulta de dado real é permitida.

## Aceite para C1

- A autorização descreve finalidade, escopo, fonte, campos, responsáveis, vigência, retenção e evidência.
- A fonte está registrada como autorizada e ativa para a finalidade.
- O acesso é somente leitura, minimizado e auditável.
- Não existe execução externa nem promoção automática de lifecycle.
