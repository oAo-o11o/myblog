'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Skill {
  name: string
  level: number
  color: string
}

interface Social {
  label: string
  href: string
  icon: string
}

interface AboutForm {
  name: string
  handle: string
  role: string
  status: string
  avatarEmoji: string
  introTitle: string
  introSubtitle: string
  bio: string[]
  skills: Skill[]
  interests: string[]
  socials: Social[]
  tools: string[]
}

export default function AdminAboutPage() {
  const router = useRouter()
  const [form, setForm] = useState<AboutForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/about')
      .then((r) => r.json())
      .then((data) => {
        setForm(data)
        setLoading(false)
      })
  }, [])

  const setField = (key: keyof AboutForm, value: any) => {
    setForm((f) => (f ? { ...f, [key]: value } : f))
  }

  const updateSkill = (index: number, key: keyof Skill, value: any) => {
    if (!form) return
    const next = [...form.skills]
    next[index] = { ...next[index], [key]: value }
    setField('skills', next)
  }

  const addSkill = () => {
    if (!form) return
    setField('skills', [...form.skills, { name: '', level: 50, color: 'var(--skin-accent)' }])
  }

  const removeSkill = (index: number) => {
    if (!form) return
    setField('skills', form.skills.filter((_, i) => i !== index))
  }

  const updateSocial = (index: number, key: keyof Social, value: any) => {
    if (!form) return
    const next = [...form.socials]
    next[index] = { ...next[index], [key]: value }
    setField('socials', next)
  }

  const addSocial = () => {
    if (!form) return
    setField('socials', [...form.socials, { label: '', href: '', icon: '◈' }])
  }

  const removeSocial = (index: number) => {
    if (!form) return
    setField('socials', form.socials.filter((_, i) => i !== index))
  }

  const updateStringList = (key: 'bio' | 'interests' | 'tools', index: number, value: string) => {
    if (!form) return
    const next = [...form[key]]
    next[index] = value
    setField(key, next)
  }

  const addStringListItem = (key: 'bio' | 'interests' | 'tools') => {
    if (!form) return
    setField(key, [...form[key], ''])
  }

  const removeStringListItem = (key: 'bio' | 'interests' | 'tools', index: number) => {
    if (!form) return
    setField(key, form[key].filter((_, i) => i !== index))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form) return

    setSaving(true)
    setError('')

    const cleanData = {
      ...form,
      bio: form.bio.map((s) => s.trim()).filter(Boolean),
      interests: form.interests.map((s) => s.trim()).filter(Boolean),
      tools: form.tools.map((s) => s.trim()).filter(Boolean),
      skills: form.skills.filter((s) => s.name.trim()),
      socials: form.socials.filter((s) => s.label.trim() && s.href.trim()),
    }

    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
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

  if (loading || !form) {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">Loading…</div>
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="text-ink-muted/50 text-sm hover:text-accent transition-colors">
            ← Back
          </Link>
          <h1 className="text-xl font-black tracking-widest text-ink">Edit About</h1>
        </div>

        <form onSubmit={submit} className="surface p-8 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name"><input value={form.name} onChange={(e) => setField('name', e.target.value)} className={inputCls} /></Field>
            <Field label="Handle"><input value={form.handle} onChange={(e) => setField('handle', e.target.value)} className={inputCls} /></Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Role"><input value={form.role} onChange={(e) => setField('role', e.target.value)} className={inputCls} /></Field>
            <Field label="Status"><input value={form.status} onChange={(e) => setField('status', e.target.value)} className={inputCls} /></Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Avatar Emoji"><input value={form.avatarEmoji} onChange={(e) => setField('avatarEmoji', e.target.value)} className={inputCls} /></Field>
            <Field label="Intro Title"><input value={form.introTitle} onChange={(e) => setField('introTitle', e.target.value)} className={inputCls} /></Field>
          </div>

          <Field label="Intro Subtitle">
            <input value={form.introSubtitle} onChange={(e) => setField('introSubtitle', e.target.value)} className={inputCls} />
          </Field>

          <SectionTitle title="Bio" />
          {form.bio.map((item, i) => (
            <div key={i} className="flex gap-3">
              <textarea
                value={item}
                onChange={(e) => updateStringList('bio', i, e.target.value)}
                rows={3}
                className={`${inputCls} resize-y`}
              />
              <button type="button" onClick={() => removeStringListItem('bio', i)} className={dangerBtn}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addStringListItem('bio')} className={minorBtn}>+ Add Bio Paragraph</button>

          <SectionTitle title="Skills" />
          {form.skills.map((skill, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 items-end">
              <Field label="Name"><input value={skill.name} onChange={(e) => updateSkill(i, 'name', e.target.value)} className={inputCls} /></Field>
              <Field label="Level"><input type="number" min="0" max="100" value={skill.level} onChange={(e) => updateSkill(i, 'level', Number(e.target.value))} className={inputCls} /></Field>
              <Field label="Color"><input value={skill.color} onChange={(e) => updateSkill(i, 'color', e.target.value)} className={inputCls} /></Field>
              <button type="button" onClick={() => removeSkill(i)} className={dangerBtn}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addSkill} className={minorBtn}>+ Add Skill</button>

          <SectionTitle title="Interests" />
          {form.interests.map((item, i) => (
            <div key={i} className="flex gap-3">
              <input value={item} onChange={(e) => updateStringList('interests', i, e.target.value)} className={inputCls} />
              <button type="button" onClick={() => removeStringListItem('interests', i)} className={dangerBtn}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addStringListItem('interests')} className={minorBtn}>+ Add Interest</button>

          <SectionTitle title="Social Links" />
          {form.socials.map((item, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 items-end">
              <Field label="Label"><input value={item.label} onChange={(e) => updateSocial(i, 'label', e.target.value)} className={inputCls} /></Field>
              <Field label="URL"><input value={item.href} onChange={(e) => updateSocial(i, 'href', e.target.value)} className={inputCls} /></Field>
              <Field label="Icon"><input value={item.icon} onChange={(e) => updateSocial(i, 'icon', e.target.value)} className={inputCls} /></Field>
              <button type="button" onClick={() => removeSocial(i)} className={dangerBtn}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addSocial} className={minorBtn}>+ Add Social</button>

          <SectionTitle title="Tools" />
          {form.tools.map((item, i) => (
            <div key={i} className="flex gap-3">
              <input value={item} onChange={(e) => updateStringList('tools', i, e.target.value)} className={inputCls} />
              <button type="button" onClick={() => removeStringListItem('tools', i)} className={dangerBtn}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addStringListItem('tools')} className={minorBtn}>+ Add Tool</button>

          {error && <p className="text-accent text-sm">{error}</p>}

          <button type="submit" disabled={saving} className={primaryBtn}>
            {saving ? 'Saving…' : 'Save About'}
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

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-ink text-sm font-semibold tracking-[0.18em] uppercase pt-2">{title}</h2>
}

const inputCls = 'field'
const minorBtn = 'btn-ghost px-4 py-2 text-sm w-fit'
const dangerBtn = 'btn-danger px-4 py-2 text-sm'
const primaryBtn = 'btn-accent w-full py-3 text-sm'
