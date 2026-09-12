/**
 * Colony Sound System - Self-Contained Client Plugin Bundle for Bot Crossing
 *
 * Integrates:
 * - 3D Power Antenna & Speaker Tower placed in the dirt behind the spaceship
 * - Web Audio Chiptune Synthesizer playing classic 8-bit/16-bit video game tracks (<2m each)
 * - Spotify embed player with video game soundtrack presets
 * - Dual-mode spatial 3D audio (emitted from tower) and global ambient audio
 * - Slide-out left-side HUD drawer (triggered by tower click, left pull-tab, or 'M' key)
 */

// ── 1. Dynamic Asset & Three.js Loader ───────────────────────────────────────────────

function injectStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById('colony-sound-system-styles')) return
  const link = document.createElement('link')
  link.id = 'colony-sound-system-styles'
  link.rel = 'stylesheet'
  link.href = '/plugins/music/client/styles.css'
  document.head.appendChild(link)
}

let _threePromise = null
async function getThree() {
  if (typeof window !== 'undefined' && window.THREE) return window.THREE
  if (typeof window !== 'undefined' && window.botCrossing?.THREE) return window.botCrossing.THREE
  if (!_threePromise) {
    _threePromise = import('https://esm.sh/three@0.185.0').then((m) => {
      const three = m.default || m
      if (typeof window !== 'undefined') {
        window.THREE = three
      }
      return three
    }).catch((err) => {
      console.error('[ColonySound] Failed to load Three.js from CDN:', err)
      throw err
    })
  }
  return _threePromise
}

// ── 2. Spotify Presets ───────────────────────────────────────────────────────────────

export const SPOTIFY_PRESETS = [
  {
    id: 'retro-gaming',
    name: 'Retro Gaming Classics',
    uri: 'playlist/37i9dQZF1DXdfO26u3IRSZ',
    description: 'Chiptune, 8-bit & 16-bit arcade and console nostalgia',
  },
  {
    id: 'nintendo-chill',
    name: 'Nintendo & Video Game Lo-Fi',
    uri: 'playlist/37i9dQZF1DXdLEN7aqioXM',
    description: 'Relaxed ambient game beats and chill vibes for colony building',
  },
  {
    id: 'epic-symphony',
    name: 'Video Game Symphony',
    uri: 'playlist/37i9dQZF1DWV7cv92d5kpx',
    description: 'Full orchestral game anthems (Zelda, Mario, Skyrim, Halo)',
  },
  {
    id: 'cyberpunk-gaming',
    name: 'Synthwave & Cyberpunk Gaming',
    uri: 'playlist/37i9dQZF1DXdLEN7aqioXM',
    description: 'Dark synth, futuristic bass and electronic pulses',
  },
]

// ── 3. Chiptune Track Library & Synthesizer ──────────────────────────────────────────

const NOTE_FREQS = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98, 'A6': 1760.00,
  '-': 0
}

