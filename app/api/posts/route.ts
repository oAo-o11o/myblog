import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'

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

// GET /api/posts — 列表（公开）：posts 为 slug 数组，meta 附带类型与日期
export async function GET() {
  const dir = path.join(process.cwd(), 'content', 'posts')
  if (!fs.existsSync(dir)) return NextResponse.json({ posts: [], meta: [] })

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  const slugs = files.map((f) => f.replace(/\.(mdx|md)$/, ''))

  const meta = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const slug = file.replace(/\.(mdx|md)$/, '')
      const kind = /^kind:\s*thought\s*$/m.test(raw) ? 'thought' : 'article'
      const date = raw.match(/^date:\s*"?([^"\n]+)"?/m)?.[1] ?? ''
      const title = raw.match(/^title:\s*"([^"]*)"/m)?.[1] ?? ''
      const topicsRaw = raw.match(/^topics:\s*\[(.*)\]/m)?.[1] ?? ''
      const topics = topicsRaw
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
      return { slug, kind, date, title, topics }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return NextResponse.json({ posts: slugs, meta })
}

// POST /api/posts — create new post (admin only)
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const body = await req.json()
  const { title, date, excerpt, content } = body
  const kind = body.kind === 'thought' ? 'thought' : 'article'
  const topics: string[] = Array.isArray(body.topics)
    ? body.topics.map(String).filter(Boolean)
    : []
  const media: string[] = Array.isArray(body.media)
    ? body.media.map(String).filter(Boolean)
    : []

  if (!content) {
    return NextResponse.json({ error: '正文不能为空' }, { status: 400 })
  }
  if (kind === 'article' && !title) {
    return NextResponse.json({ error: '文章需要标题' }, { status: 400 })
  }

  // 想法可以没标题、没 slug：用时间戳兜底
  const rawSlug = (body.slug as string) || `${kind === 'thought' ? 't' : 'p'}-${Date.now().toString(36)}`
  const safeSlug = rawSlug.replace(/[^a-z0-9\u4e00-\u9fa5_-]/gi, '-').toLowerCase()
  const filePath = path.join(process.cwd(), 'content', 'posts', `${safeSlug}.mdx`)

  if (fs.existsSync(filePath)) {
    return NextResponse.json({ error: '该 slug 已存在' }, { status: 409 })
  }

  const frontmatter = [
    '---',
    title ? `title: "${title}"` : null,
    `date: "${date ?? new Date().toISOString().slice(0, 10)}"`,
    `kind: ${kind}`,
    topics.length > 0 ? `topics: [${topics.map((t) => `"${t}"`).join(', ')}]` : null,
    media.length > 0 ? `media: [${media.map((m) => `"${m}"`).join(', ')}]` : null,
    `excerpt: "${excerpt ?? ''}"`,
    // 不再写 tags / cover：站点已改用 topics（分类）与 media（图片视频）
    '---',
    '',
  ].filter((l) => l !== null).join('\n')

  fs.writeFileSync(filePath, frontmatter + content)

  revalidatePath('/')
  revalidatePath('/notes')
  revalidatePath('/blog')
  revalidatePath(`/blog/${safeSlug}`)

  return NextResponse.json({ ok: true, slug: safeSlug, kind }, { status: 201 })
}
