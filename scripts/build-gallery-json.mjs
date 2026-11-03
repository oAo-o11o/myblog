// build-gallery-json.mjs —— 静态部署时，把画廊数据固化成 JSON
// 生成 public/gallery-photos.json 和 public/gallery-videos.json，
// 结构与原来的 /api/upload/photos、/api/upload/videos 完全一致，
// 所以前端组件只需要换 URL，不用改逻辑。
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const photosDir = path.join(root, 'public', 'photos')
const videosDir = path.join(root, 'public', 'videos')

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp)$/i
const VIDEO_EXT = /\.(mp4|webm|mov)$/i

function readJson(rel, fallback = {}) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) return fallback
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch {
    return fallback
  }
}

const photoMeta = readJson('content/photos.json')
const videoMeta = readJson('content/videos.json')

const photos = (fs.existsSync(photosDir) ? fs.readdirSync(photosDir) : [])
  .filter((f) => IMAGE_EXT.test(f))
  .map((file) => ({
    id: file,
    src: `/photos/${file}`,
    alt: photoMeta[file]?.alt || file,
    tags: photoMeta[file]?.tags || [],
    width: photoMeta[file]?.width || 600,
    height: photoMeta[file]?.height || 600,
  }))

const videos = (fs.existsSync(videosDir) ? fs.readdirSync(videosDir) : [])
  .filter((f) => VIDEO_EXT.test(f))
  .map((file) => ({
    id: file,
    src: `/videos/${file}`,
    poster: videoMeta[file]?.poster ? `/videos/${videoMeta[file].poster}` : null,
    title: videoMeta[file]?.title || file,
    desc: videoMeta[file]?.desc || '',
    tags: videoMeta[file]?.tags || [],
  }))

fs.writeFileSync(
  path.join(root, 'public', 'gallery-photos.json'),
  JSON.stringify({ photos }, null, 2)
)
fs.writeFileSync(
  path.join(root, 'public', 'gallery-videos.json'),
  JSON.stringify({ videos }, null, 2)
)

console.log(`gallery json: ${photos.length} 张图, ${videos.length} 段视频`)
