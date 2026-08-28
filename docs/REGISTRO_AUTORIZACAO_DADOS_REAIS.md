# Registro de autorização para dados reais

**Estado:** AUTORIZAÇÃO DOCUMENTAL APROVADA — nenhuma fonte real conectada ou consultada.

**Propriedade do projeto:** Diretor 360 é projeto privado de Rafael. Rafael é o proprietário e responsável técnico permanente. Qualquer regra institucional aplicável limita somente o uso de uma fonte de dados institucional, sem transferir a propriedade, a administração ou a responsabilidade técnica do projeto.
**Autoridade sobre fontes:** Rafael decide, caso a caso, se uma fonte pode ser utilizada e quais campos podem ou não ser armazenados. Nenhuma fonte, campo novo ou ampliação de retenção é autorizada por inferência.
**Regra:** preencher e aprovar este registro antes de C1; o preenchimento não promove agentes para `ACTIVE`.

## Registro obrigatório por operação

| Campo | Valor aprovado |
|---|---|
| Operação e finalidade | Acompanhar e analisar metas POBJ |
| Domínio e capacidade | GG Performance; `PERFORMANCE_SCORING_STATE` e parecer consultivo em leitura controlada |
| Fonte e campos mínimos | Planilha POBJ autorizada; somente meta, realizado e período. CPF, telefone, e-mail, documentos pessoais e demais campos não necessários são proibidos. |
| Tenant e público autorizado | Usuários autorizados individualmente por e-mail ou convite; Rafael decide inclusão e retirada de acessos; autenticação e auditoria obrigatórias |
| Período de vigência | Indeterminado, até revogação expressa de Rafael |
| Retenção e descarte | Dados detalhados: 24 meses após o encerramento do período POBJ. Backups: rotação e descarte em até 90 dias. Agregados não identificáveis: prazo indeterminado. Exclusão antecipada por revogação, fim da finalidade ou determinação institucional aplicável. |
| Responsável de negócio | Rafael |
| Responsável técnico / data steward | Rafael, de forma permanente, como proprietário do projeto. Delegação a terceiro somente por decisão expressa de Rafael, sem transferência automática de propriedade. |
| Evidência da autorização | Declaração registrada de Rafael em 28/08/2026: autorização institucional vigente para a finalidade descrita |
| Limites de consulta e classificação LGPD | Somente leitura, mínimo necessário, acesso autenticado/autorizado e auditoria; classificação detalhada depende dos campos da fonte |
| Efeitos externos | Proibidos |
| Condição de pausa e rollback | `DISABLE_CAPABILITY` + preservação de auditoria |

## Controles operacionais obrigatórios

1. Rafael aprova e revoga individualmente os acessos por e-mail ou convite.
2. A exclusão deve registrar data, escopo, responsável e resultado; backups expiram pela rotação de até 90 dias.
3. Agregados somente podem permanecer por prazo indeterminado quando não permitirem identificação ou reidentificação.
4. Se Rafael decidir delegar suporte técnico, a delegação deve registrar escopo, prazo, privilégios e revogação; a propriedade do projeto permanece com Rafael.
5. A fonte concreta ainda deve ser cadastrada e validada tecnicamente antes da primeira conexão; esta autorização documental não ativa a fonte.
6. Cada autorização de fonte deve registrar a decisão de Rafael, finalidade, campos permitidos, campos proibidos e prazo de retenção aplicável.

Enquanto a fonte concreta não for cadastrada, validada e ativada por gate próprio, o canary permanece exclusivamente sintético e nenhuma consulta de dado real é permitida.

## Aceite para C1

- A autorização descreve finalidade, escopo, fonte, campos, responsáveis, vigência, retenção e evidência.
- A fonte concreta deve ser registrada como autorizada e ativa para a finalidade antes da primeira conexão.
- O acesso é somente leitura, minimizado e auditável.
- Não existe execução externa nem promoção automática de lifecycle.