export const CLASSIC_TRACKS = [
  {
    id: 'zelda-overworld',
    title: 'Overworld Theme',
    game: 'The Legend of Zelda',
    year: 1986,
    bpm: 150,
    durationSec: 64,
    notes: [
      { n: 'A#4', d: 1 }, { n: 'F4', d: 0.75 }, { n: 'A#4', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: 'D5', d: 0.5 }, { n: 'D#5', d: 0.5 },
      { n: 'F5', d: 1.5 }, { n: 'F5', d: 0.5 }, { n: 'F5', d: 0.33 }, { n: 'F#5', d: 0.33 }, { n: 'G#5', d: 0.34 },
      { n: 'A#5', d: 1.5 }, { n: 'A#5', d: 0.5 }, { n: 'A#5', d: 0.33 }, { n: 'G#5', d: 0.33 }, { n: 'F#5', d: 0.34 },
      { n: 'G#5', d: 1 }, { n: 'F#5', d: 0.5 }, { n: 'F5', d: 1 }, { n: 'F5', d: 0.5 },
      { n: 'D#5', d: 0.5 }, { n: 'F5', d: 0.5 }, { n: 'F#5', d: 1 }, { n: 'F5', d: 0.5 }, { n: 'D#5', d: 0.5 },
      { n: 'C#5', d: 0.5 }, { n: 'D#5', d: 0.5 }, { n: 'F5', d: 1 }, { n: 'D#5', d: 0.5 }, { n: 'C#5', d: 0.5 },
      { n: 'C5', d: 0.75 }, { n: 'D5', d: 0.25 }, { n: 'E5', d: 1.5 }, { n: 'G5', d: 0.5 },
      { n: 'F5', d: 2 }
    ],
    bass: ['A#3', 'F3', 'A#3', 'D#3', 'F3', 'A#3', 'F3', 'A#3']
  },
  {
    id: 'mario-overworld',
    title: 'Ground Theme (Overworld)',
    game: 'Super Mario Bros',
    year: 1985,
    bpm: 180,
    durationSec: 52,
    notes: [
      { n: 'E5', d: 0.25 }, { n: 'E5', d: 0.25 }, { n: '-', d: 0.25 }, { n: 'E5', d: 0.25 },
      { n: '-', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'E5', d: 0.5 },
      { n: 'G5', d: 0.75 }, { n: '-', d: 0.75 }, { n: 'G4', d: 0.75 }, { n: '-', d: 0.75 },
      { n: 'C5', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'G4', d: 0.5 }, { n: '-', d: 0.25 },
      { n: 'E4', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'A4', d: 0.5 }, { n: 'B4', d: 0.5 },
      { n: 'A#4', d: 0.25 }, { n: 'A4', d: 0.5 }, { n: 'G4', d: 0.33 }, { n: 'E5', d: 0.33 }, { n: 'G5', d: 0.34 },
      { n: 'A5', d: 0.5 }, { n: 'F5', d: 0.25 }, { n: 'G5', d: 0.25 }, { n: '-', d: 0.25 },
      { n: 'E5', d: 0.5 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.25 }, { n: 'B4', d: 0.75 }
    ],
    bass: ['D3', 'D3', 'D3', 'G3', 'C3', 'G3', 'C3', 'F3', 'C3', 'G3']
  },
  {
    id: 'tetris-korobeiniki',
    title: 'Type A (Korobeiniki)',
    game: 'Tetris',
    year: 1989,
    bpm: 144,
    durationSec: 58,
    notes: [
      { n: 'E5', d: 0.5 }, { n: 'B4', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.5 }, { n: 'C5', d: 0.25 }, { n: 'B4', d: 0.25 },
      { n: 'A4', d: 0.5 }, { n: 'A4', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'E5', d: 0.5 }, { n: 'D5', d: 0.25 }, { n: 'C5', d: 0.25 },
      { n: 'B4', d: 0.75 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.5 }, { n: 'E5', d: 0.5 },
      { n: 'C5', d: 0.5 }, { n: 'A4', d: 0.5 }, { n: 'A4', d: 1 },
      { n: 'D5', d: 0.5 }, { n: 'F5', d: 0.25 }, { n: 'A5', d: 0.5 }, { n: 'G5', d: 0.25 }, { n: 'F5', d: 0.25 },
      { n: 'E5', d: 0.75 }, { n: 'C5', d: 0.25 }, { n: 'E5', d: 0.5 }, { n: 'D5', d: 0.25 }, { n: 'C5', d: 0.25 },
      { n: 'B4', d: 0.5 }, { n: 'B4', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.5 }, { n: 'E5', d: 0.5 },
      { n: 'C5', d: 0.5 }, { n: 'A4', d: 0.5 }, { n: 'A4', d: 1 }
    ],
    bass: ['E3', 'A3', 'E3', 'A3', 'G#3', 'E3', 'A3', 'A3', 'D3', 'D3', 'C3', 'C3', 'E3', 'E3', 'A3', 'A3']
  },
  {
    id: 'megaman2-wily',
    title: "Dr. Wily's Castle Stage 1",
    game: 'Mega Man 2',
    year: 1988,
    bpm: 160,
    durationSec: 62,
    notes: [
      { n: 'D#5', d: 0.25 }, { n: 'D#5', d: 0.25 }, { n: 'D#5', d: 0.25 }, { n: 'F5', d: 0.25 }, { n: 'F#5', d: 0.5 }, { n: 'G#5', d: 0.5 },
      { n: 'A#5', d: 0.5 }, { n: 'G#5', d: 0.5 }, { n: 'F#5', d: 0.5 }, { n: 'F5', d: 0.5 },
      { n: 'D#5', d: 0.5 }, { n: 'A#4', d: 0.5 }, { n: 'D#5', d: 0.5 }, { n: 'F5', d: 0.5 },
      { n: 'F#5', d: 0.75 }, { n: 'G#5', d: 0.25 }, { n: 'F#5', d: 0.5 }, { n: 'F5', d: 0.5 },
      { n: 'D#5', d: 0.5 }, { n: 'C#5', d: 0.5 }, { n: 'B4', d: 0.5 }, { n: 'C#5', d: 0.5 },
      { n: 'D#5', d: 1 }, { n: 'F5', d: 1 }
    ],
    bass: ['D#3', 'D#3', 'B2', 'B2', 'C#3', 'C#3', 'A#2', 'A#2']
  },
  {
    id: 'sonic-greenhill',
    title: 'Green Hill Zone',
    game: 'Sonic the Hedgehog',
    year: 1991,
    bpm: 140,
    durationSec: 68,
    notes: [
      { n: 'C5', d: 0.25 }, { n: 'B4', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: 'G4', d: 0.5 }, { n: 'E4', d: 0.5 },
      { n: 'A4', d: 0.5 }, { n: 'C5', d: 0.5 }, { n: 'B4', d: 1 },
      { n: 'G4', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'B4', d: 0.5 }, { n: 'C5', d: 0.5 }, { n: 'D5', d: 0.5 },
      { n: 'E5', d: 0.75 }, { n: 'D5', d: 0.25 }, { n: 'C5', d: 1 },
      { n: 'C5', d: 0.5 }, { n: 'D5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'G5', d: 0.5 },
      { n: 'F5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'D5', d: 1 }
    ],
    bass: ['C3', 'G3', 'A3', 'E3', 'F3', 'C3', 'G3', 'G3']
  },
  {
    id: 'zelda-fairy-fountain',
    title: "Great Fairy's Fountain",
    game: 'The Legend of Zelda',
    year: 1991,
    bpm: 120,
    durationSec: 48,
    notes: [
      { n: 'D4', d: 0.2 }, { n: 'F#4', d: 0.2 }, { n: 'A4', d: 0.2 }, { n: 'B4', d: 0.2 }, { n: 'C#5', d: 0.2 }, { n: 'E5', d: 0.2 }, { n: 'F#5', d: 0.2 }, { n: 'A5', d: 0.2 },
      { n: 'D5', d: 0.2 }, { n: 'F#5', d: 0.2 }, { n: 'A5', d: 0.2 }, { n: 'B5', d: 0.2 }, { n: 'A5', d: 0.4 }, { n: 'F#5', d: 0.4 },
      { n: 'C4', d: 0.2 }, { n: 'E4', d: 0.2 }, { n: 'G4', d: 0.2 }, { n: 'B4', d: 0.2 }, { n: 'C5', d: 0.2 }, { n: 'E5', d: 0.2 }, { n: 'G5', d: 0.2 }, { n: 'B5', d: 0.2 },
      { n: 'C6', d: 0.4 }, { n: 'G5', d: 0.4 }, { n: 'E5', d: 0.4 }, { n: 'C5', d: 0.4 }
    ],
    bass: ['D3', 'D3', 'C3', 'C3', 'B2', 'B2', 'A#2', 'A#2']
  },
  {
    id: 'castlevania-vampire-killer',
    title: 'Vampire Killer',
    game: 'Castlevania',
    year: 1986,
    bpm: 148,
    durationSec: 54,
    notes: [
      { n: 'D5', d: 0.5 }, { n: 'D5', d: 0.25 }, { n: 'E5', d: 0.25 }, { n: 'F5', d: 0.5 }, { n: 'D5', d: 0.5 },
      { n: 'G5', d: 0.5 }, { n: 'F5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'C#5', d: 0.5 },
      { n: 'D5', d: 0.5 }, { n: 'A4', d: 0.5 }, { n: 'F4', d: 0.5 }, { n: 'G4', d: 0.5 },
      { n: 'A4', d: 1 }, { n: 'C#5', d: 1 }
    ],
    bass: ['D3', 'D3', 'A#2', 'A#2', 'C3', 'C3', 'A2', 'A2']
  },
  {
    id: 'pokemon-pallet-town',
    title: 'Pallet Town & Route 1',
    game: 'Pokemon Red & Blue',
    year: 1996,
    bpm: 116,
    durationSec: 56,
    notes: [
      { n: 'G4', d: 0.5 }, { n: 'B4', d: 0.5 }, { n: 'D5', d: 0.5 }, { n: 'C5', d: 0.25 }, { n: 'B4', d: 0.25 },
      { n: 'A4', d: 0.5 }, { n: 'D5', d: 0.5 }, { n: 'B4', d: 1 },
      { n: 'G4', d: 0.5 }, { n: 'A4', d: 0.5 }, { n: 'B4', d: 0.5 }, { n: 'C5', d: 0.5 },
      { n: 'D5', d: 0.75 }, { n: 'C5', d: 0.25 }, { n: 'B4', d: 0.5 }, { n: 'A4', d: 0.5 },
      { n: 'G4', d: 1.5 }
    ],
    bass: ['G3', 'D3', 'G3', 'C3', 'G3', 'D3', 'G3', 'G3']
  },
  {
    id: 'chrono-trigger',
    title: 'Chrono Trigger Theme',
    game: 'Chrono Trigger',
    year: 1995,
    bpm: 132,
    durationSec: 60,
    notes: [
      { n: 'C5', d: 0.5 }, { n: 'D#5', d: 0.5 }, { n: 'F5', d: 0.5 }, { n: 'G5', d: 1 },
      { n: 'F5', d: 0.5 }, { n: 'D#5', d: 0.5 }, { n: 'D5', d: 0.5 }, { n: 'C5', d: 1 },
      { n: 'A#4', d: 0.5 }, { n: 'C5', d: 0.5 }, { n: 'D#5', d: 0.5 }, { n: 'F5', d: 0.75 }, { n: 'G5', d: 0.25 },
      { n: 'G#5', d: 1 }, { n: 'G5', d: 1 }
    ],
    bass: ['C3', 'G3', 'G#3', 'D#3', 'A#2', 'F3', 'G3', 'C3']
  },
  {
    id: 'donkey-kong-jungle',
    title: 'Jungle Groove',
    game: 'Donkey Kong Country',
    year: 1994,
    bpm: 110,
    durationSec: 66,
    notes: [
      { n: 'F4', d: 0.5 }, { n: 'G#4', d: 0.5 }, { n: 'A#4', d: 0.75 }, { n: 'C5', d: 0.25 },
      { n: 'A#4', d: 0.5 }, { n: 'G#4', d: 0.5 }, { n: 'F4', d: 1 },
      { n: 'D#4', d: 0.5 }, { n: 'F4', d: 0.5 }, { n: 'G#4', d: 0.5 }, { n: 'F4', d: 0.5 },
      { n: 'C5', d: 1 }, { n: 'A#4', d: 1 }
    ],
    bass: ['F2', 'F2', 'G#2', 'A#2', 'C3', 'A#2', 'G#2', 'F2']
  },
  {
    id: 'mario-underground',
    title: 'Underground Theme',
    game: 'Super Mario Bros',
    year: 1985,
    bpm: 100,
    durationSec: 40,
    notes: [
      { n: 'C4', d: 0.3 }, { n: 'C5', d: 0.3 }, { n: 'A3', d: 0.3 }, { n: 'A4', d: 0.3 },
      { n: 'A#3', d: 0.3 }, { n: 'A#4', d: 0.6 },
      { n: 'C4', d: 0.3 }, { n: 'C5', d: 0.3 }, { n: 'A3', d: 0.3 }, { n: 'A4', d: 0.3 },
      { n: 'A#3', d: 0.3 }, { n: 'A#4', d: 0.6 }
    ],
    bass: ['C2', 'C2', 'F#2', 'F#2', 'F2', 'F2', 'E2', 'D#2']
  },
  {
    id: 'kirby-green-greens',
    title: 'Green Greens',
    game: "Kirby's Dream Land",
    year: 1992,
    bpm: 156,
    durationSec: 46,
    notes: [
      { n: 'C5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'A5', d: 0.5 },
      { n: 'G5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'C5', d: 1 },
      { n: 'D5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: 'F5', d: 0.5 }, { n: 'G5', d: 0.5 },
      { n: 'E5', d: 1 }, { n: 'C5', d: 1 }
    ],
    bass: ['C3', 'G3', 'C3', 'G3', 'F3', 'C3', 'G3', 'C3']
  },
  {
    id: 'metroid-brinstar',
    title: 'Brinstar Depths',
    game: 'Metroid',
    year: 1986,
    bpm: 128,
    durationSec: 54,
    notes: [
      { n: 'E4', d: 0.5 }, { n: 'G4', d: 0.5 }, { n: 'A#4', d: 0.5 }, { n: 'B4', d: 0.5 },
      { n: 'G4', d: 0.5 }, { n: 'E4', d: 0.5 }, { n: 'F4', d: 1 },
      { n: 'E4', d: 0.5 }, { n: 'G4', d: 0.5 }, { n: 'B4', d: 0.5 }, { n: 'C5', d: 0.5 },
      { n: 'B4', d: 1 }, { n: 'G4', d: 1 }
    ],
    bass: ['E2', 'E2', 'F2', 'F2', 'G2', 'G2', 'E2', 'E2']
  },
  {
    id: 'zelda-lost-woods',
    title: "Saria's Song (Lost Woods)",
    game: 'The Legend of Zelda',
    year: 1998,
    bpm: 140,
    durationSec: 50,
    notes: [
      { n: 'F4', d: 0.33 }, { n: 'A4', d: 0.33 }, { n: 'B4', d: 0.67 },
      { n: 'F4', d: 0.33 }, { n: 'A4', d: 0.33 }, { n: 'B4', d: 0.67 },
      { n: 'F4', d: 0.33 }, { n: 'A4', d: 0.33 }, { n: 'B4', d: 0.33 }, { n: 'E5', d: 0.33 }, { n: 'D5', d: 0.67 },
      { n: 'B4', d: 0.33 }, { n: 'C5', d: 0.33 }, { n: 'B4', d: 0.33 }, { n: 'G4', d: 0.33 }, { n: 'E4', d: 1 }
    ],
    bass: ['F3', 'C3', 'F3', 'G3', 'D3', 'G3', 'A3', 'E3']
  },
  {
    id: 'fzero-mutecity',
    title: 'Mute City',
    game: 'F-Zero',
    year: 1990,
    bpm: 172,
    durationSec: 64,
    notes: [
      { n: 'C5', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'D#5', d: 0.25 }, { n: 'F5', d: 0.5 }, { n: 'F#5', d: 0.25 },
      { n: 'G5', d: 0.5 }, { n: 'A#5', d: 0.5 }, { n: 'C6', d: 1 },
      { n: 'A#5', d: 0.5 }, { n: 'G5', d: 0.5 }, { n: 'F5', d: 0.5 }, { n: 'D#5', d: 0.5 },
      { n: 'C5', d: 1.5 }
    ],
    bass: ['C3', 'C3', 'D#3', 'F3', 'G3', 'G3', 'A#2', 'C3']
  }
]

export class ChiptuneEngine {
  constructor(audioContext, outputNode) {
    this.ctx = audioContext
    this.outputNode = outputNode
    this.isPlaying = false
    this.currentTrackIndex = 0
    this.shuffle = true
    this.stepTimer = null
    this.noteStep = 0
    this.bassStep = 0
    this.startTime = 0
    this.playlistOrder = []
    this.onTrackChange = null
    this.onTick = null

    // Create channel gain nodes
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 1.0
    this.masterGain.connect(this.outputNode)

    this._initPlaylist()
  }

  _initPlaylist() {
    this.playlistOrder = Array.from({ length: CLASSIC_TRACKS.length }, (_, i) => i)
    if (this.shuffle) {
      this._shufflePlaylist()
    }
  }

  _shufflePlaylist() {
    for (let i = this.playlistOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.playlistOrder[i], this.playlistOrder[j]] = [this.playlistOrder[j], this.playlistOrder[i]]
    }
  }

  getCurrentTrack() {
    const trackIdx = this.playlistOrder[this.currentTrackIndex] || 0
    return CLASSIC_TRACKS[trackIdx]
  }

  setOutputNode(node) {
    this.masterGain.disconnect()
    this.outputNode = node
    this.masterGain.connect(this.outputNode)
  }

  setVolume(vol) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05)
    }
  }

  play() {
    if (this.isPlaying) return
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    this.isPlaying = true
    this.startTime = Date.now()
    this.noteStep = 0
    this.bassStep = 0
    this._scheduleNextNote()
    this.onTrackChange?.(this.getCurrentTrack())
  }

  pause() {
    this.isPlaying = false
    if (this.stepTimer) {
      clearTimeout(this.stepTimer)
      this.stepTimer = null
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlistOrder.length
    this.noteStep = 0
    this.bassStep = 0
    this.startTime = Date.now()
    if (this.stepTimer) clearTimeout(this.stepTimer)
    if (this.isPlaying) {
      this._scheduleNextNote()
    }
    this.onTrackChange?.(this.getCurrentTrack())
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlistOrder.length) % this.playlistOrder.length
    this.noteStep = 0
    this.bassStep = 0
    this.startTime = Date.now()
    if (this.stepTimer) clearTimeout(this.stepTimer)
    if (this.isPlaying) {
      this._scheduleNextNote()
    }
    this.onTrackChange?.(this.getCurrentTrack())
  }

  _scheduleNextNote() {
    if (!this.isPlaying) return

    const track = this.getCurrentTrack()
    const beatSec = 60 / track.bpm

    // Check track duration limit (all tracks guaranteed < 2 min)
    const elapsed = (Date.now() - this.startTime) / 1000
    if (elapsed >= track.durationSec) {
      this.nextTrack()
      return
    }

    const noteObj = track.notes[this.noteStep % track.notes.length]
    const noteDuration = (noteObj.d || 0.5) * beatSec

    // Play Melody Note (Square Wave)
    if (noteObj.n && noteObj.n !== '-' && NOTE_FREQS[noteObj.n]) {
      this._playSquareNote(NOTE_FREQS[noteObj.n], noteDuration * 0.85)
    }

    // Play Bass Note (Triangle Wave) every other beat
    if (track.bass && track.bass.length > 0 && this.noteStep % 2 === 0) {
      const bassNote = track.bass[this.bassStep % track.bass.length]
      if (bassNote && NOTE_FREQS[bassNote]) {
        this._playTriangleNote(NOTE_FREQS[bassNote], noteDuration * 1.5)
      }
      this.bassStep++
    }

    // Play Noise Drum Beat
    if (this.noteStep % 2 === 1) {
      this._playNoiseSnare(0.06)
    } else if (this.noteStep % 4 === 0) {
      this._playNoiseKick(0.08)
    }

    this.noteStep++
    this.onTick?.({
      elapsed,
      total: track.durationSec,
      track
    })

    this.stepTimer = setTimeout(() => {
      this._scheduleNextNote()
    }, noteDuration * 1000)
  }

  _playSquareNote(freq, duration) {
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, now)

      // Classic 8-bit snappy ADSR envelope
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(now)
      osc.stop(now + duration + 0.05)
    } catch {}
  }

  _playTriangleNote(freq, duration) {
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.24, now)
      gain.gain.linearRampToValueAtTime(0.01, now + duration)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(now)
      osc.stop(now + duration + 0.05)
    } catch {}
  }

  _playNoiseSnare(duration) {
    try {
      const now = this.ctx.currentTime
      const bufferSize = this.ctx.sampleRate * duration
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4))
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 1200

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.masterGain)

      noise.start(now)
    } catch {}
  }

  _playNoiseKick(duration) {
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.frequency.setValueAtTime(140, now)
      osc.frequency.exponentialRampToValueAtTime(30, now + duration)

      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(now)
      osc.stop(now + duration)
    } catch {}
  }
}

