import { MDXRemote } from 'next-mdx-remote/rsc'
import { asset } from '@/lib/asset'

/**
 * 正文渲染。用 next-mdx-remote 的 RSC 版本在服务端编译：
 * - 静态导出时正文直接写进 HTML（不再等 JS 加载才出字）
 * - 不会出现「服务端骨架屏 / 客户端内容」的 hydration 不一致
 *
 * 正文里的 ![]() 和 <video> 会走下面的映射，自动补上部署路径前缀，
 * 所以写到 GitHub Pages 子路径下也不会 404。
 */
const components = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={typeof props.src === 'string' ? asset(props.src) : props.src}
      className="rounded-xl"
    />
  ),
  video: (props: React.VideoHTMLAttributes<HTMLVideoElement>) => (
    <video
      {...props}
      src={typeof props.src === 'string' ? asset(props.src) : undefined}
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
