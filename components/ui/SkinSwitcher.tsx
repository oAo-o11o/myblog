'use client'

import { useEffect, useState } from 'react'

const SKINS = [
  { id: 'olive', label: '橄榄', dot: '#c1ce9c' },
  { id: 'ink',   label: '石墨', dot: '#9ab3c9' },
  { id: 'plum',  label: '暗梅', dot: '#c9a0ab' },
  { id: 'warm',  label: '暖褐', dot: '#f4b8a0' },
  { id: 'neon',  label: '霓虹', dot: '#00ff88' },
] as const

type SkinId = (typeof SKINS)[number]['id']

export default function SkinSwitcher() {
  const [skin, setSkin] = useState<SkinId>('olive')

  useEffect(() => {
    const current = document.documentElement.dataset.skin as SkinId | undefined
    if (current) setSkin(current)
  }, [])

  const apply = (id: SkinId) => {
    document.documentElement.dataset.skin = id
    try {
      localStorage.setItem('skin', id)
    } catch {
      /* 隐私模式下忽略 */
    }
    setSkin(id)
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-panel-2 px-2.5 py-1.5">
      {SKINS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => apply(s.id)}
          aria-label={`切换到${s.label}皮肤`}
          aria-pressed={skin === s.id}
          title={s.label}
          className={`h-3.5 w-3.5 rounded-full transition-colors duration-200 ${
            skin === s.id
              ? 'ring-1 ring-accent ring-offset-2 ring-offset-canvas'
              : 'opacity-45 hover:opacity-100'
          }`}
          style={{ backgroundColor: s.dot }}
        />
      ))}
    </div>
  )
}
