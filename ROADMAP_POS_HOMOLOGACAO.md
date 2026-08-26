# Roadmap Pós-Homologação — Diretor 360

**Início:** 26 de agosto de 2026  
**Ponto de partida:** release `v3.0.0-final-hybrid`, com 24 marcos e H1–H10 concluídos para dados sintéticos.  
**Objetivo final:** transformar o Diretor 360 em um assistente diário confiável, rastreável e útil à decisão, com eventual uso de dados reais somente após autorização institucional.

> **Limite atual:** o piloto técnico não está autorizado a receber dados reais, sigilosos ou identificáveis de clientes do banco. Até o Gate P6, usar somente dados sintéticos ou anonimizados e previamente autorizados.

---

## Como acompanhar

- `[ ]` não iniciado; `[~]` em andamento; `[x]` concluído com evidência.
- Cada fase termina com teste, evidência no `status.md`, backup e sincronização com GitHub.
- Codex e Antigravity devem executar primeiro a fase marcada como atual.

## Visão geral

| Fase | Resultado esperado | Estado |
|---|---|:---:|
| P1 | Operação diária sintética medida e confiável | [~] |
| P2 | Qualidade das análises e recomendações comprovada | [ ] |
| P3 | Entrada de documentos mais robusta e fácil | [ ] |
| P4 | Dashboard orientado à decisão do gerente | [ ] |
| P5 | Fontes e integrações futuras desenhadas com governança | [ ] |
| P6 | Segurança, LGPD e autorização institucional formalizadas | [ ] |
| P7 | Piloto limitado com dados reais, somente se autorizado | [ ] |
| P8 | Operação 24 horas e escala, somente quando necessária | [ ] |

---

## P1 — Operação diária sintética medida

**Objetivo:** usar o sistema em jornadas realistas e descobrir problemas de operação, não apenas de código.

- [ ] Executar jornada completa pelo Telegram com texto sintético.
- [ ] Executar jornada completa com PDF sintético.
- [ ] Executar jornada completa com Excel sintético.
- [ ] Confirmar recebimento, fila, processamento, Dashboard e Mesa do Revisor.
- [ ] Registrar tempo total, falhas, retrabalho e clareza da resposta.
- [ ] Testar desligar e religar o computador com trabalho aguardando.
- [ ] Criar diário simples de uso para cinco jornadas.
- [ ] Corrigir somente falhas comprovadas nessas jornadas.

**Critério de aceite:** cinco jornadas completas, sem perda nem duplicidade, com tempos e dificuldades registrados.

**Próximo passo exato:** executar e registrar a Jornada `P1-01` com uma mensagem sintética enviada pelo Telegram.

---

## P2 — Qualidade da inteligência e das recomendações

**Objetivo:** comprovar que as análises ajudam Rafael a decidir melhor.

- [ ] Criar pelo menos 20 casos sintéticos com respostas esperadas.
- [ ] Cobrir Conta, Performance, Financeiro e Relacionamento.
- [ ] Incluir conflitos, dados ausentes, documentos vencidos e casos ambíguos.
- [ ] Medir precisão, completude, rastreabilidade e utilidade.
- [ ] Comparar a resposta do sistema com a avaliação humana de Rafael.
- [ ] Calibrar regras, prompts e reason codes sem ocultar incertezas.
- [ ] Criar regressão automática para impedir perda de qualidade.

**Critério de aceite:** metas de qualidade definidas e atingidas em suíte versionada, sem afirmação material sem evidência.

---

## P3 — Entrada de documentos robusta

**Objetivo:** reduzir trabalho manual ao receber informações variadas.

- [ ] Melhorar extração de PDFs digitais.
- [ ] Implementar OCR controlado para PDFs digitalizados.
- [ ] Interpretar `.xlsx` com múltiplas abas, fórmulas e períodos.
- [ ] Exibir prévia do que foi extraído antes da análise.
- [ ] Permitir correção humana sem apagar o original.
- [ ] Detectar arquivo corrompido, protegido por senha ou incompleto.
- [ ] Revalidar limites, tipos, malware e prompt injection.

**Critério de aceite:** documentos sintéticos representativos são extraídos com campos, hash, origem, confiança e lacunas visíveis.

---

## P4 — Dashboard orientado à decisão

**Objetivo:** mostrar primeiro aquilo que muda a agenda e a decisão do gerente.