// ── 4. 3D Antenna Tower Mesh ────────────────────────────────────────────────────────

const METAL_DARK = 0x3d414a
const METAL_FRAME = 0x6e7380
const ACCENT_CYAN = 0x00e5ff
const SPEAKER_HORN = 0x242831
const SPEAKER_CONE = 0x111317
const BEACON_COLOR = 0xff5533

export class AntennaTower {
  constructor(THREE, scene, shipPos, planet, onClick) {
    this.THREE = THREE || (typeof window !== 'undefined' ? window.THREE : null)
    const T = this.THREE
    this.scene = scene
    this.shipPos = shipPos
    this.planet = planet
    this.onClick = onClick

    this.group = new T.Group()
    this.group.name = 'antenna-speaker-tower'
    scene.add(this.group)

    this.hovered = false
    this.materials = []

    this._calculatePosition()
    this._buildMesh()
    this._positionOnTerrain()
  }

  _calculatePosition() {
    const THREE = this.THREE
    // Ship is located at shipPos and faces inward toward (0,0,0).
    // "Behind the spaceship" is outward away from colony center.
    const outwardDir = (this.shipPos && (this.shipPos.x !== 0 || this.shipPos.z !== 0))
      ? this.shipPos.clone().normalize()
      : new THREE.Vector3(-1, 0, 0)
    // Snug offset ~3.4 units directly behind the spaceship hull (just behind rear engine bells & landing legs)
    this.position = new THREE.Vector3().addVectors(
      this.shipPos,
      outwardDir.clone().multiplyScalar(3.4)
    )
    this.group.position.copy(this.position)

    // Face toward the colony center / camera
    this.group.rotation.y = Math.atan2(this.shipPos.x, this.shipPos.z)
  }

