# Roadmap n8n — Diretor 360 MVP Real

**Versão:** 2.0
**Data:** 2026-08-31
**Decisão:** o n8n é a espinha dorsal operacional do Diretor 360.

## Escopo congelado do MVP mínimo

O primeiro produto utilizável possui uma única jornada obrigatória:

```text
Arquivo enviado pelo Telegram
  → n8n recebe, registra e reserva o job
  → document-worker lê PDF/JPG/PNG/XLSX
  → MinerU pipeline ou híbrido extrai texto, tabelas e evidências
  → Orquestrador identifica que o conteúdo pertence a Performance
  → GG Performance consulta somente seus especialistas necessários
  → regras determinísticas calculam metas, realizado, atingimento, pontos e gaps
  → GG Performance produz análise executiva rastreável
  → n8n devolve a análise no mesmo chat do Telegram
```

O MVP estará concluído somente quando Rafael enviar um arquivo real pelo celular e receber no Telegram uma análise correta, compreensível e sustentada pelos valores do arquivo, sem terminal e sem intervenção manual no fluxo.

### Dentro do MVP

- Telegram como canal de entrada e saída.
- n8n como controlador de todas as etapas e estados.
- leitura local de PDF, foto, planilha e documento escaneado.
- Diretor/Orquestrador limitado a classificar, rotear e integrar.
- somente o GG Performance e seus especialistas.
- cálculo determinístico e evidência por página, bloco ou célula.
- resposta consultiva no Telegram, sem efeito externo adicional.
- retry, idempotência, timeout, fallback e erro compreensível.

### Fora do MVP — somente depois do gate ponta a ponta

- GG Conta, Financeiro e Relacionamento.
- visão 360 completa e cruzamentos multidomínio.
- automações de contato, envio ou qualquer outro efeito externo.
- aprendizado automático a partir das correções de Rafael.
- escala, VPS, alta disponibilidade e otimizações não necessárias ao primeiro fluxo.
- expansão visual do Dashboard além do necessário para auditoria técnica.

## Plano executivo do MVP mínimo

### M0 — Baseline e intake Telegram — CONCLUÍDO

- [x] Webhook Telegram autenticado e allowlist de Rafael.
- [x] Arquivo original preservado com protocolo, hash e idempotência.
- [x] Job durável criado sem depender da IA ou do Docker estar disponível.
- [x] Confirmação imediata de recebimento sem alegar processamento antecipado.

**Gate:** o arquivo chega à fila uma única vez e Rafael recebe o protocolo.

### M1 — Leitor documental local — CONCLUÍDO

- [x] `document-worker` interno com PDF, JPG/PNG, XLSX e CSV.
- [x] MinerU 3.4.5 como OCR/parser local principal.
- [x] Pipeline econômico com escalada automática para híbrido em layout complexo.
- [x] Fallback PyMuPDF/Tesseract quando MinerU falhar.
- [x] Evidências por página, bloco ou célula em contrato validado.
- [x] Concorrência e janela limitadas a 1; reinício seguro disponível para liberar RAM após uso híbrido.
- [x] PDF/JPG/XLSX reais testados diretamente pelo worker.
- [ ] Validar leitura passando pelo job real do Telegram e WF-11.

**Gate:** o arquivo real do Telegram gera extração correta dentro do workflow, não apenas em teste isolado.

### M2 — Orquestrador mínimo no n8n — CONCLUÍDO

- [ ] Fazer o WF-11 atravessar claim → download → leitor → validação.
- [x] Criar subworkflow mínimo do Diretor para classificar documento e intenção — WF-12 criado, testado e importado no n8n.
- [x] Rotear POBJ/metas exclusivamente ao GG Performance.
- [x] Registrar justificativa, confiança, lacunas e evidências do roteamento.
- [x] Enviar entrada estruturada; nunca entregar PDF bruto aos agentes.
- [x] Encerrar com retry/falha rastreável quando a classificação não for segura.

**Ensaio real de 2026-08-31:** PDF enviado pelo Telegram atravessou fila, lease, download protegido e OCR MinerU híbrido (3 páginas). O WF-12 reconheceu sinais de POBJ com confiança alta e roteou exclusivamente ao `GERENTE_GERAL_PERFORMANCE`, com zero efeitos externos. O Estado mínimo foi persistido pela ponte. A análise especializada e a resposta útil ao Telegram pertencem aos marcos M3 e M4.

