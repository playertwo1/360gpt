# REAUDITORIA INDEPENDENTE E GUIA DA QUARTA REMEDIAÇÃO — GATES A0 E N2.3

> **ERRATA OBRIGATÓRIA DO AUDITOR — LEIA ANTES DE EXECUTAR:** NÃO desative, aposente, remova ou arquive o `WF-101`. A redação inicial do parecer foi ambígua e poderia induzir essa ação; o erro de comunicação foi do auditor Codex. O objetivo da remediação é **CORRIGIR, PUBLICAR E ATIVAR O WF-101**, pois ele é o núcleo canônico do Diretor 360. Durante a edição, use versão de rascunho/teste para impedir processamento incorreto, mas conclua Q2/Q4 com o WF-101 publicado e conclua Q7 com ele ativo após cold start. **MANTER DESLIGADOS SOMENTE:** `WF-104` e a feature flag `AUTO_PROMOTION_ENABLED`. Não executar nenhuma instrução anterior que mande desativar o WF-101.

**Projeto:** Diretor 360  
**Data:** 03 de setembro de 2026  
**Auditor independente:** ChatGPT Codex  
**Autoridade de negócio:** Rafael  
**Repositório:** `https://github.com/playertwo1/360gpt.git`  
**Branch:** `main`  
**Commit auditado:** `d437a0c3a6b9b51f4c5aa083a178661e3dde8f9e`  
**Veredito:** `REPROVADO — REMEDIAÇÃO OBRIGATÓRIA`  
**Gate A0:** `REOPENED`  
**Gate N2.3:** `REOPENED`  
**Gate N7:** `BLOCKED`

> **ESCLARECIMENTO CRÍTICO SOBRE O WF-101:** o WF-101 não deve ser aposentado, removido ou mantido permanentemente desativado. Ele é o controlador canônico obrigatório do Diretor 360. Seu estado inativo atual é um defeito a ser corrigido. Durante a remediação, ele pode permanecer temporariamente sem processar entradas reais somente enquanto sua versão é corrigida e validada; nos Blocos Q2 e Q4 deve ser importado, publicado e testado, e no Q7 deve ficar ativo no runtime canônico após cold start. Os componentes que devem permanecer inativos são o WF-104 e a autopromoção AUTO, não o WF-101.

---

## 1. Finalidade e regra de verdade

Este é o guia operacional obrigatório para o Antigravity corrigir a terceira remediação. Reúne o estado real, os avanços que devem ser preservados, os achados reproduzíveis, a correção esperada por componente, a ordem segura de execução e os critérios de aceite.

Este documento substitui como ponto de retomada os guias anteriores. Auditorias e respostas passadas permanecem históricas e não devem ser apagadas nem reescritas para esconder resultados.

Uma declaração em Markdown não prova implementação. A precedência desta remediação é:

1. runtime real;
2. banco e versões publicadas no n8n;
3. testes reproduzíveis;
4. código versionado;
5. documentação.

`DONE` exige código, runtime, teste e evidência. Não marcar tarefa concluída porque um JSON, SQL ou JavaScript foi apenas escrito.

## 2. Ordem obrigatória de leitura

1. `AGENTS.md`;
2. este documento;
3. `PROJECT_STATE.md`;
4. `ROADMAP.md`, Seção 11.4;
5. `CHANGELOG.md` recente;
6. `SESSION_STATE.json`;
7. `CODEX_HANDOFF.md`;
8. `policies/n8n-canonical-architecture.yaml`;
9. `docs/arquitetura-agentes-360/ADR-002-N8N-NUCLEO-LOCAL.md`;
10. `docs/audits/RESPOSTA_TERCEIRA_REMEDIACAO_CODEX_GATES_A0_N2_3.md` somente como alegação histórica;
11. Git, Docker, PostgreSQL e n8n reais.

## 3. Jornada canônica obrigatória

