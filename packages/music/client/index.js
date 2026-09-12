import * as THREE from 'three'
import { AntennaTower } from './tower.js'
import { AudioEngine } from './audio-engine.js'
import { MusicDrawer } from './drawer.js'
import './styles.css'

/**
 * Initializes the Colony Sound System plugin once Bot Crossing boots.
 */
export function initMusicPlugin() {
  function tryMount() {
    const bc = window.botCrossing
    if (!bc || !bc.colony || !bc.colony.scene) {
      setTimeout(tryMount, 200)
      return
    }

    const scene = bc.colony.scene
    const camera = bc.engine?.camera
    const shipPos = bc.colony.ship?.group?.position || new THREE.Vector3(0, 0, 0)
    const planet = bc.colony.planet

    // 1. Mount 3D Antenna Tower with speakers directly behind the spaceship
    const tower = new AntennaTower(scene, shipPos, planet, () => {
      drawer.toggle()
    })

    // 2. Initialize dual-mode Audio Engine (3D Positional + Ambient)
    const audioEngine = new AudioEngine(camera, tower.speakerGroup || tower.group)

    // 3. Initialize Left-Side Slide-out HUD Drawer
    const drawer = new MusicDrawer(audioEngine, (mode) => {
      // Callback on mode change if needed
    })

    // 4. Hook frame ticks for beacon illumination and speaker animation
    const tick = () => {
      const now = performance.now() * 0.001
      const isPlaying = audioEngine.chiptune.isPlaying
      tower.tick(now, isPlaying)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    // 5. Raycasting click & hover on the 3D antenna tower
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    window.addEventListener('mousemove', (e) => {
      if (e.target !== bc.engine?.canvas) {
        tower.setHover(false)
        return
      }
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      if (!camera) return

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(tower.group.children, true)
      tower.setHover(hits.length > 0)
    })

    window.addEventListener('click', (e) => {
      if (e.target !== bc.engine?.canvas) return
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      if (!camera) return

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(tower.group.children, true)
      if (hits.length > 0) {
        audioEngine.resumeContext()
        drawer.open()
      }
    })

    console.log('[ColonySound] Colony Sound System successfully mounted.')
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