**Gate:** um arquivo POBJ extraído produz um handoff válido para Performance e não aciona outro Gerente.

### M3 — GG Performance e especialistas — CONCLUÍDO COM EXCEÇÕES PROTEGIDAS

- [x] Criar WF-13 Performance recebendo somente JSON validado.
- [x] Acionar reconciliação de fontes e estado de pontuação reportado pelo documento.
- [x] Aplicar regras versionadas de meta, realizado, piso, teto e pontos somente aos indicadores elegíveis.
- [x] Calcular atingimento, gap e cenários sem permitir que a IA invente números; exceções sem regra permanecem reportadas pela fonte.
- [x] Acionar plano consultivo somente quando houver dados suficientes e direção da meta conhecida.
- [x] Produzir parecer do GG Performance com fatos, análise, lacunas e recomendação.

**Validação de 2026-08-31:** o WF-13 estruturou 106 indicadores do PDF real, reconheceu `AGOSTO/2026`, base `28/08/2026` e preservou os `100,65` pontos finais reportados. Indicadores com direção desconhecida e métricas `LOWER_IS_BETTER` foram excluídos do ranking de aumento. Continuam pendentes a homologação das regras específicas por indicador e a validação dos cálculos de gap/cenários antes de fechar o gate M3.

**Validação de regras explícitas:** em comparação shadow, `N3_CONSORCIO_EXPERT_LINEAR` reproduziu `4,67` pontos e `OPEN_FINANCE_PJ_BINARY` reproduziu `7,00` pontos, ambos sem divergência. Nenhum valor da fonte foi sobrescrito. A regra geral permanece `APPROVED_SOURCE_NOT_RUNTIME_ACTIVE`; Seguros e Cartões continuam exigindo regras dedicadas.

**Ativação autorizada por Rafael em 2026-08-31:** a política `POBJ_SCORING_2026_H2` v1.1.0 foi promovida a `RUNTIME_ACTIVE` no escopo do WF-13, sem efeitos externos. A base correta do painel mensal é `% PROJ. FINAL`. O teste real reproduziu 13/13 indicadores elegíveis pela regra geral e 2/2 regras explícitas, com divergência zero. Seguros e Cartões não herdam a regra geral e permanecem como valores reportados até receberem regra dedicada.

**Gate:** os valores do parecer reproduzem os valores e cálculos conferíveis do arquivo real.

### M4 — Resposta final no Telegram — CONCLUÍDO

- [x] Transformar o parecer em mensagem curta e legível no celular.
- [x] Mostrar período, principais indicadores, pontos, gaps e ações recomendadas.
- [x] Informar incerteza ou campo não reconhecido sem fabricar resposta.
- [x] Preparar entrega idempotente ao mesmo chat e relacioná-la ao protocolo original.
- [x] Evitar resposta duplicada em retry ou update repetido pela auditoria da ponte.
- [x] Registrar duração, parser usado, agentes acionados e resultado final no payload de conclusão.

**Homologação M4 em 2026-08-31:** novo PDF enviado pelo Telegram foi processado automaticamente pela agenda do WF-11, passou pelo OCR MinerU e pelos WF-12/WF-13 e concluiu com `telegram_reply_sent: true`. A resposta foi vinculada ao protocolo original e entregue ao mesmo chat autorizado.

**Gate final do MVP:** Rafael envia `metas1708.pdf` pelo Telegram e recebe no mesmo chat uma análise correta do GG Performance, sem PowerShell, sem copiar dados manualmente e sem efeito externo além da própria resposta solicitada.

### M5 — Piloto curto e correção de rota — EM ANDAMENTO

