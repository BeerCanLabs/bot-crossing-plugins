import { SPOTIFY_PRESETS } from '../server/middleware.js'

export class MusicDrawer {
  constructor(audioEngine, onModeChange) {
    this.audioEngine = audioEngine
    this.onModeChange = onModeChange
    this.isOpen = false
    this.activeSource = 'classic' // 'classic' | 'spotify'
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
        <!-- Audio Source Selector -->
        <div class="music-control-group">
          <div class="music-group-label">Audio Source</div>
          <div class="music-segmented source-switcher">
            <button type="button" data-source="classic" class="active">👾 Classic Games</button>
            <button type="button" data-source="spotify">🎧 Spotify</button>
          </div>
        </div>

        <!-- 3D Spatial vs Global Ambient Selector -->
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

        <!-- Volume Slider -->
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

        <!-- Classic Games Player View -->
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

        <!-- Spotify Embed View (Hidden by default) -->
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
    // Open / close drawer
    this.tabEl.addEventListener('click', () => this.toggle())
    this.drawerEl.querySelector('.music-close-btn').addEventListener('click', () => this.close())

    // Keyboard shortcut (M to toggle drawer)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'm' || e.key === 'M') {
        this.toggle()
      }
    })

    // Source switcher
    const sourceBtns = this.drawerEl.querySelectorAll('.source-switcher button')
    sourceBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        sourceBtns.forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
        this._setSource(btn.dataset.source)
      })
    })

    // Mode switcher (3D Spatial vs Global Ambient)
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

    // Volume & Mute
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

    // Classic Synth Controls
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

    // Chiptune track change & tick hooks
    this.audioEngine.chiptune.onTrackChange = (track) => {
      this._updateTrackInfo(track)
      this._updatePlayButton()
    }

    this.audioEngine.chiptune.onTick = ({ elapsed, total }) => {
      this._updateProgress(elapsed, total)
      this._animateVisualizer(this.audioEngine.chiptune.isPlaying)
    }

    // Spotify presets
    const presetBtns = this.drawerEl.querySelectorAll('.spotify-preset-btn')
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const uri = btn.dataset.uri
        this._loadSpotifyUri(uri)
      })
    })

    // Spotify custom URL
    const loadBtn = this.drawerEl.querySelector('#spotify-load-btn')
    const customInput = this.drawerEl.querySelector('#spotify-custom-input')
    loadBtn.addEventListener('click', () => {
      const val = customInput.value.trim()
      if (val) {
        this._loadSpotifyCustom(val)
      }
    })

    // Initial display sync
    this._updateTrackInfo(this.audioEngine.chiptune.getCurrentTrack())
  }

  _setSource(source) {
    this.activeSource = source
    const classicView = this.drawerEl.querySelector('#classic-player-view')
    const spotifyView = this.drawerEl.querySelector('#spotify-player-view')

    if (source === 'spotify') {
      classicView.style.display = 'none'
      spotifyView.style.display = 'flex'
      // Pause classic synth while listening to Spotify
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
    // Parse link like https://open.spotify.com/playlist/37i9dQZF1DXdfO26u3IRSZ
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
