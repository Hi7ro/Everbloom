#!/bin/sh
set -eu
umask 077
. "$(dirname -- "$0")/common.sh"
if [ "${1:-}" = '--help' ]; then
  printf '%s\n' 'Usage: backup.sh [output-directory]. Creates a new PostgreSQL custom-format dump.'
  exit 0
fi
if [ "$#" -gt 1 ]; then printf '%s\n' 'Expected at most one output directory.' >&2; exit 2; fi
require_environment
backup_dir=${1:-"$deploy_dir/backups"}
mkdir -p "$backup_dir"
backup_dir=$(CDPATH= cd -- "$backup_dir" && pwd)
backup=$(mktemp "$backup_dir/everbloom-$(date -u +%Y%m%dT%H%M%SZ).dump.XXXXXX")
trap 'rm -f -- "$backup"; exit 1' HUP INT TERM
if ! compose exec -T db sh -eu -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --format=custom --no-owner --no-acl' > "$backup"; then
  rm -f -- "$backup"
  printf '%s\n' 'Backup failed; incomplete output removed.' >&2
  exit 1
fi
trap - HUP INT TERM
printf '%s\n' "Backup written: $backup"