  _positionOnTerrain() {
    let y = 0
    const bc = typeof window !== 'undefined' ? window.botCrossing : null
    const colony = bc?.colony

    // 1. Exact height sampler from terrain mesh
    if (colony?.terrain?.userData?.heightAt) {
      y = colony.terrain.userData.heightAt(this.position.x, this.position.z)
    } else if (colony?.ship?.group?.position?.y !== undefined) {
      y = colony.ship.group.position.y
    }

    // 2. Physical raycast straight down against terrain mesh geometry
    if (colony?.terrain && this.THREE) {
      try {
        const THREE = this.THREE
        const rayOrigin = new THREE.Vector3(this.position.x, 50, this.position.z)
        const rayDir = new THREE.Vector3(0, -1, 0)
        const raycaster = new THREE.Raycaster(rayOrigin, rayDir)
        const hits = raycaster.intersectObject(colony.terrain, true)
        if (hits.length > 0) {
          y = hits[0].point.y
        }
      } catch {}
    }

    // Seat firmly into ground with footpads planted in regolith
    this.position.y = y - 0.04
    this.group.position.y = this.position.y
  }

  _buildMesh() {
    const THREE = this.THREE
    const metalMat = new THREE.MeshStandardMaterial({
      color: METAL_FRAME,
      roughness: 0.35,
      metalness: 0.85,
    })
    const darkMat = new THREE.MeshStandardMaterial({
      color: METAL_DARK,
      roughness: 0.5,
      metalness: 0.7,
    })
    const hornMat = new THREE.MeshStandardMaterial({
      color: SPEAKER_HORN,
      roughness: 0.3,
      metalness: 0.9,
    })
    const coneMat = new THREE.MeshStandardMaterial({
      color: SPEAKER_CONE,
      roughness: 0.7,
      metalness: 0.3,
    })
    const coilMat = new THREE.MeshStandardMaterial({
      color: ACCENT_CYAN,
      emissive: ACCENT_CYAN,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.8,
    })
    const beaconMat = new THREE.MeshStandardMaterial({
      color: BEACON_COLOR,
      emissive: BEACON_COLOR,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    })

    this.materials.push(metalMat, darkMat, hornMat, coneMat, coilMat, beaconMat)
    this.beaconMat = beaconMat

    // 1. Foundation footpads & angled support pylons (Y: 0.0 to 2.4)
    const pylonOffsets = [
      { x: -1.2, z: -1.2, a: Math.PI / 4 },
      { x: 1.2, z: -1.2, a: -Math.PI / 4 },
      { x: 1.2, z: 1.2, a: -3 * Math.PI / 4 },
      { x: -1.2, z: 1.2, a: 3 * Math.PI / 4 },
    ]

    for (const p of pylonOffsets) {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.18, 8), darkMat)
      pad.position.set(p.x, 0.09, p.z)
      this.group.add(pad)

      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.5, 6), metalMat)
      leg.position.set(p.x * 0.55, 1.2, p.z * 0.55)
      leg.rotation.z = (p.x > 0 ? -1 : 1) * 0.26
      leg.rotation.x = (p.z > 0 ? 1 : -1) * 0.26
      this.group.add(leg)
    }

    // 2. Central Equipment Base Housing (Y: 1.8 to 2.8)
    const baseHousing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 1.4), darkMat)
    baseHousing.position.set(0, 2.3, 0)
    this.group.add(baseHousing)

    const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), coilMat)
    panel.position.set(0, 2.3, 0.71)
    this.group.add(panel)

    // 3. Tapered Main Antenna Mast (Y: 2.8 to 8.2)
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.55, 5.4, 8), metalMat)
    mast.position.set(0, 5.5, 0)
    this.group.add(mast)

    for (let h = 3.5; h <= 7.5; h += 1.3) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48 - (h - 3.5) * 0.035, 0.05, 6, 12), metalMat)
      ring.position.set(0, h, 0)
      ring.rotation.x = Math.PI / 2
      this.group.add(ring)
    }

    // High-voltage Insulator Power Coils (Glowing Cyan)
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.07, 8, 16), coilMat)
    coil.position.set(0, 4.8, 0)
    coil.rotation.x = Math.PI / 2
    this.group.add(coil)

    // 4. Quad Broadcast Speakers (Y: 7.8 to 8.4)
    this.speakerGroup = new THREE.Group()
    this.speakerGroup.position.set(0, 8.0, 0)
    this.group.add(this.speakerGroup)

    const hornAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
    for (const angle of hornAngles) {
      const hornAssembly = new THREE.Group()
      hornAssembly.rotation.y = angle

      const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 6), metalMat)
      bracket.rotation.z = Math.PI / 2
      bracket.position.set(0.3, 0, 0)
      hornAssembly.add(bracket)

      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.8, 12, 1, true), hornMat)
      horn.rotation.z = -Math.PI / 2 - 0.22
      horn.position.set(0.85, -0.08, 0)
      hornAssembly.add(horn)

      const driver = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), coneMat)
      driver.position.set(0.55, -0.02, 0)
      hornAssembly.add(driver)

      this.speakerGroup.add(hornAssembly)
    }

    // 5. Pinnacle Antenna Rod & Warning Beacon (Y: 8.2 to 9.5)
    const pinnacleRod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1.4, 6), metalMat)
    pinnacleRod.position.set(0, 8.9, 0)
    this.group.add(pinnacleRod)

    const beaconSphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), beaconMat)
    beaconSphere.position.set(0, 9.5, 0)
    this.group.add(beaconSphere)

    const hitBox = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 9.6, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    hitBox.position.set(0, 4.8, 0)
    hitBox.name = 'antenna-tower-hitbox'
    this.group.add(hitBox)
    this.hitBox = hitBox
  }

  setHover(hovered) {
    if (this.hovered === hovered) return
    this.hovered = hovered
    const THREE = this.THREE
    for (const m of this.materials) {
      if (m === this.beaconMat) continue
      if (hovered) {
        m.emissive = new THREE.Color(0x005577)
        m.emissiveIntensity = 0.35
      } else {
        m.emissive = new THREE.Color(0x000000)
        m.emissiveIntensity = 0
      }
    }
  }

  tick(timeSec, isPlaying = false) {
    // Keep firmly grounded if terrain loads or changes
    if (!this._grounded || (Math.floor(timeSec) % 2 === 0 && Math.abs(timeSec - (this._lastCheck || 0)) > 1)) {
      this._lastCheck = timeSec
      this._positionOnTerrain()
      if (this.group.position.y < 1.0) this._grounded = true
    }

    if (!this.beaconMat) return
    const pulseSpeed = isPlaying ? 6.0 : 1.8
    const intensity = isPlaying
      ? 0.4 + 0.6 * Math.sin(timeSec * pulseSpeed) ** 2
      : (Math.sin(timeSec * pulseSpeed) > 0.6 ? 1.0 : 0.2)
    this.beaconMat.emissiveIntensity = intensity
    if (isPlaying && this.speakerGroup) {
      this.speakerGroup.rotation.y += 0.002
    }
  }
}

