import { getPostBySlug, getAllPosts } from '@/lib/mdx'
import { notFound } from 'next/navigation'
import PageTransition from '@/components/layout/PageTransition'
import ReadingProgress from '@/components/ui/ReadingProgress'
import PostBody from '@/components/blog/PostBody'
import MediaStrip from '@/components/content/MediaStrip'
import Link from 'next/link'
import type { Metadata } from 'next'
import { readSite } from '@/lib/site'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const site = readSite()
  const base = site.url || 'http://localhost:3000'

  // 分享图优先级：附带媒体里的第一张图 → 正文里的第一张图 → 站点默认卡片
  const mediaImage = post.media?.find((m) => /\.(jpe?g|png|webp|gif)$/i.test(m))
  const bodyImage = post.body.match(/!\[[^\]]*\]\(([^)]+\.(?:jpe?g|png|webp|gif))\)/i)?.[1]
  const image = mediaImage
    ? `${base}/photos/${mediaImage}`
    : bodyImage
      ? `${base}${bodyImage.startsWith('/') ? '' : '/'}${bodyImage}`
      : `${base}/og.png`
  const images = [image]

  return {
    title: post.title || '一条想法',
    description: post.excerpt || post.body.slice(0, 120),
    alternates: { canonical: `${base}/blog/${slug}/` },
    openGraph: {
      type: 'article',
      url: `${base}/blog/${slug}/`,
      title: post.title || '一条想法',
      description: post.excerpt || post.body.slice(0, 120),
      publishedTime: post.date,
      tags: post.topics,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title || '一条想法',
      description: post.excerpt || post.body.slice(0, 120),
      images,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  const formattedDate = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <ReadingProgress />
      <PageTransition>
        <article className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-ink/40 hover:text-ink text-sm tracking-[0.18em] mb-10 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            返回文章列表
          </Link>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="type-display-2">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="note mt-4">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-ink/38 mt-6">
            <span>{formattedDate}</span>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>

          <MediaStrip media={post.media} />

          <div className="prose prose-invert max-w-none mt-12">
            <PostBody content={post.body} />
          </div>

          <div className="mt-16 pt-8 border-t border-line flex items-center justify-center gap-4 text-ink-dim font-mono text-sm">
            <span>— EOF —</span>
          </div>
        </article>
      </PageTransition>
    </>
  )
}
