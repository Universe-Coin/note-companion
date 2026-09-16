# Move repo off iCloud Documents (Sep 2026)

**Why:** The monorepo lived inside an iCloud-synced Obsidian vault:

`~/Documents/test-local-vault/test-local-vault/.obsidian/plugins/note-companion`

iCloud Desktop & Documents + Optimize Storage created conflict copies (e.g. `.git/index 2.lock`) and evicted files as dataless stubs (`.pnpm-store`, some `.git/objects`). `mv` out of Documents hung; Finder trash failed with “needs to be downloaded” (`-8013`).

**Current layout**

| Role | Path |
|------|------|
| Git repo (open this in Cursor) | `~/Developer/GitHub/note-companion` |
| Vault plugin load path | `…/.obsidian/plugins/fileorganizer2000` → `.obsidian-dev-plugin/` (thin folder; **not** repo root) |
| Dev plugin artifacts | `~/Developer/GitHub/note-companion/.obsidian-dev-plugin/` symlinks to `main.js`, `manifest.json`, `styles.css`, `data.json` |
| Leftover iCloud copy | `…/.obsidian/plugins/note-companion` (manifest renamed to `manifest.json.icloud-old` so Obsidian does not load it) |

Local files copied into the new checkout: `packages/web/.env.local`, `packages/mobile/.env`, `data.json`, `main.js`, `styles.css`.

**Do not** put the git repo, `node_modules`, or `.pnpm-store` back under `~/Documents`. Keep the test vault in iCloud if you want note sync; only the plugin folder should be a symlink.

**Obsidian freeze fix (Sep 13):** Symlinking the vault directly to the repo root exposed `.git` + `node_modules` (~4GB) to Obsidian. With **Hot Reload** enabled, it watched the entire monorepo and hung on launch. Fix: symlink vault → `.obsidian-dev-plugin/` (only the four plugin files + `.hotreload` for dev reload). Rebuild still writes to repo root; dev folder picks up changes via symlinks.

**After the leftover is deleted:** empty Trash / remove `…/plugins/note-companion` when iCloud will allow it. Until then, develop only from `~/Developer/GitHub/note-companion` and run `pnpm install` there.