// ── 5. Audio Engine ─────────────────────────────────────────────────────────────────

export class AudioEngine {
  constructor(THREE, camera, towerObject) {
    this.THREE = THREE || (typeof window !== 'undefined' ? window.THREE : null)
    this.camera = camera
    this.towerObject = towerObject
    this.mode = 'spatial'
    this.volume = 0.65
    this.muted = false

    const T = this.THREE

    if (T && T.AudioListener) {
      try {
        this.listener = new T.AudioListener()
        if (this.camera) {
          this.camera.add(this.listener)
        }
        this.positionalAudio = new T.PositionalAudio(this.listener)
        this.positionalAudio.setRefDistance(10)
        this.positionalAudio.setMaxDistance(60)
        this.positionalAudio.setRolloffFactor(1.4)
        this.positionalAudio.setDistanceModel('exponential')
        if (this.towerObject) {
          this.towerObject.add(this.positionalAudio)
        }
      } catch (err) {
        console.warn('[ColonySound] PositionalAudio setup warning:', err)
      }
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    this.ctx = (this.listener && this.listener.context) || new AudioContextClass()

    this.ambientGain = this.ctx.createGain()
    this.ambientGain.gain.value = this.volume
    this.ambientGain.connect(this.ctx.destination)

    this.inputRouter = this.ctx.createGain()
    this.inputRouter.gain.value = 1.0

    this.chiptune = new ChiptuneEngine(this.ctx, this.inputRouter)
    this._routeAudio()
  }

  setSpatialMode(mode) {
    if (this.mode === mode) return
    this.mode = mode
    this._routeAudio()
  }

  _routeAudio() {
    this.inputRouter.disconnect()
    if (this.mode === 'spatial' && this.positionalAudio) {
      try {
        this.positionalAudio.setNodeSource(this.inputRouter)
      } catch {
        if (this.positionalAudio.gain) {
          this.inputRouter.connect(this.positionalAudio.gain)
        } else {
          this.inputRouter.connect(this.ambientGain)
        }
      }
    } else {
      this.inputRouter.connect(this.ambientGain)
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol))
    const effectiveVol = this.muted ? 0 : this.volume
    const now = this.ctx.currentTime
    this.ambientGain.gain.setTargetAtTime(effectiveVol, now, 0.05)
    if (this.positionalAudio?.gain) {
      this.positionalAudio.gain.gain.setTargetAtTime(effectiveVol, now, 0.05)
    }
  }

