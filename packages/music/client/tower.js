import * as THREE from 'three'

/**
 * 3D Power Antenna & Speaker Tower for Bot Crossing.
 *
 * Placed in the dirt directly behind the spaceship.
 * Stands ~9.5 units tall (1/3 higher than the spaceship's 7.0 units).
 * Features:
 *   - 4 structural support pylons rooted in the regolith
 *   - Tapered industrial steel antenna mast
 *   - High-voltage insulator coils with subtle energy illumination
 *   - Quad directional horn speakers pointing outward over the colony
 *   - Pulsing aviation/broadcast beacon at the pinnacle (Y = 9.5)
 *   - Click interaction to open the Colony Sound System drawer
 */

const METAL_DARK = 0x3d414a
const METAL_FRAME = 0x6e7380
const ACCENT_CYAN = 0x00e5ff
const SPEAKER_HORN = 0x242831
const SPEAKER_CONE = 0x111317
const BEACON_COLOR = 0xff5533

export class AntennaTower {
  constructor(scene, shipPos, planet, onClick) {
    this.scene = scene
    this.shipPos = shipPos
    this.planet = planet
    this.onClick = onClick

    this.group = new THREE.Group()
    this.group.name = 'antenna-speaker-tower'
    scene.add(this.group)

    this.hovered = false
    this.materials = []

    this._calculatePosition()
    this._buildMesh()
    this._positionOnTerrain()
  }

  _calculatePosition() {
    // Ship is located at shipPos and faces inward toward (0,0,0).
    // "Behind the spaceship" is outward away from colony center.
    const outwardDir = this.shipPos.clone().normalize()
    // Offset 6.2 units directly behind the ship hull in the dirt
    this.position = new THREE.Vector3().addVectors(
      this.shipPos,
      outwardDir.clone().multiplyScalar(6.2)
    )
    this.group.position.copy(this.position)

    // Face toward the colony center / camera
    this.group.rotation.y = Math.atan2(this.shipPos.x, this.shipPos.z)
  }

  _positionOnTerrain() {
    // Bot Crossing planet terrain elevation lookup
    let y = 0
    if (window.botCrossing?.colony?.planet) {
      const p = window.botCrossing.colony.planet
      // Approximate terrain curvature or flat regolith
      const r = Math.sqrt(this.position.x * this.position.x + this.position.z * this.position.z)
      y = Math.max(0, (p.radius || 35) - Math.sqrt(Math.max(0, (p.radius || 35) ** 2 - r * r)) * 0.2)
    }
    this.group.position.y = y
  }

  _buildMesh() {
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
      // Concrete/metal footpad
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.18, 8), darkMat)
      pad.position.set(p.x, 0.09, p.z)
      this.group.add(pad)

      // Angled leg strut
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

    // Equipment cooling vents & status panels
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), coilMat)
    panel.position.set(0, 2.3, 0.71)
    this.group.add(panel)

    // 3. Tapered Main Antenna Mast (Y: 2.8 to 8.2)
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.55, 5.4, 8), metalMat)
    mast.position.set(0, 5.5, 0)
    this.group.add(mast)

    // Cross-brace rings on the mast
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
    // 4 directional horns pointing North, East, South, West angled down
    this.speakerGroup = new THREE.Group()
    this.speakerGroup.position.set(0, 8.0, 0)
    this.group.add(this.speakerGroup)

    const hornAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
    for (const angle of hornAngles) {
      const hornAssembly = new THREE.Group()
      hornAssembly.rotation.y = angle

      // Speaker mount bracket
      const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 6), metalMat)
      bracket.rotation.z = Math.PI / 2
      bracket.position.set(0.3, 0, 0)
      hornAssembly.add(bracket)

      // Conical megaphone horn flare
      // Cone points outward (+X) and tilts down by 15 degrees
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.8, 12, 1, true), hornMat)
      horn.rotation.z = -Math.PI / 2 - 0.22 // Angle down toward colony
      horn.position.set(0.85, -0.08, 0)
      hornAssembly.add(horn)

      // Internal speaker driver/cone
      const driver = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), coneMat)
      driver.position.set(0.55, -0.02, 0)
      hornAssembly.add(driver)

      this.speakerGroup.add(hornAssembly)
    }

    // 5. Pinnacle Antenna Rod & Warning Beacon (Y: 8.2 to 9.5)
    // Spaceship mast is ~7.0; 9.5 units is exactly 1/3 taller!
    const pinnacleRod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1.4, 6), metalMat)
    pinnacleRod.position.set(0, 8.9, 0)
    this.group.add(pinnacleRod)

    const beaconSphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), beaconMat)
    beaconSphere.position.set(0, 9.5, 0)
    this.group.add(beaconSphere)

    // Interactive clickable hit-box proxy
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
    if (!this.beaconMat) return

    // Pulse beacon light: rapid pulse when music is playing, slow warning strobe when idle
    const pulseSpeed = isPlaying ? 6.0 : 1.8
    const intensity = isPlaying
      ? 0.4 + 0.6 * Math.sin(timeSec * pulseSpeed) ** 2
      : (Math.sin(timeSec * pulseSpeed) > 0.6 ? 1.0 : 0.2)

    this.beaconMat.emissiveIntensity = intensity

    // Subtle vibration on the speakers when active
    if (isPlaying && this.speakerGroup) {
      this.speakerGroup.rotation.y += 0.002
    }
  }
}
