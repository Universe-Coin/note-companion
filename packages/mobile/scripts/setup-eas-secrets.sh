#!/usr/bin/env bash
# Run from packages/mobile after: bash scripts/eas.sh login
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Setting EAS environment variables for note-companion (production)..."
echo "Project: https://expo.dev/accounts/jpfong/projects/note-companion"

set_secret() {
  local name="$1"
  local value="$2"
  bash scripts/eas.sh env:set production \
    --name "$name" \
    --value "$value" \
    --visibility plaintext \
    --non-interactive
  echo "Set $name"
}

set_secret "EXPO_PUBLIC_API_URL" "https://app.notecompanion.ai"
set_secret "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY" "pk_live_Y2xlcmsubm90ZWNvbXBhbmlvbi5haSQ"
set_secret "EXPO_PUBLIC_UPGRADE_CHECKOUT_URL" "https://app.notecompanion.ai/upgrade-from-mobile"

echo ""
echo "Done. Next steps:"
echo "  1. bash scripts/eas.sh credentials   # link Apple Developer, manage certs"
echo "  2. pnpm run build:ios:remote"
echo "  3. pnpm run submit:ios"
