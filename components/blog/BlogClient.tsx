'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { PostMeta } from '@/lib/mdx'

interface BlogClientProps {
  posts: PostMeta[]
  tags: string[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export default function BlogClient({ posts, tags }: BlogClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchTag = !activeTag || p.topics.includes(activeTag)
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.topics.some((t) => t.toLowerCase().includes(q)) || p.title.toLowerCase().includes(q)
      return matchTag && matchSearch
    })
  }, [posts, activeTag, search])

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="搜索标题、摘要、标签…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field sm:max-w-xs"
        />

        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            data-active={!activeTag}
            className="filter-term"
          >
            全部
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              data-active={activeTag === tag}
              className="filter-term"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <p className="meta-label mb-4">共 {filtered.length} 篇</p>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-ink-dim text-sm">没有找到匹配的文章</p>
      ) : (
        <ul className="divide-y divide-line/60">
          {filtered.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group flex items-baseline gap-5 py-5">
                <span className="hidden sm:block w-24 shrink-0 font-mono text-[11px] text-ink-dim">
                  {formatDate(post.date)}
                </span>

                <span className="flex-1 min-w-0">
                  <span className="block title-display text-lg md:text-xl text-ink group-hover:text-accent transition-colors">
                    {post.title}
                  </span>
                  <span className="block note mt-1.5 line-clamp-1">
                    {post.excerpt}
                  </span>
                </span>

                <span className="shrink-0 font-mono text-[11px] text-ink-dim">
                  {post.readingTime}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
