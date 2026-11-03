'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface TimelineItem {
  year: string
  month: string
  title: string
  desc: string
  icon: string
  color: string
  tags: string[]
}

export default function AdminTimelinePage() {
  const router = useRouter()
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/timeline')
      .then((r) => r.json())
      .then((data) => {
        setItems(data)
        setLoading(false)
      })
  }, [])

  const updateItem = (index: number, key: keyof TimelineItem, value: any) => {
    const next = [...items]
    next[index] = { ...next[index], [key]: value }
    setItems(next)
  }

  const updateTag = (itemIndex: number, tagIndex: number, value: string) => {
    const next = [...items]
    next[itemIndex].tags[tagIndex] = value
    setItems(next)
  }

  const addTag = (itemIndex: number) => {
    const next = [...items]
    next[itemIndex].tags.push('')
    setItems(next)
  }

  const removeTag = (itemIndex: number, tagIndex: number) => {
    const next = [...items]
    next[itemIndex].tags = next[itemIndex].tags.filter((_, i) => i !== tagIndex)
    setItems(next)
  }

  const addItem = () => {
    setItems([
      {
        year: '2026',
        month: 'April',
        title: '',
        desc: '',
        icon: '✦',
        color: 'var(--skin-accent)',
        tags: [],
      },
      ...items,
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const clean = items.map((item) => ({
      ...item,
      tags: item.tags.map((t) => t.trim()).filter(Boolean),
    }))

    try {
      const res = await fetch('/api/timeline', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clean),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Save failed')
        return
      }

      router.push('/admin/dashboard')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">Loading…</div>
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="text-ink-muted/50 text-sm hover:text-accent transition-colors">
            ← Back
          </Link>
          <h1 className="text-xl font-black tracking-widest text-ink">Edit Timeline</h1>
        </div>

        <form onSubmit={submit} className="surface p-8 flex flex-col gap-6">
          <button type="button" onClick={addItem} className={minorBtn}>+ Add Timeline Item</button>

          {items.map((item, i) => (
            <div key={i} className="rounded-2xl border border-line bg-panel-2 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-ink text-sm font-semibold tracking-[0.18em] uppercase">Item {i + 1}</h2>
                <button type="button" onClick={() => removeItem(i)} className={dangerBtn}>Remove</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Year"><input value={item.year} onChange={(e) => updateItem(i, 'year', e.target.value)} className={inputCls} /></Field>
                <Field label="Month"><input value={item.month} onChange={(e) => updateItem(i, 'month', e.target.value)} className={inputCls} /></Field>
                <Field label="Icon"><input value={item.icon} onChange={(e) => updateItem(i, 'icon', e.target.value)} className={inputCls} /></Field>
                <Field label="Color"><input value={item.color} onChange={(e) => updateItem(i, 'color', e.target.value)} className={inputCls} /></Field>
              </div>

              <Field label="Title">
                <input value={item.title} onChange={(e) => updateItem(i, 'title', e.target.value)} className={inputCls} />
              </Field>

              <Field label="Description">
                <textarea value={item.desc} onChange={(e) => updateItem(i, 'desc', e.target.value)} rows={4} className={`${inputCls} resize-y`} />
              </Field>

              <div className="flex flex-col gap-3">
                <label className="text-ink-muted/70 text-xs tracking-widest uppercase">Tags</label>
                {item.tags.map((tag, ti) => (
                  <div key={ti} className="flex gap-3">
                    <input value={tag} onChange={(e) => updateTag(i, ti, e.target.value)} className={inputCls} />
                    <button type="button" onClick={() => removeTag(i, ti)} className={dangerBtn}>Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => addTag(i)} className={minorBtn}>+ Add Tag</button>
              </div>
            </div>
          ))}

          {error && <p className="text-accent text-sm">{error}</p>}

          <button type="submit" disabled={saving} className={primaryBtn}>
            {saving ? 'Saving…' : 'Save Timeline'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-ink-muted/70 text-xs tracking-widest uppercase">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'field'
const minorBtn = 'btn-ghost px-4 py-2 text-sm w-fit'
const dangerBtn = 'btn-danger px-4 py-2 text-sm'
const primaryBtn = 'btn-accent w-full py-3 text-sm'