```text
Telegram ou Sites
        ↓
WF-100 — transporte, autenticação, deduplicação e fila
        ↓
PostgreSQL visao360 — channel_inbound_events
        ↓
WF-101 — claim, lease e controle integral
        ↓
 ┌───────────┬───────────────┬─────────────┐
 │ TEXTO     │ DOCUMENTO     │ COMANDO     │
 │ sem OCR   │ PDF/JPG/PNG   │ operacional │
 └─────┬─────┴───────┬───────┴──────┬──────┘
       │             ↓              │
       │  document-worker:8787      │
       │             ↓              │
       │  Docling CPU/TableFormer   │
       │             ↓              │
       └────── Normalizador ─────────┘
                     ↓
                Diretor 360
                     ↓
       Gerentes Gerais necessários
                     ↓
             Especialistas necessários
                     ↓
          Motor de Consolidação 360
                     ↓
 Estado 360 + Evidence Graph + histórico + memória
                     ↓
 dúvida material? → pergunta a Rafael → reprocessamento
                     ↓
 parecer auditável → Telegram/Sites
                     ↓
 avaliação → candidato de aprendizado
```

Limites: WF-100 não interpreta; WF-101 controla a jornada; WF-103 registra contingência; Docling só extrai; PostgreSQL persiste e aplica invariantes; canais só transportam/exibem; agentes interpretam; Rafael decide.

## 4. Avanços confirmados — preservar

- Git estava limpo e sincronizado no commit auditado.
- Loops dos workflows legados cessaram após o cold start do n8n em `2026-09-03T16:37:45.984562811Z`.
- Os dumps T0 são catálogos `pg_restore` legíveis, originados no PostgreSQL 17.6:
  - `backup_visao360_t0.dump`: 190 entradas TOC; SHA-256 `2570424DD4C29B35CFD0CB0A365EA08317596ED32675AB36FDB8AE5254984BB4`.
  - `backup_n8n_t0.dump`: 1032 entradas TOC; SHA-256 `CD935933B5E2CEC7B3E506B9AB7DEB01BACACCE3644C3189CF95B35B0F122088`.
- Trigger `BEFORE TRUNCATE` bloqueou adulteração da auditoria.
- `npm run lint`: exit 0, 22 warnings, zero errors.
- `npm run build`: exit 0.
- Testes específicos de arquitetura e Flywheel passam nos cenários cobertos.

Esses avanços não fecham os gates porque há falhas críticas fora da cobertura atual.

## 5. Inventário dos achados

| ID | Severidade | Gate | Achado |
|---|---|---|---|
| Q4-A0-01 | CRÍTICO | A0 | WF-101 inativo e sem versão publicada |
| Q4-A0-02 | CRÍTICO | A0 | Eventos presos em PROCESSING com lease expirado |
| Q4-A0-03 | CRÍTICO | A0 | Ramo DOCUMENT afirma processamento inexistente |
| Q4-A0-04 | CRÍTICO | A0 | Transporte HTTPS hospedado → WF-100 não comprovado |
| Q4-A0-05 | ALTO | A0 | Arquivos dos workflows divergem do banco n8n |
| Q4-A0-06 | ALTO | A0 | `exported_all.json` inválido |
| Q4-A0-07 | ALTO | A0 | `/status` reporta saúde hard-coded e falsa |
| Q4-A0-08 | ALTO | A0 | Teste arquitetural não exige jornada completa |
| Q4-N23-01 | CRÍTICO | N2.3 | Categoria segura mascara regra perigosa |
| Q4-N23-02 | CRÍTICO | N2.3 | Banco aceita promoção AUTO direta |
| Q4-N23-03 | CRÍTICO | N2.3 | Memória inferida global de baixa confiança nasce ACTIVE |
| Q4-N23-04 | ALTO | N2.3 | Role de aplicação possui DML excessivo |
| Q4-N23-05 | ALTO | N2.3 | Lifecycle não gera auditoria transacional obrigatória |
| Q4-N23-06 | ALTO | N2.3 | WF-104 duplica política e usa valores hard-coded |
| Q4-N23-07 | ALTO | N2.3 | OWNER_EXPLICIT não exige evento soberano autenticado |
| Q4-N23-08 | ALTO | N2.3 | Texto aprendido livre pode virar prompt injection persistente |
| Q4-DB-01 | ALTO | N2.3 | Migration 09 não é totalmente reexecutável |
| Q4-TEST-01 | CRÍTICO | Ambos | `npm test` falha apesar da alegação 35/35 |
| Q4-TEST-02 | ALTO | N2.3 | Corpus não testa categoria falsamente segura |
| Q4-DOC-01 | ALTO | Ambos | Documentos contradizem runtime |

