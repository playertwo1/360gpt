# Checklist de ativação gradual dos Gerentes Gerais

**Versão do checklist:** 1.0.0  
**Estado atual:** todos os quatro gerentes permanecem `INACTIVE`  
**Regra:** nenhum item de ativação autoriza, sozinho, a promoção para `ACTIVE`.

## Pré-requisitos comuns

- [ ] Janela Shadow de 24 medições concluída e parecer emitido.
- [ ] 14/14 testes gerais aprovados.
- [ ] Schemas Draft 2020-12 validados em todas as fronteiras.
- [ ] Evidência, data-base, fonte, vigência e hash presentes nos pareceres.
- [ ] Zero efeitos externos não autorizados.
- [ ] Backup verificável e rollback testado.
- [ ] Allowlist, segredos e classificação LGPD confirmados.
- [ ] Rafael revisou e autorizou o escopo específico.

## GG Conta — `4.38.0`

- [ ] Cadastro e identidade usam identificadores fortes.
- [ ] Elegibilidade é específica por produto, operação ou ação.
- [ ] Restrições divergentes geram `MANUAL_REVIEW_REQUIRED`.
- [ ] Não calcula POBJ nem rentabilidade.
- [ ] Não transforma pré-aprovação em promessa.
- [ ] Especialistas e catálogo estão em `ACTIVE` somente após aprovação separada.
- [ ] Canary limitado homologado.

## GG Performance — `5.3.0-approved-design`

- [ ] POBJ usa fórmula, piso, teto e versão de política registrados.
- [ ] Cada indicador possui unidade, meta, realizado e data-base.
- [ ] Não escolhe empresa sem apoio do GG Conta.
- [ ] Não inventa retorno financeiro nem pitch relacional.
- [ ] Gaps e prioridades possuem cálculo reproduzível.
- [ ] Canary limitado homologado.

## GG Financeiro — `2.0.0-approved-design`

- [ ] Orçamento, realizado e cenário estão separados.
- [ ] Fórmula, escala, moeda, período e arredondamento são reproduzíveis.
- [ ] Ausência financeira é `NOT_AVAILABLE`, não bloqueio automático.
- [ ] Não aprova crédito nem produz efeito financeiro.
- [ ] Canary limitado homologado.

## GG Relacionamento — `2.0.0-approved-design`

- [ ] Conversas e compromissos possuem evidência textual.
- [ ] Hipóteses permanecem rotuladas como hipóteses.
- [ ] Responsável, prazo e follow-up são rastreáveis.
- [ ] Não transforma inferência em necessidade do cliente.
- [ ] Redação externa exige autorização humana específica.
- [ ] Canary limitado homologado.

## Promoção controlada

- [ ] Aprovar um único domínio e uma única capacidade.
- [ ] Manter efeitos externos bloqueados.
- [ ] Monitorar erro, latência, custo, divergência e override.
- [ ] Definir condição de pausa e rollback antes da ativação.
- [ ] Registrar decisão, versão, escopo, evidências e validade no changelog.
- [ ] Promover somente a capacidade autorizada para `ACTIVE`.
