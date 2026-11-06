import type { MetadataRoute } from 'next'
import { getAllEntries } from '@/lib/mdx'
import { readSite } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const site = readSite()
  const base = site.url || 'http://localhost:3000'
  const entries = getAllEntries()

  const newest = entries[0]?.date ?? new Date().toISOString().slice(0, 10)

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/notes/`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/blog/`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/life/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/topics/`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/about/`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/gallery/`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/timeline/`, changeFrequency: 'monthly', priority: 0.4 },
  ]

  const topics = Array.from(new Set(entries.flatMap((e) => e.topics)))

  return [
    ...pages,
    ...entries.map((e) => ({
      url: `${base}/blog/${e.slug}/`,
      lastModified: e.date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...topics.map((t) => ({
      url: `${base}/topics/${encodeURIComponent(t)}/`,
      lastModified: newest,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ]
}
