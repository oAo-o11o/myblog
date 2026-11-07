'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Post {
  slug: string
  kind: string
  date: string
  title: string
  topics: string[]
}

interface Counts {
  thoughts: number
  articles: number
  photos: number
  videos: number
}

const ACTIONS = [
  { href: '/admin/new',            label: '写一条',   hint: '想法 / 文章' },
  { href: '/admin/new?topic=生活&kind=thought', label: '写生活', hint: '题目自动填「生活」' },
  { href: '/admin/gallery/upload', label: '上传图片', hint: '≤ 10 MB' },
  { href: '/admin/videos/upload',  label: '上传视频', hint: '≤ 50 MB · 自动转码' },
  { href: '/admin/about',          label: '关于页',   hint: 'about.json' },
  { href: '/admin/timeline',       label: '时间线',   hint: 'timeline.json' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [counts, setCounts] = useState<Counts>({ thoughts: 0, articles: 0, photos: 0, videos: 0 })
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    const res = await fetch('/api/posts')
    if (res.status === 401) {
      router.push('/admin/login')
      return
    }
    const data = await res.json()
    const list: Post[] = (data.meta ?? (data.posts as string[]).map((s: string) => ({ slug: s }))) as Post[]

    let photos = 0
    let videos = 0
    try {
      const [p, v] = await Promise.all([
        fetch('/api/upload/photos').then((r) => r.json()),
        fetch('/api/upload/videos').then((r) => r.json()),
      ])
      photos = (p.photos ?? []).length
      videos = (v.videos ?? []).length
    } catch {
      /* 统计失败不影响主流程 */
    }

    setPosts(list)
    setCounts({
      thoughts: list.filter((p) => p.kind === 'thought').length,
      articles: list.filter((p) => p.kind !== 'thought').length,
      photos,
      videos,
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const deletePost = async (slug: string) => {
    if (!confirm(`删除「${slug}」？文件会直接从 content/posts 移除。`)) return
    await fetch(`/api/posts/${slug}`, { method: 'DELETE' })
    fetchAll()
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 pt-32 pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

        {/* 抬头 */}
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="label-rule mb-6">概览 <em>overview</em></div>
            <h1 className="type-display-2">写作台。</h1>
            <p className="text-ink-muted text-sm mt-3">
              内容都躺在 <code className="font-mono text-accent">content/</code> 里，改完即生效。
            </p>
          </div>

          <button onClick={logout} className="btn-ghost px-4 py-2 text-sm shrink-0">
            退出
          </button>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { k: '想法', v: counts.thoughts },
            { k: '文章', v: counts.articles },
            { k: '图片', v: counts.photos },
            { k: '视频', v: counts.videos },
          ].map(({ k, v }) => (
            <div key={k} className="surface px-5 py-4">
              <div className="font-mono text-2xl text-accent leading-none">{loading ? '—' : v}</div>
              <div className="label-rule mt-2">{k}</div>
            </div>
          ))}
        </div>

        {/* 动作 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-12">
          {ACTIONS.map(({ href, label, hint }) => (
            <Link
              key={href}
              href={href}
              className="btn-accent px-4 py-3 flex flex-col gap-1 text-left"
            >
              <span className="text-sm">{label}</span>
              <span className="font-mono text-[10.5px] text-ink-dim">{hint}</span>
            </Link>
          ))}
        </div>

        {/* 文章列表 */}
        <section className="surface p-0 overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-line">
            <span className="label-rule">全部内容</span>
            <span className="type-count">{posts.length} 条</span>
          </header>

          {loading ? (
            <p className="text-ink-dim text-sm text-center py-12">读取中…</p>
          ) : posts.length === 0 ? (
            <p className="text-ink-dim text-sm text-center py-12">
              还没有文章，从「新建文章」开始。
            </p>
          ) : (
            <ul>
              {posts.map((p) => (
                <li
                  key={p.slug}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-line last:border-0 hover:bg-panel-2 transition-colors"
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono text-[10px] tracking-[.14em] text-ink-dim shrink-0">
                      {p.kind === 'thought' ? '想法' : '文章'}
                    </span>
                    <span className="font-mono text-sm text-ink/85 truncate">{p.slug}</span>
                    <span className="type-count shrink-0 hidden sm:block">{p.date}</span>
                  </span>

                  <div className="flex items-center gap-4 shrink-0">
                    <Link
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      className="font-mono text-[11px] text-ink-dim hover:text-accent transition-colors"
                    >
                      预览
                    </Link>
                    <Link
                      href={`/admin/edit/${p.slug}`}
                      className="font-mono text-[11px] text-ink-dim hover:text-accent transition-colors"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => deletePost(p.slug)}
                      className="font-mono text-[11px] text-ink-dim hover:text-accent-2 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

      </motion.div>
    </div>
  )
}
