'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  readingTime: string
}

interface CenterContentProps {
  posts: Post[]
}

export default function CenterContent({ posts }: CenterContentProps) {
  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-6xl font-black mb-4 gradient-text">CYBERLOG</h1>
        <p className="text-xl text-ink-muted/80">
          用代码、文字与视觉记录我的技术世界与日常思考
        </p>
      </motion.div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post, idx) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group"
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="p-6 rounded-xl border-2 border-line bg-[rgba(0,255,255,0.05)] backdrop-blur-xl hover:border-[rgba(255,0,255,0.4)] hover:bg-[rgba(0,255,255,0.1)] transition-all duration-300 cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-2xl font-bold text-ink group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <span className="text-sm text-[#606080]">{post.readingTime}</span>
                </div>
                <p className="text-ink-muted/70 mb-3">{post.excerpt}</p>
                <div className="text-xs text-[#606080]">{post.date}</div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