  setMuted(muted) {
    this.muted = Boolean(muted)
    this.setVolume(this.volume)
  }

  toggleMute() {
    this.setMuted(!this.muted)
    return this.muted
  }

  resumeContext() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }
}

// ── 6. Slide-Out Music Drawer UI ────────────────────────────────────────────────────

export class MusicDrawer {
  constructor(audioEngine, onModeChange) {
    this.audioEngine = audioEngine
    this.onModeChange = onModeChange
    this.isOpen = false
    this.activeSource = 'classic'
    this.activeSpotifyUri = 'playlist/37i9dQZF1DXdfO26u3IRSZ'

    this._createDOM()
    this._wireEvents()
    this._syncInitialConfig()
  }

  _createDOM() {
    // 1. Left-edge pull tab
    this.tabEl = document.createElement('div')
    this.tabEl.className = 'music-drawer-tab'
    this.tabEl.title = 'Colony Sound System (M)'
    this.tabEl.innerHTML = `
      <span class="tab-icon">📻</span>
      <span class="tab-label">Colony Sound</span>
    `
    document.body.appendChild(this.tabEl)

    // 2. Sliding Drawer
    this.drawerEl = document.createElement('div')
    this.drawerEl.className = 'music-drawer'
    this.drawerEl.innerHTML = `
      <div class="music-drawer-header">
        <div class="music-drawer-title">
          <span>📻 Colony Sound System</span>
          <span class="badge">Online</span>
        </div>
        <button class="music-close-btn" title="Close drawer (M)">✕</button>
      </div>

      <div class="music-drawer-content">
        <div class="music-control-group">
          <div class="music-group-label">Audio Source</div>
          <div class="music-segmented source-switcher">
            <button type="button" data-source="classic" class="active">👾 Classic Games</button>
            <button type="button" data-source="spotify">🎧 Spotify</button>
          </div>
        </div>

        <div class="music-control-group">
          <div class="music-group-label">
            <span>Audio Mode</span>
            <span id="mode-status-lbl" style="color: #00e5ff; font-weight: 500;">3D Spatial</span>
          </div>
          <div class="music-segmented mode-switcher">
            <button type="button" data-mode="spatial" class="active">📡 3D Spatial</button>
            <button type="button" data-mode="ambient">🌐 Global Ambient</button>
          </div>
        </div>

        <div class="music-control-group">
          <div class="music-group-label">
            <span>Master Volume</span>
            <span id="vol-pct-lbl">65%</span>
          </div>
          <div class="volume-row">
            <button type="button" class="mute-btn" id="music-mute-btn" title="Toggle Mute">🔊</button>
            <input type="range" class="volume-slider" id="music-vol-slider" min="0" max="100" value="65" />
          </div>
        </div>

        <div id="classic-player-view" class="now-playing-card">
          <div class="track-meta">
            <div class="track-subtitle" id="track-game-lbl">The Legend of Zelda (1986)</div>
            <div class="track-title" id="track-title-lbl">Overworld Theme</div>
          </div>

          <div class="visualizer-bars" id="eq-bars">
            <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
            <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
            <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
          </div>

          <div class="track-progress-wrap">
            <div class="track-progress-bar">
              <div class="track-progress-fill" id="track-progress-fill"></div>
            </div>
            <div class="track-time-labels">
              <span id="track-elapsed-lbl">0:00</span>
              <span id="track-total-lbl">1:04</span>
            </div>
          </div>

          <div class="transport-row">
            <button type="button" class="transport-btn" id="track-prev-btn" title="Previous Track">⏮</button>
            <button type="button" class="transport-btn play-btn" id="track-play-btn" title="Play / Pause">▶</button>
            <button type="button" class="transport-btn" id="track-next-btn" title="Next Track (Random)">⏭</button>
          </div>
        </div>

        <div id="spotify-player-view" class="spotify-wrap" style="display: none;">
          <div class="music-group-label">Spotify Game Playlists</div>
          <div class="spotify-preset-grid" id="spotify-presets">
            ${(SPOTIFY_PRESETS || []).map(p => `
              <button type="button" class="spotify-preset-btn" data-uri="${p.uri}">
                🎵 ${p.name}
              </button>
            `).join('')}
          </div>

          <iframe
            id="spotify-iframe"
            class="spotify-embed-iframe"
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DXdfO26u3IRSZ?utm_source=generator&theme=0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy">
          </iframe>

          <div class="music-group-label" style="margin-top: 4px;">Custom Playlist / Track URL</div>
          <div class="spotify-input-row">
            <input type="text" class="spotify-input" id="spotify-custom-input" placeholder="Paste Spotify URL or URI..." />
            <button type="button" class="spotify-load-btn" id="spotify-load-btn">Load</button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(this.drawerEl)
  }

  _wireEvents() {
    this.tabEl.addEventListener('click', () => this.toggle())
    this.drawerEl.querySelector('.music-close-btn').addEventListener('click', () => this.close())

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'm' || e.key === 'M') {
        this.toggle()
      }
    })

    const sourceBtns = this.drawerEl.querySelectorAll('.source-switcher button')
    sourceBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        sourceBtns.forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
        this._setSource(btn.dataset.source)
      })
    })

    const modeBtns = this.drawerEl.querySelectorAll('.mode-switcher button')
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
        const mode = btn.dataset.mode
        this.audioEngine.setSpatialMode(mode)
        this.drawerEl.querySelector('#mode-status-lbl').textContent =
          mode === 'spatial' ? '3D Spatial' : 'Global Ambient'
        this.onModeChange?.(mode)
        this._persistConfig({ spatialMode: mode })
      })
    })

    const volSlider = this.drawerEl.querySelector('#music-vol-slider')
    const volLbl = this.drawerEl.querySelector('#vol-pct-lbl')
    const muteBtn = this.drawerEl.querySelector('#music-mute-btn')

    volSlider.addEventListener('input', (e) => {
      const vol = Number(e.target.value) / 100
      volLbl.textContent = `${Math.round(vol * 100)}%`
      this.audioEngine.setVolume(vol)
      this._persistConfig({ volume: vol })
    })

    muteBtn.addEventListener('click', () => {
      const muted = this.audioEngine.toggleMute()
      muteBtn.textContent = muted ? '🔇' : '🔊'
      volLbl.textContent = muted ? 'Muted' : `${Math.round(this.audioEngine.volume * 100)}%`
      this._persistConfig({ muted })
    })

    const playBtn = this.drawerEl.querySelector('#track-play-btn')
    const nextBtn = this.drawerEl.querySelector('#track-next-btn')
    const prevBtn = this.drawerEl.querySelector('#track-prev-btn')

    playBtn.addEventListener('click', () => {
      this.audioEngine.resumeContext()
      this.audioEngine.chiptune.toggle()
      this._updatePlayButton()
    })

    nextBtn.addEventListener('click', () => {
      this.audioEngine.resumeContext()
      this.audioEngine.chiptune.nextTrack()
      this._updatePlayButton()
    })

    prevBtn.addEventListener('click', () => {
      this.audioEngine.resumeContext()
      this.audioEngine.chiptune.prevTrack()
      this._updatePlayButton()
    })

    this.audioEngine.chiptune.onTrackChange = (track) => {
      this._updateTrackInfo(track)
      this._updatePlayButton()
    }

    this.audioEngine.chiptune.onTick = ({ elapsed, total }) => {
      this._updateProgress(elapsed, total)
      this._animateVisualizer(this.audioEngine.chiptune.isPlaying)
    }

    const presetBtns = this.drawerEl.querySelectorAll('.spotify-preset-btn')
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const uri = btn.dataset.uri
        this._loadSpotifyUri(uri)
      })
    })

    const loadBtn = this.drawerEl.querySelector('#spotify-load-btn')
    const customInput = this.drawerEl.querySelector('#spotify-custom-input')
    loadBtn.addEventListener('click', () => {
      const val = customInput.value.trim()
      if (val) {
        this._loadSpotifyCustom(val)
      }
    })

    this._updateTrackInfo(this.audioEngine.chiptune.getCurrentTrack())
  }

  _setSource(source) {
    this.activeSource = source
    const classicView = this.drawerEl.querySelector('#classic-player-view')
    const spotifyView = this.drawerEl.querySelector('#spotify-player-view')

    if (source === 'spotify') {
      classicView.style.display = 'none'
      spotifyView.style.display = 'flex'
      if (this.audioEngine.chiptune.isPlaying) {
        this.audioEngine.chiptune.pause()
        this._updatePlayButton()
      }
    } else {
      classicView.style.display = 'block'
      spotifyView.style.display = 'none'
    }

    this._persistConfig({ activeSource: source })
  }

  _loadSpotifyUri(uri) {
    this.activeSpotifyUri = uri
    const iframe = this.drawerEl.querySelector('#spotify-iframe')
    iframe.src = `https://open.spotify.com/embed/${uri}?utm_source=generator&theme=0`
    this._persistConfig({ spotifyUri: uri })
  }

