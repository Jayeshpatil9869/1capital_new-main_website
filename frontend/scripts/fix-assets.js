import { readdirSync, copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// Find built assets under dist/assets and copy the main JS/CSS to dist/assets/index.js and index.css
const dist = resolve(process.cwd(), 'dist')
const assetsDir = resolve(dist, 'assets')
if (!existsSync(dist)) {
  console.error('dist directory not found. Run build first.')
  process.exit(1)
}
if (!existsSync(assetsDir)) {
  console.error('dist/assets not found.')
  process.exit(1)
}

const files = readdirSync(assetsDir)
let jsFile = files.find((f) => f.endsWith('.js') && !f.endsWith('.map'))
let cssFile = files.find((f) => f.endsWith('.css') && !f.endsWith('.map'))

if (!jsFile && !cssFile) {
  console.error('No JS/CSS assets found in dist/assets')
  process.exit(1)
}

try {
  if (jsFile) {
    copyFileSync(resolve(assetsDir, jsFile), resolve(assetsDir, 'index.js'))
  }
  if (cssFile) {
    copyFileSync(resolve(assetsDir, cssFile), resolve(assetsDir, 'index.css'))
  }
  console.log('Copied main JS/CSS to assets/index.(js|css)')
} catch (e) {
  console.error('Failed to copy assets:', e)
  process.exit(1)
}