- [x] Ampliar o parecer do GG Performance após feedback do primeiro ensaio, incluindo visão geral, forças, riscos, cenários conferíveis e próxima ação.
- [x] M5.1–M5.7 implementados: isolamento sintético, comandos, parecer multipartes, perguntas obrigatórias, persistência e retomada conversacional.
- [ ] Executar M5.8–M5.9: ensaio real controlado com lacuna, resposta natural de Rafael e piloto de 3–5 arquivos.
- [ ] Executar de 3 a 5 arquivos reais autorizados por Rafael.
- [ ] Comparar extração, cálculos e análise com a leitura humana.
- [ ] Corrigir apenas erros observados no uso real.
- [ ] Registrar métricas e critérios mínimos de estabilidade.
- [ ] Declarar o MVP utilizável antes de expandir o escopo.

**Auditoria operacional de 2026-08-31:** sete documentos reais do piloto foram localizados no D1. Três planilhas possuem extração estruturada; quatro PDFs registraram falha de extração/IA. Os sete jobs ficaram presos na terceira tentativa como `PROCESSING`, sem esclarecimento nem entrega. A ponte foi corrigida para transformar lease final expirado em `FAILED_FINAL`, e a reabertura passou a zerar o orçamento de tentativas. O reprocessamento depende do Docker/n8n local voltar a operar.

- [x] Detectar e corrigir job órfão após expiração da terceira tentativa.
- [x] Corrigir `/tentar novamente` e reabertura para reiniciar o contador de tentativas.
- [ ] Publicar a correção da ponte e reclassificar os sete jobs órfãos.
- [ ] Reprocessar primeiro um arquivo distinto de forma controlada; só então avançar pelos demais.

**Gate:** fluxo repetível e útil; Rafael aprova iniciar a evolução pós-MVP.

## Evolução somente após o MVP

1. Melhorar revisão e correção pelo site.
2. Incorporar aprendizado governado pelas correções aprovadas.
3. Adicionar GG Conta.
4. Adicionar GG Financeiro.
5. Adicionar GG Relacionamento.
6. Consolidar a Visão 360 multidomínio.
7. Evoluir operação, disponibilidade, custo e escala.

## Resultado final

Rafael envia um arquivo pelo Telegram ou site. O n8n assume o protocolo e conduz o ciclo até uma informação verificável aparecer no Dashboard 360 e, quando a origem for Telegram, uma síntese voltar ao chat.

```text
Telegram/site → D1 + R2 → WF-11 n8n
                         ├─ reserva, lease e download
                         ├─ leitura documental
                         ├─ Diretor e roteamento
                         ├─ Gerentes Gerais
                         ├─ Motor e Estado 360
                         ├─ revisão humana
                         └─ resposta Telegram/site
```

O n8n controla o processo. Leitor de documentos, provedor de IA e motores são capacidades subordinadas chamadas por ele. Nenhuma delas controla a fila ou decide sozinha o próximo estágio.

## Workflow mestre

Arquivo canônico: `n8n/workflows/wf-11-diretor-360-orquestrador-mvp.json`.

O WF-11 consulta a fila, reserva o job com lease, baixa o original, aciona o leitor, valida contratos, chama Diretor e Gerentes, consolida o Estado 360, registra sucesso/retry/falha e permite reprocessar sem novo upload. Workflows especializados serão subworkflows versionados; dados entram e saem em JSON validado. Efeitos externos permanecem proibidos.

## Etapas

### N0 — Intake durável — CONCLUÍDO

- [x] Site e Telegram apenas validam, armazenam e enfileiram.
- [x] Protocolo, hash, proprietário, original e job persistidos.
- [x] Estados públicos e polling no site.

**Gate:** upload independe de n8n, Docker ou IA.

### N1 — Controlador mestre no n8n — EM ANDAMENTO

- [x] Criar WF-11 como workflow canônico.
- [x] Reservar job com lease e baixar o original protegido.
- [x] Preparar conclusão, retry e falha final.
- [ ] Validar execução manual com worker stub local.
- [ ] Ativar agendamento depois do teste manual.
- [ ] Desativar WF-09 quando WF-11 assumir a fila.

**Gate:** job de teste atravessa claim → download → worker stub → resultado com rastreabilidade.

### N2 — Leitor documental subordinado

