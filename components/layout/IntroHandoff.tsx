'use client'

import { useEffect } from 'react'

/**
 * 接力：进站画面里的「思考角落」不是消失，而是飞到左上角，
 * 变成导航栏的品牌。位置和大小都是量出来的（FLIP），
 * 所以不同屏幕、不同字号都能对齐。
 *
 * 如果 JS 没跑起来，CSS 里那套「整屏向上收起」会自动兜底。
 */
export default function IntroHandoff() {
  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.intro === 'skip' || root.dataset.intro === 'done') return

    const overlay = document.querySelector<HTMLElement>('.intro-overlay')
    const title = document.querySelector<HTMLElement>('.intro-title')
    const brand = document.querySelector<HTMLElement>('[data-brand]')
    if (!overlay || !title || !brand) return

    const finish = () => {
      overlay.style.display = 'none'
      delete root.dataset.introMorph
      root.dataset.intro = 'done'
    }

    // 画面演完之后再飞（CSS 里第 3.3 秒才开始收起，这里提前一点接管）
    const timer = window.setTimeout(() => {
      const a = title.getBoundingClientRect()
      const b = brand.getBoundingClientRect()

      // 量不到就干脆收掉，不留半截画面
      if (!a.width || !b.width) {
        finish()
        return
      }

      root.dataset.introMorph = '1'

      const scale = b.width / a.width
      title.style.transformOrigin = 'top left'
      title.style.transition = 'transform 1s cubic-bezier(0.76, 0, 0.24, 1)'
      title.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${scale})`

      // 背景改成淡出（不用收起，否则会把飞行中的站名裁掉）
      overlay.style.animation = 'none'
      overlay.style.transition = 'opacity 0.85s ease'
      requestAnimationFrame(() => {
        overlay.style.opacity = '0'
      })

      overlay.querySelectorAll<HTMLElement>('.intro-frame, .intro-sub, .intro-sweep').forEach((el) => {
        el.style.transition = 'opacity 0.35s ease'
        el.style.opacity = '0'
      })

      window.setTimeout(finish, 1010)
    }, 2950)

    return () => window.clearTimeout(timer)
  }, [])

  return null
}
