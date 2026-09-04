# iOS TestFlight / EAS release pitfalls (Sep 2026)

**Context:** First production TestFlight build for `packages/mobile` (`ai.notecompanion.app`).

## Symptoms we hit (and what they mean)

| Symptom | Likely cause | Fix |
|--------|----------------|-----|
| Small centered “Note Companion” on white, app never loads | Native splash stuck — JS never finished boot (Clerk hang, blank startup states, or crash before UI) | Use TestFlight/dev build, not Expo Go. After startup fixes (`StartupGate`, root auth redirect), rebuild. |
| EAS build fails: `pnpm install --frozen-lockfile` / lockfile specifiers don't match package.json | Changed `package.json` without updating `pnpm-lock.yaml` | From repo root: `pnpm install`, commit lockfile, then rebuild |
| `zsh: command not found: pnpm` | Corepack not enabled in that shell / nvm not loaded | `corepack enable` (once per Node install), or `corepack pnpm run …` |
| EAS submit: “waiting for an available submitter” | Expo free-tier submit queue | Wait, or upload IPA via Apple Transporter, or paid Expo plan |
| Build succeeded but app still old behavior | TestFlight still on previous build number | Install latest build from TestFlight after processing |
| **Build 24** dies on open (~131ms). TestFlight: “Crash directly when opening” | JS fatal (`RCTFatal` / `RCTExceptionsManager`). Same SIGABRT costume as build 6, but never reaches UI. Likely `useAuth` outside matching Clerk context, Clerk/`clerk-js` init, or invalid hook call. `.crash` has no JS message | Boot hardening in build 25+ (`useSafeAuth`, error boundary, no eager `@clerk/expo` on routes, production fatal guard). Rebuild + TestFlight to verify. Console.app still useful if it dies again |
| **Build 6, 7, 9, 10** crash ~22–33s after launch after submit. Same phone. 6+7 Aug 9 “login / pwd submit”; 9+10 Aug 11 “after submit” (iOS 26.6) | Same class: TurboModule abort on a worker after submit. 6+7 Thread 0 = `RNSScreen setViewToSnapshot`. 9+10 Thread 0 idle (9 also launching a view service). App UUID `fc516b11…` for 6–9; build 10 is `65381518…` (binary changed, React/Hermes UUIDs unchanged). Predates handoff/keyboard workarounds | `navigateToSessionHandoff` before `setActive`; do not `Keyboard.dismiss` on iOS 26. Still waiting behind the build 24 boot crash |

## Release checklist (run in order)

1. **Env / deps**
   - [ ] Any `package.json` change → `pnpm install` at **monorepo root**
   - [ ] `pnpm --filter note-companion typecheck` (in `packages/mobile`)
   - [ ] Terminal has pnpm: `corepack enable && pnpm --version` → `10.8.1`

2. **EAS secrets** (if env vars changed)
   - [ ] `cd packages/mobile && pnpm setup:eas-secrets`

3. **Build**
   - [ ] `pnpm run build:ios:remote` from `packages/mobile`
   - [ ] If “Install dependencies” fails → lockfile mismatch (step 1)

4. **Submit**
   - [ ] `pnpm run submit:ios` or Transporter if queue stuck

5. **Verify on device**
   - [ ] Open **Note Companion AI** from TestFlight (not Expo Go)
   - [ ] Splash should dismiss within ~5–15s → sign-in or home
   - [ ] If stuck >30s → Console.app crash logs, or reinstall TestFlight build

## Code fixes applied (build 15+)

- `components/startup-gate.tsx` — hide splash only when fonts + Clerk ready; timeout error UI
- `components/root-navigator.tsx` — signed-in cold start → `/(tabs)`
- `app/(auth)/_layout.tsx` — removed signed-in overlay that blocked navigation
- `app/(tabs)/_layout.tsx` — spinner instead of `return null`
- `@clerk/react` added as direct dependency (requires lockfile update)

## Boot hardening (build 25+, vs TestFlight 24 RCTFatal)

- `hooks/use-safe-auth.ts` — catch `useAuth()` throw (missing/mismatched ClerkProvider) on boot layouts
- `components/app-error-boundary.tsx` — render errors show UI instead of SIGABRT
- `index.ts` — production `ErrorUtils` does not call `RCTFatal`; router import failure shows “Could not start”
- `lazy-auth-provider.tsx` — Clerk import failure → `AuthLoadFailed`
- Sign-in/sign-up no longer top-level-import `@clerk/expo` (eager clerk-js at route eval). OAuth lives in lazy `oauth-continue-buttons.tsx`

This does **not** fix builds 6+7+9+10 (login `RNSScreen` unmount / view-service abort after submit). That still needs the handoff path to be verified after boot works.

## Do not repeat

- **Do not** test production behavior in Expo Go — native modules (Clerk SecureStore, Apple Sign-In) need EAS/dev/TestFlight build.
- **Do not** push EAS build after editing `package.json` without running `pnpm install` at root.
- **Do not** assume submit CLI stuck = failed — check https://expo.dev/accounts/jpfong/projects/note-companion/submissions
- **Do not** hide splash on font load only — wait for Clerk `isLoaded` or show explicit loading/error.
- **Do not** treat every TestFlight `SIGABRT` as the same bug — compare time-to-crash and Thread 0. Builds 6+7+9+10 = post-submit (~22–33s). Build 24 = JS fatal at cold start (~131ms).
- **Do not** expect the JS exception string in a TestFlight `.crash` — use Console.app or a redbox/dev build.

## Related docs

- `packages/mobile/README.md` — basic EAS commands
- `memory/2024-09-25-expo-run-command-directory.md` — run from `packages/mobile`
- `REACT_HOOKS_ERROR_FIX.md` — monorepo React/pnpm hoisting (separate class of bugs)
