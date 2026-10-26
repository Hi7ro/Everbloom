#!/bin/sh
set -eu
if [ "${1:-}" = '--help' ]; then printf '%s\n' 'Usage: smoke.sh https://beta.example.com'; exit 0; fi
[ "$#" -eq 1 ] || { printf '%s\n' 'Pass the public HTTPS origin.' >&2; exit 2; }
case "$1" in https://*) ;; *) printf '%s\n' 'An HTTPS origin is required.' >&2; exit 2 ;; esac
origin=${1%/}
curl --fail --silent --show-error --max-time 15 "$origin/api/health"
printf '\n'
status=$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 15 "$origin/api/game")
[ "$status" = 401 ] || { printf '%s\n' "Protected game expected 401, received $status." >&2; exit 1; }
curl --fail --silent --show-error --output /dev/null --max-time 15 "$origin/character/create"
curl --fail --silent --show-error --max-time 15 "$origin/runtime-config.json"
printf '\n%s\n' 'Basic HTTP smoke passed. Account/email/game/native device flows still require their own checks.'
