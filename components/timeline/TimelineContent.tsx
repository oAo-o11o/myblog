'use client'

import { useEffect, useState } from 'react'

interface TimelineItem {
  year: string
  month: string
  title: string
  desc: string
  icon: string
  color: string
  tags: string[]
}

function groupByYear(items: TimelineItem[]) {
  const map = new Map<string, TimelineItem[]>()
  items.forEach((item) => {
    if (!map.has(item.year)) map.set(item.year, [])
    map.get(item.year)!.push(item)
  })
  return Array.from(map.entries())
}

export default function TimelineContent() {
  const [events, setEvents] = useState<TimelineItem[]>([])

  useEffect(() => {
    fetch('/api/timeline')
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => setEvents([]))
  }, [])

  const grouped = groupByYear(events)

  return (
    <div>
      {grouped.map(([year, items]) => (
        <section key={year} className="mb-16">
          <div className="flex items-baseline gap-5 mb-8">
            <span className="type-display-2 !text-[1.35rem] !tracking-[0.12em] text-ink-muted">
              {year}
            </span>
            <span className="h-px flex-1 bg-line/70" />
          </div>

          <div className="relative pl-7 border-l border-line/70">
            {items.map((event, i) => (
              <article key={`${year}-${i}`} className="relative pb-9 last:pb-0">
                {/* 节点：单色小点，不再按数据上色 */}
                <span className="absolute -left-[29px] top-1.5 h-[5px] w-[5px] rounded-full bg-ink-dim" />

                <div className="meta-line mb-2">
                  <span>{event.month}</span>
                  {event.tags.length > 0 && <span className="sep">·</span>}
                  {event.tags.map((tag) => (
                    <span key={tag} className="term">{tag}</span>
                  ))}
                </div>

                <h3 className="type-title">{event.title}</h3>
                <p className="note mt-1.5 max-w-[58ch]">{event.desc}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-4 font-mono text-[0.625rem] tracking-[0.24em] text-ink-dim/70 uppercase">
        still in progress
      </p>
    </div>
  )
}
