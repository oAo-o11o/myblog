import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'change-this-secret-in-production'
)

async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try {
    await jwtVerify(token, SECRET)
    return true
  } catch {
    return false
  }
}

const q = (v: string) => JSON.stringify(v)
const arr = (v: string[]) => `[${v.map(q).join(', ')}]`

function normalizeDate(v: unknown): string {
  if (!v) return new Date().toISOString().slice(0, 10)
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v).slice(0, 10)
}

// PUT /api/posts/[slug] — 更新内容
// 关键：以磁盘上现有的 frontmatter 为基准做合并，未知字段原样保留，
// 这样编辑一次不会把 kind / topics / media 抹掉。
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { slug } = await params
  const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  const body = await req.json()
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data: prev } = matter(raw)

  const kind = body.kind === 'thought' ? 'thought' : body.kind === 'article' ? 'article' : prev.kind ?? 'article'
  const title = typeof body.title === 'string' ? body.title.trim() : (prev.title ?? '')
  const date = normalizeDate(body.date ?? prev.date)
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt : (prev.excerpt ?? '')
  const topics: string[] = Array.isArray(body.topics) ? body.topics.filter(Boolean) : (prev.topics ?? [])
  const media: string[] = Array.isArray(body.media) ? body.media.filter(Boolean) : (prev.media ?? [])
  const tags: string[] = Array.isArray(body.tags) ? body.tags.filter(Boolean) : (prev.tags ?? [])
  const cover = typeof body.cover === 'string' ? body.cover : (prev.cover ?? '')
  const content = typeof body.content === 'string' ? body.content : ''

  const lines: string[] = ['---', `kind: ${kind}`, `date: "${date}"`]
  if (title) lines.push(`title: ${q(title)}`)
  if (excerpt) lines.push(`excerpt: ${q(excerpt)}`)
  if (topics.length) lines.push(`topics: ${arr(topics)}`)
  if (media.length) lines.push(`media: ${arr(media)}`)
  if (tags.length) lines.push(`tags: ${arr(tags)}`)
  if (cover) lines.push(`cover: ${q(cover)}`)
  lines.push('---', '')

  fs.writeFileSync(filePath, lines.join('\n') + content, 'utf-8')

  revalidatePath('/')
  revalidatePath('/notes')
  revalidatePath('/blog')
  revalidatePath('/topics')
  revalidatePath(`/blog/${slug}`)

  return NextResponse.json({ ok: true, kind, topics, media })
}

// DELETE /api/posts/[slug] — 删除内容
// 不真删：移到 content/.trash/，误删可以从回收站捞回来
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { slug } = await params
  const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  const trashDir = path.join(process.cwd(), 'content', '.trash')
  if (!fs.existsSync(trashDir)) fs.mkdirSync(trashDir, { recursive: true })

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  fs.renameSync(filePath, path.join(trashDir, `${slug}__${stamp}.mdx`))

  revalidatePath('/')
  revalidatePath('/notes')
  revalidatePath('/blog')
  revalidatePath('/topics')

  return NextResponse.json({ ok: true, movedTo: 'content/.trash' })
}
