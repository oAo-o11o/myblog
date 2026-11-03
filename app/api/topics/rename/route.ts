import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import fs from 'fs'
import path from 'path'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'change-this-secret-in-production'
)

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

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

/**
 * 重命名题目：把所有文章 frontmatter 里 topics 数组中的 from 换成 to。
 * 只动 frontmatter 那一行，不碰正文。
 */
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { from, to } = (await req.json()) as { from?: string; to?: string }
  if (!from || !to || !from.trim() || !to.trim()) {
    return NextResponse.json({ error: '缺少原题目或新题目' }, { status: 400 })
  }
  if (from === to) {
    return NextResponse.json({ error: '新旧题目相同' }, { status: 400 })
  }
  if (to.includes('"') || to.includes(']')) {
    return NextResponse.json({ error: '题目里不能含引号或方括号' }, { status: 400 })
  }

  if (!fs.existsSync(POSTS_DIR)) {
    return NextResponse.json({ error: 'content/posts 不存在' }, { status: 404 })
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => /\.(mdx|md)$/.test(f))
  const changed: string[] = []

  for (const file of files) {
    const full = path.join(POSTS_DIR, file)
    const raw = fs.readFileSync(full, 'utf-8')

    // frontmatter 区间
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!match) continue

    const front = match[1]
    const lineMatch = front.match(/^topics:\s*\[(.*)\]\s*$/m)
    if (!lineMatch) continue

    const items = lineMatch[1]
      .split(',')
      .map((s) => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean)

    if (!items.includes(from)) continue

    const nextItems = items.map((i) => (i === from ? to.trim() : i))
    const nextLine = `topics: [${nextItems.map((i) => `"${i}"`).join(', ')}]`
    const nextFront = front.replace(lineMatch[0], nextLine)
    const nextRaw = raw.replace(front, nextFront)

    fs.writeFileSync(full, nextRaw, 'utf-8')
    changed.push(file)
  }

  return NextResponse.json({ ok: true, changed: changed.length, files: changed })
}
