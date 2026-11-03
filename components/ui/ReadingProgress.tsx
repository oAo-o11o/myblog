'use client'

import { useEffect, useRef, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docH > 0 ? (scrollTop / docH) * 100 : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      id="reading-progress"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  )
}
