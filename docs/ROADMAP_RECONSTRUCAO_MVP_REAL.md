# Roadmap de Reconstrução — Diretor 360 MVP Real

**Versão do plano:** 1.0  
**Data:** 2026-08-29  
**Objetivo final deste roadmap:** Rafael envia um arquivo pelo Telegram uma única vez; o sistema preserva o original, processa-o de forma assíncrona, extrai fatos com IA, aciona os Gerentes Gerais necessários, grava o resultado e apresenta ao menos uma informação verificável no Telegram e no site.

## 1. Definição objetiva de sucesso

O MVP só será considerado funcional quando um documento real completar este caminho:

`Telegram → ingestão → armazenamento → fila → n8n → processador de documentos → Diretor → Gerente(s) → Estado 360 → site → resposta no Telegram`.

Critérios obrigatórios:

- o arquivo é enviado apenas uma vez;
- o Telegram confirma recebimento e fornece um protocolo;
- o upload não espera a IA e não sofre timeout do navegador;
- o arquivo original, hash, proprietário e data ficam preservados;
- o painel mostra `RECEBIDO`, `PROCESSANDO`, `AGUARDANDO_RETRY`, `PRONTO_PARA_REVISÃO`, `CONCLUÍDO` ou `ERRO`;
- a IA devolve JSON validado, nunca apenas texto livre;
- cada informação material aponta para página, trecho, célula ou tabela de origem;
- pelo menos um Gerente Geral produz diagnóstico baseado nos dados extraídos;
- o resultado aparece no site e uma síntese com link retorna ao Telegram;
- Rafael consegue corrigir e aprovar sem reenviar o arquivo;
- nenhuma ação externa de negócio é executada automaticamente.

Meta operacional inicial: 95% dos documentos suportados concluídos em até cinco minutos, admitindo retries controlados e sem bloquear o upload.

## 2. Arquitetura-alvo

```text
Telegram / site
      ↓
Intake autenticado e idempotente
      ↓
R2: arquivo original  +  D1: documento, job e status
      ↓
n8n local agenda, reserva e observa o trabalho
      ↓
Worker de documentos local
      ├─ PDF nativo
      ├─ OCR quando necessário
      ├─ XLSX/CSV
      └─ adaptador Gemini/OpenAI
      ↓
JSON de extração validado
      ↓
Diretor Orquestrador
      ├─ GG Conta → especialistas de carteira e oportunidades
      ├─ GG Performance → especialistas POBJ, gaps e plano
      ├─ GG Financeiro → especialistas de orçamento e resultado
      └─ GG Relacionamento → especialistas de conversas e compromissos
      ↓
Motor de Consolidação + Evidence Graph + Estado 360
      ↓
Dashboard, revisão humana e resposta no Telegram
```

O n8n transporta, agenda e observa. O worker lê documentos. Os motores calculam. As IAs interpretam. O Motor 360 consolida. Rafael aprova.

## 3. Fases e gates

### R0 — Baseline honesto e ponto de retorno — CONCLUÍDO

- [x] Criar backup verificável da versão atual antes da reconstrução.
- [x] Registrar commit, versão hospedada, ambiente e workflows ativos.
- [x] Marcar o processamento síncrono `site → Gemini` como legado e impedir novos usos.
- [x] Criar um conjunto mínimo de documentos reais autorizados para aceite, sem duplicá-los no Git.

**Gate R0:** APROVADO. Evidência: [`baselines/R0_BASELINE_2026-08-29.md`](baselines/R0_BASELINE_2026-08-29.md).

### R1 — Ingestão assíncrona única — CONCLUÍDO

- [x] Alterar site e Telegram para apenas validar, armazenar e enfileirar.
- [x] Responder ao usuário em poucos segundos com `document_id` e protocolo.
- [x] Unificar deduplicação por proprietário, hash e canais de origem.
- [x] Criar estados explícitos do documento e do job.
- [x] Exibir status no site por consulta periódica, sem manter requisição aberta.

