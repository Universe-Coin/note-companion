#!/usr/bin/env bash
# Run eas-cli with nested zod@4 resolution, from packages/mobile (not eas-cli's dir).
set -euo pipefail
MOBILE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$MOBILE_ROOT/../.." && pwd)"
EAS_CLI_ROOT="$REPO_ROOT/node_modules/eas-cli"
export NODE_PATH="$EAS_CLI_ROOT/node_modules${NODE_PATH:+:$NODE_PATH}"
cd "$MOBILE_ROOT"
exec node "$EAS_CLI_ROOT/bin/run" "$@"
