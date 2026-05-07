#!/usr/bin/env bash
#
# Sync .env between local repo and production.
#
# Source of truth is whichever side you push from. Default mode is a "pull"
# (prod → local) because the typical workflow is: edit a value via SSH or
# during a deploy, then mirror it locally so your editor/CLI sees the new
# value.
#
# Usage:
#   scripts/env-sync.sh pull    # prod → local (safe, overwrites local .env)
#   scripts/env-sync.sh push    # local → prod (with confirmation; backs up prod first)
#   scripts/env-sync.sh diff    # show line-by-line diff between local and prod
#
# A note on what's IN this file vs what isn't:
#   - This .env contains only *secrets* (passwords, API keys, DSNs).
#   - Hostnames / URLs (DATABASE_URL, NEXTAUTH_URL, etc.) live in
#     docker-compose.yml on the prod server and are computed at runtime
#     from the secret values here. So this sync alone is NOT enough to
#     `npm run dev` locally — you'd need to add DATABASE_URL,
#     NEXTAUTH_URL=http://localhost:3000, etc. to your local .env.
#   - .env is gitignored (line ~28 of .gitignore). It never reaches GitHub.

set -euo pipefail

SSH_TARGET="root@204.168.129.243"
SSH_KEY="$HOME/.ssh/auratech-hetzner"
REMOTE_PATH="/opt/auratech/.env"
LOCAL_PATH="$(dirname "$0")/../.env"

usage() { sed -n '2,/^$/p' "$0" | sed 's/^# \?//'; exit 1; }

case "${1:-}" in
  pull)
    echo "Pulling ${SSH_TARGET}:${REMOTE_PATH} → ${LOCAL_PATH}"
    scp -i "$SSH_KEY" "${SSH_TARGET}:${REMOTE_PATH}" "$LOCAL_PATH"
    echo "Done. Variables present (values redacted):"
    grep -E "^[A-Z_]+=" "$LOCAL_PATH" | sed 's/=.*/=<present>/'
    ;;

  push)
    echo "Push will REPLACE ${SSH_TARGET}:${REMOTE_PATH} with local ${LOCAL_PATH}."
    echo "A timestamped backup will be created on prod first."
    read -p "Continue? [y/N] " -n 1 -r
    echo
    [[ "$REPLY" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }

    ssh -i "$SSH_KEY" "$SSH_TARGET" "cp ${REMOTE_PATH} ${REMOTE_PATH}.backup-\$(date +%F-%H%M)"
    scp -i "$SSH_KEY" "$LOCAL_PATH" "${SSH_TARGET}:${REMOTE_PATH}"
    echo "Pushed. Backup: ${REMOTE_PATH}.backup-<timestamp>"
    echo "Run 'cd /opt/auratech && docker compose up -d backend' on prod to pick up changes."
    ;;

  diff)
    echo "=== Diff (local vs prod), values redacted ==="
    diff <(grep -E "^[A-Z_]+=" "$LOCAL_PATH" | sed 's/=.*/=<value>/' | sort) \
         <(ssh -i "$SSH_KEY" "$SSH_TARGET" "grep -E '^[A-Z_]+=' ${REMOTE_PATH}" | sed 's/=.*/=<value>/' | sort) \
      || true
    echo "(< local, > prod)"
    ;;

  *)
    usage
    ;;
esac