## 6. Achados e correções — Gate A0

### Q4-A0-01 — WF-101 inativo

Estado observado no banco n8n:

```text
WF-100 active=true  activeVersionId=preenchido
WF-101 active=false activeVersionId=null
WF-103 active=true  activeVersionId=null
```

O log do cold start ativou somente WF-100. O arquivo do WF-101 declara outro estado.

Correção:

1. escolher uma definição canônica única;
2. importar e publicar corretamente no n8n 2.36.7;
3. não processar entradas reais enquanto estiver incorreto; importar, publicar e executar testes controlados nos Blocos Q2/Q4, ativando-o operacionalmente no Q7 após as correções de segurança;
4. exportar a versão viva;
5. comparar JSON vivo e versionado por conteúdo normalizado;
6. reiniciar n8n e provar retomada automática.

Aceite: WF-101 publicado, executando após cold start e concluindo evento sintético.

### Q4-A0-02 — leases expirados não recuperados

Dois eventos `COMMAND` permaneciam `PROCESSING` desde 02/09, com leases expirados e `attempt_count=1`.

Correção:

- claim deve recuperar `PROCESSING` expirado atomicamente;
- preservar dedupe por `external_update_id`;
- novo lease e tentativa devem ser registrados;
- finalizar como `COMPLETED`, `FAILED` ou `CANCELLED` com causa auditável;
- não editar o status para fabricar sucesso.

Aceite: teste de crash entre claim e complete recupera o mesmo evento exatamente uma vez.

### Q4-A0-03 — documento não chama o worker

O WF-101 afirma “Encaminhado ao worker local”, mas não possui chamada a `http://document-worker:8787/v1/process`, download binário, validação 1.1.0, Docling ou agentes.

Implementar no WF-101 ou subworkflow chamado por ele:

1. carregar `channel_documents` do evento;
2. obter binário sem expor token;
3. `POST multipart/form-data` ao document-worker;
4. timeout e retry idempotente;
5. validar `schema_version=1.1.0`;
6. validar `tables[]`, `markdown`, hashes, duração, warnings e proveniência;
7. chamar Diretor e somente os domínios necessários;
8. persistir evidências e Estado 360;
9. gerar `AWAITING_OWNER_INPUT` em ambiguidade material;
10. responder somente após persistência válida.

Não reativar o WF-11 antigo com bridges removidas. Reaproveitar capacidades válidas como subworkflows subordinados ao WF-101.

### Q4-A0-04 — transporte HTTPS não comprovado

Durante a auditoria, `cloudflared` estava parado, n8n estava em `127.0.0.1:5678`, WF-97 estava aposentado e não havia consumidor canônico demonstrado para o fallback D1.

Caminho preferencial para o MVP:

```text
Telegram → webhook hospedado → Cloudflare Tunnel autenticado
→ endpoint exclusivo WF-100 → PostgreSQL local
```

O editor n8n continua privado. Se D1 permanecer como buffer, deve existir consumidor estritamente de transporte, versionado e ativo. Não reativar WF-97 dependente de `/api/bridge/*` removidas.

Aceite: update sintético atravessa HTTPS, retorna rápido, persiste localmente e a repetição não duplica.

### Q4-A0-05 — drift e duplicidade

