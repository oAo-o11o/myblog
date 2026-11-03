'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SiteConfig } from '@/lib/site'

const SKINS = [
  { id: 'olive', label: '橄榄' },
  { id: 'ink', label: '石墨' },
  { id: 'plum', label: '暗梅' },
  { id: 'warm', label: '暖褐' },
  { id: 'neon', label: '霓虹' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [site, setSite] = useState<SiteConfig | null>(null)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/site')
      .then((r) => r.json())
      .then(setSite)
      .catch(() => setStatus('读取失败'))
  }, [])

  const set = (k: keyof SiteConfig) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setSite((s) => (s ? { ...s, [k]: e.target.value } : s))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!site) return
    setSaving(true)
    setStatus('')
    try {
      const res = await fetch('/api/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setStatus(data.error ?? '保存失败')
        return
      }
      // 默认皮肤改了要立刻生效
      document.documentElement.dataset.skin = site.skin
      setStatus('已保存')
      router.refresh()
    } catch {
      setStatus('网络错误')
    } finally {
      setSaving(false)
    }
  }

  if (!site) {
    return <p className="text-ink-dim text-sm py-10">读取中…</p>
  }

  return (
    <div className="max-w-2xl">
      <header className="mb-10">
        <div className="label-rule mb-6">站点设置 <em>settings</em></div>
        <h1 className="type-display-2">前台显示什么，在这里改。</h1>
        <p className="note mt-4">
          改完立刻生效，不用重新构建。存在 <code className="font-mono text-ink-muted">content/site.json</code>。
        </p>
      </header>

      <form onSubmit={submit} className="space-y-7">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="label-rule">站名</span>
            <input value={site.name} onChange={set('name')} className="field" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-rule">英文名</span>
            <input value={site.nameEn} onChange={set('nameEn')} className="field" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="label-rule">首页第一行</span>
            <input value={site.tagline1} onChange={set('tagline1')} className="field" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-rule">首页第二行</span>
            <input value={site.tagline2} onChange={set('tagline2')} className="field" />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="label-rule">首页题记</span>
          <textarea
            value={site.epigraph}
            onChange={set('epigraph')}
            rows={4}
            className="field resize-y leading-7"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="label-rule">默认皮肤</span>
            <select value={site.skin} onChange={set('skin')} className="field">
              {SKINS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-rule">页脚注</span>
            <input value={site.footerNote} onChange={set('footerNote')} className="field" />
          </label>
        </div>

        {status && (
          <p className="note text-ink-muted">{status}</p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={saving} className="btn-accent px-6 py-2.5 text-sm">
            {saving ? '保存中…' : '保存'}
          </button>
          <Link href="/" target="_blank" className="text-[.75rem] text-ink-dim hover:text-ink-muted">
            看一下前台 ↗
          </Link>
        </div>
      </form>
    </div>
  )
}
