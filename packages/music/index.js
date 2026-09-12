import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createMusicMiddleware, SPOTIFY_PRESETS } from './server/middleware.js'
import { loadMusicConfig, saveMusicConfig } from './server/config-store.js'

const here = path.dirname(fileURLToPath(import.meta.url))

export function createMiddleware(options = {}) {
  return createMusicMiddleware(options)
}

/**
 * Vite plugin for Colony Sound System
 */
export default function musicPlugin(options = {}) {
  return {
    name: 'vite-plugin-bot-crossing-music',

    configureServer(server) {
      server.middlewares.use(createMusicMiddleware(options))
    },

    configurePreviewServer(server) {
      server.middlewares.use(createMusicMiddleware(options))
    },

    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: '/@music/client.js',
            },
            injectTo: 'body',
          },
        ],
      }
    },

    resolveId(id) {
      if (id === '/@music/client.js') {
        return path.join(here, 'client', 'index.js')
      }
    },
  }
}

export {
  createMusicMiddleware,
  loadMusicConfig,
  saveMusicConfig,
  SPOTIFY_PRESETS,
}
