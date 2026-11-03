import { asset } from '@/lib/asset'
import fs from 'fs'
import path from 'path'
import Image from 'next/image'

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp)$/i
const VIDEO_EXT = /\.(mp4|webm|mov)$/i

interface PhotoMeta {
  width?: number
  height?: number
  alt?: string
}
interface VideoMeta {
  poster?: string | null
  title?: string
}

function readJson<T>(relPath: string, fallback: T): T {
  try {
    const p = path.join(process.cwd(), relPath)
    if (!fs.existsSync(p)) return fallback
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as T
  } catch {
    return fallback
  }
}

/**
 * 想法/文章附带的媒体：图片按真实宽高排，视频用转码时抽的封面。
 * 服务端渲染，不需要客户端 JS。
 */
export default function MediaStrip({ media }: { media?: string[] }) {
  const items = (media ?? []).filter((f) => IMAGE_EXT.test(f) || VIDEO_EXT.test(f))
  if (items.length === 0) return null

  const photos = readJson<Record<string, PhotoMeta>>('content/photos.json', {})
  const videos = readJson<Record<string, VideoMeta>>('content/videos.json', {})

  const single = items.length === 1
  const cols = single ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div className={`mt-5 grid gap-3 ${cols} ${single ? 'justify-items-start' : ''}`}>
      {items.map((file) => {
        if (VIDEO_EXT.test(file)) {
          const meta = videos[file]
          return (
            <video
              key={file}
              src={asset(`/api/media/videos/${file}`)}
              poster={meta?.poster ? asset(`/api/media/videos/${meta.poster}`) : undefined}
              controls
              preload="none"
              playsInline
              className="w-full max-h-[480px] rounded-xl border border-line bg-black"
            />
          )
        }

        const meta = photos[file]
        // 单图：按原始比例显示但限制高度，不裁切；多图：统一方寸，避免参差
        return (
          <div
            key={file}
            className={`overflow-hidden rounded-xl border border-line bg-panel ${
              single ? 'inline-block' : 'aspect-square'
            }`}
          >
            <Image
              src={asset(`/api/media/photos/${file}`)}
              alt={meta?.alt || file}
              width={meta?.width || 1200}
              height={meta?.height || 900}
              sizes={single ? '(max-width: 768px) 100vw, 720px' : '(max-width: 768px) 50vw, 360px'}
              className={
                single
                  ? 'max-h-[480px] w-auto h-auto rounded-xl'
                  : 'w-full h-full object-cover'
              }
            />
          </div>
        )
      })}
    </div>
  )
}
