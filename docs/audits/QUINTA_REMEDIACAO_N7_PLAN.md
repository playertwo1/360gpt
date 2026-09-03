# Quinta Remediacao — Gate N7

Base congelada: `ccc742ff1da8ababd564dabbcbce5e10913bb272`  
Branch: `fix/n7-fifth-remediation-20260903`  
Status: **EM REMEDIACAO — N7 CONTINUA BLOQUEADO**

## Regra de verdade
Nenhum item sera marcado como concluido apenas por existir no codigo. Itens de runtime exigem teste no runtime real e evidencia reproduzivel. WF-104 e AUTO_PROMOTION_ENABLED permanecem desligados ate nova auditoria independente.

## Bloco S0 — contencao e segredo
- [x] branch congelada a partir do commit auditado.
- [x] removido fallback versionado de BRIDGE_SHARED_SECRET no Compose.
- [x] Compose passa a exigir segredo externo em `.env.n8n`.
- [ ] ROTACIONAR o segredo real no host e invalidar o valor exposto.
- [ ] limpar o segredo dos demais arquivos versionados e exports.
- [ ] reescrever/limpar historico Git ou adotar procedimento formal de secret revocation + history purge.
- [ ] varredura integral do historico com secret scanner.

## Bloco S1 — banco como ultima barreira
- [x] migration 13 revoga DML direto das tabelas de lifecycle.
- [x] migration 13 revoga EXECUTE de PUBLIC nas funcoes privilegiadas.
- [x] structured_memory recebe bloqueio de inferencia GLOBAL+ACTIVE quando schema compativel existe.
- [x] catalogo fechado de preferencias AUTO criado no DB.
- [x] funcao AUTO carrega candidata do banco e valida risco LOW, escopo, frequencia, confidence, template e policy.
- [x] flag autoritativa AUTO_PROMOTION_ENABLED criada no DB, default false/fail-closed.
- [x] auditoria passa a ter helper de hash incluindo payload completo.
- [ ] aplicar migration 13 no PostgreSQL real e executar ataques com role visao360_app.

## Bloco S2 — aprovacao soberana
- [x] JS deixa de considerar hash hexadecimal prova de autenticacao.
- [x] OWNER_EXPLICIT no DB exige evento real, tenant, owner Rafael, chat allowlisted, COMMAND, `/aprovardiretriz`, hash persistido e uso unico.
- [x] promotion_policy_version e promotion_score sao preenchidos pela funcao.
- [ ] popular owner_channel_allowlist no runtime com o chat autorizado sem versionar PII/segredos.
- [ ] E2E real Telegram: aprovacao valida passa; hash falso, chat errado, tenant errado, comando errado e replay falham.

## Bloco S3 — jornada documental
- [ ] implementar `inbound -> channel_documents -> processing_jobs -> download -> Docling -> JSON Schema 1.1.0 -> evidencias -> Diretor -> GG Performance -> state_snapshots -> parecer -> delivery`.
- [ ] proibir COMPLETED antes de todas as etapas obrigatorias confirmadas.
- [ ] mapear falhas para FAILED_RETRYABLE, FAILED_FINAL ou AWAITING_OWNER_INPUT.
- [ ] remover mensagens falsas de `consolidado/persistido/enfileirado` sem transacao/fila comprovada.

## Bloco S4 — transporte e workflows
- [ ] decidir e implementar somente um transporte externo canonico. Para webhook: tunnel HTTPS permanente, reconexao automatica e webhook real do Telegram apontando para WF-100.
- [ ] publicar WF-103 com activeVersionId valido e provar cold start.
- [ ] provar Telegram externo -> WF-100 -> WF-101 -> resposta.

## Bloco S5 — respostas e comandos
- [ ] remover POBJ, competencia e contagens hard-coded do WF-101.
- [ ] consultar state_snapshots e handoffs reais.
- [ ] persistir fatos estruturados antes de confirmar registro.
- [ ] implementar ou retirar comandos reconhecidos sem handler real.

## Bloco S6 — testes e documentacao
- [x] teste estatico N7 adicionado ao `npm test`.
- [ ] adicionar testes PostgreSQL ofensivos para todos os bypasses do parecer.
- [ ] adicionar secret scanning de working tree + historico.
- [ ] adicionar E2E documental e Telegram real.
- [ ] corrigir AGENTS/ROADMAP/PROJECT_STATE/SESSION_STATE/dossie/rollback/hashes/backups somente apos runtime convergir.
- [ ] gerar novo dossie com SHA final fixo e evidencias reproduziveis.

## Criterio de desbloqueio N7
N7 somente pode sair de BLOCKED quando S0-S6 estiverem completos, `npm test`, lint e build passarem, os testes ofensivos passarem com `visao360_app`, o E2E documental persistir estado/evidencias reais, Telegram externo estiver comprovado e uma nova auditoria independente aprovar A0 e N2.3.
