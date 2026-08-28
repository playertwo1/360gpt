# Canary individual — Gerente Geral Performance

**Estado:** PREPARADO — bloqueado até Gate Shadow aprovado por Rafael.  
**Capacidade candidata:** `PERFORMANCE_SCORING_STATE` e parecer de performance em modo consultivo.

## Limites não negociáveis

- Runtime inicial: `SHADOW` ou canary supervisionado, nunca `ACTIVE` direto.
- Fonte permitida: casos sintéticos; dados reais exigem o registro de autorização completo.
- Sem escolha automática de empresa, sem contato externo e sem efeito financeiro.
- Divergência de fonte, regra ou curva gera `MANUAL_REVIEW_REQUIRED`.

## Ondas

| Onda | Volume acumulado | Critério de saída |
|---|---:|---|
| 1 | 1–3 casos | schemas válidos, evidência completa, zero efeito externo e revisão de Rafael |
| 2 | 5 casos | cálculo reproduzível, custo dentro do orçamento e sem incidente de segurança |
| 3 | 10 casos | concordância ≥ 90%, override ≤ 10%, latência e custo dentro dos SLOs |

## Pausa e rollback

Pausar imediatamente por mutação não autorizada, efeito externo, falha de segurança, divergência acima do limite, ausência de evidência material ou erro repetido de schema. Rollback: `DISABLE_CAPABILITY`, preservação de auditoria e reprocessamento somente após correção aprovada.

## Evidência por caso

Cada execução registra versão da política POBJ, unidade, meta, realizado, data-base, fonte, hash, resultado determinístico, recomendação consultiva, revisão humana e métricas FinOps.
