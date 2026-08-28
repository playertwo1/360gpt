# A2 — Performance em leitura supervisionada

**Data:** 2026-08-28
**Autorização:** Rafael autorizou o início de A2 nesta conversa.
**Capacidade única:** `PERFORMANCE_SCORING_STATE`.
**Runtime:** `SHADOW`; o Gerente Geral de Performance e todas as demais capacidades permanecem `INACTIVE`.

## Escopo efetivo

| Controle | Estado |
|---|---|
| Dados | `SYNTHETIC_ONLY` |
| Fonte real POBJ | desconectada |
| Campos permitidos | `meta`, `realizado`, `periodo` |
| Revisão humana | obrigatória |
| Efeitos externos | proibidos |
| Mutação de estado de negócio | proibida |
| Rollback | `DISABLE_CAPABILITY` |

## Validação de entrada

- Manifesto e registro de capacidades reconciliados: somente `PERFORMANCE_SCORING_STATE` está em `SHADOW`.
- Política A2 rejeita fontes reais, documentos Telegram e conectores externos.
- Testes de manifesto, lifecycle e política A2 aprovados; bateria geral anterior permaneceu 14/14 aprovada.
- Baseline supervisionado: 10/10 casos, 0 erro, 0% de divergência, custo US$ 0,00, 0,043 ms médio, zero mutação e zero efeito externo.
- Kill switch testado: execução é bloqueada por `CAPABILITY_INACTIVE`, fonte/campo não autorizado ou tentativa de efeito externo.

## Saída de A2

A2 foi homologado após três medições consecutivas aprovadas: 30/30 casos, zero erro, zero divergência, custo zero, zero mutação e zero efeito externo. A revisão humana e o kill switch permaneceram preservados.

Nenhuma condição deste documento autoriza A3, dados reais ou efeitos externos. A3 exige nova autorização explícita de Rafael.
