import test from 'node:test'
import assert from 'node:assert/strict'
import fsp from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { createMusicMiddleware, SPOTIFY_PRESETS } from '../packages/music/server/middleware.js'
import { loadMusicConfig, saveMusicConfig } from '../packages/music/server/config-store.js'
import { CLASSIC_TRACKS } from '../packages/music/client/classic-synth.js'

async function withServer(run) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'bot-crossing-test-music-'))
  const middleware = createMusicMiddleware({ dataDir: dir })

  const server = http.createServer((req, res) => {
    middleware(req, res, () => {
      res.writeHead(404)
      res.end()
    })
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const base = `http://127.0.0.1:${port}`

  try {
    await run({ base, dir })
  } finally {
    server.close()
    await fsp.rm(dir, { recursive: true, force: true })
  }
}

test('Music Plugin: plugin.json specification', async () => {
  const raw = await fsp.readFile(
    path.join(process.cwd(), 'packages/music/plugin.json'),
    'utf8'
  )
  const meta = JSON.parse(raw)
  assert.equal(meta.id, 'music')
  assert.equal(meta.category, 'audio')
  assert.ok(meta.entry.server)
  assert.ok(meta.entry.client)
})

test('Music Plugin: server endpoints and state persistence', async () => {
  await withServer(async ({ base, dir }) => {
    // 1. GET initial config
    const res1 = await fetch(`${base}/api/music/config`)
    assert.equal(res1.status, 200)
    const data1 = await res1.json()
    assert.equal(data1.config.activeSource, 'classic')
    assert.equal(data1.config.spatialMode, 'spatial')
    assert.equal(data1.config.volume, 0.65)
    assert.ok(Array.isArray(data1.presets))

    // 2. POST update config
    const res2 = await fetch(`${base}/api/music/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spatialMode: 'ambient',
        volume: 0.82,
        activeSource: 'spotify'
      })
    })
    assert.equal(res2.status, 200)
    const data2 = await res2.json()
    assert.equal(data2.ok, true)
    assert.equal(data2.config.spatialMode, 'ambient')
    assert.equal(data2.config.volume, 0.82)
    assert.equal(data2.config.activeSource, 'spotify')

    // 3. Verify file persistence on disk
    const stored = await loadMusicConfig(dir)
    assert.equal(stored.spatialMode, 'ambient')
    assert.equal(stored.volume, 0.82)
    assert.equal(stored.activeSource, 'spotify')
  })
})

test('Music Plugin: Classic Games track library constraints (< 2 mins each)', () => {
  assert.ok(CLASSIC_TRACKS.length >= 10, 'Must have at least 10 classic tracks')

  for (const track of CLASSIC_TRACKS) {
    assert.ok(track.id, `Track must have id: ${JSON.stringify(track)}`)
    assert.ok(track.title, `Track must have title: ${track.id}`)
    assert.ok(track.game, `Track must have game name: ${track.id}`)
    assert.ok(track.bpm > 0, `Track must have valid bpm: ${track.id}`)
    assert.ok(track.durationSec > 0, `Track must have duration: ${track.id}`)
    assert.ok(
      track.durationSec <= 120,
      `Track ${track.title} exceeds 2 minutes limit: ${track.durationSec}s`
    )
    assert.ok(track.notes.length > 0, `Track ${track.id} must have notes`)
  }

  // Verify Zelda and Mario are present
  const hasZelda = CLASSIC_TRACKS.some((t) => t.game.toLowerCase().includes('zelda'))
  const marioTrack = CLASSIC_TRACKS.find((t) => t.id === 'mario-overworld')
  assert.ok(hasZelda, 'Classic playlist must contain Zelda')
  assert.ok(marioTrack, 'Classic playlist must contain Mario')
  assert.ok(
    marioTrack.notes.length >= 150,
    `Mario Overworld must be full sequence (>150 notes), got: ${marioTrack.notes.length}`
  )

  // Verify all 15 tracks have rich, full multi-measure sequences (no short 4-sec motifs)
  assert.equal(CLASSIC_TRACKS.length, 15, 'Must have 15 classic game tracks')
  for (const track of CLASSIC_TRACKS) {
    assert.ok(
      track.notes.length >= 30,
      `Track ${track.id} must have at least 30 notes for a full theme loop, got: ${track.notes.length}`
    )
    assert.ok(
      track.bass && track.bass.length >= 8,
      `Track ${track.id} must have rich bassline, got: ${track.bass?.length}`
    )
  }
})

test('Music Plugin: Client scripts have no bare specifiers or server imports', async () => {
  const clientDir = path.join(process.cwd(), 'packages/music/client')
  const files = await fsp.readdir(clientDir)
  const jsFiles = files.filter((f) => f.endsWith('.js'))

  for (const f of jsFiles) {
    const code = await fsp.readFile(path.join(clientDir, f), 'utf8')

    // Must not have bare imports like import ... from 'three'
    assert.equal(
      /from\s+['"]three['"]/.test(code),
      false,
      `File ${f} contains bare import from 'three'`
    )

    // Must not have CSS import in JS
    assert.equal(
      /import\s+['"].*\.css['"]/.test(code),
      false,
      `File ${f} contains direct CSS import`
    )

    // Must not import server files or node: built-ins
    assert.equal(
      /from\s+['"].*\/server\/.*['"]/.test(code),
      false,
      `File ${f} imports server module`
    )
    assert.equal(
      /from\s+['"]node:.*['"]/.test(code),
      false,
      `File ${f} imports node: built-in`
    )
  }
})

test('Music Plugin: Tower positioning and grounding formula validation', async () => {
  const towerCode = await fsp.readFile(
    path.join(process.cwd(), 'packages/music/client/tower.js'),
    'utf8'
  )
  const indexCode = await fsp.readFile(
    path.join(process.cwd(), 'packages/music/client/index.js'),
    'utf8'
  )

  for (const [name, code] of [['tower.js', towerCode], ['index.js', indexCode]]) {
    // Offset behind spaceship should be snug ~3.4 units, NOT 6.2
    assert.match(code, /multiplyScalar\(3\.4\)/, `${name} must position tower 3.4 units behind ship`)
    assert.doesNotMatch(code, /multiplyScalar\(6\.2\)/, `${name} must not use old 6.2 offset`)

    // Must sample terrain elevation using heightAt or raycasting, NOT hardcoded 35 sphere radius
    assert.match(code, /heightAt\(this\.position\.x,\s*this\.position\.z\)/, `${name} must use terrain heightAt`)
    assert.doesNotMatch(code, /p\.radius\s*\|\|\s*35/, `${name} must not use broken sphere formula`)
  }
})

test('Music & RBAC UI: Drawer tab clearing controls and RBAC pill center-top dismissible', async () => {
  const cssCode = await fsp.readFile(
    path.join(process.cwd(), 'packages/music/client/styles.css'),
    'utf8'
  )
  // Drawer tab must be raised to top: 76px to not overlap .rail controls
  assert.match(cssCode, /top:\s*76px;/, 'styles.css must position .music-drawer-tab at top: 76px')
  assert.doesNotMatch(cssCode, /top:\s*48%;/, 'styles.css must not position tab in the middle where .rail sits')

  const rbacCode = await fsp.readFile(
    path.join(process.cwd(), 'packages/rbac/client/index.js'),
    'utf8'
  )
  // RBAC pill must be centered at top, away from top-right controls
  assert.match(rbacCode, /left:\s*50%;/, 'RBAC badge must be centered at left: 50%')
  assert.match(rbacCode, /translateX\(-50%\)/, 'RBAC badge must use translateX(-50%)')
  assert.match(rbacCode, /colony-rbac-dismiss/, 'RBAC badge must have dismiss button')
  assert.match(rbacCode, /colony-rbac-dismissed/, 'RBAC badge must support dismissal persistence')
})


