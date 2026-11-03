import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

export type EntryKind = 'article' | 'thought'

export interface PostMeta {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  topics: string[]
  /** 附带的媒体文件名（photos 或 videos 目录下的裸文件名） */
  media: string[]
  kind: EntryKind
  cover?: string
  readingTime: string
  /** 正文（未渲染的 Markdown 原文）。想法条目通常很短，直接当文本显示。 */
  body: string
}

export interface Post extends PostMeta {}

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

function normalizeKind(raw: unknown): EntryKind {
  return raw === 'thought' ? 'thought' : 'article'
}

function normalizeTopics(raw: unknown, tags: string[]): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
  // 没写 topics 时退回用 tags，避免老文章没有主题归属
  return tags.slice(0, 3)
}

function readEntry(filename: string): PostMeta | null {
  const slug = filename.replace(/\.(mdx|md)$/, '')
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8')
  const { data, content } = matter(raw)
  const rt = readingTime(content)
  const tags: string[] = Array.isArray(data.tags) ? data.tags : []
  const kind = normalizeKind(data.kind)

  const trimmed = content.trim()

  return {
    slug,
    title: data.title ?? (kind === 'thought' ? '' : '无标题'),
    date: data.date ?? new Date().toISOString(),
    excerpt: data.excerpt ?? trimmed.slice(0, 120).replace(/[#*`>]/g, '').trim() + '…',
    tags,
    topics: normalizeTopics(data.topics, tags),
    media: Array.isArray(data.media) ? data.media.map(String).filter(Boolean) : [],
    kind,
    cover: data.cover,
    readingTime: rt.text,
    body: trimmed,
  }
}

export function getAllEntries(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  return files
    .map(readEntry)
    .filter((e): e is PostMeta => e !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** 兼容老调用方：文章列表 */
export function getAllPosts(): PostMeta[] {
  return getAllEntries()
}

export function getThoughts(): PostMeta[] {
  return getAllEntries().filter((e) => e.kind === 'thought')
}

export function getArticles(): PostMeta[] {
  return getAllEntries().filter((e) => e.kind === 'article')
}

export function getPostBySlug(slug: string): Post | null {
  const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`)
  const mdPath = path.join(POSTS_DIR, `${slug}.md`)
  const filename = fs.existsSync(mdxPath)
    ? `${slug}.mdx`
    : fs.existsSync(mdPath)
      ? `${slug}.md`
      : null

  if (!filename) return null
  return readEntry(filename)
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>()
  for (const e of getAllEntries()) e.tags.forEach((t) => tagSet.add(t))
  return Array.from(tagSet).sort()
}

export interface TopicStat {
  name: string
  total: number
  thoughts: number
  articles: number
}

export function getTopicStats(): TopicStat[] {
  const map = new Map<string, TopicStat>()
  for (const e of getAllEntries()) {
    for (const topic of e.topics) {
      const cur = map.get(topic) ?? { name: topic, total: 0, thoughts: 0, articles: 0 }
      cur.total += 1
      if (e.kind === 'thought') cur.thoughts += 1
      else cur.articles += 1
      map.set(topic, cur)
    }
  }
  return Array.from(map.values()).sort((a, b) => b.thoughts - a.thoughts || b.total - a.total)
}

/** 想法优先的混合流：先想法，后文章，各自按时间倒序 */
export function getFeed(limit = 12): PostMeta[] {
  const thoughts = getThoughts()
  const articles = getArticles()
  return [...thoughts, ...articles]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit)
}

/** 专题：某个题目下的全部记录（想法 + 文章），按时间倒序 */
export function getEntriesByTopic(topic: string): PostMeta[] {
  return getAllEntries()
    .filter((e) => e.topics.includes(topic))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}
