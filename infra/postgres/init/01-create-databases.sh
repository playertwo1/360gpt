#!/usr/bin/env bash
set -Eeuo pipefail

psql --set ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set n8n_password="$N8N_DB_PASSWORD" \
  --set app_password="$APP_DB_PASSWORD" <<'EOSQL'
SELECT 'CREATE ROLE n8n LOGIN PASSWORD ' || quote_literal(:'n8n_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'n8n')\gexec

SELECT 'CREATE ROLE visao360_app LOGIN PASSWORD ' || quote_literal(:'app_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'visao360_app')\gexec

SELECT 'CREATE DATABASE n8n OWNER n8n'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'n8n')\gexec

SELECT 'CREATE DATABASE visao360 OWNER visao360_app'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'visao360')\gexec
EOSQL
