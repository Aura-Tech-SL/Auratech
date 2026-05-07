#!/usr/bin/env bash
#
# Sync .env between local repo and production.
#
# Usage:
#   scripts/env-sync.sh pull              # prod → local (overwrites local .env)
#   scripts/env-sync.sh push [-y]         # local → prod, full auto: backup, scp,
#                                         #   restart backend, smoke test. Use -y
#                                         #   to skip the confirmation prompt.
#   scripts/env-sync.sh diff              # show variable-name diff (values redacted)
#   scripts/env-sync.sh watch             # auto-push on every local .env save
#                                         #   (polls mtime; ctrl-c to stop)
#   scripts/env-sync.sh restart           # just restart the prod backend, no .env touched
#   scripts/env-sync.sh bootstrap         # pull prod, then append local-dev overrides
#                                         #   so `npm run dev` works immediately
#
# A note on what's IN this file vs what isn't:
#   - This .env contains only *secrets* (passwords, API keys, DSNs).
#   - Hostnames / URLs (DATABASE_URL, NEXTAUTH_URL, etc.) live in
#     docker-compose.yml on the prod server. `bootstrap` adds local
#     overrides so dev mode can find a local Postgres + localhost auth.
#   - .env is gitignored. It never reaches GitHub.

set -euo pipefail

SSH_TARGET="root@204.168.129.243"
SSH_KEY="$HOME/.ssh/auratech-hetzner"
SSH_OPTS="-i $SSH_KEY -o ConnectTimeout=10"
REMOTE_PATH="/opt/auratech/.env"
LOCAL_PATH="$(cd "$(dirname "$0")/.." && pwd)/.env"
PROD_URL="https://auratech.cat/ca"

c_red()   { printf '\033[0;31m%s\033[0m\n' "$*"; }
c_green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
c_blue()  { printf '\033[0;34m%s\033[0m\n' "$*"; }
c_dim()   { printf '\033[2m%s\033[0m\n' "$*"; }

usage() { sed -n '2,/^$/p' "$0" | sed 's/^# \?//'; exit 1; }

cmd_pull() {
  c_blue "→ pull  ${SSH_TARGET}:${REMOTE_PATH} → ${LOCAL_PATH}"
  scp $SSH_OPTS "${SSH_TARGET}:${REMOTE_PATH}" "$LOCAL_PATH"
  c_green "✓ pulled $(grep -cE '^[A-Z_]+=' "$LOCAL_PATH") variables"
}

cmd_push() {
  local skip_confirm="${1:-no}"
  if [[ "$skip_confirm" != "-y" && "$skip_confirm" != "--yes" ]]; then
    c_dim "Diff (local vs prod, values redacted):"
    cmd_diff || true
    read -p "Push local .env to prod and restart backend? [y/N] " -n 1 -r
    echo
    [[ "$REPLY" =~ ^[Yy]$ ]] || { c_red "✗ aborted"; exit 1; }
  fi

  local TS
  TS=$(date +%F-%H%M%S)

  c_blue "→ backup prod .env"
  ssh $SSH_OPTS "$SSH_TARGET" "cp ${REMOTE_PATH} ${REMOTE_PATH}.backup-${TS}"

  c_blue "→ scp local → prod"
  scp $SSH_OPTS "$LOCAL_PATH" "${SSH_TARGET}:${REMOTE_PATH}"

  c_blue "→ restart backend"
  ssh $SSH_OPTS "$SSH_TARGET" "cd /opt/auratech && docker compose up -d backend >/dev/null 2>&1"
  sleep 6

  c_blue "→ smoke ${PROD_URL}"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' "$PROD_URL")
  if [[ "$code" == "200" ]]; then
    c_green "✓ pushed + restarted + smoke 200 (backup at ${REMOTE_PATH}.backup-${TS})"
  else
    c_red "✗ smoke returned ${code} — check 'docker compose logs --tail=30 backend'"
    c_dim "  rollback: ssh ${SSH_TARGET} 'cp ${REMOTE_PATH}.backup-${TS} ${REMOTE_PATH} && cd /opt/auratech && docker compose up -d backend'"
    exit 2
  fi
}

cmd_diff() {
  diff <(grep -E "^[A-Z_]+=" "$LOCAL_PATH" 2>/dev/null | sed 's/=.*/=<value>/' | sort) \
       <(ssh $SSH_OPTS "$SSH_TARGET" "grep -E '^[A-Z_]+=' ${REMOTE_PATH}" | sed 's/=.*/=<value>/' | sort) \
    || true
}

cmd_watch() {
  c_blue "→ watching ${LOCAL_PATH} for changes (ctrl-c to stop)"
  local last
  last=$(stat -f %m "$LOCAL_PATH" 2>/dev/null || stat -c %Y "$LOCAL_PATH")
  while true; do
    sleep 2
    local now
    now=$(stat -f %m "$LOCAL_PATH" 2>/dev/null || stat -c %Y "$LOCAL_PATH")
    if [[ "$now" != "$last" ]]; then
      c_blue "  change detected, pushing…"
      cmd_push -y
      last="$now"
      c_dim "  watching again…"
    fi
  done
}

cmd_restart() {
  c_blue "→ restart backend on prod"
  ssh $SSH_OPTS "$SSH_TARGET" "cd /opt/auratech && docker compose up -d backend"
  sleep 5
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' "$PROD_URL")
  if [[ "$code" == "200" ]]; then c_green "✓ smoke 200"; else c_red "✗ smoke ${code}"; exit 2; fi
}

cmd_bootstrap() {
  cmd_pull
  if grep -q "^DATABASE_URL=" "$LOCAL_PATH"; then
    c_dim "local-dev overrides already present — skip"
  else
    c_blue "→ append local-dev overrides for npm run dev"
    cat >> "$LOCAL_PATH" <<'EOF'

# === LOCAL DEV OVERRIDES (not synced to prod) ===
# These hostnames/URLs only make sense on your Mac.
# `env-sync.sh push` will copy them to prod, where docker-compose.yml
# overrides them with the canonical prod values, so it's harmless.
DATABASE_URL=postgresql://auratech:auratech@localhost:5432/auratech?schema=public
NEXTAUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Auratech
EOF
    c_green "✓ overrides appended; you can now: docker compose up -d && npm run dev"
  fi
}

case "${1:-}" in
  pull)      cmd_pull ;;
  push)      cmd_push "${2:-}" ;;
  diff)      cmd_diff ;;
  watch)     cmd_watch ;;
  restart)   cmd_restart ;;
  bootstrap) cmd_bootstrap ;;
  *)         usage ;;
esac