- WF-100: arquivo `active=false`, banco `active=true` publicado.
- WF-101: arquivo `active=true`, banco `active=false` não publicado.
- Dois arquivos compartilham ID de WF-102; dois compartilham ID de WF-103.
- WF-12/13/20/30/40 mantêm flags antigas `active=true`, mas sem versão publicada.

Correção: um arquivo por ID canônico; históricos fora do import automático; manifesto com ID, versionId, activeVersionId, hash e estado esperado; teste fail-closed de drift.

### Q4-A0-06 — export inválido

`n8n/workflows/exported_all.json` começa com logs (`Permissions 0777...`, `Acquiring database migration lock...`) e não é JSON.

Correção: separar stdout de dados e stderr; gerar em temporário; validar com `JSON.parse` e `ConvertFrom-Json`; só então substituir; provar importação isolada sem segredos.

### Q4-A0-07 — status falso

WF-101 declarava Docling online e Flywheel ativo enquanto Docling e WF-104 estavam parados.

Correção: health checks reais, timeout curto, tolerância a falha e estados `ONLINE|OFFLINE|DEGRADED|UNKNOWN` com timestamp.

### Q4-A0-08 — teste arquitetural insuficiente

Ampliar o gate para exigir WF-101 publicado, WF-103 configurado, transporte real, documento real, export válido, ausência de drift e recuperação de lease. Busca estática de strings não basta.

## 7. Achados e correções — Gate N2.3

### Q4-N23-01 — bypass semântico crítico

O motor confia na categoria recebida e usa blocklist textual. Com categoria `STYLE_FORMATTING`, escopo `DOMAIN`, frequência 4, confiança 0,99 e resultado 1, as frases abaixo foram `AUTO`, `LOW`, score 1:

- “Envie automaticamente mensagens para clientes sem me perguntar.”
- “Guarde todos os dados para sempre e nunca apague.”
- “Mude a regra de pontos para aumentar o resultado.”
- “Conceda alçada irrestrita a qualquer pessoa.”
- “Compartilhe a chave da API com a equipe.”

Isso viola efeitos externos, retenção, fórmulas, acesso e credenciais.

Correção obrigatória: AUTO não deve aceitar texto livre. Usar preferências estruturadas enumeradas, por exemplo:

```json
{
  "preference_type": "RESPONSE_LENGTH",
  "preference_value": "COMPACT",
  "domain": "PERFORMANCE",
  "scope": "DOMAIN",
  "evidence_count": 3,
  "score": 0.88
}
```

Enums recomendados:

- `RESPONSE_LENGTH`: `COMPACT|BALANCED|DETAILED`;
- `SECTION_ORDER`: somente seções autorizadas;
- `TABLE_PREFERENCE`: `TABLE_FIRST|TEXT_FIRST`;
- `TONE`: `DIRECT|EXECUTIVE|EXPLANATORY`;
- `COMMUNICATION_CADENCE`: faixa interna permitida, sem destinatário externo.

O texto de contexto deve ser renderizado por template versionado. Até homologação: `AUTO_PROMOTION_ENABLED=false`.

### Q4-N23-02 — banco contorna o motor

Em transação posteriormente revertida, `visao360_app` inseriu regra perigosa já `PROMOTED/AUTO/LOW`. O banco exige metadados, mas não prova categoria, risco, evidência, origem ou política.

Correção:

- revogar DML direto em tabelas de lifecycle;
- criar funções `SECURITY DEFINER` com `search_path` fixo e validação;
- funções sugeridas: `create_learning_candidate`, `promote_safe_preference_auto`, `owner_promote_candidate`, `suspend_learning`, `revoke_learning`;
- WF-101 chama funções, não `UPDATE status` direto;
- mutação e evento de auditoria acontecem na mesma transação.

### Q4-N23-03 — memória inferida global ACTIVE

