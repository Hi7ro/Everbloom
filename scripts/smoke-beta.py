#!/usr/bin/env python3
"""Local-only HTTP/PostgreSQL smoke test. Never prints tokens, cookies or credentials.

Default: temporary synthetic accounts are deleted again, including on a failed check.
--keep-ui-account also creates one verified account without touching /api/game and writes
its credentials exclusively to ignored .local/browser-qa.json with mode 0600.
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
import http.cookiejar
import json
import os
from pathlib import Path
import secrets
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid


class CheckFailed(RuntimeError):
    pass


class Client:
    def __init__(self, base: str):
        self.base = base
        self.cookies = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookies))

    def call(self, method: str, path: str, body=None, expect=200, csrf=True, owner=None):
        headers = {"Accept": "application/json"}
        if owner is not None:
            headers["X-Everbloom-Account"] = owner
        data = None if body is None else json.dumps(body).encode()
        if data is not None:
            headers["Content-Type"] = "application/json"
        if csrf and method not in ("GET", "HEAD"):
            token = self.call("GET", "/api/auth/csrf")
            headers[token["headerName"]] = token["token"]
        request = urllib.request.Request(self.base + path, data=data, headers=headers, method=method)
        try:
            with self.opener.open(request, timeout=20) as response:
                status, payload = response.status, response.read()
        except urllib.error.HTTPError as error:
            status, payload = error.code, error.read()
        except (urllib.error.URLError, TimeoutError):
            raise CheckFailed(f"{method} {path}: local server unavailable") from None
        try:
            parsed = json.loads(payload) if payload else None
        except (ValueError, UnicodeDecodeError):
            raise CheckFailed(f"{method} {path}: expected JSON response") from None
        if status != expect:
            code = parsed.get("code", "") if isinstance(parsed, dict) else ""
            raise CheckFailed(f"{method} {path}: expected {expect}, received {status} {code}")
        return parsed

    def login(self, account):
        user = self.call("POST", "/api/auth/login", {"email": account.email, "password": account.password})
        check(user.get("verified") is True, "Login must return a verified account")
        return user


@dataclass
class Account:
    email: str
    password: str
    verified: bool = False
    deleted: bool = False


def check(condition, message):
    if not condition:
        raise CheckFailed(message)


def loopback_origin(value: str) -> str:
    """One shared boundary for QA commands that create/delete synthetic accounts."""
    base = value.rstrip("/")
    try:
        parsed = urllib.parse.urlsplit(base)
        if (parsed.scheme == "http" and parsed.hostname in ("127.0.0.1", "localhost", "::1")
                and not (parsed.path or parsed.query or parsed.fragment or parsed.username or parsed.password)
                and (parsed.port is None or 1 <= parsed.port <= 65535)):
            return base
    except ValueError:
        pass
    raise argparse.ArgumentTypeError("Only a local HTTP loopback API origin is allowed")


def make_account():
    return Account(f"beta-smoke-{uuid.uuid4().hex}@example.test", "Local-beta-" + secrets.token_urlsafe(24))


def mail_token(client: Client, account: Account, purpose: str):
    messages = client.call("GET", "/api/dev/mail/outbox")
    matches = [mail for mail in messages if mail.get("recipient") == account.email and mail.get("purpose") == purpose]
    check(bool(matches), "Expected local verification/reset mail was not delivered")
    token = urllib.parse.parse_qs(urllib.parse.urlsplit(matches[-1]["link"]).fragment).get("token", [""])[0]
    check(len(token) == 43, "Mail token must contain 256 bits of URL-safe randomness")
    return token


def register_verify(client: Client, account: Account):
    response = client.call("POST", "/api/auth/register", {"email": account.email, "password": account.password}, expect=202)
    check(set(response) == {"message"}, "Registration must not disclose account identity")
    client.call("GET", "/api/auth/me", expect=401)
    token = mail_token(client, account, "verification")
    client.call("POST", "/api/auth/verification/confirm", {"token": token}, expect=204)
    account.verified = True
    return token


def cleanup(base: str, account: Account):
    if account.deleted:
        return
    client = Client(base)
    if not account.verified:
        token = mail_token(client, account, "verification")
        client.call("POST", "/api/auth/verification/confirm", {"token": token}, expect=204)
        account.verified = True
    client.login(account)
    client.call("POST", "/api/account/delete", {"password": account.password}, expect=204)
    account.deleted = True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", type=loopback_origin, default="http://127.0.0.1:8080")
    parser.add_argument("--keep-ui-account", action="store_true")
    args = parser.parse_args()
    base = args.base_url
    accounts = []
    cleanup_failed = False
    try:
        check(Client(base).call("GET", "/api/health") == {"status": "UP"}, "Database readiness failed")
        anonymous = Client(base)
        anonymous.call("GET", "/api/game", expect=401)
        anonymous.call("POST", "/api/auth/register", {"email": "unused@example.test", "password": "unused-test-password"}, expect=403, csrf=False)
        first, second = make_account(), make_account()
        for account in (first, second):
            accounts.append(account)
            verify_token = register_verify(Client(base), account)
            Client(base).call("POST", "/api/auth/verification/confirm", {"token": verify_token}, expect=400)
        a, a_other_session, b = Client(base), Client(base), Client(base)
        a_user, b_user = a.login(first), b.login(second)
        membership = a.call("GET", "/api/billing/membership", owner=a_user["id"])
        check(membership == {"mode": "preview", "active": False, "verifiedAt": None, "expiresAt": None,
              "willRenew": None, "store": None, "managementUrl": None, "characterXpBonusPercent": 0,
              "advancedBosses": True, "purchaseConfig": None}, "Local preview must not sell or fabricate a membership")
        check(a.call("POST", "/api/billing/refresh", {}, owner=a_user["id"]) == membership, "Preview refresh changed free access")
        a.call("POST", "/api/billing/refresh", {"active": True}, expect=400, owner=a_user["id"])
        a.call("POST", "/api/billing/refresh", {}, expect=403, csrf=False, owner=a_user["id"])
        a_other_session.login(first)
        check(a_user["id"] != b_user["id"], "Separate accounts must have distinct owner IDs")
        a_initial, b_initial = a.call("GET", "/api/game"), b.call("GET", "/api/game")
        check(a_initial["character"]["totalXp"] == b_initial["character"]["totalXp"] == 0, "New accounts must start at zero XP")
        check(a_initial["character"]["createdByPlayer"] is False, "New account must require character creation")
        # A stale window still expects A, but its shared session cookie now belongs to B.
        # Even valid CSRF and B's password must not turn this into an operation on B.
        stale_requests = (
            ("GET", "/api/game", None),
            ("GET", "/api/game/journey", None),
            ("GET", "/api/account/export", None),
            ("GET", "/api/billing/membership", None),
            ("POST", "/api/billing/refresh", {}),
            ("POST", "/api/game/activities", {"requestId": "stale-" + uuid.uuid4().hex, "skillId": "running", "minutes": 15}),
            ("POST", "/api/auth/logout", {}),
            ("POST", "/api/account/delete", {"password": second.password}),
        )
        for method, path, body in stale_requests:
            rejected = b.call(method, path, body, expect=409, owner=a_user["id"])
            check(rejected["code"] == "ACCOUNT_CHANGED", "Stale-owner operation was not rejected")
        check(b.call("GET", "/api/auth/me")["id"] == b_user["id"], "Stale logout/deletion altered the other account")
        check(b.call("GET", "/api/game", owner=b_user["id"])["activities"] == [], "Stale activity awarded progress to the other account")
        command = {"requestId": "smoke-" + uuid.uuid4().hex, "skillId": "calisthenics", "minutes": 60}
        activity = a.call("POST", "/api/game/activities", command, owner=a_user["id"])
        check(activity["reward"] == {"activityXp": 240, "questXp": 50, "damage": 480, "rewardedMinutes": 60, "duplicate": False, "membershipXp": 0}, "60-minute activity reward differs from fixed balancing contract")
        # Retrying after a new login uses the original durable command, not a new ID.
        resumed = Client(base)
        resumed.login(first)
        repeat = resumed.call("POST", "/api/game/activities", command, owner=a_user["id"])
        check(repeat["reward"]["duplicate"] is True and repeat["snapshot"]["character"]["totalXp"] == 290, "Idempotent retry must never grant another reward")
        check(len(repeat["snapshot"]["activities"]) == 1, "Fresh-session retry duplicated the activity history")
        a.call("POST", "/api/game/activities", {**command, "minutes": 90}, expect=409)
        a.call("POST", "/api/game/activities", {**command, "requestId": "injected", "accountId": b_user["id"], "xp": 99999}, expect=400)
        b_after = b.call("GET", "/api/game")
        check(b_after["character"]["totalXp"] == 0 and not b_after["activities"], "Another account's progress must remain unchanged")
        exported = a.call("GET", "/api/account/export")
        check(exported["account"]["id"] == a_user["id"] and exported["game"]["snapshot"]["character"]["totalXp"] == 290, "Export must contain only the current owner's account and progress")
        export_text = json.dumps(exported)
        check(all(value not in export_text for value in (first.password, second.email, "password_hash", "token_hash", "session_version")), "Export leaked private authentication data")
        reset = Client(base)
        known = reset.call("POST", "/api/auth/password/request", {"email": first.email}, expect=202)
        unknown = reset.call("POST", "/api/auth/password/request", {"email": f"absent-{uuid.uuid4().hex}@example.test"}, expect=202)
        check(known == unknown, "Reset request disclosed whether an account exists")
        reset_token = mail_token(reset, first, "password-reset")
        new_password = "Changed-beta-" + secrets.token_urlsafe(24)
        reset.call("POST", "/api/auth/password/reset", {"token": reset_token, "password": new_password}, expect=204)
        first.password = new_password
        a.call("GET", "/api/auth/me", expect=401)
        a_other_session.call("GET", "/api/auth/me", expect=401)
        Client(base).call("POST", "/api/auth/password/reset", {"token": reset_token, "password": new_password}, expect=400)
        a = Client(base)
        a.login(first)
        check(a.call("GET", "/api/game")["character"]["totalXp"] == 290, "Password recovery must preserve earned progress")
        a.call("POST", "/api/account/delete", {"password": "incorrect-password-for-delete"}, expect=401)
        a.call("POST", "/api/account/delete", {"password": first.password}, expect=204)
        first.deleted = True
        a.call("GET", "/api/account/export", expect=401)
        b.call("POST", "/api/auth/logout", {}, expect=204)
        b.call("GET", "/api/auth/me", expect=401)
        cleanup(base, second)
        print("PASS: PostgreSQL HTTP account lifecycle, CSRF, stale-window account binding, fixed XP, fresh-session idempotency, export, two-session reset, logout and deletion.")
        if args.keep_ui_account:
            target = Path(__file__).resolve().parents[1] / ".local" / "browser-qa.json"
            if target.exists():
                print("Existing browser QA credentials left unchanged.")
            else:
                ui = make_account()
                accounts.append(ui)
                register_verify(Client(base), ui)
                target.parent.mkdir(mode=0o700, exist_ok=True)
                descriptor = os.open(target, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
                with os.fdopen(descriptor, "w", encoding="utf-8") as output:
                    json.dump({"email": ui.email, "password": ui.password, "apiBaseUrl": base}, output)
                    output.write("\n")
                accounts.remove(ui)
                print("Verified UI account saved privately to .local/browser-qa.json; character creation untouched.")
    except CheckFailed as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return_code = 1
    except Exception:
        print("FAIL: unexpected local smoke-test error; no credentials or response bodies were printed.", file=sys.stderr)
        return_code = 1
    else:
        return_code = 0
    finally:
        for account in accounts:
            if not account.deleted:
                try:
                    cleanup(base, account)
                except Exception:
                    cleanup_failed = True
        if cleanup_failed:
            print("Cleanup incomplete for a synthetic smoke account; investigate local server availability without logging tokens.", file=sys.stderr)
    return 1 if cleanup_failed else return_code


if __name__ == "__main__":
    sys.exit(main())
