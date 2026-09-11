# Bot Crossing Plugins 🔌🛸

Official plugins and addons monorepo for **[Bot Crossing](https://github.com/BeerCanLabs/bot-crossing)**.

This monorepo houses official plugins that extend the Colony simulation with new structures, security features, telemetry displays, and integrations.

---

## 📦 Packages

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@beercanlabs/bot-crossing-billboard`](packages/billboard)** | 3D Task Board Billboard & Work Tracker (Notion, GitHub, Jira, Linear, Paperclip) | Active |
| **[`@beercanlabs/bot-crossing-rbac`](packages/rbac)** | Role-Based Access Control (Admin, Agent Manager, Spectator) with Pluggable AuthN | Active |

---

## 🛠️ Developing a Plugin

Every plugin implements the standard Bot Crossing Plugin Spec:
- `plugin.json`: Metadata, author, config schema, category.
- `server/`: Express/Vite/Connect middleware, API routes, and backend hooks.
- `client/`: 3D meshes, HUD widgets, or configuration UI components.

---

## 📄 License

MIT © [BeerCanLabs](https://github.com/BeerCanLabs)
