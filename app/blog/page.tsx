import Link from 'next/link'
import { getArticles, getAllTopics } from '@/lib/mdx'
import BlogClient from '@/components/blog/BlogClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '文章',
  description: '把一个问题说到底的那些。',
}

export default function BlogPage() {
  const posts = getArticles()
  const topics = getAllTopics()

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 pt-32 pb-24">
      <header className="mb-14">
        <div className="label-rule mb-8">
          文章 <em>essays</em>
        </div>
        <h1 className="type-display-2">想得久一些的。</h1>
        <p className="epigraph mt-7 max-w-[52ch]">
          {posts.length} 篇。短的在
          <Link href="/notes" className="mx-1 text-ink hover:underline">想法</Link>
          那边；这里是把一个问题说到底的。
        </p>
      </header>

      <BlogClient posts={posts} tags={topics} />
    </div>
  )
}
