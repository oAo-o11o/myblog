'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Topic {
  name: string
  total: number
  thoughts: number
  articles: number
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [nextName, setNextName] = useState('')
  const [status, setStatus] = useState('')
  const [working, setWorking] = useState(false)

  const load = async () => {
    try {
      const posts = await fetch('/api/posts').then((r) => r.json())
      const slugs: string[] = posts.posts ?? []

      const all: Topic[] = []
      const map = new Map<string, Topic>()

      await Promise.all(
        slugs.map(async (slug) => {
          const r = await fetch(`/api/posts/${encodeURIComponent(slug)}/raw`)
          if (!r.ok) return
          const data = await r.json()
          const topics: string[] = Array.isArray(data.topics) ? data.topics : []
          const kind = data.kind === 'thought' ? 'thought' : 'article'
          for (const t of topics) {
            const cur = map.get(t) ?? { name: t, total: 0, thoughts: 0, articles: 0 }
            cur.total += 1
            if (kind === 'thought') cur.thoughts += 1
            else cur.articles += 1
            map.set(t, cur)
          }
        })
      )

      all.push(...map.values())
      setTopics(all.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)))
    } catch {
      setStatus('读取失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const rename = async (from: string) => {
    const to = nextName.trim()
    if (!to) return
    setWorking(true)
    setStatus('')
    try {
      const res = await fetch('/api/topics/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.error ?? '改名失败')
        return
      }
      setStatus(`「${from}」→「${to}」，改了 ${data.changed} 篇`)
      setEditing(null)
      setNextName('')
      setLoading(true)
      await load()
    } catch {
      setStatus('网络错误')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <header className="mb-10">
        <div className="label-rule mb-6">题目 <em>topics</em></div>
        <h1 className="type-display-2">所有题目。</h1>
        <p className="note mt-4">
          题目来自每篇内容的 frontmatter。这里改名会同步改掉所有引用它的文件——不会留下孤儿题目。
        </p>
      </header>

      {loading ? (
        <p className="text-ink-dim text-sm py-10">读取中…</p>
      ) : topics.length === 0 ? (
        <p className="text-ink-dim text-sm py-10">
          还没有题目。在「写一条」里填上题目就会出现。
        </p>
      ) : (
        <ul>
          {topics.map((t) => (
            <li key={t.name} className="border-b border-line/50 py-4">
              <div className="flex items-baseline gap-4">
                <span className="type-title">{t.name}</span>
                <span className="type-count">
                  想法 {t.thoughts} · 文章 {t.articles}
                </span>

                <div className="ml-auto flex items-baseline gap-4">
                  <Link
                    href={`/topics/${encodeURIComponent(t.name)}`}
                    target="_blank"
                    className="text-[.75rem] text-ink-dim hover:text-ink-muted"
                  >
                    查看 ↗
                  </Link>
                  <button
                    onClick={() => {
                      setEditing(editing === t.name ? null : t.name)
                      setNextName(t.name)
                      setStatus('')
                    }}
                    className="text-[.75rem] text-ink-dim hover:text-ink-muted"
                  >
                    {editing === t.name ? '取消' : '改名'}
                  </button>
                </div>
              </div>

              {editing === t.name && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    value={nextName}
                    onChange={(e) => setNextName(e.target.value)}
                    className="field max-w-xs"
                    placeholder="新题目"
                  />
                  <button
                    onClick={() => rename(t.name)}
                    disabled={working || !nextName.trim() || nextName.trim() === t.name}
                    className="btn-accent px-4 py-2 text-sm disabled:opacity-40"
                  >
                    {working ? '处理中…' : '确认改名'}
                  </button>
                  <span className="note">会改写 content/posts 下的 frontmatter</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {status && <p className="note mt-6 text-ink-muted">{status}</p>}
    </div>
  )
}
