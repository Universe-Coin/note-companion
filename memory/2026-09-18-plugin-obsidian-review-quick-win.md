# Plugin audit: Obsidian review quick wins (2026-09-18)

## Context
Issue [#478](https://github.com/Nexus-JPF/note-companion/issues/478): Obsidian community directory automated review is failing. After **2026-10-30** a failing latest release is delisted.

`memory/2026-06-10-obsidian-eslint-setup.md` still says ~2000 lint violations. That is stale. A local `pnpm lint:obsidian-scan` of `packages/plugin` (2026-09-18) had **6 errors**, all either:

1. Node builtins in inbox source (`crypto`, `events`) — real, scanner-visible
2. `packages/plugin/dist/main.js` leftover bundle — local only; official scanner ignore is the top-level `dist` name

## Shipped this pass
- Inbox file ids: drop Node `crypto` for a short FNV fingerprint (queue keys are not cryptographic)
- Inbox queue: drop unused Node `EventEmitter` (no listeners anywhere)
- esbuild: `builtinModules` from `node:module` instead of the `builtin-modules` package (scanner lists that package as replaceable)
- Restored vault-root `manifest.json` (iCloud had deleted it; plugin + eslint-plugin-obsidianmd both need it)

## Next review wins (not done)
- Remove unused plugin deps that never import: `natural`, `compromise`, `node-fetch`, `openai`, `lodash`, `form-data`. `moment` is a package.json dep but runtime uses Obsidian `window.moment`.
- Setup-mode selector on General (Cloud / Self-hosted / Ollama) — see `memory/2026-06-09-byok-setup-ux-followups.md`
- Monorepo scan risk: the community scanner ignores a fixed list, not this repo's eslint config. `packages/web` / `packages/mobile` can still pollute the Scorecard if the GitHub source URL is the whole monorepo.
- Preview scan from https://community.obsidian.md/account/plugins/fileorganizer2000 before the next release

## How to apply
```bash
pnpm lint:obsidian-scan
pnpm --filter @file-organizer/plugin test
```
After this pass, `pnpm lint:obsidian-scan` on `packages/plugin` is 0 errors / 0 warnings. Preview the community directory scan before the next release.
