import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const packagesDir = path.join(root, 'packages')

const pkgs = fs.readdirSync(packagesDir).filter(p => !p.startsWith('.'))
const catalog = []

for (const pkg of pkgs) {
  const pluginJsonPath = path.join(packagesDir, pkg, 'plugin.json')
  if (fs.existsSync(pluginJsonPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'))
      catalog.push({
        ...meta,
        repo: `https://github.com/BeerCanLabs/bot-crossing-plugins/tree/main/packages/${meta.id || pkg}`,
      })
    } catch (e) {
      console.warn(`Failed to parse ${pluginJsonPath}:`, e.message)
    }
  }
}

catalog.sort((a, b) => (a.id || '').localeCompare(b.id || ''))

fs.writeFileSync(
  path.join(root, 'registry.json'),
  JSON.stringify({ catalog, updatedAt: new Date().toISOString() }, null, 2),
  'utf8'
)

console.log(`Generated registry.json with ${catalog.length} official plugins.`)
