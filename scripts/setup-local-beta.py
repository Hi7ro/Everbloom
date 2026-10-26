#!/usr/bin/env python3
"""Create only Everbloom's isolated local development database; never change an existing role/db."""
import os
from pathlib import Path
import secrets
import subprocess
import sys

def main():
    root = Path(__file__).resolve().parent.parent
    local = root / '.local'
    local.mkdir(mode=0o700, exist_ok=True)
    env = local / 'beta.env'
    if env.exists():
        print('Existing .local/beta.env preserved. Start scripts/start-backend-local.sh.')
        sys.exit(0)
    name = 'everbloom_beta_dev'
    try:
        result = subprocess.run(['psql', '-d', 'postgres', '-Atc',
            f"SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='{name}') OR EXISTS(SELECT 1 FROM pg_database WHERE datname='{name}')"],
            check=True, capture_output=True, text=True)
        if result.stdout.strip() != 'f':
            sys.exit('The scoped database/role already exists. No changes made; configure .local/beta.env manually.')
        password = secrets.token_urlsafe(36)
        # SQL values are generated locally: constant identifiers and URL-safe random password only.
        subprocess.run(['psql', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'],
            input=f"CREATE ROLE {name} LOGIN PASSWORD '{password}';\nCREATE DATABASE {name} OWNER {name};\n",
            check=True, capture_output=True, text=True)
        with os.fdopen(os.open(env, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as file:
            file.write(f'SPRING_PROFILES_ACTIVE=dev\nEVERBLOOM_DB_URL=jdbc:postgresql://127.0.0.1:5432/{name}\nEVERBLOOM_DB_USER={name}\nEVERBLOOM_DB_PASSWORD={password}\n')
    except (FileNotFoundError, subprocess.CalledProcessError):
        sys.exit('Local PostgreSQL/psql must be installed, running, and accessible to your local admin. No credentials are printed.')
    print('Isolated local beta database created. Credentials are in ignored .local/beta.env (0600).')


if __name__ == '__main__':
    main()
