# Colony Sound System 📻🎶

Official sound and music broadcast plugin for **Bot Crossing**.

Provides an interactive 3D power antenna speaker tower behind the spaceship, dual-mode 3D spatial and global ambient sound, local Classic Games retro chiptunes (< 2 min shuffle), and a responsive Spotify embed player in a dismissible left-side HUD drawer.

---

## ✨ Features

- **📡 3D Power Antenna & Speaker Tower**:
  - Located in the regolith directly behind the spaceship.
  - Stands ~9.5 units tall (1/3 taller than the spaceship).
  - Four directional horn speakers pointing outward across the colony.
  - Flashing aviation/broadcast beacon synchronized with audio playback.
  - Interactive click raycasting to toggle the Sound System drawer.
- **🌐 Dual-Mode Audio Engine**:
  - **3D Spatial**: Audio radiates in 3D Three.js space from the antenna tower with camera-distance attenuation.
  - **Global Ambient**: Smooth, colony-wide background soundtrack.
- **👾 Classic Games Chiptune Engine**:
  - 100% local, offline-capable 4-channel Web Audio chiptune synthesizer.
  - 15 iconic game themes (Zelda, Mario, Tetris, Mega Man, Sonic, Chrono Trigger, Metroid, etc.).
  - Enforced limit: all tracks under 2 minutes each, played in randomized shuffle order.
  - Animated retro 8-bit EQ visualizer and progress tracking.
- **🎧 Spotify Embedded Player**:
  - Preset gaming OST playlists (Retro Classics, Nintendo Chill Lo-Fi, Orchestral Symphony, Cyberpunk Synthwave).
  - Custom playlist/album URL input support.
- **🗂️ Left-Side Dismissible Drawer**:
  - Slide-out translucent HUD drawer with hotkey (`M`), pull-tab, and tower click trigger.
  - Master volume slider and instant mute toggle.

---

## 🛠️ Usage in Bot Crossing

Register in your `vite.config.js` or through Bot Crossing's Colony Plugin Engine:

```javascript
import musicPlugin from '@beercanlabs/bot-crossing-music'

export default {
  plugins: [
    musicPlugin()
  ]
}
```

---

## 📄 License

MIT © [BeerCanLabs](https://github.com/BeerCanLabs)
