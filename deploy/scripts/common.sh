#!/bin/sh
# Sourced by scripts in this directory. Never source .env as executable shell code.
deploy_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
env_file=${EVERBLOOM_ENV_FILE:-"$deploy_dir/.env"}
# Allows the same operating scripts to be tested against an isolated, database-only
# Compose project. Never select a different deployment implicitly.
compose_file=${EVERBLOOM_COMPOSE_FILE:-"$deploy_dir/compose.yml"}
compose() {
  docker compose --project-directory "$deploy_dir" --env-file "$env_file" -f "$compose_file" "$@"
}
require_environment() {
  if [ ! -f "$env_file" ]; then
    printf '%s\n' "Missing deployment environment: $env_file" >&2
    exit 1
  fi
  # POSIX grep is intentional: these scripts also run on minimal VPS systems.
  if grep -Eq 'REPLACE_WITH|example\.com' "$env_file"; then
    printf '%s\n' 'Replace the example values before operating a deployment.' >&2
    exit 1
  fi
}
