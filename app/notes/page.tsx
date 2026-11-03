import Link from 'next/link'
import { getThoughts } from '@/lib/mdx'
import MediaStrip from '@/components/content/MediaStrip'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '想法',
  description: '想起一句，就先记一句。',
}

export default function NotesPage() {
  const thoughts = getThoughts()

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 pt-32 pb-24">

      <header className="mb-16">
        <div className="label-rule mb-8">
          想法 <em>thoughts</em>
        </div>
        <h1 className="type-display-2">
          想一半的，先放着。
        </h1>
        <p className="epigraph mt-7 max-w-[52ch]">
          {thoughts.length} 条。没有标题，也不必有结论。想起一句，就先记一句。
        </p>
      </header>

      <div className="space-y-14">
        {thoughts.map((t) => (
          <article key={t.slug} className="thought-rail">
            <div className="meta-line mb-3">
              <time>{t.date}</time>
              {t.topics.length > 0 && <span className="sep">·</span>}
              {t.topics.map((topic) => (
                <Link key={topic} href={`/topics/${encodeURIComponent(topic)}`} className="term">
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

      {thoughts.length === 0 && (
        <p className="text-ink-dim text-sm py-10">还没有想法。</p>
      )}

      <div className="mt-20 pt-8 border-t border-line/60">
        <Link href="/" className="type-count hover:text-accent transition-colors">
          ← 回首页
        </Link>
      </div>
    </div>
  )
}
