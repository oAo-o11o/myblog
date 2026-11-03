import { MDXRemote } from 'next-mdx-remote/rsc'

/**
 * 正文渲染。用 next-mdx-remote 的 RSC 版本在服务端编译：
 * - 静态导出时正文直接写进 HTML（不再等 JS 加载才出字）
 * - 不会出现「服务端骨架屏 / 客户端内容」的 hydration 不一致
 */
export default function PostBody({ content }: { content: string }) {
  return (
    <div className="prose">
      <MDXRemote source={content} />
    </div>
  )
}
