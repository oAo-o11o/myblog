import { MDXRemote } from 'next-mdx-remote/rsc'
import { asset } from '@/lib/asset'

/**
 * 正文渲染。用 next-mdx-remote 的 RSC 版本在服务端编译：
 * - 静态导出时正文直接写进 HTML（不再等 JS 加载才出字）
 * - 不会出现「服务端骨架屏 / 客户端内容」的 hydration 不一致
 *
 * 正文里的 ![]() 和 <video> 会走下面的映射：
 * 1. 把历史上写错的地址（带 localhost、带 /api/media）纠正成 /photos 或 /videos
 * 2. 再补上部署路径前缀，这样写到 GitHub Pages 子路径下也不会 404
 */
function normalizeMediaUrl(raw: string): string {
  if (!raw) return raw
  let url = raw

  // http://localhost:3000/api/media/photos/x.png  →  /photos/x.png
  url = url.replace(/^https?:\/\/[^/]*localhost[^/]*(?::\d+)?/i, '')
  // 去掉任何域名前缀，统一成站内绝对路径
  url = url.replace(/^https?:\/\/[^/]+/i, '')
  // 旧接口路径
  url = url.replace(/^\/api\/media\/photos\//, '/photos/')
  url = url.replace(/^\/api\/media\/videos\//, '/videos/')

  return asset(url)
}

const components = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const src = typeof props.src === 'string' ? normalizeMediaUrl(props.src) : undefined
    return (
      // 原图不压缩，点开就是原始文件
      <a href={src} target="_blank" rel="noopener noreferrer" title="查看原图" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...props}
          src={src}
          loading="lazy"
          decoding="async"
          className="rounded-xl"
        />
      </a>
    )
  },
  video: (props: React.VideoHTMLAttributes<HTMLVideoElement>) => (
    <video
      {...props}
      src={typeof props.src === 'string' ? normalizeMediaUrl(props.src) : undefined}
      controls
      className="w-full rounded-xl"
    />
  ),
}

export default function PostBody({ content }: { content: string }) {
  return (
    <div className="prose">
      <MDXRemote source={content} components={components} />
    </div>
  )
}
