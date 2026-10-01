// Minimal cross-platform `cp src dest`.
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const [src, dest] = process.argv.slice(2)
mkdirSync(dirname(dest), { recursive: true })
copyFileSync(src, dest)
