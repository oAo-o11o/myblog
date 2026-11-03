'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import type { PostMeta } from '@/lib/mdx'
import { useRef, MouseEvent } from 'react'

interface FeaturedPostsProps {
  posts: PostMeta[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function MagneticCard({ post, index }: { post: PostMeta; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-60, 60], [6, -6]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-60, 60], [-6, 6]), { stiffness: 300, damping: 30 })

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      >
        <Link href={`/blog/${post.slug}`} className="block h-full group">
          <div className="premium-border surface glass-border h-full p-7 flex flex-col gap-4 transition-all duration-300 bg-panel">
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag text-[10px]">{tag}</span>
              ))}
            </div>
            <h3 className="text-xl font-semibold text-[#f5f5f5]/90 group-hover:text-[#f5f5f5] transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
            <p className="text-[#b8b8b8]/70 text-sm leading-7 line-clamp-3 flex-1">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-[#b8b8b8]/50 border-t border-line/[0.06] pt-4 mt-auto">
              <span>{formatDate(post.date)}</span>
              <span className="font-mono">{post.readingTime}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.article>
  )
}

export default function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="py-20 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4 mb-12"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(0,255,255,0.4)]" />
        <h2 className="text-2xl font-black tracking-widest uppercase text-accent neon-glow">◈ 最新文章</h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(0,255,255,0.4)]" />
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <MagneticCard key={post.slug} post={post} index={i} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-ink-muted/70 text-sm tracking-[0.22em] uppercase hover:text-accent hover:gap-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"
        >
          查看全部文章 <span>→</span>
        </Link>
      </motion.div>
    </section>
  )
}