- [ ] Criar visão “Hoje”: prioridades, prazos, revisões e oportunidades.
- [ ] Criar carteira de empresas com filtros e busca.
- [ ] Exibir saúde por empresa e mudanças desde o snapshot anterior.
- [ ] Separar fatos, inferências, recomendações e decisões pendentes.
- [ ] Permitir navegação até documento e evidência de origem.
- [ ] Criar alertas de dado vencido, conflito e SLA.
- [ ] Validar experiência no celular e no computador.

**Critério de aceite:** Rafael identifica em até dois minutos o que precisa fazer, por quê e com qual evidência.

---

## P5 — Fontes e integrações governadas

**Objetivo:** preparar integrações sem ligar fontes bancárias prematuramente.

- [ ] Listar fontes desejadas e o valor de cada uma.
- [ ] Classificar dados, finalidade, proprietário, atualidade e retenção.
- [ ] Definir fonte autoritativa por campo e tratamento de divergência.
- [ ] Priorizar integrações por benefício, risco e esforço.
- [ ] Criar adaptadores somente para ambientes de teste autorizados.
- [ ] Proibir exportação manual de dados bancários para canais pessoais.
- [ ] Documentar desligamento, correção e revogação de cada fonte.

**Critério de aceite:** catálogo e matriz de autoridade aprovados, sem credenciais ou dados reais conectados.

---

## P6 — Gate institucional, LGPD e segurança

**Objetivo:** decidir formalmente se o sistema pode avançar além de dados sintéticos.

- [ ] Identificar responsáveis de Segurança, Compliance, Jurídico/LGPD e negócio.
- [ ] Documentar finalidade, base legal, minimização e retenção.
- [ ] Fazer modelagem de ameaças e avaliação de fornecedores.
- [ ] Definir ambiente, identidade corporativa, logs, DLP e gestão de segredos.
- [ ] Definir quais dados e ações continuam proibidos.
- [ ] Obter autorização formal e limitada para qualquer piloto real.
- [ ] Registrar decisão `APROVADO`, `REPROVADO` ou `AJUSTES NECESSÁRIOS`.

**Critério de aceite:** autorização institucional escrita e escopo técnico correspondente. Sem autorização, o projeto permanece sintético.

---

## P7 — Piloto real limitado e supervisionado

**Pré-requisito obrigatório:** P6 aprovado.

- [ ] Selecionar amostra mínima e finalidade única.
- [ ] Usar somente campos e usuários autorizados.
- [ ] Manter recomendações sem efeitos transacionais automáticos.
- [ ] Exigir revisão humana em decisões materiais.
- [ ] Medir qualidade, tempo economizado, falsos positivos e incidentes.
- [ ] Executar rollback e descarte ao final do piloto.
- [ ] Produzir relatório de aceite ou interrupção.

**Critério de aceite:** valor comprovado no escopo autorizado, sem incidente material e com decisão humana preservada.

---

## P8 — Disponibilidade 24 horas e escala

**Objetivo:** migrar o processamento local somente se o uso justificar.

- [ ] Medir quantos trabalhos ficam esperando o computador ligar.
- [ ] Definir SLO, RTO, RPO, volume, custo e suporte necessários.
- [ ] Comparar manter local, VPS gerenciada e arquitetura hospedada.
- [ ] Implantar ambiente separado, backups e observabilidade.
- [ ] Realizar teste de carga, desastre, rollback e custo.
- [ ] Fazer migração gradual e manter retorno seguro ao modo anterior.

**Critério de aceite:** disponibilidade e custo atendem à necessidade comprovada sem reduzir segurança ou rastreabilidade.

---

## Indicadores do novo ciclo

| Indicador | Por que importa |
|---|---|
| Jornadas concluídas sem intervenção técnica | Usabilidade real |
| Tempo entre envio e estado publicado | Agilidade |
| Entradas perdidas ou duplicadas | Confiabilidade |
| Afirmações materiais com evidência | Rastreabilidade |
| Recomendações aceitas, corrigidas ou rejeitadas | Qualidade decisória |
| Revisões fora do SLA | Capacidade operacional |
| Custo por análise | Sustentabilidade |
| Incidentes de segurança ou privacidade | Condição de continuidade |

## Decisão atual

Começar pela **P1**, mantendo Docker local, site hospedado e Telegram como estão. VPS, integrações bancárias e dados reais não são o próximo passo; serão avaliados somente após evidência de uso e autorização formal.
