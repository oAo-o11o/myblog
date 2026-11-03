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
    title: data.title ?? '',
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    tags: data.tags ?? [],
    cover: data.cover ?? '',
    content,
  })
}
