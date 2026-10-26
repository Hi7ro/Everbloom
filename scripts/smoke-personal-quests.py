#!/usr/bin/env python3
"""Local HTTP smoke for personalized quests; deletes its synthetic account on exit.

Uses the development mail outbox only. Never prints credentials, tokens or cookies.
"""
from __future__ import annotations

import argparse
import importlib.util
from pathlib import Path
import sys
import uuid


spec = importlib.util.spec_from_file_location("everbloom_beta_smoke", Path(__file__).with_name("smoke-beta.py"))
if spec is None or spec.loader is None:
    raise RuntimeError("Local smoke helpers could not be loaded")
helpers = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = helpers
spec.loader.exec_module(helpers)
Client, CheckFailed, check = helpers.Client, helpers.CheckFailed, helpers.check
make_account, register_verify, cleanup = helpers.make_account, helpers.register_verify, helpers.cleanup


def preferences(skills):
    return {"interestIds": ["physical", "knowledge", "creative"], "activeSkillIds": skills, "primaryInterestId": "physical"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", type=helpers.loopback_origin, default="http://127.0.0.1:8080")
    args = parser.parse_args()
    base = args.base_url
    account = None
    cleanup_failed = False
    try:
        client = Client(base)
        check(client.call("GET", "/api/health") == {"status": "UP"}, "Database readiness failed")
        client.call("GET", "/api/dev/mail/outbox")
        account = make_account()
        register_verify(client, account)
        owner = client.login(account)["id"]
        initial = client.call("GET", "/api/game", owner=owner)
        check(initial["character"]["totalXp"] == 0, "New account must start at zero XP")
        check([quest["bonusXp"] for quest in initial["quests"]] == [50, 30, 40], "Legacy default quest bonuses changed")

        for skills in (["swimming"], ["swimming", "reading"], ["swimming", "reading", "music"]):
            selected = preferences(skills)
            check(client.call("PUT", "/api/game/journey", selected, owner=owner) == selected, "Saved focus differs from selected skills")
            snapshot = client.call("GET", "/api/game", owner=owner)
            check([quest["skillId"] for quest in snapshot["quests"]] == skills, "Personal quest board contains missing or unselected skills")
            check(all(quest["bonusXp"] == 40 for quest in snapshot["quests"]), "Each personal quest must grant exactly 40 bonus XP")
            check(snapshot["character"]["totalXp"] == 0, "Changing focus must not grant XP")
        check([quest["targetMinutes"] for quest in snapshot["quests"]] == [15, 15, 10], "Swimming, reading and music targets must be 15/15/10 minutes")
        check(all(quest["id"] == f'daily:{snapshot["dayKey"]}:{quest["skillId"]}' for quest in snapshot["quests"]), "Quest identity must be bound to its server day and skill")

        invalid = {**preferences(["recovery"]), "bonusXp": 99999, "targetMinutes": 1}
        client.call("PUT", "/api/game/journey", invalid, expect=400, owner=owner)
        check(client.call("GET", "/api/game", owner=owner) == snapshot, "Rejected preferences changed the game state")
        check(client.call("GET", "/api/game/journey", owner=owner) == preferences(["swimming", "reading", "music"]), "Rejected preferences changed the saved focus")

        command = {"requestId": "personal-quest-" + uuid.uuid4().hex, "skillId": "swimming", "minutes": 15}
        first = client.call("POST", "/api/game/activities", command, owner=owner)
        check(first["reward"] == {"activityXp": 45, "questXp": 40, "damage": 90, "rewardedMinutes": 15, "duplicate": False, "membershipXp": 0}, "Swimming reward differs from the fixed 45+40 XP and 90 damage contract")
        check(first["snapshot"]["character"]["totalXp"] == 85, "First personal quest must result in 85 character XP")
        check(first["snapshot"]["boss"]["hp"] == initial["boss"]["hp"] - 90, "Weekly boss damage differs from the activity-only contract")
        check(first["snapshot"]["quests"][0]["claimed"] is True, "Swimming quest was not completed")

        resumed = Client(base)
        resumed.login(account)
        repeated = resumed.call("POST", "/api/game/activities", command, owner=owner)
        check(repeated["reward"] == {"activityXp": 0, "questXp": 0, "damage": 0, "rewardedMinutes": 0, "duplicate": True, "membershipXp": 0}, "Repeated request granted an additional reward")
        check(repeated["snapshot"] == first["snapshot"], "Repeated request changed the accepted snapshot")

        changed_focus = preferences(["recovery", "languages"])
        resumed.call("PUT", "/api/game/journey", changed_focus, owner=owner)
        check(resumed.call("GET", "/api/game/journey", owner=owner) == changed_focus, "New focus was not saved for future quests")
        check(resumed.call("GET", "/api/game", owner=owner) == first["snapshot"], "Changing focus after activity replaced the frozen board or awarded XP")
        unplanned = resumed.call("POST", "/api/game/activities", {"requestId": "unplanned-" + uuid.uuid4().hex, "skillId": "recovery", "minutes": 10}, owner=owner)
        check(unplanned["reward"]["questXp"] == 0 and unplanned["snapshot"]["character"]["totalXp"] == 105, "Focus switching created a new quest bonus on the same day")
        check(unplanned["snapshot"]["quests"] == first["snapshot"]["quests"], "Unplanned activity changed the frozen quest board")
    except CheckFailed as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return_code = 1
    except Exception:
        print("FAIL: unexpected local quest smoke-test error; no credentials or response bodies were printed.", file=sys.stderr)
        return_code = 1
    else:
        return_code = 0
    finally:
        if account is not None:
            try:
                cleanup(base, account)
            except Exception:
                cleanup_failed = True
                print("Cleanup incomplete for a synthetic quest-smoke account; inspect local server availability without logging tokens.", file=sys.stderr)
    if not return_code and not cleanup_failed:
        print("PASS: personalized 1/2/3-skill quests, fixed targets and bonuses, rejected reward injection, fresh-session retry and same-day board protection. Synthetic account deleted.")
    return 1 if cleanup_failed else return_code


if __name__ == "__main__":
    sys.exit(main())
