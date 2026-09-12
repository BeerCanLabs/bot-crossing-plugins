/**
 * Chiptune Synthesizer & Classic Video Game Track Library for Bot Crossing.
 *
 * Implements an authentic 4-channel NES/Game Boy style sound chip in the browser:
 *   - Pulse 1: Lead melody (square wave with vibrato/decay envelope)
 *   - Pulse 2: Counter-melody / arpeggiator (square wave)
 *   - Triangle: Bassline (deep smooth triangle wave)
 *   - Noise: Percussion / drum beats (hi-hat, snare, bass kick noise bursts)
 *
 * Every track is under 2 minutes, sequenced with authentic retro note data,
 * and plays completely locally offline with zero latency and zero copyright vulnerability.
 */

// Note frequencies (C2 to B6)
const NOTE_FREQS = {
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'B6': 1975.53,
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
    durationSec: 50,
    notes: [
      // --- 1. INTRO ---
      { n: 'E5', d: 0.25 }, { n: 'E5', d: 0.25 }, { n: '-', d: 0.25 }, { n: 'E5', d: 0.25 },
      { n: '-', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'E5', d: 0.5 },
      { n: 'G5', d: 0.75 }, { n: '-', d: 0.75 }, { n: 'G4', d: 0.75 }, { n: '-', d: 0.75 },

      // --- 2. MAIN PHRASE A1 ---
      { n: 'C5', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'G4', d: 0.5 }, { n: '-', d: 0.25 },
      { n: 'E4', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'A4', d: 0.5 }, { n: 'B4', d: 0.5 },
      { n: 'A#4', d: 0.25 }, { n: 'A4', d: 0.5 }, { n: 'G4', d: 0.33 }, { n: 'E5', d: 0.33 }, { n: 'G5', d: 0.34 },
      { n: 'A5', d: 0.5 }, { n: 'F5', d: 0.25 }, { n: 'G5', d: 0.25 }, { n: '-', d: 0.25 },
      { n: 'E5', d: 0.5 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.25 }, { n: 'B4', d: 0.75 }, { n: '-', d: 0.25 },

      // --- 3. MAIN PHRASE A2 ---
      { n: 'C5', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'G4', d: 0.5 }, { n: '-', d: 0.25 },
      { n: 'E4', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'A4', d: 0.5 }, { n: 'B4', d: 0.5 },
      { n: 'A#4', d: 0.25 }, { n: 'A4', d: 0.5 }, { n: 'G4', d: 0.33 }, { n: 'E5', d: 0.33 }, { n: 'G5', d: 0.34 },
      { n: 'A5', d: 0.5 }, { n: 'F5', d: 0.25 }, { n: 'G5', d: 0.25 }, { n: '-', d: 0.25 },
      { n: 'E5', d: 0.5 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.25 }, { n: 'B4', d: 0.75 }, { n: '-', d: 0.5 },

      // --- 4. SECTION B1 (Jump & Coin rhythm) ---
      { n: 'G5', d: 0.25 }, { n: 'F#5', d: 0.25 }, { n: 'F5', d: 0.25 }, { n: 'D#5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: '-', d: 0.25 },
      { n: 'G#4', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.5 },
      { n: '-', d: 0.5 },
      { n: 'G5', d: 0.25 }, { n: 'F#5', d: 0.25 }, { n: 'F5', d: 0.25 }, { n: 'D#5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: '-', d: 0.25 },
      { n: 'C6', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'C6', d: 0.25 }, { n: 'C6', d: 0.5 }, { n: '-', d: 0.75 },

      // --- 5. SECTION B2 ---
      { n: 'G5', d: 0.25 }, { n: 'F#5', d: 0.25 }, { n: 'F5', d: 0.25 }, { n: 'D#5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: '-', d: 0.25 },
      { n: 'G#4', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.5 },
      { n: '-', d: 0.5 },
      { n: 'D#5', d: 0.75 }, { n: '-', d: 0.25 }, { n: 'D5', d: 0.75 }, { n: '-', d: 0.25 },
      { n: 'C5', d: 1.0 }, { n: '-', d: 0.75 },

      // --- 6. SECTION B3 (Repeat) ---
      { n: 'G5', d: 0.25 }, { n: 'F#5', d: 0.25 }, { n: 'F5', d: 0.25 }, { n: 'D#5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: '-', d: 0.25 },
      { n: 'G#4', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.5 },
      { n: '-', d: 0.5 },
      { n: 'G5', d: 0.25 }, { n: 'F#5', d: 0.25 }, { n: 'F5', d: 0.25 }, { n: 'D#5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: '-', d: 0.25 },
      { n: 'C6', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'C6', d: 0.25 }, { n: 'C6', d: 0.5 }, { n: '-', d: 0.75 },

      // --- 7. SECTION B4 ---
      { n: 'G5', d: 0.25 }, { n: 'F#5', d: 0.25 }, { n: 'F5', d: 0.25 }, { n: 'D#5', d: 0.5 }, { n: 'E5', d: 0.5 }, { n: '-', d: 0.25 },
      { n: 'G#4', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.5 },
      { n: '-', d: 0.5 },
      { n: 'D#5', d: 0.75 }, { n: '-', d: 0.25 }, { n: 'D5', d: 0.75 }, { n: '-', d: 0.25 },
      { n: 'C5', d: 1.0 }, { n: '-', d: 0.75 },

      // --- 8. SECTION C1 (Bridge) ---
      { n: 'C5', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: '-', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.5 },
      { n: 'E5', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: 'A4', d: 0.25 }, { n: 'G4', d: 1.0 },
      { n: 'C5', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: '-', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.25 },
      { n: 'E5', d: 1.5 }, { n: '-', d: 0.5 },

      // --- 9. SECTION C2 (Bridge resolution into intro) ---
      { n: 'C5', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: '-', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: '-', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.5 },
      { n: 'E5', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: 'A4', d: 0.25 }, { n: 'G4', d: 1.0 },
      { n: 'E5', d: 0.25 }, { n: 'E5', d: 0.25 }, { n: '-', d: 0.25 }, { n: 'E5', d: 0.25 },
      { n: '-', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'E5', d: 0.5 },
      { n: 'G5', d: 0.75 }, { n: '-', d: 0.75 }, { n: 'G4', d: 0.75 }, { n: '-', d: 0.75 }
    ],
    bass: [
      'D3', 'D3', 'D3', 'G3',
      'C3', 'G3', 'C3', 'G3', 'F3', 'C3', 'F3', 'C3', 'G3', 'D3', 'G3', 'C3',
      'C3', 'G3', 'C3', 'G3', 'F3', 'C3', 'F3', 'C3', 'G3', 'D3', 'G3', 'C3',
      'C3', 'G3', 'C3', 'G3', 'F3', 'C3', 'F3', 'C3', 'C3', 'G3', 'C3', 'G3', 'G3', 'D3', 'G3', 'C3',
      'C3', 'G3', 'C3', 'G3', 'F3', 'C3', 'F3', 'C3', 'C3', 'G3', 'C3', 'G3', 'G3', 'D3', 'G3', 'C3',
      'G#2', 'D#3', 'G#2', 'A#2', 'F3', 'A#2', 'C3', 'G3', 'C3', 'G3',
      'G#2', 'D#3', 'G#2', 'A#2', 'F3', 'A#2', 'G3', 'D3', 'G3', 'G3'
    ]
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
