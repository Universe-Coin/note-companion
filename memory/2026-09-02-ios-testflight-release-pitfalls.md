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
| Small splash square, then **black screen**, no crash, UI dead | Splash hidden while the JS tree is empty: (1) production fatal guard swallowed RCTFatal but a second `registerRootComponent` is a **no-op** on native; (2) `StartupGate` still force-hid splash on a timer; (3) Expo Router `Stack` was not mounted until Clerk loaded, so the native screen was a dark-mode black UIViewController; (4) expo-router’s `_internal_preventAutoHideAsync` hides splash on any `ErrorUtils` error. Auth `return null` / layouts with no background | Keep splash until a white surface + root `Stack` are mounted. Report fatals to already-mounted `BootShell` (do not re-register the root). `AuthReadyGate` / `LazyAuthProvider` must **overlay**, not replace, the navigator. Never `return null` on auth screens. Root `backgroundColor: #ffffff` |
| **Could not start** / `undefined is not a function` on white | Module eval (`loadModuleImplementation`). **Build 33** named it: `expo-router/build/views/Toast.js` → EmptyRoute → useScreens → router-store → ExpoRoot. Toast calls `StyleSheet.create` at require-time and imports the `@react-navigation/bottom-tabs` barrel. NativeWind css-interop native `StyleSheet` has no `create()` (web copies RN’s). Clerk was a wrong lead (build 32 line only moved +7). | Shim Toast (dev overlay). Restore RN `StyleSheet.create` on css-interop native stylesheet. Keep module-eval path annotations. |
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
- `boot-shell.tsx` / `lib/boot-runtime.ts` — fatals update the mounted tree (`reportBootFatal`). Do not call `renderRootComponent` twice
- `lazy-auth-provider.tsx` — Clerk import failure → `AuthLoadFailed`; children (root `Stack`) stay mounted while Clerk loads
- `auth-ready-gate.tsx` — overlay spinner/timeout; does not unmount the navigator
- `startup-gate.tsx` — no timed splash hide; always mounts children
- `metro.config.js` — native `@clerk/clerk-js` → `dist/clerk.native.js`; shim expo-router Toast + css-interop native `StyleSheet.create`
- Sign-in/sign-up no longer top-level-import `@clerk/expo` (eager clerk-js at route eval). OAuth lives in lazy `oauth-continue-buttons.tsx`. Loading state is a white spinner, never `return null`

This does **not** fix builds 6+7+9+10 (login `RNSScreen` unmount / view-service abort after submit). That still needs the handoff path to be verified after boot works.

## Do not repeat

- **Do not** test production behavior in Expo Go — native modules (Clerk SecureStore, Apple Sign-In) need EAS/dev/TestFlight build.
- **Do not** push EAS build after editing `package.json` without running `pnpm install` at root.
- **Do not** assume submit CLI stuck = failed — check https://expo.dev/accounts/jpfong/projects/note-companion/submissions
- **Do not** hide splash on font load only — wait for Clerk `isLoaded` or show explicit loading/error.
- **Do not** swallow JS fatals and also force-hide the splash — that is a black screen with no crash. Leave the splash up, or show `BootFailed` via the already-mounted `BootShell`.
- **Do not** call `registerRootComponent` / `renderRootComponent` a second time to recover from a fatal — native ignores it.
- **Do not** return early from root / auth providers without the Expo Router `Stack` — an unmounted navigator is a blank native screen (black in dark mode).
- **Do not** `require.resolve("@clerk/clerk-js")` in Metro for native — Node’s export conditions pick the browser `clerk.js`. Use `dist/clerk.native.js` whenever `platform !== "web"` (Metro often resolves with `null` / `"native"`).
- **Do not** let Clerk’s `react-native-url-polyfill/auto` run in production Hermes — shim it; RN 0.83 already has `URL`.
- **Do not** assume `undefined is not a function` at boot is Clerk — build 33 was `expo-router/build/views/Toast.js` (NativeWind StyleSheet.create / bottom-tabs barrel).
- **Do not** treat every TestFlight `SIGABRT` as the same bug — compare time-to-crash and Thread 0. Builds 6+7+9+10 = post-submit (~22–33s). Build 24 = JS fatal at cold start (~131ms).
- **Do not** expect the JS exception string in a TestFlight `.crash` — use Console.app or a redbox/dev build.

## Related docs

- `packages/mobile/README.md` — basic EAS commands
- `memory/2024-09-25-expo-run-command-directory.md` — run from `packages/mobile`
- `REACT_HOOKS_ERROR_FIX.md` — monorepo React/pnpm hoisting (separate class of bugs)
