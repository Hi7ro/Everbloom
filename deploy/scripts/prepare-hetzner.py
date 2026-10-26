#!/usr/bin/env python3
"""Prepare, never apply, first-boot files for a fresh Hetzner Ubuntu 24.04 ARM64 VPS.

No network calls, key generation, credentials or provider API access. JSON after the
cloud-config header is valid YAML and keeps all supplied key data out of shell code.
"""

import argparse
import ipaddress
import json
import os
from pathlib import Path
import re
import shutil
import subprocess


BOOTSTRAP = r'''#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

# This bootstrap is only for a fresh Ubuntu 24.04 ARM64 server, never an existing host.
test "$(id -u)" = 0
. /etc/os-release
if [ "$ID" != ubuntu ] || [ "$VERSION_ID" != 24.04 ] || [ "$(dpkg --print-architecture)" != arm64 ]; then
    echo 'Expected Ubuntu 24.04 ARM64; refusing to change this host.' >&2
    exit 1
fi

# Confirm cloud-init created a usable non-root account before changing SSH policy.
test "$(id -u herovera)" -gt 0
test -s /home/herovera/.ssh/authorized_keys
ssh-keygen -lf /home/herovera/.ssh/authorized_keys >/dev/null
install -d -m 0755 /etc/ssh/sshd_config.d
ssh_config=/etc/ssh/sshd_config.d/00-herovera.conf
if [ -e "$ssh_config" ]; then
    echo 'SSH policy already exists; refusing to overwrite it.' >&2
    exit 1
fi
cat >"$ssh_config" <<'SSH_POLICY'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
SSH_POLICY
chmod 0644 "$ssh_config"
if ! /usr/sbin/sshd -t; then
    rm -- "$ssh_config"
    echo 'Invalid SSH configuration; policy was not activated.' >&2
    exit 1
fi
# Ubuntu can use socket activation: an inactive service reads the policy on first start.
if systemctl is-active --quiet ssh.service; then
    systemctl reload ssh.service
fi

# Official Docker apt repository, signed packages; no curl-to-shell installer.
install -m 0755 -d /etc/apt/keyrings
curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
    --retry 3 --connect-timeout 15 --max-time 120 \
    https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod 0644 /etc/apt/keyrings/docker.asc
cat >/etc/apt/sources.list.d/docker.sources <<'DOCKER_REPOSITORY'
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: noble
Components: stable
Architectures: arm64
Signed-By: /etc/apt/keyrings/docker.asc
DOCKER_REPOSITORY
apt-get update
apt-get install --yes docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker.service
docker version
docker compose version
install -d -m 0750 -o herovera -g herovera /srv/herovera
echo 'Host bootstrap complete. No app, database, domain or cloud firewall was deployed.'
'''


def read_public_key(path):
    if not path.is_file() or path.stat().st_size > 16384:
        raise ValueError("Supply an existing public SSH key file (at most 16 KiB).")
    value = path.read_text(encoding="utf-8").strip()
    if len(value.splitlines()) != 1:
        raise ValueError("The public key file must contain exactly one public key line.")
    fields = value.split()
    allowed = {"ssh-ed25519", "ssh-rsa", "ecdsa-sha2-nistp256", "ecdsa-sha2-nistp384", "ecdsa-sha2-nistp521"}
    if len(fields) < 2 or fields[0] not in allowed or not re.fullmatch(r"[A-Za-z0-9+/]+={0,2}", fields[1]):
        raise ValueError("Expected an OpenSSH public key, without key options or private key material.")
    if not shutil.which("ssh-keygen"):
        raise ValueError("ssh-keygen is required to validate the existing public key; no key is generated.")
    # Discard comments so they cannot become executable or confusing output metadata.
    key = " ".join(fields[:2])
    result = subprocess.run(["ssh-keygen", "-l", "-f", "/dev/stdin"], input=key + "\n",
                            text=True, capture_output=True, timeout=10)
    if result.returncode != 0:
        raise ValueError("ssh-keygen rejected this public key.")
    if fields[0] == "ssh-rsa" and int(result.stdout.split()[0]) < 3072:
        raise ValueError("Use an RSA key of at least 3072 bits or an Ed25519 key.")
    return key


def admin_sources(values):
    sources = []
    for value in values:
        try:
            # Scoped addresses and networks wider than one host are intentionally unsupported.
            if "%" in value:
                raise ValueError()
            network = ipaddress.ip_network(value, strict=True)
            address = network.network_address
            if (network.prefixlen != network.max_prefixlen or not address.is_global or address.is_multicast
                    or isinstance(address, ipaddress.IPv6Address) and address.ipv4_mapped is not None):
                raise ValueError()
        except ValueError:
            raise ValueError("Each --admin-ip must be a public host address, optionally /32 or /128; no open networks.") from None
        source = str(network)
        if source not in sources:
            sources.append(source)
    if not sources:
        raise ValueError("At least one public administrator IP address is required.")
    return sources


def cloud_config(key):
    return {
        "users": [{"name": "herovera", "shell": "/bin/bash", "lock_passwd": True,
                   "sudo": "ALL=(ALL) NOPASSWD:ALL", "ssh_authorized_keys": [key]}],
        "disable_root": True,
        "ssh_pwauth": False,
        "allow_public_ssh_keys": False,
        "package_update": True,
        "package_upgrade": True,
        "packages": ["ca-certificates", "curl", "openssh-client", "sudo"],
        "write_files": [{"path": "/usr/local/sbin/herovera-bootstrap", "owner": "root:root",
                         "permissions": "0700", "content": BOOTSTRAP}],
        "runcmd": [["/usr/local/sbin/herovera-bootstrap"]],
        "final_message": "Herovera host initialization finished. Check cloud-init status and logs before deployment.",
    }


def firewall_rules(sources):
    public = ["0.0.0.0/0", "::/0"]
    return [
        {"direction": "in", "protocol": "tcp", "port": "22", "source_ips": sources,
         "description": "SSH only from the administrator's verified public IPs"},
        {"direction": "in", "protocol": "tcp", "port": "80", "source_ips": public,
         "description": "HTTP redirect and ACME certificate verification"},
        {"direction": "in", "protocol": "tcp", "port": "443", "source_ips": public,
         "description": "HTTPS"},
        {"direction": "in", "protocol": "udp", "port": "443", "source_ips": public,
         "description": "HTTP/3"},
    ]


def prepare(public_key_file, ips, output):
    # Validate everything before writing. Existing output is never replaced.
    key = read_public_key(public_key_file)
    sources = admin_sources(ips)
    config = "#cloud-config\n" + json.dumps(cloud_config(key), indent=2) + "\n"
    rules = json.dumps(firewall_rules(sources), indent=2) + "\n"
    output.mkdir(mode=0o700, parents=False, exist_ok=False)
    for name, content in (("cloud-init.yaml", config), ("firewall-rules.json", rules)):
        descriptor = os.open(output / name, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            handle.write(content)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ssh-public-key", required=True, type=Path, help="Existing .pub file; never a private key")
    parser.add_argument("--admin-ip", required=True, action="append", help="Your public IPv4/IPv6; repeat for additional host addresses")
    parser.add_argument("--output-dir", required=True, type=Path, help="New private directory outside the repository")
    args = parser.parse_args()
    try:
        prepare(args.ssh_public_key, args.admin_ip, args.output_dir)
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        parser.exit(1, "No deployment performed: " + str(error) + "\n")
    print("Prepared cloud-init.yaml and firewall-rules.json in " + str(args.output_dir))
    print("Nothing was applied. Attach this firewall at server creation, then supply cloud-init as user data.")


if __name__ == "__main__":
    main()
