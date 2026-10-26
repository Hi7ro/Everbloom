#!/usr/bin/env python3
"""Local HTTP/PostgreSQL boss smoke. XP fixtures apply only to newly created synthetic accounts.

This is a QA harness, never a public XP endpoint. No existing account is changed.
--keep-ui-account keeps its new level-130 test character and stores credentials only in
ignored .local/boss-browser-qa.json (0600), never in console output.
"""
from __future__ import annotations
import argparse
import importlib.util
import json
import os
from pathlib import Path
import shlex
import subprocess
import sys
import urllib.parse
import uuid

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("beta_smoke", ROOT / "scripts/smoke-beta.py")
beta = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = beta
spec.loader.exec_module(beta)
Client, check, CheckFailed = beta.Client, beta.check, beta.CheckFailed


def local_database():
    values = {}
    for line in (ROOT / ".local/beta.env").read_text().splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        key, value = line.split("=", 1)
        parsed = shlex.split(value)
        if len(parsed) == 1:
            values[key.strip()] = parsed[0]
    check(values.get("SPRING_PROFILES_ACTIVE") == "dev", "QA fixtures require the local development profile")
    url = urllib.parse.urlsplit(values.get("EVERBLOOM_DB_URL", "").removeprefix("jdbc:"))
    check(url.scheme == "postgresql" and url.hostname in ("127.0.0.1", "localhost")
          and url.path == "/everbloom_beta_dev" and not url.query and not url.username,
          "QA fixtures require the isolated loopback everbloom_beta_dev database")
    env = {**os.environ, "PGPASSWORD": values["EVERBLOOM_DB_PASSWORD"]}
    return ["psql", "-h", url.hostname, "-p", str(url.port or 5432), "-U", values["EVERBLOOM_DB_USER"],
            "-d", "everbloom_beta_dev", "-At", "-v", "ON_ERROR_STOP=1"], env


def fixture_level(account, owner, level, created_accounts, database):
    check(account in created_accounts and account.email.startswith("beta-smoke-") and account.email.endswith("@example.test"),
          "Fixture access is restricted to a synthetic account created in this exact run")
    owner = str(uuid.UUID(owner))
    check(1 <= level <= 130, "Unsupported QA level")
    xp = (level - 1) * 1200 + (level - 1) * (level - 2) * 100
    command, env = database
    sql = """WITH changed AS (
      UPDATE game_states SET snapshot_json = jsonb_set(snapshot_json::jsonb,
        '{character,totalXp}', :'xp'::jsonb)::text
      WHERE account_id = :'owner'::uuid
        AND EXISTS (SELECT 1 FROM accounts WHERE id = :'owner'::uuid AND email = :'email')
      RETURNING account_id
    ) SELECT count(*) FROM changed;
    """
    result = subprocess.run(command + ["-v", "owner=" + owner, "-v", "email=" + account.email, "-v", "xp=" + str(xp)],
                            input=sql, env=env, capture_output=True, text=True)
    check(result.returncode == 0 and result.stdout.strip() == "1", "Fixture refused to update exactly its new synthetic game")
    return xp


def fixture_training(account, owner, total_xp, created_accounts, database):
    check(account in created_accounts and account.email.startswith("beta-smoke-") and account.email.endswith("@example.test"),
          "Training fixtures apply only to this run's synthetic account")
    owner = str(uuid.UUID(owner))
    command, env = database
    skill_xp = int(total_xp * .35 / 6)
    sql = """WITH changed AS (
      UPDATE game_states SET snapshot_json = jsonb_set(snapshot_json::jsonb, '{skills}',
        (SELECT jsonb_agg(jsonb_set(skill, '{totalXp}',
          CASE WHEN skill->>'skillId' IN ('calisthenics','running','bjj','programming','meditation','recovery')
               THEN :'skill_xp'::jsonb ELSE '0'::jsonb END))
         FROM jsonb_array_elements(snapshot_json::jsonb->'skills') skill))::text
      WHERE account_id = :'owner'::uuid
        AND EXISTS (SELECT 1 FROM accounts WHERE id = :'owner'::uuid AND email = :'email')
      RETURNING account_id
    ) SELECT count(*) FROM changed;
    """
    result = subprocess.run(command + ["-v", "owner=" + owner, "-v", "email=" + account.email, "-v", "skill_xp=" + str(skill_xp)],
                            input=sql, env=env, capture_output=True, text=True)
    check(result.returncode == 0 and result.stdout.strip() == "1", "Training fixture must update exactly its own synthetic game")