  _loadSpotifyCustom(input) {
    let uri = input
    const match = input.match(/open\.spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/)
    if (match) {
      uri = `${match[1]}/${match[2]}`
    }
    this._loadSpotifyUri(uri)
  }

  _updateTrackInfo(track) {
    if (!track) return
    this.drawerEl.querySelector('#track-title-lbl').textContent = track.title
    this.drawerEl.querySelector('#track-game-lbl').textContent = `${track.game} (${track.year})`
    this.drawerEl.querySelector('#track-total-lbl').textContent = this._fmtTime(track.durationSec)
  }

  _updateProgress(elapsed, total) {
    const pct = Math.min(100, (elapsed / (total || 1)) * 100)
    const fill = this.drawerEl.querySelector('#track-progress-fill')
    const elapsedLbl = this.drawerEl.querySelector('#track-elapsed-lbl')
    if (fill) fill.style.width = `${pct}%`
    if (elapsedLbl) elapsedLbl.textContent = this._fmtTime(elapsed)
  }

  _animateVisualizer(isPlaying) {
    const bars = this.drawerEl.querySelectorAll('.eq-bar')
    bars.forEach((bar) => {
      const h = isPlaying ? Math.floor(Math.random() * 20 + 4) : 4
      bar.style.height = `${h}px`
    })
  }