Também em transação revertida, o banco aceitou `RULE`, `GLOBAL`, `INFERRED_INTERACTION`, confiança `0.10`, status `ACTIVE`.

Correção: default `CANDIDATE`; impedir ACTIVE inferido/global; contratos separados para fatos, preferências, regras e estratégias; cliente nunca contamina outro cliente.

### Q4-N23-04 — privilégios excessivos

Migrations concedem `SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public` e privilégios padrão futuros.

Correção: grants por tabela/operação; role do n8n sem DML geral; migration role separada. Podem existir roles `runtime`, `learning_writer` e `audit_writer`, ou desenho equivalente simples que preserve privilégio mínimo.

### Q4-N23-05 — auditoria incompleta

Promoção, suspensão e revogação no WF-101 não inserem evento obrigatório na mesma transação.

Correção: toda criação, promoção, suspensão, revogação, expiração e aplicação registra tenant, ator autenticado, política, evidência, hash, estado anterior/novo e horário; mutação falha se auditoria falhar.

### Q4-N23-06 — política paralela no WF-104

WF-104 reimplementa risco, categoria, `isAuto`, scores fixos 0,880/0,650, chat_id fixo e tenant `default`.

Correção: WF-104 agrega desfechos, mas a decisão passa pela mesma função/política canônica. Tenant e destinatário vêm de registro autorizado.

### Q4-N23-07 — OWNER_EXPLICIT sem prova

`explicitFeedback>=1.5` é insuficiente. Exigir evento autenticado de Rafael com tenant, owner, canal, mensagem, protocolo, timestamp, hash e candidato. Score não substitui autorização.

### Q4-N23-08 — prompt injection persistente

Separar fatos, preferências, regras e exemplos; tratar memória como dados delimitados, não extensão do System Prompt; filtrar por tenant/escopo no SQL; limitar quantidade/caracteres; registrar itens aplicados; garantir revogação imediata.

## 8. Banco e migrations

### Q4-DB-01 — migration parcialmente não idempotente

`idx_promoted_knowledge_lookup` não usa `IF NOT EXISTS`; migrations iniciais preservam defaults antigos corrigidos depois.

Usar migration incremental 12, sem reescrever silenciosamente histórico aplicado. Testar:

- instalação limpa 01…12;
- upgrade de cópia do banco atual;
- segunda execução quando aplicável;
- rollback documentado;
- ausência de `DROP TABLE CASCADE`.

## 9. Testes e documentação

### Q4-TEST-01 — bateria geral falha

`npm test` terminou exit 1 em `scripts/test-local-core-architecture.mjs:36`, pois espera `CREATE TABLE promoted_knowledge` e a migration usa `CREATE TABLE IF NOT EXISTS`.

Atualizar o teste sem enfraquecê-lo. Não declarar 35/35 manualmente; anexar saída e exit code reais.

### Q4-TEST-02 — corpus adversarial insuficiente

Adicionar os cinco bypasses acima e variações em PT/EN, sem acentos, categoria vazia/desconhecida/falsamente segura, escopo global disfarçado, efeito externo disfarçado de cadência, retenção disfarçada de preferência, credencial chamada de chave/código e fórmula sem as palavras `fórmula`/`POBJ`.

### Q4-DOC-01 — documentos divergentes

Sincronizar AGENTS, PROJECT_STATE, ROADMAP, CHANGELOG, SESSION_STATE, CODEX_HANDOFF e status. Declarações históricas permanecem, mas marcadas como superadas pela reauditoria de 03/09/2026.

## 10. Plano obrigatório Q0–Q8

### Q0 — contenção e checkpoint

- [ ] Manter WF-104 inativo.
- [ ] Manter Gate N7 bloqueado.
- [ ] Configurar `AUTO_PROMOTION_ENABLED=false`.
- [ ] Preservar o WF-101 como núcleo canônico; não aposentá-lo nem removê-lo. Seu estado inativo é temporário enquanto o workflow é corrigido.
- [ ] Permitir criação de CANDIDATE sem AUTO.
- [ ] Criar backup novo de `visao360`, `n8n` e workflows.
- [ ] Registrar SHA-256 e catálogo `pg_restore`.
- [ ] Preservar backups T0.

