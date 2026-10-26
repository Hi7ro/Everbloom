#!/usr/bin/env python3
"""Read-only V1 preflight. Never executes .env content or prints configured values."""

import argparse
import ipaddress
import json
import re
import stat
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
RESULTS = []
ENV_KEYS = (
    "EVERBLOOM_DOMAIN", "EVERBLOOM_PUBLIC_BASE_URL", "EVERBLOOM_ACME_EMAIL",
    "EVERBLOOM_POSTGRES_ADMIN_PASSWORD", "EVERBLOOM_DB_PASSWORD",
    "EVERBLOOM_SMTP_HOST", "EVERBLOOM_SMTP_PORT", "EVERBLOOM_SMTP_USER",
    "EVERBLOOM_SMTP_PASSWORD", "EVERBLOOM_MAIL_FROM",
    "REVENUECAT_SECRET_API_KEY", "REVENUECAT_WEBHOOK_AUTHORIZATION",
    "REVENUECAT_APPLE_API_KEY", "REVENUECAT_GOOGLE_API_KEY",
)


def report(state, label):
    RESULTS.append(state)
    print(f"{state:7} {label}")


def check(condition, label):
    report("PASS" if condition else "MISSING", label)


def text_file(path):
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeError):
        return ""


def configured(value):
    if not isinstance(value, str) or not value.strip():
        return False
    lowered = value.lower()
    return not any(marker in lowered for marker in (
        "example.", "replace_", "placeholder", "changeme", "dein-", "${",
    ))


def public_origin(value):
    if not configured(value):
        return None
    try:
        parsed = urlsplit(value)
        host = parsed.hostname or ""
        port = parsed.port
        if (parsed.scheme != "https" or parsed.username or parsed.password or
                parsed.path not in ("", "/") or parsed.query or parsed.fragment or
                not re.fullmatch(r"[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?", host) or
                "." not in host or port not in (None, 443) or
                host.endswith((".localhost", ".local", ".test", ".invalid"))):
            return None
        try:
            # A named public host is required for this deployment's TLS/mail setup.
            ipaddress.ip_address(host)
            return None
        except ValueError:
            pass
        return f"https://{host}"
    except ValueError:
        return None


def read_env(path):
    data = {}
    source = text_file(path)
    if not source:
        report("MISSING", "Geschützte Deployment-Umgebung vorhanden und lesbar")
        return data
    check(stat.S_IMODE(path.stat().st_mode) & 0o077 == 0,
          "Deployment-Umgebung nur für Eigentümer zugänglich")
    malformed = False
    for raw in source.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        match = re.fullmatch(r"(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)", line)
        if not match:
            malformed = True
            continue
        key, value = match.groups()
        if key in data:
            malformed = True
        if value.startswith(("'", '"')):
            quote = value[0]
            end = value.rfind(quote)
            if end == 0 or (value[end + 1:].strip() and not value[end + 1:].strip().startswith("#")):
                malformed = True
                continue
            value = value[1:end]
        else:
            value = re.split(r"\s+#", value, maxsplit=1)[0].strip()
        data[key] = value
    check(not malformed, "Deployment-Datei als eindeutige KEY=VALUE-Zeilen lesbar (kein Shellcode)")
    return data


def check_environment(env):
    for key in ENV_KEYS:
        # Labels are from this fixed allowlist, never arbitrary input keys or values.
        check(configured(env.get(key)), key + " gesetzt, ohne erkannten Beispielwert")
    origin = public_origin(env.get("EVERBLOOM_PUBLIC_BASE_URL"))
    check(origin is not None, "Öffentliche Backend-Origin ist eine HTTPS-Domain")
    domain = env.get("EVERBLOOM_DOMAIN", "").lower()
    check(origin is not None and public_origin("https://" + domain) == origin,
          "Domain und öffentliche Backend-Origin passen zusammen")
    check(env.get("EVERBLOOM_BILLING_MODE") == "live", "Billing-Modus für abonnierbare V1 ist live")
    check(env.get("REVENUECAT_ALLOW_SANDBOX", "false").lower() == "false",
          "Sandbox-Berechtigungen für Produktion ausgeschaltet")
    for key, prefix in (("REVENUECAT_APPLE_API_KEY", "appl_"), ("REVENUECAT_GOOGLE_API_KEY", "goog_")):
        check(env.get(key, "").startswith(prefix), key + " hat plattformspezifisches SDK-Präfix")
    check(len(env.get("REVENUECAT_WEBHOOK_AUTHORIZATION", "")) >= 32,
          "Webhook-Authentifizierung mindestens 32 Zeichen lang")
    check(bool(env.get("EVERBLOOM_DB_PASSWORD")) and
          env.get("EVERBLOOM_DB_PASSWORD") != env.get("EVERBLOOM_POSTGRES_ADMIN_PASSWORD"),
          "Getrennte Administrator- und App-Datenbankpasswörter")
    for key, expected in (("REVENUECAT_ENTITLEMENT_ID", "everbloom_plus"),
                          ("REVENUECAT_APPLE_PRODUCT_ID", "everbloom_plus_monthly"),
                          ("REVENUECAT_GOOGLE_PRODUCT_ID", "everbloom_plus:monthly"),
                          ("REVENUECAT_OFFERING_ID", "default")):
        check(env.get(key, expected) == expected, key + " entspricht dem vereinbarten V1-Katalog")
    return origin