  _updatePlayButton() {
    const playBtn = this.drawerEl.querySelector('#track-play-btn')
    const isPlaying = this.audioEngine.chiptune.isPlaying
    playBtn.textContent = isPlaying ? '⏸' : '▶'
    playBtn.title = isPlaying ? 'Pause' : 'Play'
    if (!isPlaying) {
      this._animateVisualizer(false)
    }
  }

  _fmtTime(sec) {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  async _syncInitialConfig() {
    try {
      const res = await fetch('/api/music/config')
      if (res.ok) {
        const { config } = await res.json()
        if (config) {
          if (config.activeSource) {
            const btn = this.drawerEl.querySelector(`[data-source="${config.activeSource}"]`)
            if (btn) btn.click()
          }
          if (config.spatialMode) {
            const btn = this.drawerEl.querySelector(`[data-mode="${config.spatialMode}"]`)
            if (btn) btn.click()
          }
          if (typeof config.volume === 'number') {
            const slider = this.drawerEl.querySelector('#music-vol-slider')
            slider.value = Math.round(config.volume * 100)
            this.audioEngine.setVolume(config.volume)
            this.drawerEl.querySelector('#vol-pct-lbl').textContent = `${slider.value}%`
          }
          if (config.spotifyUri) {
            this._loadSpotifyUri(config.spotifyUri)
          }
        }
      }
    } catch {}
  }

  async _persistConfig(patch) {
    try {
      await fetch('/api/music/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
    } catch {}
  }

  open() {
    this.isOpen = true
    this.drawerEl.classList.add('open')
  }

  close() {
    this.isOpen = false
    this.drawerEl.classList.remove('open')
  }

  toggle() {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }
}

// ── 7. Main Plugin Mounting Orchestrator ───────────────────────────────────────────

export async function initMusicPlugin() {
  injectStyles()

  async function tryMount() {
    const bc = window.botCrossing
    if (!bc || !bc.colony || !bc.colony.scene || !bc.engine?.camera || !bc.engine?.canvas) {
      setTimeout(tryMount, 250)
      return
    }

    try {
      const THREE = await getThree()
      const scene = bc.colony.scene
      const camera = bc.engine.camera
      const canvas = bc.engine.canvas
      const shipPos = bc.colony.ship?.group?.position || new THREE.Vector3(0, 0, 0)
      const planet = bc.colony.planet

      // 1. Mount 3D Antenna Tower with speakers directly behind the spaceship
      const tower = new AntennaTower(THREE, scene, shipPos, planet, () => {
        drawer.toggle()
      })

      // 2. Initialize dual-mode Audio Engine (3D Positional + Ambient)
      const audioEngine = new AudioEngine(THREE, camera, tower.speakerGroup || tower.group)

      // 3. Initialize Left-Side Slide-out HUD Drawer
      const drawer = new MusicDrawer(audioEngine)

      // 4. Hook frame ticks for beacon illumination and speaker animation
      const tick = () => {
        const now = performance.now() * 0.001
        const isPlaying = audioEngine.chiptune?.isPlaying || false
        tower.tick(now, isPlaying)
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)

      // 5. Raycasting click & hover on the 3D antenna tower
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      function getCanvasNdc(e) {
        const rect = canvas.getBoundingClientRect()
        return {
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
        }
      }

      window.addEventListener('mousemove', (e) => {
        if (e.target !== canvas) {
          tower.setHover(false)
          return
        }
        const p = getCanvasNdc(e)
        mouse.x = p.x
        mouse.y = p.y
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(tower.group.children, true)
        tower.setHover(hits.length > 0)
      })

      window.addEventListener('click', (e) => {
        if (e.target !== canvas) return
        const p = getCanvasNdc(e)
        mouse.x = p.x
        mouse.y = p.y
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(tower.group.children, true)
        if (hits.length > 0) {
          audioEngine.resumeContext()
          drawer.open()
        }
      })

      console.log('[ColonySound] Colony Sound System successfully mounted behind spaceship!')
    } catch (err) {
      console.error('[ColonySound] Error mounting Colony Sound System:', err)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryMount)
  } else {
    tryMount()
  }
}

// Auto-boot if loaded directly as client script
if (typeof window !== 'undefined') {
  initMusicPlugin()
}

export default initMusicPlugin
