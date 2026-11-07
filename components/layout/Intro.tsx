'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * 进站画面：按杂志刊头的关系排布，而不是一个居中的 logo。
 *
 *   2026 — 11 — 06                          DIGITAL CORNER
 *
 *                     思 考 角 落
 *
 *                         ─────
 *
 *   NO. 001 · 记录思考的地方                  READ IN THE DARK
 *
 * 时序：逐字出现 → 字距收紧 → 细线横扫 → 整屏向上收起
 *
 * 规则：
 * - 同一会话只播一次（sessionStorage），刷新不反复挡人
 * - 后台不播
 * - 系统开了「减少动态效果」就不播
 * - 地址加 ?nointro 可跳过（截图用）
 */
export default function Intro({ name, nameEn }: { name: string; nameEn: string }) {
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return
    if (typeof window === 'undefined') return
    if (new URLSearchParams(window.location.search).has('nointro')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (sessionStorage.getItem('intro-seen') === '1') return

    sessionStorage.setItem('intro-seen', '1')
    setShow(true)

    const toLeave = setTimeout(() => setLeaving(true), 2050)
    const toHide = setTimeout(() => setShow(false), 2820)
    return () => {
      clearTimeout(toLeave)
      clearTimeout(toHide)
    }
  }, [pathname])

  if (!show) return null

  const now = new Date()
  const dateLine = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join(' — ')

  return (
    <div className="intro-overlay" data-leaving={leaving ? 'true' : 'false'} aria-hidden="true">
      <div className="intro-frame font-mono text-[0.5rem] tracking-[0.34em] uppercase text-ink-dim" data-pos="top">
        <span>{dateLine}</span>
        <span>{nameEn}</span>
      </div>

      <div className="intro-center">
        <div className="intro-title type-display-2 !text-[1.75rem] md:!text-[2.25rem] text-ink">
          {[...name].map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              className="intro-char"
              style={{ animationDelay: `${0.16 + i * 0.1}s` }}
            >
              {ch}
            </span>
          ))}
        </div>

        <div className="intro-sweep" />
      </div>

      <div className="intro-frame font-mono text-[0.5rem] tracking-[0.34em] uppercase text-ink-dim" data-pos="bottom">
        <span>NO. 001 · 记录思考的地方</span>
        <span>read in the dark</span>
      </div>
    </div>
  )
}
