# Key Product Flows (KPF.md) — Bot-Crossing Plugins Monorepo

This document maps all plugin packages within **BeerCanLabs / bot-crossing-plugins** to their entry points, failure impacts, and associated automated test files.

---

## 1. Role-Based Access Control (RBAC) Package
- **KPF ID:** `KPF-BCP-001`
- **Description:** Standalone plugin package (`@beercanlabs/bot-crossing-rbac`) providing role definitions (Admin, Agent Manager, Spectator), Cloudflare Zero Trust authentication extraction, strict invite-only access gates, and persistent JSON storage.
- **Entry points:**
  - Package: `packages/rbac/index.js`, `packages/rbac/server/store.js`, `packages/rbac/client/index.js`
- **If it silently breaks:** Uninvited users gain unauthorized access to colony state, or permissions fail to persist across runtime reloads.
- **Test status:** Automated (tested via integration harness in `bot-crossing/test/plugins-and-rbac.test.mjs` and `bot-crossing/test/persistence-and-hydration.test.mjs`).

---

## 2. Custom Agent Cards Package
- **KPF ID:** `KPF-BCP-002`
- **Description:** Standalone plugin package (`@beercanlabs/bot-crossing-agent-cards`) providing custom astronaut cards with live chat, fleet cron schedule inspection, manual routine execution, and provider-agnostic backlog management.
- **Entry points:**
  - Package: `packages/agent-cards/index.js`, `packages/agent-cards/client/index.js`
- **If it silently breaks:** Agent cards fail to render in the 3D viewport, cron triggers fail, or provider task backlogs fail to populate.
- **Test status:** Automated (tested via integration harness in `bot-crossing/test/agent-cards.test.mjs`).

---

## 3. Procedural Task Board Billboard Package
- **KPF ID:** `KPF-BCP-003`
- **Description:** Standalone plugin package (`@beercanlabs/bot-crossing-billboard`) rendering a procedural 3D billboard structure beside the colony landing pad, projecting active tasks and cron schedules into the 3D scene.
- **Entry points:**
  - Package: `packages/billboard/index.js`, `packages/billboard/client/index.js`
- **If it silently breaks:** Billboard 3D mesh fails to render on the colony canvas or task aggregation fails.
- **Test status:** Automated (tested via `bot-crossing/test/task-board.test.mjs`).

---

## 4. Colony Sound System (Music) Package
- **KPF ID:** `KPF-BCP-004`
- **Description:** Standalone plugin package (`@beercanlabs/bot-crossing-music`) rendering a 3D power antenna speaker tower behind the spaceship, dual-mode 3D spatial/ambient audio routing, local classic game chiptunes (< 2m duration shuffle), and a Spotify embed player in a dismissible left HUD drawer.
- **Entry points:**
  - Package: `packages/music/index.js`, `packages/music/server/middleware.js`, `packages/music/client/index.js`, `packages/music/client/tower.js`, `packages/music/client/audio-engine.js`, `packages/music/client/classic-synth.js`, `packages/music/client/drawer.js`
- **If it silently breaks:** Sound tower fails to render, Web Audio fails to initialize, or left drawer UI becomes unresponsive.
- **Test status:** Automated (tested via `test/music.test.mjs`).

