'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NewPostPage() {
  const router = useRouter()
  const contentRef = useRef<HTMLTextAreaElement | null>(null)

  const [form, setForm] = useState({
    slug: '',
    title: '',
    date: new Date().toISOString().slice(0, 10),
    excerpt: '',
    tags: '',
    topics: '',
    cover: '',
    content: '',
  })
  const [kind, setKind] = useState<'thought' | 'article'>('thought')
  const [media, setMedia] = useState<string[]>([])
  const [assets, setAssets] = useState<{ photos: { id: string; alt: string }[]; videos: { id: string; title: string }[] }>({ photos: [], videos: [] })

  useEffect(() => {
    Promise.all([
      fetch('/api/upload/photos').then((r) => (r.ok ? r.json() : { photos: [] })),
      fetch('/api/upload/videos').then((r) => (r.ok ? r.json() : { videos: [] })),
    ])
      .then(([ph, vi]) => setAssets({ photos: ph.photos ?? [], videos: vi.videos ?? [] }))
      .catch(() => {})
  }, [])

  const toggleMedia = (id: string) =>
    setMedia((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    const selected = current.slice(start, end)
    const after = current.slice(end)

    const needsLeadingBreak =
      before.length > 0 && !before.endsWith('\n\n')
    const needsTrailingBreak =
      after.length > 0 && !after.startsWith('\n\n')

    const insertText =
      `${needsLeadingBreak ? '\n\n' : ''}` +
      text +
      `${needsTrailingBreak ? '\n\n' : ''}`

    const next = before + insertText + after.replace(/^\n?/, needsTrailingBreak ? '' : after.startsWith('\n') ? '' : '')

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
    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          kind,
          media,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          topics: form.topics.split(',').map(t => t.trim()).filter(Boolean),
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
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="text-ink-muted/50 text-sm hover:text-accent transition-colors">
            ← 返回
          </Link>
          <h1 className="text-xl font-black tracking-widest text-ink">
            {kind === 'thought' ? '记一条想法' : '写一篇文章'}
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <form onSubmit={submit} className="surface p-8 flex flex-col gap-5">

            {/* 类型：想法优先 */}
            <div className="flex items-center gap-2">
              {([
                { id: 'thought', label: '想法', hint: '短，不用标题' },
                { id: 'article', label: '文章', hint: '长，要标题' },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setKind(t.id)}
                  className={`flex-1 px-4 py-3 rounded-xl border text-left transition-all ${
                    kind === t.id
                      ? 'bg-accent/12 border-accent/35 text-ink'
                      : 'bg-panel-2 border-line text-ink-muted hover:border-line-strong'
                  }`}
                >
                  <span className="text-sm block">{t.label}</span>
                  <span className="font-mono text-[10.5px] text-ink-dim">{t.hint}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label={kind === 'thought' ? 'Slug（可留空，自动生成）' : 'Slug（URL）'} required={kind === 'article'}>
                <input
                  value={form.slug}
                  onChange={set('slug')}
                  required={kind === 'article'}
                  placeholder={kind === 'thought' ? '留空即可' : 'my-post-slug'}
                  className={inputCls}
                />
              </Field>
              <Field label="日期">
                <input type="date" value={form.date} onChange={set('date')} className={inputCls} />
              </Field>
            </div>

            <Field label="题目（逗号分隔）">
              <input
                value={form.topics}
                onChange={set('topics')}
                placeholder="哲学, 数学, 计算机"
                className={inputCls}
              />
            </Field>

            {/* 附带媒体：从已上传素材里点选，图片视频都能挂到这条记录上 */}
            <div className="flex flex-col gap-2">
              <label className="text-ink-muted/70 text-xs tracking-widest uppercase">
                附带的图片 / 视频
                {media.length > 0 && (
                  <span className="ml-2 font-mono text-accent normal-case tracking-normal">
                    已选 {media.length}
                  </span>
                )}
              </label>

              {assets.photos.length === 0 && assets.videos.length === 0 ? (
                <p className="text-ink-dim text-[12.5px] leading-6">
                  还没有素材。先去
                  <Link href="/admin/gallery/upload" target="_blank" className="text-accent hover:underline mx-1">
                    上传图片
                  </Link>
                  或
                  <Link href="/admin/videos/upload" target="_blank" className="text-accent hover:underline mx-1">
                    上传视频
                  </Link>
                  ，回来再点选。
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {assets.photos.map((ph) => {
                    const on = media.includes(ph.id)
                    return (
                      <button
                        key={ph.id}
                        type="button"
                        onClick={() => toggleMedia(ph.id)}
                        title={ph.alt}
                        className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${
                          on ? 'border-accent ring-1 ring-accent' : 'border-line opacity-70 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/api/media/photos/${ph.id}`} alt={ph.alt} className="w-full h-full object-cover" />
                        {on && (
                          <span className="absolute top-1 right-1 text-[10px] bg-accent text-on-accent rounded px-1">✓</span>
                        )}
                      </button>
                    )
                  })}

                  {assets.videos.map((vi) => {
                    const on = media.includes(vi.id)
                    return (
                      <button
                        key={vi.id}
                        type="button"
                        onClick={() => toggleMedia(vi.id)}
                        title={vi.title}
                        className={`relative aspect-square overflow-hidden rounded-lg border bg-black transition-all ${
                          on ? 'border-accent ring-1 ring-accent' : 'border-line opacity-70 hover:opacity-100'
                        }`}
                      >
                        <video src={`/api/media/videos/${vi.id}`} muted preload="metadata" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-ink rounded px-1">视频</span>
                        {on && (
                          <span className="absolute top-1 right-1 text-[10px] bg-accent text-on-accent rounded px-1">✓</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {kind === 'article' && (
              <>
                <Field label="标题" required>
                  <input value={form.title} onChange={set('title')} required placeholder="文章标题" className={inputCls} />
                </Field>

                <Field label="摘要">
                  <input value={form.excerpt} onChange={set('excerpt')} placeholder="一句话简介" className={inputCls} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="标签（逗号分隔）">
                    <input value={form.tags} onChange={set('tags')} placeholder="技术, 生活, Next.js" className={inputCls} />
                  </Field>
                  <Field label="封面图 URL">
                    <input value={form.cover} onChange={set('cover')} placeholder="https://..." className={inputCls} />
                  </Field>
                </div>
              </>
            )}

            <Field label={kind === 'thought' ? '想到什么就写什么' : '正文（Markdown）'} required>
              <textarea
                ref={contentRef}
                value={form.content}
                onChange={set('content')}
                required
                rows={kind === 'thought' ? 8 : 20}
                placeholder={
                  kind === 'thought'
                    ? '几句话就好，不用标题，也不用配图。'
                    : '在这里写 Markdown 内容…'
                }
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
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm font-medium tracking-wide hover:bg-accent/20 hover:border-accent/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '发布中…' : kind === 'thought' ? '发布想法' : '发布文章'}
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
