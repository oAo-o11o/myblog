import Link from 'next/link'
import { getAllEntries } from '@/lib/mdx'
import MediaStrip from '@/components/content/MediaStrip'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '生活',
  description: '想累了就记点别的。发生过什么，就记什么。',
}

/** 专栏的判定：题目里带这个词的内容，都会出现在这里 */
const COLUMN = '生活'

function monthLabel(ym: string) {
  const [y, m] = ym.split('-')
  return `${y} 年 ${Number(m)} 月`
}

export default function LifePage() {
  const entries = getAllEntries().filter((e) => e.topics?.includes(COLUMN))

  // 按月份分组，保持时间倒序
  const groups: { month: string; items: typeof entries }[] = []
  for (const e of entries) {
    const month = e.date.slice(0, 7)
    const last = groups[groups.length - 1]
    if (last && last.month === month) last.items.push(e)
    else groups.push({ month, items: [e] })
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 pt-32 pb-24">
      <header className="mb-16">
        <div className="label-rule mb-8">
          生活 <em>life</em>
        </div>
        <h1 className="type-display-2">生活不用想清楚。</h1>
        <p className="epigraph mt-7 max-w-[52ch]">
          {entries.length} 条。今天吃了什么、路过哪里、谁说了句话——记下来就够，不必有意义。
        </p>
      </header>

      {groups.map((group) => (
        <section key={group.month} className="mb-16">
          <div className="label-rule mb-8">{monthLabel(group.month)}</div>

          <div className="space-y-12">
            {group.items.map((e) => (
              <article key={e.slug} className="thought-rail">
                <div className="meta-line mb-3">
                  <time>{e.date}</time>
                  {e.topics.filter((t) => t !== COLUMN).length > 0 && <span className="sep">·</span>}
                  {e.topics
                    .filter((t) => t !== COLUMN)
                    .map((topic) => (
                      <Link
                        key={topic}
                        href={`/topics/${encodeURIComponent(topic)}`}
                        className="term"
                      >
                        {topic}
                      </Link>
                    ))}
                </div>

                {e.kind === 'article' ? (
                  <>
                    <h2 className="type-title">
                      <Link href={`/blog/${e.slug}`} className="hover:text-accent transition-colors">
                        {e.title}
                      </Link>
                    </h2>
                    {e.excerpt && <p className="note mt-3">{e.excerpt}</p>}
                  </>
                ) : (
                  <p className="body-text whitespace-pre-wrap">{e.body}</p>
                )}

                <MediaStrip media={e.media} />
              </article>
            ))}
          </div>
        </section>
      ))}

      {entries.length === 0 && (
        <div className="py-10">
          <p className="text-ink-dim text-sm">还没有记录。</p>
          <p className="note mt-3 max-w-[46ch]">
            写内容的时候，把「题目」填上「生活」，它就会出现在这一页。
            想法和文章都可以，图片视频也一起带过来。
          </p>
        </div>
      )}

      <div className="mt-20 pt-8 border-t border-line/60 flex items-center gap-8">
        <Link href="/" className="type-count hover:text-accent transition-colors">
          ← 回首页
        </Link>
        <Link href="/gallery" className="type-count hover:text-accent transition-colors">
          画廊 →
        </Link>
      </div>
    </div>
  )
}
