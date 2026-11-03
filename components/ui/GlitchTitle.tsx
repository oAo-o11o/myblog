'use client'

interface GlitchTitleProps {
  text: string
  className?: string
  tag?: 'h1' | 'h2' | 'h3' | 'span'
}

export default function GlitchTitle({ text, className = '', tag: Tag = 'h1' }: GlitchTitleProps) {
  return (
    <Tag
      className={`glitch ${className}`}
      data-text={text}
    >
      {text}
    </Tag>
  )
}
