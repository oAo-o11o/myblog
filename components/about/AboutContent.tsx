'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

interface AboutData {
  name: string
  handle: string
  role: string
  status: string
  avatarEmoji: string
  bio: string[]
  skills: Skill[]
  interests: string[]
  socials: Social[]
  tools: string[]
}

export default function AboutContent() {
  const [data, setData] = useState<AboutData | null>(null)

  useEffect(() => {
    fetch('/api/about')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data) {
    return <p className="text-ink-dim text-sm py-10">读取中…</p>
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_240px] gap-12 lg:gap-16">

      {/* 左：自述 */}
      <div>
        <h2 className="type-display-2 !text-[1.25rem] !tracking-[0.06em]">{data.name}</h2>
        <p className="font-mono text-[.6875rem] tracking-[.14em] text-ink-dim mt-2">
          {data.handle} · {data.role}
        </p>
        <p className="note mt-1 text-ink-dim">{data.status}</p>

        <div className="mt-8 space-y-4">
          {data.bio.map((line, i) => (
            <p key={i} className="body-text">{line}</p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {data.socials.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[.8125rem] text-ink-muted hover:text-ink transition-colors"
            >
              {label} ↗
            </Link>
          ))}
        </div>
      </div>

      {/* 右：在学 / 在做 */}
      <aside>
        <div className="label-rule mb-5">在学 <em>studying</em></div>

        <ul>
          {data.skills.map((s) => (
            <li
              key={s.name}
              className="flex items-baseline justify-between gap-4 border-b border-line/50 py-2.5"
            >
              <span className="text-[.8125rem] text-ink-muted">{s.name}</span>
              <span className="font-mono text-[.625rem] tracking-[.12em] text-ink-dim">
                {s.level}
              </span>
            </li>
          ))}
        </ul>

        <div className="label-rule mb-4 mt-9">在做 <em>tools</em></div>
        <p className="text-[.75rem] leading-7 text-ink-dim">
          {data.tools.join(' · ')}
        </p>

        <div className="label-rule mb-4 mt-9">在意 <em>interests</em></div>
        <p className="text-[.75rem] leading-7 text-ink-dim">
          {data.interests.join(' · ')}
        </p>
      </aside>
    </div>
  )
}
