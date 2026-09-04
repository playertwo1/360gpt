FROM python:3.12.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app
COPY requirements.txt .
RUN pip install --requirement requirements.txt
COPY app ./app

RUN useradd --create-home --uid 10001 worker \
    && chown -R worker:worker /app
USER worker

EXPOSE 8787 8000
CMD ["python", "-m", "app.main"]
