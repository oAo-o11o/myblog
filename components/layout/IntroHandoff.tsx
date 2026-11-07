'use client'

import { useEffect } from 'react'

/**
 * 接力：进站画面里的「思考角落」不是消失，而是飞到左上角，
 * 变成导航栏的品牌。位置和大小都是量出来的（FLIP），
 * 所以不同屏幕、不同字号都能对齐。
 *
 * 关键点：时间必须按 performance.now()（页面开始加载算起）对齐，
 * 不能用「挂载后 2.95 秒」——网慢时 hydration 会晚到，
 * 那时候 CSS 兜底动画早就把遮罩收掉了，再去启动反而会让它重新出现。
 */
const MORPH_AT = 2950 // 与 CSS 里第 3.3 秒的兜底收起错开一点

export default function IntroHandoff() {
  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.intro === 'skip' || root.dataset.intro === 'done') return

    const overlay = document.querySelector<HTMLElement>('.intro-overlay')
    const title = document.querySelector<HTMLElement>('.intro-title')
    const brand = document.querySelector<HTMLElement>('[data-brand]')
    if (!overlay || !title || !brand) return

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      overlay.style.display = 'none'
      delete root.dataset.introMorph
      root.dataset.intro = 'done'
    }

    const run = () => {
      // 兜底动画已经收完了就别再介入，否则会把遮罩拉回来
      const cs = getComputedStyle(overlay)
      if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.05 || cs.display === 'none') {
        finish()
        return
      }

      const a = title.getBoundingClientRect()
      const b = brand.getBoundingClientRect()
      if (!a.width || !b.width) {
        finish()
        return
      }

      root.dataset.introMorph = '1'

      // 接管：取消 CSS 的收起动画，改成一飞行 + 背景淡出
      overlay.style.animation = 'none'
      overlay.style.clipPath = 'none'
      overlay.style.transition = 'opacity 0.85s ease'

      requestAnimationFrame(() => {
        overlay.style.opacity = '0'
      })

      title.style.transformOrigin = 'top left'
      title.style.transition = 'transform 1s cubic-bezier(0.76, 0, 0.24, 1)'
      title.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width})`

      overlay.querySelectorAll<HTMLElement>('.intro-frame, .intro-sub, .intro-sweep').forEach((el) => {
        el.style.transition = 'opacity 0.35s ease'
        el.style.opacity = '0'
      })

      window.setTimeout(finish, 1010)
    }

    // 用「从页面开始加载到现在」的时长来对齐，而不是从挂载算起：
    // 还没到点就等到点；已经过点（网慢，hydration 晚了）就立刻飞。
    const remaining = Math.max(0, MORPH_AT - performance.now())
    const timer = window.setTimeout(run, remaining)
    return () => window.clearTimeout(timer)
  }, [])

  return null
}
