#!/bin/sh
set -eu
. "$(dirname -- "$0")/common.sh"
usage() { printf '%s\n' 'Usage: restore.sh --file BACKUP --database everbloom_restore_NAME --confirm-create-database'; }
backup=
target=
confirmed=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    --help) usage; exit 0 ;;
    --file) [ "$#" -ge 2 ] || { usage >&2; exit 2; }; backup=$2; shift 2 ;;
    --database) [ "$#" -ge 2 ] || { usage >&2; exit 2; }; target=$2; shift 2 ;;
    --confirm-create-database) confirmed=true; shift ;;
    *) usage >&2; exit 2 ;;
  esac
done
[ "$confirmed" = true ] && [ -f "$backup" ] && [ -n "$target" ] || { usage >&2; exit 2; }
case "$target" in
  everbloom_restore_*) ;;
  *) printf '%s\n' 'Restore target must start with everbloom_restore_.' >&2; exit 2 ;;
esac
case "$target" in
  *[!a-z0-9_]*) printf '%s\n' 'Only lower-case letters, digits and underscores are allowed.' >&2; exit 2 ;;
esac
[ "${#target}" -le 63 ] || { printf '%s\n' 'Database name is too long.' >&2; exit 2; }
require_environment
# Validate the archive before creating a database. Restore only trusted, own backups.
compose exec -T db pg_restore --list < "$backup" > /dev/null
# The target is strictly validated above; SQL cannot contain quotes or punctuation.
compose exec -T db sh -eu -c '
  target=$1
  export PGPASSWORD="$POSTGRES_PASSWORD"
  exists=$(psql --username "$POSTGRES_USER" --dbname postgres --tuples-only --no-align --command "SELECT 1 FROM pg_database WHERE datname='\''$target'\''")
  if [ -n "$exists" ] || [ "$target" = "$POSTGRES_DB" ]; then
    printf "%s\n" "Refusing to replace an existing database." >&2
    exit 1
  fi
  createdb --username "$POSTGRES_USER" --owner everbloom --template template0 "$target"
' sh "$target"
if ! compose exec -T db sh -eu -c 'export PGPASSWORD="$POSTGRES_PASSWORD"; pg_restore --username "$POSTGRES_USER" --dbname "$1" --role everbloom --no-owner --no-acl --single-transaction --exit-on-error' sh "$target" < "$backup"; then
  printf '%s\n' "Restore failed. The NEW database $target is kept for inspection; no database was dropped." >&2
  exit 1
fi
# Restoring old sessions/reset links would revive obsolete credentials. Invalidate
# them only in the newly created recovery database; the live database is untouched.
compose exec -T db sh -eu -c 'export PGPASSWORD="$POSTGRES_PASSWORD"; psql --username "$POSTGRES_USER" --dbname "$1" --set=ON_ERROR_STOP=1 --single-transaction --command "DELETE FROM spring_session; DELETE FROM auth_tokens; UPDATE accounts SET session_version = session_version + 1; ANALYZE;"' sh "$target"
printf '%s\n' "Restored to NEW database $target. Existing databases are unchanged. Re-login/new email links are required in this recovery copy."
