'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function UploadVideoPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: '',
    desc: '',
    tags: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (f.size > 50 * 1024 * 1024) {
      setError('视频过大（最大 50MB）')
      return
    }

    setFile(f)
    setError('')
    setUploadedUrl('')
    setCopiedUrl(false)
    setCopiedEmbed(false)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const copyUrl = async () => {
    if (!uploadedUrl) return
    await navigator.clipboard.writeText(uploadedUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 1500)
  }

  const copyEmbed = async () => {
    if (!uploadedUrl) return
    const html = `<video src="${uploadedUrl}" controls></video>`
    await navigator.clipboard.writeText(html)
    setCopiedEmbed(true)
    setTimeout(() => setCopiedEmbed(false), 1500)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('请选择视频')
      return
    }

    setError('')
    setLoading(true)
    setUploadedUrl('')
    setCopiedUrl(false)
    setCopiedEmbed(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', form.title || file.name)
      formData.append('desc', form.desc)
      formData.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)))

      const res = await fetch('/api/upload/videos', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '上传失败')
        return
      }

      const fullUrl = `${window.location.origin}${data.src}`
      setUploadedUrl(fullUrl)
      setError('')
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/videos" className="text-ink-muted/50 text-sm hover:text-accent transition-colors">
            ← 返回
          </Link>
          <h1 className="text-xl font-black tracking-widest text-ink">上传视频</h1>
        </div>

        <form onSubmit={submit} className="surface p-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-ink-muted/70 text-xs tracking-widest uppercase">视频文件 *</label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileChange}
              required
              className={inputCls}
            />
            {file && <p className="text-ink-muted/60 text-xs">{file.name}</p>}
          </div>

          <Field label="标题" required>
            <input value={form.title} onChange={set('title')} required placeholder="视频标题" className={inputCls} />
          </Field>

          <Field label="描述">
            <textarea value={form.desc} onChange={set('desc')} rows={4} placeholder="视频描述" className={inputCls} />
          </Field>

          <Field label="标签（逗号分隔）">
            <input value={form.tags} onChange={set('tags')} placeholder="演示, 项目, 记录" className={inputCls} />
          </Field>

          {error && (
            <p className="text-accent text-xs text-center bg-accent/8 border border-accent/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {uploadedUrl && (
            <div className="bg-accent/8 border border-line rounded-xl p-4 flex flex-col gap-3">
              <p className="text-[#9ff5cf] text-sm">上传成功</p>

              <input
                readOnly
                value={uploadedUrl}
                className="w-full bg-panel-2 border border-line rounded-xl px-4 py-2.5 text-ink text-sm outline-none"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="px-4 py-2 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm hover:bg-accent/20 transition-all"
                >
                  {copiedUrl ? '已复制链接' : '复制视频链接'}
                </button>

                <button
                  type="button"
                  onClick={copyEmbed}
                  className="px-4 py-2 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm hover:bg-accent/20 transition-all"
                >
                  {copiedEmbed ? '已复制嵌入代码' : '复制嵌入代码'}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/admin/videos')}
                  className="px-4 py-2 rounded-xl bg-panel-2 border border-line text-ink-muted/80 text-sm hover:text-ink transition-all"
                >
                  去视频管理
                </button>
              </div>

              <div className="text-ink-muted/60 text-xs break-all">
                HTML 用法：<code>{`<video src="${uploadedUrl}" controls></video>`}</code>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-3 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm font-medium tracking-wide hover:bg-accent/20 hover:border-accent/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '上传中…' : '上传视频'}
          </button>
        </form>
      </motion.div>
    </div>
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
