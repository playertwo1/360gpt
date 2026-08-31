# Roadmap n8n — Diretor 360 MVP Real

**Versão:** 1.1
**Data:** 2026-08-31
**Decisão:** o n8n é a espinha dorsal operacional do Diretor 360.

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

Concluir N1/N2 ponta a ponta: executar manualmente o WF-11 com um job controlado do `metas1708.pdf` e provar claim → download → MinerU → validação → complete, sem novo upload. O parser e seu fallback já estão homologados isoladamente; não ativar o agendamento antes desse ensaio.