def check_native(root, origin):
    configs = (
        ("Android-Bundle", "frontend/android/app/src/main/assets/public/runtime-config.json"),
        ("iOS-Bundle", "frontend/ios/App/App/public/runtime-config.json"),
    )
    for label, relative in configs:
        try:
            config = json.loads(text_file(root / relative))
            valid = isinstance(config, dict) and config.get("schemaVersion") == 1
            target = public_origin(config.get("nativeApiOrigin")) if valid else None
        except (ValueError, TypeError):
            target = None
        check(target is not None, label + ": öffentliche HTTPS-API gebündelt")
        check(target is not None and target == origin, label + ": API entspricht Deployment")
    # Source public/runtime-config.json intentionally stays null for the web build.
    capacitor = text_file(root / "frontend/capacitor.config.ts")
    android = text_file(root / "frontend/android/app/build.gradle")
    ios = text_file(root / "frontend/ios/App/App.xcodeproj/project.pbxproj")
    patterns = (
        (capacitor, r"appId\s*:\s*['\"]([^'\"]+)['\"]"),
        (android, r"applicationId\s+['\"]([^'\"]+)['\"]"),
        (ios, r"PRODUCT_BUNDLE_IDENTIFIER\s*=\s*([^;\s]+)\s*;"),
    )
    ids = [re.findall(pattern, source) for source, pattern in patterns]
    check(all(ids) and len({value.strip('"') for group in ids for value in group}) == 1,
          "Capacitor-/Android-/iOS-App-IDs stimmen überein")
    manifest = text_file(root / "frontend/android/app/src/main/AndroidManifest.xml")
    check(bool(re.search(r'android:launchMode="(?:singleTop|standard)"', manifest)),
          "Android erlaubt Kauf-Rückkehr aus externer Banking-App")
    check(bool(re.search(r"DEVELOPMENT_TEAM\s*=\s*[^;\s]+\s*;", ios)),
          "iOS-Signing-Team im Projekt eingetragen (keine Signaturprüfung)")
    check("com.apple.InAppPurchase" in ios,
          "iOS-In-App-Purchase-Capability im Projekt vermerkt")
    check((root / "frontend/dist/everbloom/browser/index.html").is_file(),
          "Produktions-Web-Artefakt vorhanden (Aktualität separat prüfen)")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", type=Path, default=ROOT / "deploy/.env",
                        help="Geschützte Deployment-Datei; nur lesen, nie ausführen")
    args = parser.parse_args()
    print("V1-Vorprüfung · Dateiprüfung, keine Veröffentlichung und keine Netzwerkanfragen")
    env = read_env(args.env_file)
    origin = check_environment(env)
    check_native(ROOT, origin)
    for label in (
        "Herovera: betriebliche Anmeldung, App-IDs, Betreiberanschrift und Domain-/Supportkontakt bestätigen",
        "Öffentliche Datenschutz-, Nutzungs- und Kontolöschseiten rechtlich/inhaltlich abnehmen",
        "RevenueCat: Stores, Produkte, Offering, Webhook und Keep with original App User ID bestätigen",
        "Öffentliches HTTPS, SMTP-Zustellung sowie Backup/Wiederherstellung nachweisen",
        "Signierte Builds und vollständige Kauf-/Restore-/Ablauftests auf beiden Stores nachweisen",
        "Spiel-/Account-Flows auf physischen Telefonen und Tablets abnehmen",
        "Store-Verträge, Metadaten, Datenschutzangaben und erforderlichen Testtrack abschließen",
    ):
        report("VERIFY", label)
    missing, verify = RESULTS.count("MISSING"), RESULTS.count("VERIFY")
    print(f"NOT_READY · {missing} fehlende/ungeeignete Konfigurationen, {verify} externe Abnahmen.")
    print("Keine Konfigurationswerte ausgegeben. Details: docs/RELEASE_V1.md")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
