#!/usr/bin/env python3
"""Local generation/validation only: never boots a VM or changes host settings."""

import base64
import importlib.util
import json
from pathlib import Path
import stat
import struct
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/prepare-hetzner.py"
spec = importlib.util.spec_from_file_location("hetzner_bootstrap", SCRIPT)
bootstrap = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bootstrap)

# Public RFC 8032 Ed25519 test vector. No private key is generated or read.
PUBLIC_BYTES = bytes.fromhex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a")
KEY = "ssh-ed25519 " + base64.b64encode(struct.pack(">I", 11) + b"ssh-ed25519" + struct.pack(">I", 32) + PUBLIC_BYTES).decode()


class HetznerBootstrapTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="herovera-bootstrap-test-")
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.key_file = self.directory / "fixture.pub"
        self.key_file.write_text(KEY + " test-only@example.invalid\n")
        self.output = self.directory / "prepared"

    def test_generates_private_cloud_config_and_narrow_firewall(self):
        # Public DNS addresses test syntax only; no connection or deployment is made.
        bootstrap.prepare(self.key_file, ["8.8.8.8", "2606:4700:4700::1111", "8.8.8.8/32"], self.output)
        cloud = self.output / "cloud-init.yaml"
        self.assertEqual(cloud.read_text().splitlines()[0], "#cloud-config")
        config = json.loads(cloud.read_text().split("\n", 1)[1])
        self.assertEqual(config["users"], [{"name": "herovera", "shell": "/bin/bash", "lock_passwd": True,
            "sudo": "ALL=(ALL) NOPASSWD:ALL", "ssh_authorized_keys": [KEY]}])
        self.assertIs(config["ssh_pwauth"], False)
        self.assertIs(config["disable_root"], True)
        self.assertIs(config["allow_public_ssh_keys"], False)
        rules = json.loads((self.output / "firewall-rules.json").read_text())
        self.assertEqual([(rule["direction"], rule["protocol"], rule["port"]) for rule in rules],
                         [("in", "tcp", "22"), ("in", "tcp", "80"), ("in", "tcp", "443"), ("in", "udp", "443")])
        self.assertEqual(rules[0]["source_ips"], ["8.8.8.8/32", "2606:4700:4700::1111/128"])
        for rule in rules[1:]:
            self.assertEqual(rule["source_ips"], ["0.0.0.0/0", "::/0"])
        self.assertEqual(stat.S_IMODE(self.output.stat().st_mode), 0o700)
        for item in self.output.iterdir():
            self.assertEqual(stat.S_IMODE(item.stat().st_mode), 0o600)

    def test_rejects_missing_private_multiline_options_and_malformed_public_keys_without_output(self):
        bad = ["", "-----BEGIN OPENSSH PRIVATE KEY-----\nprivate\n-----END OPENSSH PRIVATE KEY-----",
               KEY + "\n" + KEY, 'command="touch /tmp/no" ' + KEY, "ssh-ed25519 AAAA",
               "YOUR_PUBLIC_KEY", "ssh-dss AAAA", "ssh-rsa $(touch /tmp/no)"]
        for value in bad:
            with self.subTest(value=value[:40]):
                self.key_file.write_text(value)
                with self.assertRaises(ValueError):
                    bootstrap.prepare(self.key_file, ["8.8.8.8"], self.output)
                self.assertFalse(self.output.exists())
        with self.assertRaises(ValueError):
            bootstrap.prepare(self.directory / "missing.pub", ["8.8.8.8"], self.output)
        self.assertFalse(self.output.exists())

    def test_refuses_wide_private_reserved_or_missing_admin_ips_before_writing(self):
        for ip in ["0.0.0.0/0", "::/0", "8.8.8.0/24", "2606:4700::/32", "127.0.0.1",
                   "10.0.0.1", "192.168.1.1", "192.0.2.1", "203.0.113.1", "2001:db8::1",
                   "::1", "fc00::1", "fe80::1%en0", "::ffff:8.8.8.8", "224.0.0.1", "ff02::1", "100.64.0.1",
                   "ADMIN_IP", "8.8.8.8; true"]:
            with self.subTest(ip=ip), self.assertRaises(ValueError):
                bootstrap.prepare(self.key_file, [ip], self.output)
            self.assertFalse(self.output.exists())
        with self.assertRaises(ValueError):
            bootstrap.prepare(self.key_file, [], self.output)
        self.assertFalse(self.output.exists())

    def test_rejects_short_rsa_public_key(self):
        # An encoded public modulus tests the size rule; no private material is involved.
        def ssh_field(value):
            return struct.pack(">I", len(value)) + value
        modulus = b"\x00\x80" + b"\x00" * 254 + b"\x01"
        wire = ssh_field(b"ssh-rsa") + ssh_field(b"\x01\x00\x01") + ssh_field(modulus)
        self.key_file.write_text("ssh-rsa " + base64.b64encode(wire).decode())
        with self.assertRaisesRegex(ValueError, "at least 3072"):
            bootstrap.prepare(self.key_file, ["8.8.8.8"], self.output)
        self.assertFalse(self.output.exists())

    def test_existing_output_including_symlink_is_untouched(self):
        self.output.mkdir()
        sentinel = self.output / "cloud-init.yaml"
        sentinel.write_text("keep original")
        with self.assertRaises(FileExistsError):
            bootstrap.prepare(self.key_file, ["8.8.8.8"], self.output)
        self.assertEqual(sentinel.read_text(), "keep original")
        alias = self.directory / "alias"
        alias.symlink_to(self.output, target_is_directory=True)
        with self.assertRaises(FileExistsError):
            bootstrap.prepare(self.key_file, ["8.8.8.8"], alias)
        self.assertEqual(sentinel.read_text(), "keep original")

    def test_shell_syntax_and_signed_repository_before_install_without_running_bootstrap(self):
        shell = bootstrap.cloud_config(KEY)["write_files"][0]["content"]
        result = subprocess.run(["bash", "-n"], input=shell, text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertLess(shell.index('"$VERSION_ID" != 24.04'), shell.index("apt-get install"))
        self.assertLess(shell.index("ssh-keygen -lf"), shell.index("PermitRootLogin no"))
        self.assertLess(shell.index("/usr/sbin/sshd -t"), shell.index("systemctl reload ssh.service"))
        self.assertIn("KbdInteractiveAuthentication no", shell)
        self.assertIn("Signed-By: /etc/apt/keyrings/docker.asc", shell)
        self.assertIn("https://download.docker.com/linux/ubuntu/gpg", shell)
        self.assertIn("Architectures: arm64", shell)
        self.assertNotIn("| sh", shell)
        self.assertNotIn("| bash", shell)
        self.assertNotIn("usermod", shell)

    def test_cli_requires_all_inputs_and_discards_key_comments(self):
        for args in [[], ["--ssh-public-key", str(self.key_file)],
                     ["--ssh-public-key", str(self.key_file), "--admin-ip", "8.8.8.8"]]:
            result = subprocess.run(["python3", str(SCRIPT), *args], text=True, capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(self.output.exists())
        self.key_file.write_text(KEY + " $(touch no-file) untrusted comment\n")
        result = subprocess.run(["python3", str(SCRIPT), "--ssh-public-key", str(self.key_file),
            "--admin-ip", "8.8.8.8", "--output-dir", str(self.output)], text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn("touch", (self.output / "cloud-init.yaml").read_text())
        self.assertIn("Nothing was applied", result.stdout)


if __name__ == "__main__":
    unittest.main(verbosity=2)
