#!/usr/bin/env python3
"""Create one isolated local level-55 QA character immediately before the finale.

Credentials are stored only in ignored .local/endboss-browser-qa.json (0600).
Never touches existing accounts or replaces an existing fixture file.
"""
import importlib.util
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("boss_smoke", ROOT / "scripts/smoke-bosses.py")
boss = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = boss
spec.loader.exec_module(boss)


def main():
    target = ROOT / ".local/endboss-browser-qa.json"
    if target.exists():
        print("Existing endboss QA fixture preserved; no account was changed.")
        return 0
    base = "http://127.0.0.1:8080"
    created = []
    retained = None
    try:
        database = boss.local_database()
        boss.check(boss.Client(base).call("GET", "/api/health") == {"status": "UP"}, "Local API must be ready")
        actor = boss.beta.make_account()
        created.append(actor)
        boss.beta.register_verify(boss.Client(base), actor)
        client = boss.Client(base)
        owner = client.login(actor)["id"]
        initial = client.call("GET", "/api/game")
        client.call("PUT", "/api/game/character", {"name": "Haru", "appearance": initial["character"]["appearance"]})
        client.call("PUT", "/api/game/journey", {"interestIds": ["physical", "mind"],
                    "activeSkillIds": ["calisthenics", "running", "meditation"], "primaryInterestId": "physical"})
        xp = boss.fixture_level(actor, owner, 55, created, database)
        boss.fixture_training(actor, owner, xp, created, database)
        cleared = ["mosswarden", "emberwyrm", "astral-sovereign", "frost-titan"]
        for boss_id in cleared:
            result = boss.fight(client, boss_id, "normal")
            boss.check(result["firstClear"] and result["replay"]["outcome"] == "victory", "QA prerequisite clear must succeed")
        current = client.call("GET", "/api/game")
        boss.check(current["bossProgress"]["clearedEncounterIds"] == [boss_id + ":normal" for boss_id in cleared],
                   "QA fixture must have exactly four preceding clears and no finale clear")
        descriptor = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descriptor, "w") as output:
            json.dump({"email": actor.email, "password": actor.password, "accountId": owner,
                       "apiBaseUrl": base, "fixtureLevel": 55, "characterName": "Haru",
                       "syntheticQaOnly": True, "skillXpShare": .35,
                       "clearedEncounterIds": current["bossProgress"]["clearedEncounterIds"]}, output)
            output.write("\n")
        retained = actor
        print("PASS: isolated level-55 trained character, four verified prerequisite victories, no finale clear. Private credentials: .local/endboss-browser-qa.json (0600).")
        return 0
    except Exception:
        print("FAIL: local endboss fixture creation failed; credentials and token bodies were not printed.", file=sys.stderr)
        return 1
    finally:
        for actor in created:
            if actor is not retained and not actor.deleted:
                boss.beta.cleanup(base, actor)


if __name__ == "__main__":
    sys.exit(main())