**Teste real:** enviar um PDF pelo site e confirmar armazenamento e fila sem chamada de IA.  
**Gate R1:** APROVADO localmente. O intake não importa nem chama IA/OCR/n8n, persiste no R2/D1 e cria job `QUEUED`; lint, build e `scripts/test-r1-async-intake.ps1` passaram. Publicação e um novo upload real não são necessários para iniciar R2.

### R2 — Ponte local e worker durável

- [ ] Permitir que a ponte reserve POBJ e demais documentos ainda não revisados.
- [ ] Manter lease, idempotência, tentativas, backoff e fila de falha final.
- [ ] Fazer o n8n baixar o arquivo protegido pelo `job_id` e `lease_token`.
- [ ] Criar um worker local versionado para processamento pesado, acionado e observado pelo n8n.
- [ ] Separar falha transitória de modelo, documento inválido e erro de contrato.
- [ ] Permitir reprocessamento sem novo upload.

**Teste real:** o n8n reserva e baixa o `metas1708.pdf` armazenado.  
**Gate R2:** o arquivo atravessa nuvem → máquina local sem intervenção manual e sem efeito externo.

### R3 — Leitura real de documentos

- [ ] Criar contrato `document-extraction` em JSON Schema Draft 2020-12.
- [ ] Implementar adaptador de provedor para não acoplar o projeto a um único modelo.
- [ ] Ler PDF nativo diretamente; aplicar OCR somente quando não houver texto útil.
- [ ] Ler XLSX/CSV preservando planilha, linha, coluna, valor e unidade.
- [ ] Implementar timeout local, retry, fallback de modelo e limite de custo.
- [ ] Tratar conteúdo do arquivo como dado não confiável e ignorar instruções nele contidas.
- [ ] Persistir extração, evidências, modelo, duração e versão do prompt.

**Teste real:** extrair do `metas1708.pdf` pelo menos uma informação correta com evidência localizável.  
**Gate R3:** o PDF é lido fora do ciclo HTTP e o JSON passa no schema.

### R4 — Diretor Orquestrador real

- [ ] Implementar classificação de intenção e tipo documental sobre a extração validada.
- [ ] Selecionar somente Conta, Performance, Financeiro e/ou Relacionamento que possam alterar a conclusão.
- [ ] Produzir um pacote de contexto mínimo por Gerente.
- [ ] Registrar inclusões, exclusões, dependências, confiança e justificativa.
- [ ] Encaminhar ambiguidade para revisão, sem inventar roteamento.

**Teste real:** documento POBJ seleciona Performance; outros domínios só entram se houver evidência material.  
**Gate R4:** roteamento explicável e reproduzível registrado no job.

### R5 — Primeiro corte vertical: GG Performance

- [ ] Receber os dados extraídos, não o PDF bruto.
- [ ] Acionar especialistas necessários para indicador, regra, cálculo, gap e plano.
- [ ] Usar motor determinístico homologado para pontuação POBJ.
- [ ] Separar claramente meta, realizado, atingimento, pontos e data-base.
- [ ] Produzir diagnóstico, evidências, lacunas, recomendação e decisão requerida.

**Teste real:** `metas1708.pdf` gera ao menos um indicador correto e uma leitura útil no painel.  
**Gate R5:** Rafael consegue conferir a informação contra o PDF e corrigir o rascunho.

### R6 — Quatro Gerentes Gerais operacionais

#### R6.1 — GG Conta

- [ ] Implementar leitura de carteira, empresas, ativação, cobertura, elegibilidade e oportunidades.
- [ ] Validar com uma planilha real autorizada de carteira.

#### R6.2 — GG Financeiro

- [ ] Implementar orçamento, realizado, desvios, receitas, custos e impacto.
- [ ] Distinguir `NOT_AVAILABLE`, `LEARNING`, `ESTIMATED` e `VALIDATED`.
- [ ] Validar com um documento financeiro real autorizado.

