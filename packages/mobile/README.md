# Note Companion - Your AI-Powered Note Organizer

Note Companion is a mobile app that helps you capture, organize, and enhance your notes with AI-powered features.

## Features

- **Smart Note Organization**: Automatically categorize and organize your notes
- **Scan & Extract**: Capture physical notes and extract text with OCR
- **Local-First Storage**: Your notes stay on your device by default
- **Secure Cloud Sync**: Optional encrypted sync across devices
- **AI Enhancement**: Summarize, organize, and improve your notes
- **Simple Sharing**: Share notes with others via links or direct sharing

## Getting Started

**Important:** All commands below must be run from within the `packages/mobile` directory.

1. Copy environment config

   ```bash
   cp .env.example .env
   ```

2. Install dependencies (from monorepo root)

   ```bash
   pnpm install
   ```

3. Start the app

   ```bash
   # For Android
   pnpm android

   # For iOS simulator
   pnpm ios

   # Expo Go (physical device — use tunnel if QR fails)
   pnpm start
   pnpm start:tunnel
   ```

4. Verify toolchain

   ```bash
   pnpm doctor      # expo-doctor — should pass 18/18
   pnpm typecheck
   ```

## TestFlight / App Store (EAS)

Prerequisites: [Expo account](https://expo.dev), Apple Developer account.

```bash
# 0. Log in (once per machine)
bash scripts/eas.sh login

# 1. Push env vars to EAS (production builds)
pnpm setup:eas-secrets

# 2. Link Apple credentials (first time)
bash scripts/eas.sh credentials

# 3. Cloud iOS production build
pnpm run build:ios:remote

# 4. Submit to App Store Connect / TestFlight
pnpm run submit:ios
```

EAS project ID: `b9d83b7e-03c0-46b9-82af-cf9ac6e40235` ([jpfong/note-companion](https://expo.dev/accounts/jpfong/projects/note-companion))  
App Store Connect app ID: `6799668806` (bundle `ai.notecompanion.app`, see `eas.json`)

**Development Bounty:** We are offering $50 to the first person who can refactor the mobile setup to allow building and running *perfectly* directly from the monorepo root (e.g., `pnpm run android` from the top level). See the main project README for more context.

## Privacy & Security

Note Companion prioritizes your privacy:

- Your notes are stored locally by default
- End-to-end encryption for cloud sync
- Transparent data handling practices
- No selling of your data to third parties

## Contributing

We welcome contributions! Please see our CONTRIBUTING.md file for details on how to get involved.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

Need help? Contact us at support@notecompanion.com