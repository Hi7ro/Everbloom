#!/usr/bin/env python3
"""Exercise the real operating scripts in an isolated PostgreSQL 17 container.

Requires a running Docker daemon and Compose. Publishes no ports, uses only
synthetic data, and removes only its uniquely named test project on exit.
No production .env file, application database, SMTP or paid service is used.
"""

import json
import os
from pathlib import Path
import secrets
import stat
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]
ACCOUNT = "11111111-1111-4111-8111-111111111111"
SESSION = "22222222-2222-4222-8222-222222222222"


class BackupRestoreTest(unittest.TestCase):
    @classmethod
    def run_command(cls, args, *, input=None, check=True):
        return subprocess.run(args, env=cls.environment, input=input, text=True,
                              capture_output=True, check=check, timeout=120)

    @classmethod
    def compose(cls, *args, **kwargs):
        return cls.run_command(["docker", "compose", "--project-directory", str(ROOT / "deploy"),
                                "--env-file", str(cls.env_file), "-f", str(cls.compose_file), *args], **kwargs)

    @classmethod
    def sql(cls, statement, database="everbloom"):
        return cls.compose("exec", "-T", "db", "psql", "--username", "everbloom_admin",
                           "--dbname", database, "--no-psqlrc", "--set=ON_ERROR_STOP=1",
                           "--tuples-only", "--no-align", input=statement).stdout.strip()

    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix="herovera-restore-test-")
        cls.addClassCleanup(cls.temp.cleanup)
        cls.work = Path(cls.temp.name)
        cls.env_file = cls.work / "database-test.env"
        cls.compose_file = cls.work / "compose.json"
        cls.env_file.write_text("POSTGRES_PASSWORD=" + secrets.token_hex(24) + "\n" +
                                "EVERBLOOM_DB_PASSWORD=" + secrets.token_hex(24) + "\n")
        cls.env_file.chmod(0o600)
        cls.compose_file.write_text(json.dumps({
            "name": "herovera-restore-test-" + secrets.token_hex(6),
            "services": {"db": {
                "image": "postgres:17-bookworm",
                "environment": {"POSTGRES_DB": "everbloom", "POSTGRES_USER": "everbloom_admin",
                                "POSTGRES_PASSWORD": "${POSTGRES_PASSWORD}",
                                "EVERBLOOM_DB_PASSWORD": "${EVERBLOOM_DB_PASSWORD}"},
                "tmpfs": ["/var/lib/postgresql/data:size=192m,mode=0700"],
                "volumes": [str(ROOT / "deploy/postgres/init-app-user.sh") +
                            ":/docker-entrypoint-initdb.d/10-app-user.sh:ro"],
                "healthcheck": {"test": ["CMD", "pg_isready", "-U", "everbloom_admin", "-d", "everbloom"],
                                "interval": "1s", "timeout": "2s", "retries": 30},
                "mem_limit": "512m",
            }},
            "networks": {"default": {"internal": True}},
        }))
        cls.environment = {**os.environ, "EVERBLOOM_ENV_FILE": str(cls.env_file),
                           "EVERBLOOM_COMPOSE_FILE": str(cls.compose_file)}
        cls.run_command(["docker", "info", "--format", "{{.ServerVersion}}"])
        # Registered before starting so an interrupted/failed setup also removes only this project.
        cls.addClassCleanup(lambda: cls.compose("down", "--volumes", "--remove-orphans"))
        cls.compose("up", "-d", "--wait", "--wait-timeout", "60")
        for migration in sorted((ROOT / "backend/src/main/resources/db/migration").glob("V*__*.sql")):
            cls.sql("SET ROLE everbloom;\n" + migration.read_text())
        cls.sql(f"""
            SET ROLE everbloom;
            INSERT INTO accounts(id,email,password_hash,email_verified_at,session_version)
            VALUES ('{ACCOUNT}','restore-test@local.invalid','synthetic-not-a-password',CURRENT_TIMESTAMP,7);
            INSERT INTO auth_tokens VALUES (repeat('a',64),'{ACCOUNT}','password-reset',CURRENT_TIMESTAMP + interval '1 hour');
            INSERT INTO spring_session VALUES ('{SESSION}','{SESSION}',1,1,1800,9999999999999,'{ACCOUNT}');
            INSERT INTO spring_session_attributes VALUES ('{SESSION}','synthetic',decode('010203','hex'));
            INSERT INTO game_states(account_id,snapshot_json,journey_json)
            VALUES ('{ACCOUNT}','{{"character":{{"totalXp":141}},"synthetic":true}}','{{"activeSkillIds":["swimming"]}}');
            INSERT INTO game_activity_requests VALUES ('{ACCOUNT}','activity-restore','swimming',47);
            INSERT INTO game_boss_requests(account_id,request_id,boss_id,difficulty,tactic,result_json)
            VALUES ('{ACCOUNT}','boss-restore','mosswarden','normal','balanced','{{"synthetic":true}}');
            INSERT INTO billing_memberships VALUES ('{ACCOUNT}',false,1,null,false,null,null);
            INSERT INTO billing_webhook_events VALUES ('synthetic-event',1);
            INSERT INTO billing_deletion_jobs VALUES ('33333333-3333-4333-8333-333333333333',1,1,0);
        """)
        cls.original_state = cls.sql("SELECT snapshot_json FROM game_states;")
        cls.backups = cls.work / "backups"
        cls.run_command([str(ROOT / "deploy/scripts/backup.sh"), str(cls.backups)])
        cls.backup = next(cls.backups.iterdir())

    def restore(self, target, backup=None, *, confirm=True):
        args = [str(ROOT / "deploy/scripts/restore.sh"), "--file", str(backup or self.backup), "--database", target]
        if confirm:
            args.append("--confirm-create-database")
        return self.run_command(args, check=False)

    def test_custom_archive_has_private_permissions_and_contains_game_tables(self):
        self.assertEqual(stat.S_IMODE(self.backup.stat().st_mode), 0o600)
        self.assertEqual(self.backup.read_bytes()[:5], b"PGDMP")
        with self.backup.open("rb") as source:
            result = subprocess.run(["docker", "compose", "--env-file", str(self.env_file),
                                     "-f", str(self.compose_file), "exec", "-T", "db", "pg_restore", "--list"],
                                    env=self.environment, stdin=source, capture_output=True, timeout=30)
        self.assertEqual(result.returncode, 0)
        self.assertIn(b"game_activity_requests", result.stdout)
        self.assertIn(b"billing_memberships", result.stdout)

    def test_restore_preserves_progress_and_revokes_only_recovery_copy_credentials(self):
        target = "everbloom_restore_roundtrip"
        result = self.restore(target)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.sql("SELECT snapshot_json FROM game_states;", target), self.original_state)
        self.assertEqual(self.sql("SELECT skill_id || ':' || minutes FROM game_activity_requests;", target), "swimming:47")
        self.assertEqual(self.sql("SELECT count(*) FROM game_boss_requests;", target), "1")
        self.assertEqual(self.sql("SELECT count(*) FROM billing_memberships;", target), "1")
        self.assertEqual(self.sql("SELECT session_version FROM accounts;", target), "8")
        for table in ("spring_session", "spring_session_attributes", "auth_tokens"):
            self.assertEqual(self.sql("SELECT count(*) FROM " + table + ";", target), "0")
            self.assertEqual(self.sql("SELECT count(*) FROM " + table + ";"), "1")
        self.assertEqual(self.sql("SELECT session_version FROM accounts;"), "7")
        self.assertEqual(self.sql("SELECT pg_get_userbyid(relowner) FROM pg_class WHERE relname='accounts';", target), "everbloom")
        self.assertEqual(self.sql("SELECT rolsuper OR rolcreatedb OR rolcreaterole FROM pg_roles WHERE rolname='everbloom';"), "f")

    def test_refuses_existing_database_without_altering_its_sentinel(self):
        target = "everbloom_restore_existing"
        self.sql("CREATE DATABASE " + target + ";", "postgres")
        self.sql("CREATE TABLE sentinel(value text); INSERT INTO sentinel VALUES ('untouched');", target)
        self.assertNotEqual(self.restore(target).returncode, 0)
        self.assertEqual(self.sql("SELECT value FROM sentinel;", target), "untouched")

    def test_rejects_unconfirmed_live_invalid_and_overlong_targets(self):
        self.assertNotEqual(self.restore("everbloom_restore_unconfirmed", confirm=False).returncode, 0)
        for target in ("everbloom", "everbloom_restore_bad;sql", "everbloom_restore_" + "x" * 64):
            self.assertNotEqual(self.restore(target).returncode, 0)
        self.assertEqual(self.sql("SELECT count(*) FROM pg_database WHERE datname='everbloom_restore_unconfirmed';", "postgres"), "0")
        self.assertEqual(self.sql("SELECT snapshot_json FROM game_states;"), self.original_state)

    def test_rejects_corrupt_archive_before_creating_database(self):
        corrupt = self.work / "corrupt.dump"
        corrupt.write_bytes(b"not a PostgreSQL dump")
        target = "everbloom_restore_corrupt"
        self.assertNotEqual(self.restore(target, corrupt).returncode, 0)
        self.assertEqual(self.sql("SELECT count(*) FROM pg_database WHERE datname='" + target + "';", "postgres"), "0")

    def test_failed_backup_removes_only_its_incomplete_file(self):
        broken = self.work / "missing-db.json"
        broken.write_text(json.dumps({"name": "herovera-test-unused-" + secrets.token_hex(6),
                                      "services": {"db": {"image": "postgres:17-bookworm"}}}))
        existing = set(self.backups.iterdir())
        result = subprocess.run([str(ROOT / "deploy/scripts/backup.sh"), str(self.backups)],
                                env={**self.environment, "EVERBLOOM_COMPOSE_FILE": str(broken)},
                                capture_output=True, timeout=30)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(set(self.backups.iterdir()), existing)


if __name__ == "__main__":
    unittest.main(verbosity=2)
