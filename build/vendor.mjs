// Copies untouched third-party bundles into dist/:
// Bootstrap & Popper minified scripts (with source maps) and Font Awesome Free.
import { copyFileSync, cpSync, mkdirSync } from 'node:fs'

const files = [
  'node_modules/bootstrap/dist/js/bootstrap.min.js',
  'node_modules/bootstrap/dist/js/bootstrap.min.js.map',
  'node_modules/@popperjs/core/dist/umd/popper.min.js',
  'node_modules/@popperjs/core/dist/umd/popper.min.js.map'
]

mkdirSync('dist/js', { recursive: true })
for (const file of files) {
  copyFileSync(file, `dist/js/${file.split('/').pop()}`)
}

// Keep Font Awesome's css/ + webfonts/ layout so its relative font urls keep working
const fontawesome = 'node_modules/@fortawesome/fontawesome-free'
mkdirSync('dist/fontawesome/css', { recursive: true })
copyFileSync(`${fontawesome}/css/all.min.css`, 'dist/fontawesome/css/all.min.css')
copyFileSync(`${fontawesome}/LICENSE.txt`, 'dist/fontawesome/LICENSE.txt')
cpSync(`${fontawesome}/webfonts`, 'dist/fontawesome/webfonts', { recursive: true })
