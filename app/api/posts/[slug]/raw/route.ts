import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
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

/** 把 YAML 解析出的日期（可能是 Date 对象或 ISO 串）统一成 YYYY-MM-DD */
function normalizeDate(v: unknown): string {
  if (!v) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v).slice(0, 10)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { slug } = await params
  const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return NextResponse.json({
    slug,
    kind: data.kind === 'thought' ? 'thought' : 'article',
    title: typeof data.title === 'string' ? data.title : '',
    date: normalizeDate(data.date),
    excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
    topics: Array.isArray(data.topics) ? data.topics : [],
    media: Array.isArray(data.media) ? data.media : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    cover: typeof data.cover === 'string' ? data.cover : '',
    content,
  })
}