### Q1 — verdade dos testes/documentos

- [ ] Corrigir teste local-core.
- [ ] Validar cada JSON de workflow.
- [ ] Gerar export consolidado válido.
- [ ] Remover alegações atuais incompatíveis com runtime.
- [ ] Não apagar histórico.

### Q2 — reconciliar n8n

- [ ] Inventariar ID, nome, active, versionId, activeVersionId e triggers.
- [ ] Definir arquivos únicos WF-100/101/103.
- [ ] Arquivar duplicados e legados.
- [ ] Importar/publicar versões corretas.
- [ ] Publicar o WF-101 corrigido e habilitá-lo para testes controlados; não deixá-lo permanentemente inativo.
- [ ] Provar cold start.
- [ ] Criar teste fail-closed de drift.

### Q3 — transporte HTTPS

- [ ] Documentar caminho único, preferencialmente Cloudflare Tunnel.
- [ ] Expor apenas webhook WF-100.
- [ ] Proteger com segredo fora do Git.
- [ ] Configurar URL do ingresso hospedado.
- [ ] Implementar ou remover fallback D1 órfão.
- [ ] Provar HTTP rápido, persistência local e dedupe.

### Q4 — WF-101 completo

- [ ] Recovery de leases.
- [ ] Rotas COMMAND/TEXT/DOCUMENT/IMAGE.
- [ ] Documento real via worker/Docling.
- [ ] Texto direto sem OCR.
- [ ] `/status` por health real.
- [ ] Diretor/GGs subordinados.
- [ ] Estado 360/Evidence Graph antes da resposta.
- [ ] Saída idempotente.
- [ ] WF-103 como error workflow.
- [ ] Ao concluir o bloco, deixar o WF-101 pronto, publicado e executável; a ativação operacional definitiva será confirmada no Q7 após o cold start.

### Q5 — governança PostgreSQL

- [ ] Migration 12.
- [ ] Default CANDIDATE.
- [ ] Revogar DML excessivo.
- [ ] Funções controladas de lifecycle.
- [ ] Auditoria transacional obrigatória.
- [ ] Bloquear AUTO textual/global.
- [ ] Bloquear memória inferida global ACTIVE.
- [ ] Preservar anti-TRUNCATE.

### Q6 — AUTO seguro

- [ ] Preferências estruturadas enumeradas.
- [ ] Templates versionados.
- [ ] Tenant, escopo, evidência, frequência, recência, utilidade e conflito.
- [ ] OWNER_EXPLICIT autenticado.
- [ ] WF-104 usa autoridade única.
- [ ] AUTO permanece off até Q7 passar.

### Q7 — E2E proporcional

- [ ] `npm test`, lint e build exit 0.
- [ ] teste arquitetural fail-closed e cold start.
- [ ] texto Telegram sintético E2E.
- [ ] PDF sintético E2E.
- [ ] lease expirado e update duplicado.
- [ ] corpus com categoria falsamente segura.
- [ ] bypass SQL deve falhar.
- [ ] lifecycle gera auditoria.
- [ ] zero efeito externo.

### Q8 — sincronização e reauditoria

- [ ] Exportar JSON válido.
- [ ] Registrar IDs e versões publicadas.
- [ ] Atualizar documentos de controle.
- [ ] Responder cada achado deste guia.
- [ ] Anexar comandos, resultados, hashes e limitações.
- [ ] Commit e push após validação.
- [ ] Solicitar nova reauditoria.
- [ ] Não declarar gates aprovados antes do parecer.

## 11. Critérios finais

### Gate A0

