# JARVIS OS v3 — Life Command Dashboard

Voice-first command center for Dr. Thato (Gaborone, BW). Six agents, four modes, five themes, three layouts, PIN lock, a writing library, and an optional real-LLM brain.

**The app lives in [`index.html`](index.html)** — React 18 + Tailwind + Framer Motion via CDN, Web Speech API for voice. No build step. Companion files: `manifest.webmanifest` + `sw.js` + `icon.svg` (PWA install), `proxy-server.js` (optional key-hiding backend). Deploy the folder to Replit as static HTML.

## v3 highlights

- **🌐 Overview mode** — every domain summarized on one screen; Mission Control cards click through to their mode.
- **Calendar + To-Do in every mode** — month calendar merges family events and reminders; the to-do widget filters the shared task ledger per mode.
- **5 themes** — Daylight (default), Avengers, **Spiderman**, **Matrix**, Jarvis Dark. Voice: "Jarvis, spiderman theme".
- **3 layouts** (Settings ⚙) — Grid, **Command Deck** (console + Mission Control pinned left), Focus (single column). Voice: "deck layout".
- **🔒 PIN lock** — set a PIN in Settings → Security; lock via header 🔒 or "Jarvis, lock"; optional idle auto-lock. The PIN hash lives in its own storage key and is never included in backups.
- **📚 Library** — all your writing lives inside Jarvis: multiple docs, per-doc saved versions with track-changes diffing, .md export. "Jarvis, open my library."
- **🎤 Slides Agent (Agent 6)** — "Jarvis, make a presentation about diabetic foot care" → editable deck in the studio → export a standalone HTML deck (presents full-screen with arrow keys), an outline .md for Google Slides / PowerPoint import, or copy it to the clipboard. With an AI key it writes real content; without, it scaffolds the structure.
- **Health & Vitals** — log BP/glucose/steps by widget or voice ("blood pressure 128 over 82").
- **PWA** — installable with offline shell on any HTTPS deploy (Replit). Add to dock/home screen from the browser menu.
- **Proxy support** — run `node proxy-server.js` with your keys as env vars, point Settings → AI Brain → Proxy URL at it, and keys never touch the browser.

---

## Quick start

```bash
cd jarvis-os
python3 -m http.server 5173
# → open http://localhost:5173
```

**Replit:** create an "HTML/CSS/JS" repl, paste `index.html`, hit Run. The published `*.replit.app` URL is HTTPS, so mic + AI Brain + live weather all work there.

> Don't open the file straight from Finder / a file previewer — CDN scripts won't load and you'll see only the background. It needs `http://localhost` or HTTPS.

---

## 🎙 Mic setup (Web Speech API)

1. Use **Chrome or Edge**. Firefox/Safari: the chat console does everything voice does.
2. Page must be on **localhost or HTTPS** (mic is blocked on `file://`).
3. Click the **orb** (or "enable voice"), then **Allow** the mic prompt.
4. Say **"Jarvis, …"** — or turn the wake word off in Settings ⚙ and just talk.
5. Voice, rate and pitch are tunable in Settings ⚙ → Voice.

## 🗣 Commands (built-in, work in every mode)

| Say or type | What happens |
|---|---|
| daily brief · who's next? · any risk flags? | Clinic Agent |
| family brief · what's on this weekend? · date night | Family Agent |
| next book task · open my book · summarize new diabetes papers · book progress | Research Agent |
| hustle review · 3 book monetization ideas · teach me a new skill | Hustle Agent |
| inbox brief · draft reply to Dr. Molefe · book a vacation in Dec under $2000 · day summary | Jarvis PA |
| **remind me to call the lab at 15:30** / **…in 20 minutes** | Reminders (spoken + desktop notification) |
| **set a timer for 25 minutes** · start a focus session | Timer |
| **add task order reagents** · **note that Dube prefers morning slots** · my notes | Tasks & notes |
| what's 15% of 2300 · 340+850+120 | Math |
| search for GLP-1 pricing Botswana · open gmail / calendar / notion / music | Web & apps |
| **open my library** · **make a presentation about…** · **lock** | Library · Slides Agent · Security |
| **blood pressure 128 over 82** · glucose 5.6 · 8500 steps | Health log |
| overview / work / home / builder mode · avengers / spiderman / matrix theme · grid / deck / focus layout | Modes, themes, layouts |
| hello · how are you · tell me a joke · who are you · help | Small talk |

Anything else → **AI Brain** (below) if a key is set, otherwise Jarvis suggests the closest built-in.

## 🧠 AI Brain — make Jarvis truly conversational

Settings ⚙ → **AI Brain**: pick a provider (Claude / OpenAI / Gemini), paste an API key, hit **Test connection**. From then on, anything outside the built-ins goes to the model **with a live snapshot of your whole dashboard** (queue, tasks, book progress, inbox, reminders), so answers are personal, not generic. Conversation memory carries across the last few exchanges.

- Keys live only in your browser's localStorage and are excluded from backups.
- Works on localhost and Replit. The claude.ai artifact sandbox blocks outbound calls, so on the artifact Jarvis falls back to built-ins.
- Get keys: [console.anthropic.com](https://console.anthropic.com) · [platform.openai.com](https://platform.openai.com) · [aistudio.google.com](https://aistudio.google.com)

## 🎨 Themes

Settings ⚙ → Theme, or by voice: "avengers theme" / "spiderman theme" / "matrix theme" / "dark theme" / "bright theme".
- **Daylight** (default) — bright, clinic-hours friendly
- **Avengers** — navy + gold
- **Spiderman** — red on midnight blue, faint web grid
- **Matrix** — terminal green on black
- **Jarvis Dark** — the original midnight glass

Themes are CSS tokens at the top of `index.html` (`:root` / `html[data-theme=…]`) — add another by copying a block and registering it in the `THEMES` array.

## ⏰ Reminders & scheduled briefs

- Reminders widget in every mode; add by voice, text, or the form. Firing = spoken + desktop notification (enable in Settings) + PA log.
- Automatic briefs while the tab is open: **07:00** clinic · **08:00** inbox · **18:00** family · **Fri 16:00** hustle. Edit the `TRIGGERS` array.

## 📁 Files (Mac) bridge

Connectors → **Files (Mac)**, or Settings → Data:
- **Import**: `.ics` (Apple/Google Calendar → family calendar), `.md`/`.txt` (→ Notes), `.json` (restore a Jarvis backup)
- **Export**: full backup `.json`, day summary `.md`, any event as `.ics`, book chapter as `.md`, drafts → **Mail app** via mailto

## 🔑 Data-source API keys

Live-data stubs stay in the `CONFIG` object at the top of the script (Google Sheets / Calendar / Notion / Gmail), each fetch point marked `// TODO`. Weather is already live (Open-Meteo, keyless) and follows the city you set in Settings (auto-geocoded).

## ➕ Adding a command

One entry in the `COMMANDS` array:

```js
{ match: /lab results/,            // regex on the lowercased input
  keys: ["lab","results"],         // words for the fuzzy matcher
  run: (ctx) => { ctx.openModal("book"); return "On screen."; } }
```

`ctx` gives you: `mode setMode data setData log speak openModal setTheme addReminder addReminderRaw addNote addTask exportData settings transcript`. Test by typing first, then by voice.

## Layout

Drag widget headers to reorder; **⤢** cycles size S→M→L; `/` focuses the console; ↑/↓ recalls command history. Everything persists in localStorage; **Reset everything** lives in Settings → Data.
