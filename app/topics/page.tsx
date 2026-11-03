import Link from 'next/link'
import { getTopicStats } from '@/lib/mdx'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '题目',
  description: '反复回到的那几个问题。',
}

export default function TopicsPage() {
  const topics = getTopicStats()

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 pt-32 pb-24">

      <header className="mb-16">
        <div className="label-rule mb-8">
          题目 <em>topics</em>
        </div>
        <h1 className="type-display-2">
          反复回到的几个问题。
        </h1>
        <p className="epigraph mt-7 max-w-[52ch]">
          {topics.length} 个。同一个问题，前后想过很多次；答案在变，问题没变。
        </p>
      </header>

      <ul>
        {topics.map((t) => (
          <li key={t.name} className="border-b border-line/50">
            <Link
              href={`/topics/${encodeURIComponent(t.name)}`}
              className="group flex items-baseline gap-4 py-5"
            >
              <span className="type-title group-hover:text-accent transition-colors">
                {t.name}
              </span>

              <span className="ml-auto type-count">
                {t.thoughts > 0 && <span className="mr-4">想法 {t.thoughts}</span>}
                {t.articles > 0 && <span>文章 {t.articles}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {topics.length === 0 && (
        <p className="text-ink-dim text-sm py-10">
          还没有题目。在后台写想法时填上「题目」就会出现。
        </p>
      )}

      <div className="mt-16">
        <Link href="/" className="type-count hover:text-accent transition-colors">
          ← 回首页
        </Link>
      </div>
    </div>
  )
}
