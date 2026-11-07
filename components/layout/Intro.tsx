'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * 进站画面：像开机一样，一行一行亮起来，然后让位给内容。
 *
 * 规则：
 * - 同一会话只播一次（sessionStorage），刷新不会反复挡人
 * - 后台不播
 * - 系统开了「减少动态效果」就不播
 * - 地址后面加 ?nointro 可以跳过（截图时用）
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

    const toLeave = setTimeout(() => setLeaving(true), 1400)
    const toHide = setTimeout(() => setShow(false), 1900)
    return () => {
      clearTimeout(toLeave)
      clearTimeout(toHide)
    }
  }, [pathname])

  if (!show) return null

  return (
    <div className="intro-overlay" data-leaving={leaving ? 'true' : 'false'} aria-hidden="true">
      <div className="text-center px-6">
        <div className="intro-line type-display-2 !text-[1.5rem] !tracking-[0.22em] text-ink" data-delay="1">
          {name}
        </div>

        <div
          className="intro-line mt-3 font-mono text-[0.5rem] tracking-[0.42em] text-ink-dim uppercase"
          data-delay="2"
        >
          {nameEn}
        </div>

        <div className="intro-line mt-8 flex justify-center" data-delay="3">
          <span className="block h-8 w-px bg-line" />
        </div>
      </div>
    </div>
  )
}
