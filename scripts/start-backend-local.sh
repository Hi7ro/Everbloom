#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
if [[ ! -f "$project_dir/.local/beta.env" ]]; then
  echo 'Local beta configuration missing: see docs/BETA_RELEASE.md.' >&2
  exit 1
fi
set -a
source "$project_dir/.local/beta.env"
set +a
cd "$project_dir/backend"
exec ./mvnw spring-boot:run "$@"
