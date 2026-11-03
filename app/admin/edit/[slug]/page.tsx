'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Form {
  kind: 'thought' | 'article'
  title: string
  date: string
  excerpt: string
  topics: string
  media: string
  content: string
}

export default function EditPostPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const contentRef = useRef<HTMLTextAreaElement | null>(null)

  const [form, setForm] = useState<Form>({
    kind: 'article',
    title: '',
    date: '',
    excerpt: '',
    topics: '',
    media: '',
    content: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    fetch(`/api/posts/${slug}/raw`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push('/admin/login')
          return
        }
        setForm({
          kind: data.kind === 'thought' ? 'thought' : 'article',
          title: data.title ?? '',
          date: data.date ?? '',
          excerpt: data.excerpt ?? '',
          topics: (data.topics ?? []).join(', '),
          media: (data.media ?? []).join(', '),
          content: data.content ?? '',
        })
        setLoading(false)
      })
      .catch(() => {
        setError('读取失败')
        setLoading(false)
      })
  }, [slug, router])

  const set =
    (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const splitList = (s: string) =>
    s
      .split(/[,，]/)
      .map((x) => x.trim())
      .filter(Boolean)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setOk('')
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: form.kind,
          title: form.title,
          date: form.date,
          excerpt: form.excerpt,
          topics: splitList(form.topics),
          media: splitList(form.media),
          content: form.content,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '保存失败')
        return
      }
      setOk('已保存。别忘了 git push 才会更新线上。')
      router.refresh()
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-ink-dim text-sm py-10">读取中…</p>
  }

  return (
    <div className="max-w-3xl">
      <header className="mb-9">
        <div className="label-rule mb-6">编辑 <em>edit</em></div>
        <h1 className="type-display-2">
          {form.kind === 'thought' ? '一条想法' : '一篇文章'}
        </h1>
        <p className="note mt-3 font-mono">{slug}</p>
      </header>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="label-rule">类型</span>
            <select value={form.kind} onChange={set('kind')} className="field">
              <option value="thought">想法（短，不带标题）</option>
              <option value="article">文章（长，带标题）</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="label-rule">日期</span>
            <input type="date" value={form.date} onChange={set('date')} className="field" />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="label-rule">标题{form.kind === 'thought' && '（想法可留空）'}</span>
          <input
            value={form.title}
            onChange={set('title')}
            className="field"
            placeholder={form.kind === 'thought' ? '留空即可' : '一句话说清这篇在问什么'}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="label-rule">摘要（文章列表里显示的一行）</span>
          <input value={form.excerpt} onChange={set('excerpt')} className="field" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="label-rule">题目（逗号分隔，决定它出现在哪个专题）</span>
          <input
            value={form.topics}
            onChange={set('topics')}
            className="field"
            placeholder="哲学, 计算机"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="label-rule">附带媒体（文件名，逗号分隔）</span>
          <input
            value={form.media}
            onChange={set('media')}
            className="field font-mono text-xs"
            placeholder="1793666201929.webp"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="label-rule">正文</span>
          <textarea
            ref={contentRef}
            value={form.content}
            onChange={set('content')}
            rows={18}
            className="field resize-y font-mono text-[.8125rem] leading-7"
          />
        </label>

        {error && <p className="note text-ink-muted">{error}</p>}
        {ok && <p className="note text-ink-muted">{ok}</p>}

        <div className="flex items-center gap-4 pt-1">
          <button type="submit" disabled={saving} className="btn-accent px-6 py-2.5 text-sm">
            {saving ? '保存中…' : '保存'}
          </button>
          <Link href="/admin/dashboard" className="text-[.75rem] text-ink-dim hover:text-ink-muted">
            ← 返回概览
          </Link>
          <Link
            href={`/admin/topics`}
            className="text-[.75rem] text-ink-dim hover:text-ink-muted"
          >
            管理题目 ↗
          </Link>
        </div>
      </form>
    </div>
  )
}
