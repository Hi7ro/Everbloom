#!/bin/sh
set -eu
# Only run by the official Postgres entrypoint while creating a NEW data volume.
# The application role owns this database but has no cluster administration rights.
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set=ON_ERROR_STOP=1 \
  --set=app_password="$EVERBLOOM_DB_PASSWORD" --set=db_name="$POSTGRES_DB" <<'SQL'
CREATE ROLE everbloom LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD :'app_password';
ALTER DATABASE :"db_name" OWNER TO everbloom;
ALTER SCHEMA public OWNER TO everbloom;
SQL
