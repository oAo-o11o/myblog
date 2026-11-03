'use client'

import { useEffect, useRef } from 'react'

export default function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -200, y: -200 })
  const trail = useRef({ x: -200, y: -200 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)

    let animId: number
    const animate = () => {
      // trail lags behind cursor
      trail.current.x += (pos.current.x - trail.current.x) * 0.08
      trail.current.y += (pos.current.y - trail.current.y) * 0.08

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${pos.current.x - 200}px, ${pos.current.y - 200}px)`
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trail.current.x - 12}px, ${trail.current.y - 12}px)`
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      {/* large soft glow */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          zIndex: 2,
          background: 'radial-gradient(circle, rgba(244,184,160,0.07) 0%, rgba(212,160,200,0.04) 40%, transparent 70%)',
          willChange: 'transform',
        }}
      />
      {/* small crisp dot */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none"
        style={{
          zIndex: 3,
          background: 'radial-gradient(circle, rgba(244,184,160,0.55) 0%, transparent 70%)',
          willChange: 'transform',
          mixBlendMode: 'screen',
        }}
      />
    </>
  )
}
