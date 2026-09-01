# Auditoria da migração para Docling — 2026-09-01

## Resultado

Implementação técnica concluída; homologação funcional POBJ não aprovada.

O Docling Serve 1.30.0 está fixado por digest, opera apenas na rede Docker, usa CPU, dois threads, um worker, TableFormer em modo `accurate` e volume persistente de modelos. O MinerU permanece instalado, parado e fora do fallback automático.

## Medições reais

| Arquivo | Páginas | Tempo | Método | Resultado estrutural |
|---|---:|---:|---|---|
| POBJ2808.pdf | 3 | 198 s na primeira execução; 125–127 s aquecido | DOCLING_TABLEFORMER | 3 tabelas; página final bem alinhada; células unidas nas anteriores |
| POBJ2708.pdf | 3 | 129 s | DOCLING_TABLEFORMER | tabela principal majoritariamente alinhada; cabeçalhos/células secundárias incompletos |
| POBJ2608.pdf | 3 | 125 s | DOCLING_TABLEFORMER | células de peso/métrica e alguns valores unidas; possível deslocamento |

Pico observado do serviço: aproximadamente 1,84 GiB dentro do limite de 3 GiB do container e do WSL de 6 GiB. Logs confirmaram dispositivo `cpu`; o MinerU ficou parado.

## Gate

- Tempo máximo de cinco minutos: PASS.
- CPU sem GPU: PASS.
- Memória dentro do limite: PASS.
- Rede interna e zero serviço remoto: PASS.
- 100% de associação de META, REALIZADO, % ATG, pontos e período: FAIL.
- Nenhuma troca silenciosa: PASS, porque os avisos estruturais bloqueiam promoção e o WF-11 foi despublicado.

## Retomada

Melhorar a normalização das células mescladas sem inventar valores; comparar novamente com os três PDFs e dois arquivos adicionais. Não publicar o WF-11 até o gate funcional passar.

### Arquivos centrais

- `compose.n8n.yaml`: serviço Docling e perfil manual MinerU.
- `services/document-worker/app/main.py`: cliente assíncrono, parsing e fallback.
- `contracts/document-extraction.schema.json`: contrato 1.1.0.
- `n8n/workflows/wf-11-diretor-360-orquestrador-mvp.json`: gate do contrato, atualmente despublicado.
- `n8n/workflows/wf-12-diretor-roteamento-performance-mvp.json`: transporte de tabelas estruturadas.
- `n8n/workflows/wf-13-gg-performance-mvp.json`: consumo tables-first e revisão de ambiguidade.
- `scripts/test-docling-integration.ps1`: guardas operacionais.
- `services/document-worker/app/real_file_probe.py`: medição local sem persistir o conteúdo no repositório.

### Critério para destravar

Não basta o teste automatizado passar. É necessário conferir contra leitura humana que período, indicador, META, REALIZADO, % ATG e pontos pertencem à mesma linha. Qualquer célula unida, deslocada ou conflitante mantém o job em revisão e o WF-11 pausado.
