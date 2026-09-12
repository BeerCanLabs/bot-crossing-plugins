import { ChiptuneEngine } from './classic-synth.js'

export class AudioEngine {
  constructor(THREE, camera, towerObject) {
    this.THREE = THREE || (typeof window !== 'undefined' ? window.THREE : null)
    this.camera = camera
    this.towerObject = towerObject
    this.mode = 'spatial' // 'spatial' | 'ambient'
    this.volume = 0.65
    this.muted = false

    const T = this.THREE

    // Three.js 3D Positional Audio
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

    // Initialize Web Audio Context (share listener context if available)
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    this.ctx = (this.listener && this.listener.context) || new AudioContextClass()

    // Master ambient gain node
    this.ambientGain = this.ctx.createGain()
    this.ambientGain.gain.value = this.volume
    this.ambientGain.connect(this.ctx.destination)

    // Node that switches between ambient & spatial
    this.inputRouter = this.ctx.createGain()
    this.inputRouter.gain.value = 1.0

    // Initialize Chiptune Engine connected to input router
    this.chiptune = new ChiptuneEngine(this.ctx, this.inputRouter)

    // Connect to appropriate target
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
      // Route through Three.js PositionalAudio
      try {
        this.positionalAudio.setNodeSource(this.inputRouter)
      } catch {
        // Fallback: connect to positionalAudio.gain or destination
        if (this.positionalAudio.gain) {
          this.inputRouter.connect(this.positionalAudio.gain)
        } else {
          this.inputRouter.connect(this.ambientGain)
        }
      }
    } else {
      // Route directly to global ambient gain
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
