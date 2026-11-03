import Link from 'next/link'
import { getThoughts, getArticles, getTopicStats } from '@/lib/mdx'
import { readSite } from '@/lib/site'
import MediaStrip from '@/components/content/MediaStrip'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '数字角落',
  description: '把没说清的东西，一点一点说清楚。这里留下的是过程。',
}

export default function HomePage() {
  const site = readSite()
  const thoughts = getThoughts()
  const articles = getArticles()
  const topics = getTopicStats()

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 pt-32 pb-24">

      {/* 这是什么地方 */}
      <header className="mb-20">
        <h1 className="type-display-1">
          {site.tagline1}
          <br />
          {site.tagline2}
        </h1>

        <p className="epigraph mt-9">{site.epigraph}</p>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_228px] gap-14 lg:gap-20">

        <main>
          {/* 想法 */}
          <section>
            <div className="flex items-baseline justify-between gap-6 mb-9 pb-3 border-b border-line/70">
              <h2 className="label-rule">想法 <em>thoughts</em></h2>
              <Link
                href="/notes"
                className="type-count hover:text-accent transition-colors"
              >
                全部 {thoughts.length} 条 →
              </Link>
            </div>

            {thoughts.length === 0 ? (
              <p className="text-ink-dim text-sm py-10">还没有想法。</p>
            ) : (
              <div className="space-y-12">
                {thoughts.slice(0, 6).map((t) => (
                  <article key={t.slug} className="thought-rail">
                    <div className="meta-line mb-3">
                      <time>{t.date}</time>
                      {t.topics.length > 0 && <span className="sep">·</span>}
                      {t.topics.map((topic) => (
                        <Link
                          key={topic}
                          href={`/topics/${encodeURIComponent(topic)}`}
                          className="term"
                        >
                          {topic}
                        </Link>
                      ))}
                    </div>

                    <p className="body-text whitespace-pre-wrap">
                      {t.body}
                    </p>

                    <MediaStrip media={t.media} />
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* 文章 */}
          <section className="mt-20">
            <div className="flex items-baseline justify-between gap-6 mb-9 pb-3 border-b border-line/70">
              <h2 className="label-rule">文章 <em>essays</em></h2>
              <Link
                href="/blog"
                className="type-count hover:text-accent transition-colors"
              >
                全部 {articles.length} 篇 →
              </Link>
            </div>

            <ul className="space-y-9">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/blog/${a.slug}`} className="group block">
                    <div className="meta-line mb-2">
                      <time>{a.date}</time>
                      <span className="sep">·</span>
                      <span>{a.readingTime}</span>
                    </div>
                    <h3 className="type-title group-hover:text-accent transition-colors">
                      {a.title}
                    </h3>
                    <p className="note mt-2 line-clamp-2">
                      {a.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </main>

        {/* 题目 */}
        <aside id="topics" className="lg:sticky lg:top-28 self-start">
          <div className="flex items-baseline justify-between gap-3 mb-6 pb-3 border-b border-line/70">
            <h2 className="label-rule">题目 <em>topics</em></h2>
            <Link
              href="/topics"
              className="type-count hover:text-accent transition-colors"
            >
              全部 →
            </Link>
          </div>

          <ul className="space-y-3">
            {topics.map((t) => (
              <li key={t.name}>
                <Link
                  href={`/topics/${encodeURIComponent(t.name)}`}
                  className="group flex items-baseline justify-between gap-3"
                >
                  <span className="type-item group-hover:text-accent transition-colors">
                    {t.name}
                  </span>
                  <span className="type-count">
                    {t.total}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-10 note text-ink-dim max-w-[26ch]">
            写的时候并不知道会写成什么。有些后来成了文章，多数停在这里。
          </p>
        </aside>

      </div>
    </div>
  )
}
