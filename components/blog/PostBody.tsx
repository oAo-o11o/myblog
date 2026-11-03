'use client'

import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { useEffect, useState } from 'react'

interface PostBodyProps {
  content: string
}

export default function PostBody({ content }: PostBodyProps) {
  const [mdxSource, setMdxSource] = useState<Awaited<ReturnType<typeof serialize>> | null>(null)

  useEffect(() => {
    serialize(content).then(setMdxSource)
  }, [content])

  if (!mdxSource) {
    return (
      <div className="prose animate-pulse space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-[rgba(0,255,136,0.08)] rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        ))}
      </div>
    )
  }

  return (
    <div className="prose">
      <MDXRemote {...mdxSource} />
    </div>
  )
}