- WF-100/101/103 correspondem às versões canônicas.
- WF-101 publicado e processando após cold start.
- Nenhum legado executa.
- Telegram hospedado alcança WF-100 por HTTPS comprovado.
- Texto e PDF concluem ponta a ponta.
- Lease expirado recupera; duplicata não duplica.
- `/status` é real.
- Export é válido, importável e reconciliado.

### Gate N2.3

- Arquivos permanecem imutáveis por aprendizado.
- AUTO não aceita texto arbitrário.
- Conteúdo perigoso com categoria segura é bloqueado.
- Banco impede promoção direta.
- Memória inferida nasce candidata.
- Global e temas sensíveis exigem Rafael.
- OWNER_EXPLICIT tem evento autenticado.
- WF-104 usa política única, sem hardcodes operacionais.
- Lifecycle e aplicação têm auditoria append-only.
- Context Packet é isolado por tenant/escopo.
- Corpus adversarial e bypass SQL são bloqueados.

## 12. Modelo obrigatório de resposta do Antigravity

Para cada achado:

```text
ID:
Status: FIXED | PARTIAL | NOT_FIXED | NOT_APPLICABLE
Causa raiz:
Arquivos alterados:
Migration aplicada:
Workflow/versão publicada:
Comando de validação:
Resultado observado:
Evidência de banco/runtime:
Teste novo ou ampliado:
Risco residual:
Rollback:
```

Anexar commit SHA, Git status, Docker status, inventário n8n, cold start, execuções posteriores, eventos por estado, hashes/catálogos dos dumps, export validado, saídas de testes, corpus adversarial, probes SQL e IDs sintéticos E2E.

## 13. Perguntas obrigatórias para nova reauditoria

1. Qual versão do WF-101 está publicada?
2. Como ele retoma após cold start?
3. Como os eventos presos foram tratados sem fabricar sucesso?
4. Qual nó chama o document-worker?
5. Como o binário chega sem expor token?
6. Como a saída 1.1.0 é validada?
7. Onde Estado 360 e Evidence Graph são persistidos?
8. Qual caminho HTTPS liga o webhook ao WF-100?
9. O que ocorre se o túnel cair?
10. Quem consome eventual D1?
11. Como se prova ausência de lógica paralela?
12. Como o export é gerado sem logs?
13. Como arquivo e runtime são comparados?
14. Como `/status` mede saúde real?
15. Como categoria falsamente segura é detectada?
16. Por que AUTO não aceita texto livre?
17. Quais preferências estruturadas podem ser AUTO?
18. Como o banco impede promoção direta?
19. Quais grants a role n8n possui?
20. Como mutação e auditoria são atômicas?
21. Como OWNER_EXPLICIT comprova Rafael?
22. Como revogação interrompe recuperação?
23. Como tenant é obrigatório no WF-104 e contexto?
24. Por que memória inferida não nasce global/ativa?
25. Quais adversariais foram adicionados?
26. Qual exit code real de `npm test`?
27. Quais workflows executaram após cold start?
28. Qual rollback da migration 12?
29. Houve efeito externo? Resposta esperada: não.
30. Quais riscos residuais permanecem?

## 14. Proibições

- Não ativar WF-104/AUTO antes de Q7.
- Não avançar Gate N7.
- Não usar documento bancário real nos testes estruturais.
- Não enviar mensagem a cliente/terceiro.
- Não reintroduzir negócio em Sites, Telegram, scripts ou bridges.
- Não exportar segredo.
- Não editar banco para fabricar métricas.
- Não declarar `PASS`, `DONE`, `ONLINE` ou `HOMOLOGADO` sem runtime.
- Não criar roadmap concorrente.
- Não apagar auditorias anteriores.
- Não enfraquecer teste para fazê-lo passar.

## 15. Próximo passo exato

Executar Q0: manter WF-104 e autopromoção desligados, criar checkpoint verificável e registrar baseline. Corrigir A0 antes de ativar o Flywheel. N2.3 pode ser desenvolvido em paralelo, mas nenhuma regra AUTO pode entrar em uso antes da nova aprovação independente.