#### R6.3 — GG Relacionamento

- [ ] Implementar conversas, necessidades confirmadas, objeções, compromissos e próxima abordagem.
- [ ] Separar fala registrada, interpretação e hipótese.
- [ ] Validar com conversa ou anotação real autorizada.

#### R6.4 — Integração dos quatro domínios

- [ ] Testar documento que envolva mais de um Gerente.
- [ ] Preservar fronteiras: Conta não calcula pontos; Performance não escolhe empresa; Financeiro não fabrica retorno; Relacionamento não transforma hipótese em fato.

**Gate R6:** cada Gerente concluiu ao menos um caso real próprio e um caso integrado passou sem mistura indevida de autoridade.

### R7 — Consolidação e Dashboard 360

- [ ] Gravar resultados dos Gerentes em contratos versionados.
- [ ] Reconciliar convergência, complementaridade, trade-off e conflito.
- [ ] Publicar Estado 360 imutável com proveniência por campo.
- [ ] Projetar abas Conta, Performance, Financeiro e Relacionamento no site.
- [ ] Exibir resumo do Diretor, evidências, confiança, lacunas e data-base.
- [ ] Atualizar o painel sem apagar o histórico aprovado.

**Gate R7:** o resultado processado aparece automaticamente no site e sobrevive a reinício do navegador e do Docker.

### R8 — Revisão, correção e aprendizado

- [ ] Permitir editar campo, valor, unidade, data, evidência e domínio.
- [ ] Guardar original da IA, correção de Rafael, motivo e versão.
- [ ] Recalcular somente dependências afetadas.
- [ ] Usar correções aprovadas como exemplos governados, sem alterar políticas automaticamente.
- [ ] Permitir reabrir, revogar ou substituir uma correção.

**Gate R8:** Rafael corrige um dado no site e o sistema mantém histórico e usa o exemplo em nova leitura comparável.

### R9 — Telegram ponta a ponta

- [ ] Confirmar webhook, identidade permitida e download seguro do arquivo Telegram.
- [ ] Enviar confirmação imediata com protocolo.
- [ ] Enfileirar o mesmo contrato usado pelo site.
- [ ] Atualizar o status durante retries sem pedir novo envio.
- [ ] Ao concluir, enviar síntese curta e link autenticado para a revisão no site.
- [ ] Garantir idempotência para updates repetidos do Telegram.

**Teste final do MVP:** Rafael envia um PDF real pelo Telegram e recebe uma informação retirada dele, com evidência e link para o painel.  
**Gate R9 — MVP ATIVÁVEL:** todo o caminho funciona sem console, PowerShell ou intervenção técnica.

### R10 — Operação assistida e robustez

- [ ] Medir sucesso, duração, custo, retries, divergência e correções humanas.
- [ ] Alertar falhas permanentes e permitir retry pelo painel.
- [ ] Testar reinício de Docker, indisponibilidade de modelo e arquivo corrompido.
- [ ] Criar backup, restauração e rollback desta release.
- [ ] Manter efeitos externos proibidos até autorização separada.

**Gate R10:** sete dias de uso assistido sem perda de arquivo, job ou resultado.

## 4. Ordem canônica de execução

`R0 → R1 → R2 → R3 → R4 → R5 → R7 → R8 → R9` entrega o primeiro MVP real com Performance.

Depois do primeiro caso ponta a ponta, seguir `R6.1 → R6.2 → R6.3 → R6.4 → R10` para completar a visão dos quatro Gerentes.

R6 pode evoluir em paralelo após R5, mas nenhum domínio será marcado como operacional antes de concluir um caso real próprio.

## 5. Próximo passo exato

Executar R2: ampliar a ponte para reservar documentos pendentes, baixar o original com lease e acionar um worker local durável.

Não solicitar novo envio de arquivo a Rafael até R1, R2 e R3 estarem implementados e testados localmente com uma cópia autorizada já disponível na máquina.
