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

// PUT /api/posts/[slug] — update post
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { slug } = await params
  const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  const { title, date, excerpt, tags, cover, content } = await req.json()

  const frontmatter = [
    '---',
    `title: "${title}"`,
    `date: "${date}"`,
    `excerpt: "${excerpt ?? ''}"`,
    `tags: [${(tags ?? []).map((t: string) => `"${t}"`).join(', ')}]`,
    cover ? `cover: "${cover}"` : null,
    '---',
    '',
  ].filter(l => l !== null).join('\n')

  fs.writeFileSync(filePath, frontmatter + content)

  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)

  return NextResponse.json({ ok: true })
}

// DELETE /api/posts/[slug] — delete post
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { slug } = await params
  const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  fs.unlinkSync(filePath)

  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)

  return NextResponse.json({ ok: true })
}
