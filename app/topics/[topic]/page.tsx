import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEntriesByTopic, getTopicStats } from '@/lib/mdx'
import MediaStrip from '@/components/content/MediaStrip'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ topic: string }>
}

/** 静态导出（GitHub Pages）需要预先知道所有题目 */
export function generateStaticParams() {
  return getTopicStats().map((t) => ({ topic: encodeURIComponent(t.name) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params
  const name = decodeURIComponent(topic)
  return {
    title: `专题 · ${name}`,
    description: `关于「${name}」的全部记录。`,
  }
}

export default async function TopicPage({ params }: Props) {
  const { topic } = await params
  const name = decodeURIComponent(topic)
  const entries = getEntriesByTopic(name)

  if (entries.length === 0) notFound()

  const thoughts = entries.filter((e) => e.kind === 'thought')
  const articles = entries.filter((e) => e.kind === 'article')
  const others = getTopicStats().filter((t) => t.name !== name).slice(0, 6)

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 pt-32 pb-24">

      <header className="mb-16">
        <div className="label-rule mb-8">
          专题 <em>topic</em>
        </div>
        <h1 className="type-display-2">{name}</h1>
        <p className="epigraph mt-7 max-w-[52ch]">
          围绕这个问题，留下了 {entries.length} 条记录
          {thoughts.length > 0 && `：想法 ${thoughts.length} 条`}
          {articles.length > 0 && `、文章 ${articles.length} 篇`}。
        </p>
      </header>

      <div className="space-y-14">
        {entries.map((e) => (
          <article key={e.slug} className={e.kind === 'thought' ? 'thought-rail' : ''}>
            <div className="meta-line mb-3">
              <span className={`kind-mark ${e.kind}`}>{e.kind === 'thought' ? '※ 想法' : '§ 文章'}</span>
              <span className="sep">·</span>
              <time>{e.date}</time>
              {e.kind === 'article' && (
                <>
                  <span className="sep">·</span>
                  <span>{e.readingTime}</span>
                </>
              )}
            </div>

            {e.kind === 'article' ? (
              <Link href={`/blog/${e.slug}`} className="group block">
                <h2 className="type-title group-hover:text-accent transition-colors">
                  {e.title}
                </h2>
                <p className="note mt-2 line-clamp-2">
                  {e.excerpt}
                </p>
              </Link>
            ) : (
              <p className="body-text whitespace-pre-wrap">
                {e.body}
              </p>
            )}

            {e.kind === 'thought' && <MediaStrip media={e.media} />}
          </article>
        ))}
      </div>

      <div className="mt-20 pt-8 border-t border-line/60">
        <div className="label-rule mb-5">其他题目</div>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
          {others.map((t) => (
            <Link key={t.name} href={`/topics/${encodeURIComponent(t.name)}`} className="term">
              {t.name}
            </Link>
          ))}
          <Link
            href="/topics"
            className="ml-auto type-count text-accent hover:underline"
          >
            全部题目 →
          </Link>
        </div>
      </div>
    </div>
  )
}
