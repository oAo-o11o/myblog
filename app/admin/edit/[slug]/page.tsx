'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function EditPostPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const contentRef = useRef<HTMLTextAreaElement | null>(null)

  const [form, setForm] = useState({
    title: '',
    date: '',
    excerpt: '',
    tags: '',
    cover: '',
    content: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/posts/${slug}/raw`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          router.push('/admin/login')
          return
        }
        setForm({
          title: data.title ?? '',
          date: data.date ?? '',
          excerpt: data.excerpt ?? '',
          tags: (data.tags ?? []).join(', '),
          cover: data.cover ?? '',
          content: data.content ?? '',
        })
        setLoading(false)
      })
  }, [slug, router])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const insertToContent = (text: string) => {
    const el = contentRef.current
    const current = form.content

    if (!el) {
      const next = current ? `${current}\n\n${text}\n\n` : `${text}\n\n`
      setForm(f => ({ ...f, content: next }))
      return
    }

    const start = el.selectionStart ?? current.length
    const end = el.selectionEnd ?? current.length

    const before = current.slice(0, start)
    const after = current.slice(end)

    const needsLeadingBreak =
      before.length > 0 && !before.endsWith('\n\n')
    const needsTrailingBreak =
      after.length > 0 && !after.startsWith('\n\n')

    const insertText =
      `${needsLeadingBreak ? '\n\n' : ''}` +
      text +
      `${needsTrailingBreak ? '\n\n' : ''}`

    const next = before + insertText + after

    setForm(f => ({
      ...f,
      content: next,
    }))

    requestAnimationFrame(() => {
      const textarea = contentRef.current
      if (!textarea) return
      const pos = before.length + insertText.length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      router.push('/admin/dashboard')
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted/40 text-sm">加载中…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="text-ink-muted/50 text-sm hover:text-accent transition-colors">
            ← 返回
          </Link>
          <h1 className="text-xl font-black tracking-widest text-ink">编辑文章</h1>
          <span className="text-ink-muted/40 text-sm font-mono">{slug}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <form onSubmit={submit} className="surface p-8 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="标题" required>
                <input value={form.title} onChange={set('title')} required className={inputCls} />
              </Field>
              <Field label="日期">
                <input type="date" value={form.date} onChange={set('date')} className={inputCls} />
              </Field>
            </div>

            <Field label="摘要">
              <input value={form.excerpt} onChange={set('excerpt')} className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="标签（逗号分隔）">
                <input value={form.tags} onChange={set('tags')} className={inputCls} />
              </Field>
              <Field label="封面图 URL">
                <input value={form.cover} onChange={set('cover')} className={inputCls} />
              </Field>
            </div>

            <Field label="正文（Markdown）" required>
              <textarea
                ref={contentRef}
                value={form.content}
                onChange={set('content')}
                required
                rows={20}
                className={`${inputCls} resize-y font-mono text-xs leading-6`}
              />
            </Field>

            {error && (
              <p className="text-accent text-xs text-center bg-accent/8 border border-accent/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm font-medium tracking-wide hover:bg-accent/20 hover:border-accent/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中…' : '保存修改'}
            </button>
          </form>

          <MediaHelper insertToContent={insertToContent} />
        </div>
      </motion.div>
    </div>
  )
}

function MediaHelper({ insertToContent }: { insertToContent: (text: string) => void }) {
  const imageMarkdown = `![图片描述](图片链接)`
  const videoHtml = `<video src="视频链接" controls></video>`

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <aside className="surface p-6 flex flex-col gap-5 xl:sticky xl:top-24">
      <div>
        <h2 className="text-ink text-sm font-semibold tracking-wide">媒体插入助手</h2>
        <p className="text-ink-muted/55 text-xs mt-1">
          先去上传图片或视频，复制链接后再插入正文。
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/admin/gallery/upload"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm text-center hover:bg-accent/20 transition-all"
        >
          去上传图片
        </Link>

        <Link
          href="/admin/videos/upload"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm text-center hover:bg-accent/20 transition-all"
        >
          去上传视频
        </Link>

        <Link
          href="/admin/gallery"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-panel-2 border border-line text-ink-muted/80 text-sm text-center hover:text-ink transition-all"
        >
          打开图片管理
        </Link>

        <Link
          href="/admin/videos"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-panel-2 border border-line text-ink-muted/80 text-sm text-center hover:text-ink transition-all"
        >
          打开视频管理
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-line bg-panel-2 p-4">
          <p className="text-ink text-sm mb-2">图片 Markdown</p>
          <code className="block text-ink-muted/70 text-xs break-all">{imageMarkdown}</code>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => copyText(imageMarkdown)}
              className="px-3 py-1.5 rounded-lg text-xs bg-accent/12 border border-accent/30 text-ink"
            >
              复制模板
            </button>
            <button
              type="button"
              onClick={() => insertToContent(imageMarkdown)}
              className="px-3 py-1.5 rounded-lg text-xs bg-panel-2 border border-line text-ink-muted/85"
            >
              插入正文
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-panel-2 p-4">
          <p className="text-ink text-sm mb-2">视频嵌入 HTML</p>
          <code className="block text-ink-muted/70 text-xs break-all">{videoHtml}</code>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => copyText(videoHtml)}
              className="px-3 py-1.5 rounded-lg text-xs bg-accent/12 border border-accent/30 text-ink"
            >
              复制模板
            </button>
            <button
              type="button"
              onClick={() => insertToContent(videoHtml)}
              className="px-3 py-1.5 rounded-lg text-xs bg-panel-2 border border-line text-ink-muted/85"
            >
              插入正文
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

const inputCls =
  'w-full bg-panel-2 border border-line rounded-xl px-4 py-2.5 text-ink text-sm outline-none focus:border-accent/40 transition-colors placeholder:text-ink-muted/30'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-ink-muted/70 text-xs tracking-widest uppercase">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
