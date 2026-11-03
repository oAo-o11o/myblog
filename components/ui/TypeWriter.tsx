'use client'

import { useEffect, useRef, useState } from 'react'

interface TypeWriterProps {
  phrases: string[]
  className?: string
  speed?: number
  deleteSpeed?: number
  pause?: number
}

export default function TypeWriter({
  phrases,
  className = '',
  speed = 80,
  deleteSpeed = 40,
  pause = 2000,
}: TypeWriterProps) {
  const [text, setText] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const current = phrases[phraseIdx]

    const tick = () => {
      if (deleting) {
        setText(prev => prev.slice(0, -1))
        if (text.length <= 1) {
          setDeleting(false)
          setPhraseIdx(i => (i + 1) % phrases.length)
          timeoutRef.current = setTimeout(tick, 400)
          return
        }
        timeoutRef.current = setTimeout(tick, deleteSpeed)
      } else {
        setText(current.slice(0, text.length + 1))
        if (text.length >= current.length - 1) {
          timeoutRef.current = setTimeout(() => setDeleting(true), pause)
          return
        }
        timeoutRef.current = setTimeout(tick, speed)
      }
    }

    timeoutRef.current = setTimeout(tick, deleting ? deleteSpeed : speed)
    return () => clearTimeout(timeoutRef.current ?? undefined)
  }, [text, deleting, phraseIdx, phrases, speed, deleteSpeed, pause])

  return (
    <span className={className}>
      {text}
      <span className="cursor" />
    </span>
  )
}
