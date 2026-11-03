'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function UploadPhotoPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [form, setForm] = useState({
    alt: '',
    tags: '',
    width: '600',
    height: '600',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedMarkdown, setCopiedMarkdown] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (f.size > 10 * 1024 * 1024) {
      setError('文件过大（最大 10MB）')
      return
    }

    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
    setError('')
    setUploadedUrl('')
    setCopiedUrl(false)
    setCopiedMarkdown(false)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const copyUrl = async () => {
    if (!uploadedUrl) return
    await navigator.clipboard.writeText(uploadedUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 1500)
  }

  const copyMarkdown = async () => {
    if (!uploadedUrl) return
    const markdown = `![${form.alt || '图片描述'}](${uploadedUrl})`
    await navigator.clipboard.writeText(markdown)
    setCopiedMarkdown(true)
    setTimeout(() => setCopiedMarkdown(false), 1500)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('请选择图片')
      return
    }

    setError('')
    setLoading(true)
    setUploadedUrl('')
    setCopiedUrl(false)
    setCopiedMarkdown(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', form.alt || file.name)
      formData.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)))
      formData.append('width', form.width)
      formData.append('height', form.height)

      const res = await fetch('/api/upload/photos', {
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
          <Link href="/admin/gallery" className="text-ink-muted/50 text-sm hover:text-accent transition-colors">
            ← 返回
          </Link>
          <h1 className="text-xl font-black tracking-widest text-ink">上传图片</h1>
        </div>

        <form onSubmit={submit} className="surface p-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-ink-muted/70 text-xs tracking-widest uppercase">图片文件 *</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-full bg-panel-2 border-2 border-dashed border-line rounded-xl px-4 py-8 text-center hover:border-accent/40 transition-colors cursor-pointer">
                {preview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={preview} alt="preview" className="max-h-40 rounded-lg" />
                    <p className="text-ink-muted/70 text-sm">{file?.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-ink-muted/70 text-sm">点击或拖拽上传图片</p>
                    <p className="text-ink-muted/40 text-xs">支持 JPG、PNG、GIF、WebP（最大 10MB）</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Field label="图片描述" required>
            <input value={form.alt} onChange={set('alt')} required placeholder="图片的简短描述" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="宽度（px）">
              <input type="number" value={form.width} onChange={set('width')} min="100" className={inputCls} />
            </Field>
            <Field label="高度（px）">
              <input type="number" value={form.height} onChange={set('height')} min="100" className={inputCls} />
            </Field>
          </div>

          <Field label="标签（逗号分隔）">
            <input value={form.tags} onChange={set('tags')} placeholder="生活, 旅行, 美食" className={inputCls} />
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
                  {copiedUrl ? '已复制链接' : '复制图片链接'}
                </button>

                <button
                  type="button"
                  onClick={copyMarkdown}
                  className="px-4 py-2 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm hover:bg-accent/20 transition-all"
                >
                  {copiedMarkdown ? '已复制 Markdown' : '复制 Markdown'}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/admin/gallery')}
                  className="px-4 py-2 rounded-xl bg-panel-2 border border-line text-ink-muted/80 text-sm hover:text-ink transition-all"
                >
                  去图片管理
                </button>
              </div>

              <div className="text-ink-muted/60 text-xs break-all">
                Markdown 用法：<code>{`![${form.alt || '图片描述'}](${uploadedUrl})`}</code>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-3 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm font-medium tracking-wide hover:bg-accent/20 hover:border-accent/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '上传中…' : '上传图片'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

const inputCls = 'field'

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
