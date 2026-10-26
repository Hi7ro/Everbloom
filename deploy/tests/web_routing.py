#!/usr/bin/env python3
"""Check the built web image and production Caddy routes with no published ports.

Build both deployment Dockerfiles first. EVERBLOOM_TEST_WEB_IMAGE selects the local
web image (default everbloom-web:local-beta). EVERBLOOM_TEST_API_IMAGE selects the
backend image (default everbloom-backend:local-beta); only its curl client is used.
A synthetic internal API fixture tests
routing only; this does not certify TLS, SMTP or Spring's account implementation.
"""

import json
import ipaddress
import os
from pathlib import Path
import re
import secrets
import subprocess
import tempfile
import unittest


class WebRoutingTest(unittest.TestCase):
    @classmethod
    def compose(cls, *args, check=True, input=None):
        return subprocess.run(["docker", "compose", "-f", str(cls.compose_file), *args],
                              text=True, input=input, capture_output=True, check=check, timeout=90)

    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix="herovera-web-test-")
        cls.addClassCleanup(cls.temp.cleanup)
        directory = Path(cls.temp.name)
        fixture = directory / "api-fixture.Caddyfile"
        fixture.write_text('''http://:8080 {
    respond /api/health `{"status":"UP"}` 200
    respond /api/game `{"code":"UNAUTHENTICATED"}` 401
    respond /api/assert-owner "{http.request.header.X-Everbloom-Account}" 200
    respond /api/assert-ip "{http.request.header.X-Real-IP}" 200
    respond "synthetic-api-not-found" 404
}
''')
        cls.compose_file = directory / "compose.json"
        cls.compose_file.write_text(json.dumps({
            "name": "herovera-web-test-" + secrets.token_hex(6),
            "services": {
                "backend": {"image": "caddy:2-alpine", "read_only": True,
                    "tmpfs": ["/data", "/config", "/tmp"],
                    "volumes": [str(fixture) + ":/etc/caddy/Caddyfile:ro"],
                    "healthcheck": {"test": ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:8080/api/health"],
                                    "interval": "1s", "timeout": "2s", "retries": 20}},
                "web": {"image": os.environ.get("EVERBLOOM_TEST_WEB_IMAGE", "everbloom-web:local-beta"),
                    "pull_policy": "never", "read_only": True, "tmpfs": ["/data", "/config", "/tmp"],
                    "environment": {"EVERBLOOM_DOMAIN": "http://qa.invalid", "EVERBLOOM_ACME_EMAIL": "qa@local.invalid"},
                    "depends_on": {"backend": {"condition": "service_healthy"}},
                    "healthcheck": {"test": ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:8081/healthz"],
                                    "interval": "1s", "timeout": "2s", "retries": 20}},
                "probe": {"image": os.environ.get("EVERBLOOM_TEST_API_IMAGE", "everbloom-backend:local-beta"),
                    "pull_policy": "never", "entrypoint": ["/bin/sh", "-c", "exec sleep 600"], "read_only": True},
            }, "networks": {"default": {"internal": True}},
        }))
        cls.addClassCleanup(lambda: cls.compose("down", "--volumes", "--remove-orphans"))
        cls.compose("up", "-d", "--wait", "--wait-timeout", "45")

    def fetch(self, path, *headers):
        args = ["exec", "-T", "probe", "curl", "--max-time", "10", "--silent", "--show-error",
                "--include", "--header", "Host: qa.invalid"]
        for header in headers:
            args.extend(["--header", header])
        result = self.compose(*args, "http://web" + path)
        response_headers, body = result.stdout.split("\n\n", 1)
        statuses = re.findall(r"HTTP/\S+ (\d+)", response_headers)
        self.assertTrue(statuses, "No HTTP response from container")
        return int(statuses[-1]), body, response_headers.lower()

    def test_spa_deep_link_and_security_headers(self):
        status, body, headers = self.fetch("/character/create")
        self.assertEqual(status, 200)
        self.assertIn("<app-root", body)
        self.assertIn("cache-control: no-store", headers)
        self.assertIn("content-security-policy:", headers)
        self.assertIn("x-content-type-options: nosniff", headers)
        self.assertIn("x-frame-options: deny", headers)

    def test_api_errors_are_never_spa_fallbacks(self):
        for path, expected in (("/api/health", 200), ("/api/game", 401), ("/api/missing", 404)):
            status, body, headers = self.fetch(path)
            self.assertEqual(status, expected)
            self.assertNotIn("<app-root", body)
            self.assertIn("cache-control: no-store", headers)

    def test_preserves_account_assertion_and_overwrites_spoofed_proxy_ip(self):
        status, body, _ = self.fetch("/api/assert-owner", "X-Everbloom-Account: synthetic-owner")
        self.assertEqual((status, body), (200, "synthetic-owner"))
        status, body, _ = self.fetch("/api/assert-ip", "X-Real-IP: 192.0.2.99")
        self.assertEqual(status, 200)
        self.assertNotEqual(body, "192.0.2.99")
        self.assertTrue(ipaddress.ip_address(body).is_private)

    def test_missing_art_is_404_and_hashed_javascript_is_immutable(self):
        self.assertEqual(self.fetch("/art/not-an-actual-asset.webp")[0], 404)
        _, index, _ = self.fetch("/")
        main = re.search(r'src="(main-[^"/]+\.js)"', index)
        self.assertIsNotNone(main)
        status, body, headers = self.fetch("/" + main.group(1))
        self.assertEqual(status, 200)
        self.assertNotIn("<app-root", body)
        self.assertIn("max-age=31536000, immutable", headers)

    def test_runtime_config_is_not_cached_and_contains_no_native_origin(self):
        status, body, headers = self.fetch("/runtime-config.json")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body), {"schemaVersion": 1, "nativeApiOrigin": None})
        self.assertIn("cache-control: no-store", headers)


if __name__ == "__main__":
    unittest.main(verbosity=2)
