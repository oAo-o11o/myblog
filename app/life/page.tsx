import Link from 'next/link'
import { getLifeEntries, LIFE_TOPIC } from '@/lib/mdx'
import MediaStrip from '@/components/content/MediaStrip'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '生活',
  description: '想累了就记点别的。发生过什么，就记什么。',
}

const COLUMN = LIFE_TOPIC

function monthParts(ym: string) {
  const [y, m] = ym.split('-')
  return { year: y, month: String(Number(m)) }
}

export default function LifePage() {
  const entries = getLifeEntries()

  const groups: { month: string; items: typeof entries }[] = []
  for (const e of entries) {
    const month = e.date.slice(0, 7)
    const last = groups[groups.length - 1]
    if (last && last.month === month) last.items.push(e)
    else groups.push({ month, items: [e] })
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 pt-32 pb-24">
      <header className="mb-20">
        <div className="label-rule mb-8">
          生活 <em>life</em>
        </div>
        <h1 className="type-display-2">生活不用想清楚。</h1>
        <p className="epigraph mt-7 max-w-[52ch]">
          {entries.length} 条。今天吃了什么、路过哪里、谁说了句话——记下来就够，不必有意义。
        </p>
      </header>

      {groups.map((group) => {
        const { year, month } = monthParts(group.month)
        const imageCount = group.items.filter((e) => (e.media?.length ?? 0) > 0).length

        return (
          <section key={group.month} className="mb-24">
            {/* 月份：一个大号数字当锚点，不放框线 */}
            <div className="flex items-baseline gap-5 mb-10">
              <span className="font-mono text-[3.25rem] leading-[0.8] text-ink/15 select-none">
                {month}
              </span>
              <span className="label-rule">
                {year} 年 {Number(month)} 月 · {group.items.length} 条
                {imageCount > 0 && ` · ${imageCount} 张图`}
              </span>
            </div>

            <div className="space-y-14">
              {group.items.map((e) => {
                const hasMedia = (e.media?.length ?? 0) > 0
                const day = e.date.slice(5).replace('-', '.')

                return (
                  <article
                    key={e.slug}
                    className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[5rem_1fr] gap-4 sm:gap-8"
                  >
                    <div className="meta-line pt-1">{day}</div>

                    <div className={hasMedia ? '' : 'max-w-[46ch]'}>
                      {/* 有图的条目：先看图，文字当说明 */}
                      {hasMedia && <MediaStrip media={e.media} />}

                      {e.kind === 'article' ? (
                        <>
                          <h2 className={`type-title ${hasMedia ? 'mt-5' : ''}`}>
                            <Link
                              href={`/blog/${e.slug}`}
                              className="hover:text-accent transition-colors"
                            >
                              {e.title}
                            </Link>
                          </h2>
                          {e.excerpt && <p className="note mt-3">{e.excerpt}</p>}
                        </>
                      ) : (
                        <p
                          className={
                            hasMedia
                              ? 'note mt-5 !text-[.875rem] !leading-[1.9]'
                              : 'body-text whitespace-pre-wrap'
                          }
                        >
                          {e.body}
                        </p>
                      )}

                      {/* 没图的条目，媒体组件已经在上面渲染过 */}
                      {!hasMedia && <MediaStrip media={e.media} />}

                      {e.topics.filter((t) => t !== COLUMN).length > 0 && (
                        <div className="meta-line mt-4">
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
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}

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
