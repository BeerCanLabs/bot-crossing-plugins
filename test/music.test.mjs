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
  const hasMario = CLASSIC_TRACKS.some((t) => t.game.toLowerCase().includes('mario'))
  assert.ok(hasZelda, 'Classic playlist must contain Zelda')
  assert.ok(hasMario, 'Classic playlist must contain Mario')
})
