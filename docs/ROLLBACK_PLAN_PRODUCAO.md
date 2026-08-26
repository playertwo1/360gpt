# PLANO FORMAL DE ROLLBACK E RECUPERAÇÃO DE DESASTRES (RTO/RPO)
## Procedimentos Operacionais Padrão de Reversão de Produção 360

**Versão:** 1.0.0  
**Data:** 26 de agosto de 2026  
**Autoridade de Acionamento:** Rafael (`fael@live.de`)  
**Metas de Continuidade:** RTO < 15 minutos | RPO < 5 minutos  
**Padrão de Referência:** CIS Benchmarks & 12-Factor App  

---

## 1. Triggers e Critérios de Acionamento do Rollback

O rollback emergencial deve ser disparado imediatamente quando ocorrer qualquer um dos seguintes cenários:
1. **Falha de Integridade Criptográfica:** Violação de integridade nos nós do Evidence Graph ou mutação não autorizada.
2. **Degradação Crítica de SLA:** Taxa de erro HTTP 5xx na API > 2% durante 5 minutos consecutivos.
3. **Falha no Gate de Quatro Olhos / Auth:** Bypass ou erro na validação de allowlist de revisores.
4. **Instabilidade do Banco D1 / PostgreSQL:** Corrupção de transações ou perda de conectividade persistente.

---

## 2. Roteiro Executivo de Rollback em 3 Níveis

```
                      ┌────────────────────────────┐
                      │    ACIONAMENTO ROLLBACK    │
                      └─────────────┬──────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
 [ NÍVEL 1: DNS & CDN ]      [ NÍVEL 2: BANCO D1/PG ]     [ NÍVEL 3: CONTÊINERES ]
 Reversão do tráfego para    Restore do snapshot point-   Rollback da imagem Docker
 versão estável anterior     in-time com integridade      para tag v1.2.0-marco18
```

### Nível 1: Reversão de DNS e Cloudflare Pages
- **Ação:** No painel Cloudflare Pages ou via CLI (`wrangler pages deployment rollback`), reverter o deployment ativo para o último build certificado com sucesso (`v1.2.0-marco18`).
- **Tempo Estimado:** < 60 segundos (propagação instantânea global da Cloudflare Edge).

### Nível 2: Restore Transacional do Banco de Dados (PostgreSQL / D1)
- **Ação PostgreSQL:** Restaurar o último dump íntegro validado:
  ```bash
  docker compose -f infra/cloud/docker-compose.prod.yaml exec -T postgres psql -U postgres -d visao360 < backups/latest-snapshot.sql
  ```
- **Ação D1:** Executar `wrangler d1 backup restore visao360-prod-db --backup-id <LAST_HEALTHY_ID>`.
- **Garantia:** Preservação da trilha append-only e integridade de hashes SHA-256.

### Nível 3: Reversão dos Contêineres VPS (n8n e Caddy)
- **Ação:** Reverter o `docker-compose.prod.yaml` para as tags de imagens previamente homologadas e reiniciar os serviços:
  ```bash
  docker compose -f infra/cloud/docker-compose.prod.yaml down
  docker compose -f infra/cloud/docker-compose.prod.yaml up -d
  ```

---

## 3. Checklist de Validação Pós-Rollback

Após a execução do rollback, o operador deve executar obrigatoriamente:
- [ ] Teste de autenticação falha-fechada (`/api/metrics/finops` e `/api/reviews` retornam 401 sem auth).
- [ ] Verificação de integridade do Evidence Graph (`SELECT count(*) FROM evidence_nodes`).
- [ ] Disparo de webhook de teste sintético (`scripts/test-assisted-operations.ps1`).
- [ ] Emissão de comunicado formal de encerramento do incidente para `fael@live.de`.

---

**Homologado por:** Rafael (`fael@live.de`)  
**Status:** PRONTO PARA PRODUÇÃO
