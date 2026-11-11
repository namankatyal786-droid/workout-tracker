# 🎮 Mini Games Feature — Development Rules

> These rules govern ALL work on the Mini Games feature.
> Every contributor (human or AI) must follow them.

---

## 1. New Files First, Minimal Touches

- **Create NEW files** wherever possible.
- **Touch existing files ONLY for these specific changes:**
  1. ~~Add a "Mini Games" sidebar item~~ *(already done by teammate)*
  2. Register page rendering for `activePage === "mini-games"` in `src/App.jsx`
  3. Register the games Express router in the server entry file
  4. Add the `MiniGameScore` model to `prisma/schema.prisma`

---

## 2. Follow Existing Patterns Exactly

- Match the existing code style, naming, and formatting.
- Use **vanilla CSS** (dark green theme: `#101512`, `#151d18`, `#254b34`, `#a5e6b9`).
- Use flat BEM-ish class names (e.g. `.games-card`, `.games-grid`).
- No refactoring of existing code. No adding libraries unless strictly needed.

---

## 3. Git Discipline

- Work **only** on branch `feature/mini-games`.
- Small, focused commits: `feat(games): ...` format.
- **Never push** without explicit permission.
- **Never run DB migrations** (`npx prisma migrate dev`) without asking first.

---

## 4. File Boundaries

Only touch files inside these paths:

| Area | Path |
|------|------|
| Unity projects | `unity-games/` |
| Built WebGL games | `public/games/` |
| Game pages (React) | `src/pages/MiniGames.jsx`, `src/pages/GamePlayer.jsx` |
| Game styles | `src/styles/Games.css` |
| API helper | `src/utils/api.js` |
| Server routes | `server/routes/games.js` |
| Server entry | `server/index.js` |
| Prisma schema | `prisma/schema.prisma` (append only) |
| App routing | `src/App.jsx` (add page render only) |

---

## 5. Unity Constraints

- Keep Unity code **simple** — no extra packages.
- **Do NOT add:** ML-Agents, VR/XR, Blender assets, extra documentation plugins.
- I do not know Unity — everything must be **generated from code** using C# Editor scripts (no manual Unity Editor clicks).
- Unity version: **6000.6.7f1**
- Unity path: `/Applications/Unity/Hub/Editor/6000.6.7f1/Unity.app/Contents/MacOS/Unity`
- Build target: **WebGL** (embedded in React via `<iframe>`).

---

## 6. Comments

- Comment code in **Hinglish/English mix** so it's easy to explain in a viva.
- Keep comments short and practical.
