# Note Companion Product Vision

**Last updated:** 2026-08-05  
**Audience:** Internal (support, prioritization, onboarding). Distill for landing later.

---

## One-liner

Obsidian stays your source of truth. Note Companion handles the messy middle: capture anything, turn it into clean searchable notes, and keep the vault relevant over time.

---

## Problem we solve

Obsidian is the most flexible note capture tool, but most vaults accumulate faster than people can organize them. Voice memos, meeting recordings, PDFs, inbox dumps, and half-finished notes pile up. Generic AI chat apps do not know your vault and do not persist structure where you work.

Note Companion bridges analog and digital capture into a **local-first vault** that stays searchable, linked, and current.

---

## Who it is for

- Researchers, students, and knowledge workers with an overflowing Inbox
- Meeting-heavy workflows (record, transcribe, extract actions)
- People who want AI inside Obsidian, not a separate product
- Privacy-conscious users who prefer self-hosting or local models

---

## Product pillars

### 1. Capture from anywhere

Reduce friction from raw input to vault:

- Audio and video transcription (including large files)
- YouTube and URL content
- OCR for handwritten notes and documents
- Mobile capture and share-to-vault (companion app)

**Principle:** Capture should be effortless. Processing can happen async.

### 2. Organize automatically

Turn messy files into structured notes:

- Inbox monitoring and batch processing
- AI-suggested folders, tags, titles, and templates
- Formatting and metadata enrichment

**Principle:** Suggest and apply, but keep the user in control. Never silently destroy content.

### 3. Keep the vault current

AI should help notes stay relevant, not just get created once:

- Chat with vault context (@files, folders, tags)
- Connect ideas across notes
- Summarize, enhance, and update existing content
- Surface stale or orphaned material (future)

**Principle:** Work on the vault the user already has. Do not fork their workflow into a new app.

### 4. Local-first, vault-aware AI

- Vault data stays on the user's machine during tool execution (client-side Obsidian tools)
- Self-hosting and BYOK supported for users who want full control
- Multiple AI providers (OpenAI, Claude, Gemini, Groq, Ollama, custom endpoints)

**Principle:** Privacy and control are features, not afterthoughts.

---

## What we are building toward (12–18 months)

| Area | Direction |
|------|-----------|
| **Inbox → organized vault** | Smarter defaults, fewer manual steps, reliable batch processing |
| **Meetings** | Record → transcribe → structured note with actions and links |
| **Vault chat** | More local tools, better context, faster iteration on existing notes |
| **Capture surfaces** | Mobile and desktop parity for getting content into the Inbox |
| **Self-host UX** | Clearer setup paths, Hobby-friendly deploy defaults, honest limits docs |
| **Relevance over time** | Proactive linking, summarization, and "what needs attention" signals |

---

## What we are not building

- A replacement for Obsidian (we extend it, not compete with it)
- A standalone note-taking app or general-purpose chatbot
- A cloud-only knowledge base that locks data away from the vault
- An Obsidian mobile plugin (desktop-only by design today)
- Enterprise team collaboration (not current focus)

---

## Cloud vs self-hosted

Both serve the same product vision. The difference is who runs the backend.

| | **Note Companion Cloud** | **Self-hosted** |
|---|---|---|
| **For** | Users who want zero setup | Users who want privacy, BYOK, or custom models |
| **Cost** | Subscription | Free (user pays their AI provider / infra) |
| **Setup** | License key in plugin | Backend `.env` + Server URL in plugin Advanced |
| **Limits** | Token and transcription quotas | User's infra and API limits |

Self-hosting does **not** require a paid Vercel plan. Docker, local Node, or any host works. Vercel Hobby is optional and has stricter function timeouts than Pro.

---

## How we talk about it (support and marketing)

**Elevator pitch:**  
"Turn messy captures into clean, searchable notes inside Obsidian. Transcribe, chat with your vault, and auto-organize, with cloud or self-hosted AI."

**Vision reply (when asked 'where is this going?'):**  
"We believe the best AI for knowledge work is local-first and vault-aware. Obsidian stays your source of truth. Note Companion handles capture, organization, and keeping content relevant over time, with you in control."

**Differentiation vs generic AI chat:**  
We operate on your vault structure (files, folders, tags, links), execute changes locally where possible, and persist results as Obsidian notes, not ephemeral chat threads.

---

## Open questions (revise as we learn)

- How proactive should "keep current" be? (Suggestions vs automatic refresh)
- Best default for new users: cloud trial, self-host wizard, or both equally?
- Which capture surface matters most next: mobile, meetings, or inbox automation?
- Public `/vision` page: publish when this doc has been stable for ~4 weeks

---

## Related docs

- `AGENTS.md` — architecture and implementation patterns
- `README.md` — user-facing feature list and setup
- `SELF-HOSTING.md` — self-host deployment guide
- `memory/2026-06-09-byok-setup-ux-followups.md` — setup UX backlog
