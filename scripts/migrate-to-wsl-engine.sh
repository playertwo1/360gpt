#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-/mnt/c/Users/fael/Documents/Codex/2026-08-24/vamos-criar-um-progama-360-de}"
POSTGRES_BACKUP="${2:-/mnt/c/Users/fael/Desktop/backup_visao360_postgres.sql}"
N8N_BACKUP="${3:-/mnt/c/Users/fael/Desktop/backup_n8n_data}"

cd "$PROJECT_DIR"

if [[ ! -f .env.n8n || ! -f "$POSTGRES_BACKUP" || ! -d "$N8N_BACKUP" ]]; then
  echo "ERRO: projeto, .env.n8n ou backups nao encontrados." >&2
  exit 2
fi

set -a
# shellcheck disable=SC1091
source ./.env.n8n
set +a

if [[ -z "${POSTGRES_ADMIN_PASSWORD:-}" ]]; then
  echo "ERRO: POSTGRES_ADMIN_PASSWORD ausente em .env.n8n." >&2
  exit 3
fi

docker volume create visao-360_postgres_data >/dev/null
docker volume create visao-360_n8n_data >/dev/null
docker rm -f diretor360-restore-postgres >/dev/null 2>&1 || true

cleanup() {
  docker rm -f diretor360-restore-postgres >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run -d \
  --name diretor360-restore-postgres \
  --env POSTGRES_PASSWORD="$POSTGRES_ADMIN_PASSWORD" \
  -v visao-360_postgres_data:/var/lib/postgresql/data \
  postgres:17.6-alpine >/dev/null

for _ in $(seq 1 40); do
  if docker exec diretor360-restore-postgres pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker exec diretor360-restore-postgres pg_isready -U postgres >/dev/null

docker exec -i diretor360-restore-postgres psql -U postgres \
  < "$POSTGRES_BACKUP" > /tmp/diretor360-postgres-restore.log 2>&1 || true

n8n_tables="$(docker exec diretor360-restore-postgres psql -U postgres -d n8n -Atc \
  "select count(*) from information_schema.tables where table_schema = 'public'")"
app_tables="$(docker exec diretor360-restore-postgres psql -U postgres -d visao360 -Atc \
  "select count(*) from information_schema.tables where table_schema = 'public'")"

if [[ "$n8n_tables" -lt 100 || "$app_tables" -lt 1 ]]; then
  tail -40 /tmp/diretor360-postgres-restore.log >&2
  echo "ERRO: restauracao incompleta (n8n=$n8n_tables, visao360=$app_tables)." >&2
  exit 4
fi

docker run --rm \
  -v visao-360_n8n_data:/target \
  -v "$N8N_BACKUP":/source:ro \
  alpine:3.22 sh -c 'cp -a /source/. /target/ && chown -R 1000:1000 /target'

echo "POSTGRES_RESTORED n8n_tables=$n8n_tables visao360_tables=$app_tables"
echo "N8N_DATA_RESTORED"
