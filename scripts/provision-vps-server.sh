#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/diretor-360}"
REPOSITORY_URL="${REPOSITORY_URL:-https://github.com/playertwo1/360.git}"
BRANCH="${BRANCH:-main}"
ENV_FILE="${ENV_FILE:-$PROJECT_DIR/infra/cloud/.env.prod}"

log() { printf '[Diretor 360] %s\n' "$*"; }
fail() { printf '[Diretor 360] ERRO: %s\n' "$*" >&2; exit 1; }

[[ "${EUID}" -eq 0 ]] || fail 'execute como root (sudo).'
[[ -r /etc/os-release ]] || fail 'sistema Linux sem /etc/os-release.'
. /etc/os-release
[[ "${ID:-}" == 'ubuntu' ]] || fail 'este instalador suporta Ubuntu 24.04.'
[[ "${VERSION_ID:-}" == '24.04' ]] || fail "versao nao suportada: ${VERSION_ID:-desconhecida}."

export DEBIAN_FRONTEND=noninteractive
log 'Instalando dependencias e Docker oficial...'
apt-get update
apt-get install -y ca-certificates curl git ufw
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
printf 'deb [arch=%s signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu %s stable\n' \
  "$(dpkg --print-architecture)" "${UBUNTU_CODENAME:-noble}" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

log 'Configurando firewall (SSH, HTTP e HTTPS)...'
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

if [[ -d "$PROJECT_DIR/.git" ]]; then
  git -C "$PROJECT_DIR" fetch --tags origin
  git -C "$PROJECT_DIR" checkout "$BRANCH"
  git -C "$PROJECT_DIR" pull --ff-only origin "$BRANCH"
else
  install -d -m 0750 "$(dirname "$PROJECT_DIR")"
  git clone --branch "$BRANCH" --single-branch "$REPOSITORY_URL" "$PROJECT_DIR"
fi

[[ -f "$ENV_FILE" ]] || {
  cp "$PROJECT_DIR/infra/cloud/.env.prod.example" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  fail "preencha $ENV_FILE e execute novamente. Nenhum container foi iniciado."
}
chmod 600 "$ENV_FILE"

required=(DOMAIN_NAME ACME_EMAIL POSTGRES_PASSWORD N8N_PASSWORD N8N_ENCRYPTION_KEY)
for key in "${required[@]}"; do
  value="$(sed -n "s/^${key}=//p" "$ENV_FILE" | tail -n 1)"
  [[ -n "$value" ]] || fail "$key ausente em $ENV_FILE."
  [[ "$value" != *'seudominio'* && "$value" != *'example.com'* && "$value" != gere-* ]] || fail "$key ainda contem valor de exemplo."
done

log 'Validando e iniciando os servicos de producao...'
cd "$PROJECT_DIR"
docker compose --env-file "$ENV_FILE" -f infra/cloud/docker-compose.prod.yaml config --quiet
docker compose --env-file "$ENV_FILE" -f infra/cloud/docker-compose.prod.yaml pull
docker compose --env-file "$ENV_FILE" -f infra/cloud/docker-compose.prod.yaml up -d --remove-orphans

for attempt in {1..30}; do
  if docker compose --env-file "$ENV_FILE" -f infra/cloud/docker-compose.prod.yaml exec -T n8n wget -qO- http://localhost:5678/healthz >/dev/null 2>&1; then
    log 'n8n saudavel. Provisionamento concluido.'
    docker compose --env-file "$ENV_FILE" -f infra/cloud/docker-compose.prod.yaml ps
    exit 0
  fi
  sleep 5
done
docker compose --env-file "$ENV_FILE" -f infra/cloud/docker-compose.prod.yaml ps
fail 'n8n nao ficou saudavel dentro de 150 segundos.'
