# MinerU 3.4.5 - internal document parsing service for Diretor 360.
# Based on the upstream deployment image:
# https://github.com/opendatalab/MinerU/tree/4fe4bde114a2/docker/global
# MinerU is distributed under the MinerU Open Source License.
FROM vllm/vllm-openai:v0.21.0@sha256:a230095847e93bd4df9888b33dab956fa9504537b828a23657d2b26fed57b5c9

RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-noto-core fonts-noto-cjk fontconfig libgl1 \
    && fc-cache -fv \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install --no-cache-dir --break-system-packages "mineru[core]==3.4.5"

# Keep every official model in the image so parsing remains local and offline.
RUN mineru-models-download -s huggingface -m all

ENTRYPOINT ["/bin/bash", "-c", "export MINERU_MODEL_SOURCE=local && exec \"$@\"", "--"]
CMD ["mineru-api", "--host", "0.0.0.0", "--port", "8000"]
