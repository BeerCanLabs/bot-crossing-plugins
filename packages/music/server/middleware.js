import { loadMusicConfig, saveMusicConfig } from './config-store.js'

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

export function createMusicMiddleware(options = {}) {
  const dataDir = options.dataDir

  return async function musicMiddleware(req, res, next) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

    const sendJson = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
    }

    if (url.pathname === '/api/music/config') {
      if (req.method === 'GET') {
        const config = await loadMusicConfig(dataDir)
        return sendJson(200, { config, presets: SPOTIFY_PRESETS })
      }

      if (req.method === 'POST') {
        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', async () => {
          try {
            const patch = JSON.parse(body || '{}')
            const updated = await saveMusicConfig(patch, dataDir)
            return sendJson(200, { ok: true, config: updated })
          } catch (err) {
            return sendJson(400, { error: err.message })
          }
        })
        return
      }
    }

    if (url.pathname === '/api/music/presets' && req.method === 'GET') {
      return sendJson(200, { presets: SPOTIFY_PRESETS })
    }

    if (typeof next === 'function') next()
  }
}
