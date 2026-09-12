import { AntennaTower } from './tower.js'
import { AudioEngine } from './audio-engine.js'
import { MusicDrawer } from './drawer.js'

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
    })
  }
  return _threePromise
}

/**
 * Initializes the Colony Sound System plugin once Bot Crossing boots.
 */
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