def fight(client, boss, mode, request_id=None, **kwargs):
    return client.call("POST", "/api/game/bosses/" + boss + "/fight",
                       {"requestId": request_id or uuid.uuid4().hex, "difficulty": mode, "tactic": "balanced"}, **kwargs)


def check_boss_mechanics(replay):
    required = {
        "mosswarden": {"root-strike", "bark-guard"},
        "emberwyrm": {"ember-claw", "ember-charge", "ember-breath"},
        "dusk-prowler": {"dusk-bite", "dusk-leap", "dusk-guard", "dusk-frenzy"},
        "bloodmoon-regent": {"ruby-blade", "bloodmoon-seal", "lunar-eclipse"},
        "astral-sovereign": {"astral-strike", "star-seal", "starburst"},
        "frost-titan": {"frost-strike", "frost-guard", "frost-charge", "frost-crush"},
        "cloud-sovereign": {"staff-combo", "cloud-step", "solar-charge", "solar-strike"},
        "void-devourer": {"void-rend", "gravity-well", "event-horizon"},
        "primordial-dragon": {"primal-claw", "prism-charge", "cosmic-breath", "wing-tempest"},
        "relic-sovereign": {"relic-volley", "royal-aegis", "sovereign-blade", "imperial-charge", "imperial-rain"},
    }
    turns = [turn for turn in replay["turns"] if turn["actor"] == "boss"]
    check({turn.get("abilityId") for turn in turns} == required[replay["boss"]["id"]],
          "Each normal boss must expose its own actual mechanics over HTTP")
    tells = {"event-horizon": "gravity-well", "cosmic-breath": "prism-charge", "imperial-rain": "imperial-charge", "lunar-eclipse": "bloodmoon-seal", "dusk-frenzy": "dusk-guard", "ember-breath": "ember-charge", "starburst": "star-seal", "frost-crush": "frost-charge", "solar-strike": "solar-charge"}
    harmless = {"gravity-well", "prism-charge", "royal-aegis", "imperial-charge", "bloodmoon-seal", "dusk-guard", "bark-guard", "ember-charge", "star-seal", "frost-guard", "frost-charge", "solar-charge"}
    for index, turn in enumerate(turns):
        ability = turn.get("abilityId")
        if ability in tells:
            check(index > 0 and turns[index - 1].get("abilityId") == tells[ability] and turns[index - 1]["damage"] == 0,
                  "Charged abilities must be announced one boss action ahead")
        if ability in harmless:
            check(turn["damage"] == 0 and not turn["critical"], "Guard and charge actions cannot silently damage the hero")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", type=beta.loopback_origin, default="http://127.0.0.1:8080")
    parser.add_argument("--keep-ui-account", action="store_true")
    args = parser.parse_args()
    base = args.base_url
    accounts = []
    retained = None
    cleanup_failed = False
    target = ROOT / ".local/boss-browser-qa.json"
    try:
        database = local_database()
        check(Client(base).call("GET", "/api/health") == {"status": "UP"}, "Local database readiness failed")
        actor = beta.make_account(); accounts.append(actor)
        beta.register_verify(Client(base), actor)
        client = Client(base); owner = client.login(actor)["id"]
        membership = client.call("GET", "/api/billing/membership")
        check(membership["mode"] == "preview" and not membership["active"] and membership["advancedBosses"],
              "The full-campaign smoke requires explicit local billing preview, not a live purchase entitlement")
        initial = client.call("GET", "/api/game")
        check(initial["character"]["totalXp"] == 0, "Real new accounts must still start at zero XP")
        profile = {"name": "Nori", "appearance": initial["character"]["appearance"]}
        for aura in ("rose", "void"):
            locked_profile = {"name": "Nori", "appearance": {**profile["appearance"], "aura": aura}}
            check(client.call("PUT", "/api/game/character", locked_profile, expect=403)["code"] == "AURA_LOCKED",
                  "New characters cannot equip unearned early aura colors")
        client.call("PUT", "/api/game/character", profile)
        client.call("PUT", "/api/game/journey", {"interestIds": ["physical", "mind"], "activeSkillIds": ["calisthenics", "running", "meditation"], "primaryInterestId": "physical"})
        fixture_level(actor, owner, 100, accounts, database)
        check(fight(client, "cloud-sovereign", "normal", expect=403)["code"] == "BOSS_NOT_DISCOVERED",
              "Even level 100 cannot bypass story discovery")
        request_id = uuid.uuid4().hex
        for boss, level in (("mosswarden", 10), ("emberwyrm", 20), ("dusk-prowler", 30), ("frost-titan", 40), ("cloud-sovereign", 50), ("bloodmoon-regent", 60), ("astral-sovereign", 70), ("void-devourer", 80), ("primordial-dragon", 90), ("relic-sovereign", 100)):
            fixture_level(actor, owner, level - 1, accounts, database)
            locked = fight(client, boss, "normal", expect=403)
            check(locked["code"] == "BOSS_LEVEL_LOCKED", "Boss must enforce its server level gate")
            xp = fixture_level(actor, owner, level, accounts, database)
            if boss == "cloud-sovereign":
                untrained = fight(client, boss, "normal")
                check(untrained["replay"]["outcome"] == "defeat" and not untrained["firstClear"] and untrained["reward"] is None,
                      "The final boss cannot be won through level 50 alone and a defeat grants nothing")
                check({turn.get("abilityId") for turn in untrained["replay"]["turns"] if turn["actor"] == "boss"}
                      == {"staff-combo", "cloud-step", "solar-charge", "solar-strike"}, "The final boss must use four real mechanics")
                fixture_training(actor, owner, xp, accounts, database)
            if level >= 80:
                fixture_training(actor, owner, xp, accounts, database)
            result = fight(client, boss, "normal", request_id if boss == "mosswarden" else None)
            check(result["replay"]["outcome"] == "victory" and result["firstClear"] is True and result["duplicate"] is False,
                  "Campaign bosses are beatable at their gates with suitable skills; late bosses reward balanced development")
            check_boss_mechanics(result["replay"])
            if boss == "bloodmoon-regent":
                replay = result["replay"]
                for index, turn in enumerate(replay["turns"]):
                    if turn["actor"] != "boss":
                        continue
                    previous = replay["turns"][index - 1]
                    check(turn["heroHp"] == previous["heroHp"] - turn["damage"], "Regent healing must never restore hero HP")
                    check(turn["bossHp"] == previous["bossHp"] + turn["healing"], "Regent healing must update her actual HP")
                    if turn["healing"]:
                        check(turn.get("abilityId") == "lunar-eclipse" and turn["healing"] <= 28
                              and turn["healing"] <= int(turn["damage"] * .2), "Only announced eclipse grants capped life drain")

            check(result["snapshot"]["character"]["totalXp"] == xp, "A battle must never generate character XP")
            check(result["reward"]["rarity"] == "rare", "Normal first clear must grant its rare cosmetic")
        duplicate = fight(client, "mosswarden", "normal", request_id)
        check(duplicate["duplicate"] and duplicate["replay"]["hero"]["stats"]["level"] == 10, "Retry must return the original level-ten replay")
        fight(client, "mosswarden", "hard", request_id, expect=409)
        repeated = fight(client, "mosswarden", "normal")
        check(not repeated["firstClear"] and repeated["reward"] is None, "New requests cannot farm first-clear loot")
        fixture_level(actor, owner, 39, accounts, database)
        fight(client, "mosswarden", "ultimate", expect=403)
        xp = fixture_level(actor, owner, 40, accounts, database)
        ultimate = fight(client, "mosswarden", "ultimate")
        check(ultimate["replay"]["outcome"] == "victory" and ultimate["reward"]["rarity"] == "mythic", "Ultimate unlocks at forty and grants mythic loot")
        for boss, base_level in (("dusk-prowler", 30), ("frost-titan", 40), ("cloud-sovereign", 50), ("bloodmoon-regent", 60), ("astral-sovereign", 70), ("void-devourer", 80), ("primordial-dragon", 90), ("relic-sovereign", 100)):
            for mode, minimum, recommended, rarity in (("hard", 5, 10, "epic"), ("epic", 15, 20, "legendary"), ("ultimate", 30, 30, "mythic")):
                fixture_level(actor, owner, base_level + minimum - 1, accounts, database)
                check(fight(client, boss, mode, expect=403)["code"] == "BOSS_LEVEL_LOCKED", "New boss modes must enforce their minimum level")
                xp = fixture_level(actor, owner, base_level + recommended + (5 if boss == "cloud-sovereign" else 0), accounts, database)
                if base_level >= 80:
                    fixture_training(actor, owner, xp, accounts, database)
                result = fight(client, boss, mode)
                check(result["replay"]["outcome"] == "victory" and result["firstClear"] and result["reward"]["rarity"] == rarity,
                      "New bosses must award their actual higher-tier cosmetics")
                check(result["snapshot"]["character"]["totalXp"] == xp, "New boss modes cannot grant XP")
                if boss in ("dusk-prowler", "bloodmoon-regent", "void-devourer", "primordial-dragon", "relic-sovereign"):
                    reward = result["reward"]
                    slot = "aura" if reward["slot"] == "aura" else "cosmeticOutfit"
                    appearance = {**profile["appearance"], slot: reward.get("auraId", reward["id"])}
                    equipped = client.call("PUT", "/api/game/character", {"name": "Nori", "appearance": appearance})
                    check(equipped["snapshot"]["character"]["appearance"][slot] == appearance[slot],
                          "Every new boss outfit/aura must actually be equippable after earning it")

        profile["appearance"] = {**profile["appearance"], "cosmeticHair": "cloud-crown", "cosmeticOutfit": "cloud-regalia", "aura": "light"}
        client.call("PUT", "/api/game/character", profile)
        reloaded = client.call("GET", "/api/game")
        check(reloaded["character"]["totalXp"] == xp and reloaded["character"]["appearance"]["cosmeticHair"] == "cloud-crown",
              "Earned cosmetics must persist and be equippable without modifying XP")
        check(len(reloaded["bossProgress"]["unlockedCosmetics"]) == 35, "Ten normal bosses, one forest Ultimate and twenty-four advanced encounters grant thirty-five distinct cosmetics")
        exported = client.call("GET", "/api/account/export")
        check(exported["game"]["snapshot"] == reloaded and len(exported["game"]["bossEncounters"]) == 37,
              "Account export must contain persisted clear state and its own fight history")
        other = beta.make_account(); accounts.append(other)
        beta.register_verify(Client(base), other)
        other_client = Client(base); other_client.login(other)
        other_snapshot = other_client.call("GET", "/api/game")
        check(other_snapshot["bossProgress"]["unlockedCosmetics"] == [] and other_snapshot["character"]["totalXp"] == 0,
              "Boss progress must not leak to another account")
        stolen = {"name": "Other", "appearance": {**other_snapshot["character"]["appearance"], "cosmeticHair": "moss-crown"}}
        check(other_client.call("PUT", "/api/game/character", stolen, expect=403)["code"] == "COSMETIC_LOCKED",
              "Forged cosmetic ownership must be rejected")
        beta.cleanup(base, other)
        if args.keep_ui_account and not target.exists():
            descriptor = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(descriptor, "w") as output:
                json.dump({"email": actor.email, "password": actor.password, "accountId": owner,
                           "apiBaseUrl": base, "fixtureLevel": 130, "characterName": "Nori", "syntheticQaOnly": True}, output)
                output.write("\n")
            retained = actor
            print("New level-130 UI fixture saved privately to .local/boss-browser-qa.json (0600).")
        elif args.keep_ui_account:
            print("Existing browser QA credentials preserved; this run's temporary account will be deleted.")
        print("PASS: local billing preview (no purchase entitlement), real PostgreSQL/API ordered bosses at levels 10 through 100, discovery/level gates, ten distinct real boss mechanics and honest charge tells, cloud finale skill dependence, ultimate gates up to 130, all new reward modes, deterministic retry/conflict, first-clear-only loot, equip/reload/export, account isolation and deletion.")
        code = 0
    except CheckFailed as error:
        print("FAIL: " + str(error), file=sys.stderr); code = 1
    except Exception:
        print("FAIL: local boss smoke failed; no credentials, SQL output or token bodies were printed.", file=sys.stderr); code = 1
    finally:
        for account in accounts:
            if account is not retained and not account.deleted:
                try:
                    beta.cleanup(base, account)
                except Exception:
                    cleanup_failed = True
        if cleanup_failed:
            print("A newly created synthetic account could not be cleaned up; inspect local server availability.", file=sys.stderr)
    return 1 if cleanup_failed else code


if __name__ == "__main__":
    sys.exit(main())
