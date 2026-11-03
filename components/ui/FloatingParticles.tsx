'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  wobble: number
  wobbleSpeed: number
}

const COLORS = [
  'rgba(244,184,160,',  // peach
  'rgba(212,160,200,',  // mauve
  'rgba(232,201,122,',  // gold
  'rgba(168,200,232,',  // sky
]

export default function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (): Particle => ({
      x: Math.random() * canvas.width,
      y: -10,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.15,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
    })

    // seed initial particles spread across screen
    for (let i = 0; i < 60; i++) {
      const p = spawn()
      p.y = Math.random() * canvas.height
      particles.push(p)
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.wobble += p.wobbleSpeed
        p.x += p.speedX + Math.sin(p.wobble) * 0.3
        p.y += p.speedY

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.opacity})`
        ctx.fill()

        if (p.y > canvas.height + 10) {
          particles.splice(i, 1)
          particles.push(spawn())
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.7 }}
    />
  )
}
