# MinerU no Diretor 360

Serviço interno de parsing pesado para PDFs e imagens. O n8n continua sendo o
controlador do fluxo e chama `document-worker`; somente o `document-worker`
conversa com o MinerU.

- versão fixada: `3.4.5`;
- fonte auditada: `opendatalab/MinerU`, commit `4fe4bde114a2`;
- imagem local: `diretor360/mineru:3.4.5`;
- backend padrão: `hybrid-engine`, esforço `medium`;
- concorrência: uma leitura por vez, compatível com a RTX 4060 Ti de 8 GB;
- rede: somente `frontend` do Docker, sem porta publicada no Windows;
- modelos: baixados na construção da imagem para execução local/offline;
- fallback: PyMuPDF/Tesseract preservado no `document-worker`.

O MinerU usa a [MinerU Open Source License](https://github.com/opendatalab/MinerU/blob/master/LICENSE.md),
baseada na Apache 2.0 com condições adicionais. A licença deve ser revista antes
de qualquer distribuição comercial do software ou da imagem Docker.