- [x] Adicionar serviço interno `document-worker` ao Docker Compose.
- [x] Receber arquivos somente pela rede interna usada pelo WF-11.
- [x] Extrair PDF nativo; usar OCR em PDF escaneado e JPG/PNG; ler XLSX/CSV.
- [x] Tratar conteúdo como não confiável e bloquear efeitos externos.
- [x] Retornar JSON Draft 2020-12 com evidência por página/célula.
- [x] Implementar timeout, custo local zero, retry e fallback de provedor.
- [x] Integrar MinerU 3.4.5 com modelos locais como parser principal para PDF/imagem, limitado a uma execução concorrente.
- [x] Preservar PyMuPDF/Tesseract como fallback quando o MinerU estiver indisponível.
- [x] Validar PDF, JPG e XLSX reais diretamente pelo worker e validar acesso interno a partir do n8n.
- [ ] Validar o arquivo real `metas1708.pdf` através do WF-11.

**Gate:** n8n extrai do `metas1708.pdf` um fato correto e localizável.

### N3 — Diretor como subworkflow n8n

- [ ] Criar WF-12 para classificar documento e intenção.
- [ ] Rotear somente aos Gerentes que possam mudar a conclusão.
- [ ] Registrar inclusões, exclusões, dependências e justificativas.
- [ ] Gerar contexto mínimo por domínio e revisar ambiguidades.

**Gate:** POBJ aciona Performance; outros domínios só entram com evidência material.

### N4 — GG Performance real no n8n

- [ ] Criar WF-13 Performance recebendo JSON, nunca PDF bruto.
- [ ] Aplicar regras determinísticas versionadas de meta, realizado, piso, teto e pontos.
- [ ] Produzir gaps e plano consultivo sem inventar clientes.
- [ ] Registrar evidências e lacunas.

**Gate:** arquivo real gera indicador conferível e recomendação útil.

### N5 — Motor, Evidence Graph e Estado 360

- [ ] Adaptar WF-06 para saídas reais dos Gerentes.
- [ ] Validar contratos em cada fronteira.
- [ ] Consolidar convergências e conflitos sem escolha silenciosa.
- [ ] Persistir snapshot imutável e proveniência por campo.
- [ ] Atualizar documento/job para revisão, conclusão ou erro.

**Gate:** resultado reaparece após reiniciar navegador e Docker.

### N6 — Dashboard e revisão

- [ ] Mostrar protocolo, estágio n8n, tentativas e erro compreensível.
- [ ] Exibir extração, evidência, parecer e síntese.
- [ ] Permitir corrigir e aprovar sem reenviar.
- [ ] Guardar original, correção, motivo e versão; reprocessar só dependências.

**Gate:** Rafael confere, corrige e aprova um caso real pelo celular.

### N7 — Telegram ponta a ponta

- [ ] Confirmar protocolo imediatamente e processar pelo WF-11.
- [ ] Atualizar retries sem pedir novo arquivo.
- [ ] Devolver síntese e link autenticado após conclusão.
- [ ] Garantir idempotência de updates repetidos.

**Gate do MVP:** Telegram produz informação real no site e resposta no chat sem PowerShell.

### N8 — Demais Gerentes

- [ ] WF-14 Conta: carteira, cobertura, ativação e oportunidades.
- [ ] WF-15 Financeiro: orçamento, realizado, desvios e impacto.
- [ ] WF-16 Relacionamento: conversas, necessidades, objeções e compromissos.
- [ ] Testar caso próprio de cada domínio e um caso multidomínio.

**Gate:** quatro Gerentes concluem casos reais sem misturar autoridades.

### N9 — Operação assistida

- [ ] Métricas de duração, sucesso, custo, retries e correções.
- [ ] Alertas, reprocessamento pelo painel e testes de indisponibilidade.
- [ ] Backup, restauração, rollback e sete dias sem perda.

**Gate:** operação estável; efeitos externos continuam proibidos até autorização separada.

## Ordem canônica

`N0 → N1 → N2 → N3 → N4 → N5 → N6 → N7` entrega o MVP real com Performance. Depois: `N8 Conta → N8 Financeiro → N8 Relacionamento → integração → N9`.

## Próximo passo exato

Rafael envia um arquivo POBJ pelo Telegram. Em seguida, executar WF-11 e comprovar claim → download → document-worker/MinerU → WF-12 → primeiro handoff estruturado exclusivamente para o GG Performance. Não desenvolver outros Gerentes antes do Gate final de M4.
