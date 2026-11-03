// backfill-photo-dims.mjs — 用 lib/image-size.ts 回填真实宽高
import fs from 'node:fs'
import path from 'node:path'
import { probeImageSize } from '../lib/image-size.ts'

const root = process.cwd()
const metaPath = path.join(root, 'content', 'photos.json')
const dir = path.join(root, 'public', 'photos')

const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
const out = {}

for (const [name, entry] of Object.entries(meta)) {
  const file = path.join(dir, name)
  const before = `${entry.width ?? '?'}×${entry.height ?? '?'}`
  let after = before

  if (fs.existsSync(file)) {
    const probed = probeImageSize(fs.readFileSync(file))
    if (probed && probed.width && probed.height) {
      entry.width = probed.width
      entry.height = probed.height
      after = `${probed.width}×${probed.height} (${probed.type})`
    } else {
      after = 'probe failed'
    }
  } else {
    after = 'file missing'
  }

  out[name] = entry
  console.log(`${name}\n   ${before}  ->  ${after}`)
}

fs.writeFileSync(metaPath, JSON.stringify(out, null, 2) + '\n', 'utf-8')
console.log('\nwritten:', metaPath)
