import fs from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_CONFIG = {
  activeSource: 'classic', // 'classic' | 'spotify'
  spatialMode: 'spatial',  // 'spatial' | 'ambient'
  volume: 0.65,
  muted: false,
  shuffle: true,
  spotifyUri: 'playlist/37i9dQZF1DXdfO26u3IRSZ', // Video Game Soundtracks preset
  customSpotifyUri: '',
  theme: 'sci-fi-regolith',
}

function resolveConfigPath(customDataDir) {
  const dataDir = customDataDir || process.env.BOT_CROSSING_DATA || path.join(process.cwd(), 'data')
  return path.join(dataDir, 'colony-music.json')
}

export async function loadMusicConfig(customDataDir) {
  const filePath = resolveConfigPath(customDataDir)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export async function saveMusicConfig(patch, customDataDir) {
  const filePath = resolveConfigPath(customDataDir)
  const current = await loadMusicConfig(customDataDir)
  const updated = { ...current, ...patch }
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf8')
  return updated
}
