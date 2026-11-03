import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import fs from 'fs'
import path from 'path'
import { probeImageSize } from '@/lib/image-size'

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

// GET /api/upload/photos — list all photos
export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'photos')

  if (!fs.existsSync(dir)) {
    return NextResponse.json({ photos: [] })
  }

  const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
  const metaPath = path.join(process.cwd(), 'content', 'photos.json')

  let metadata: Record<string, any> = {}
  if (fs.existsSync(metaPath)) {
    metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
  }

  const photos = files.map(file => ({
    id: file,
    src: `/api/media/photos/${file}`,
    alt: metadata[file]?.alt || file,
    tags: metadata[file]?.tags || [],
    width: metadata[file]?.width || 600,
    height: metadata[file]?.height || 600,
  }))

  return NextResponse.json({ photos })
}

// POST /api/upload/photos — upload photo (admin only)
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const alt = formData.get('alt') as string
  const tags = JSON.parse((formData.get('tags') as string) || '[]')
  const width = parseInt((formData.get('width') as string) || '600')
  const height = parseInt((formData.get('height') as string) || '600')

  if (!file) {
    return NextResponse.json({ error: '未提供文件' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: '文件过大（最大 10MB）' }, { status: 400 })
  }

  const dir = path.join(process.cwd(), 'public', 'photos')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const timestamp = Date.now()

  // 扩展名白名单：不信任客户端自报的 Content-Type
  const allowedExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const ext = path.extname(file.name).toLowerCase()
  if (!allowedExt.includes(ext)) {
    return NextResponse.json({ error: '不支持的扩展名' }, { status: 400 })
  }

  const filename = `${timestamp}${ext}`
  const filePath = path.join(dir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(filePath, buffer)

  // 真实宽高：读文件头，不信任前端传来的值
  const probed = probeImageSize(buffer)
  const realWidth = probed?.width || width
  const realHeight = probed?.height || height

  const metaDir = path.join(process.cwd(), 'content')
  if (!fs.existsSync(metaDir)) {
    fs.mkdirSync(metaDir, { recursive: true })
  }

  const metaPath = path.join(metaDir, 'photos.json')
  let metadata: Record<string, any> = {}
  if (fs.existsSync(metaPath)) {
    metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
  }

  metadata[filename] = { alt, tags, width: realWidth, height: realHeight }
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2))

  return NextResponse.json(
    { ok: true, filename, src: `/api/media/photos/${filename}` },
    { status: 201 }
  )
}

// DELETE /api/upload/photos?filename=xxx
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const url = new URL(req.url)
  const filename = url.searchParams.get('filename')

  if (!filename) {
    return NextResponse.json({ error: '未提供文件名' }, { status: 400 })
  }

  // 防路径穿越：filename 只允许是纯文件名
  const safeName = path.basename(filename)
  if (safeName !== filename) {
    return NextResponse.json({ error: '非法文件名' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'public', 'photos', safeName)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '文件不存在' }, { status: 404 })
  }

  fs.unlinkSync(filePath)

  const metaPath = path.join(process.cwd(), 'content', 'photos.json')
  if (fs.existsSync(metaPath)) {
    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    delete metadata[safeName]
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2))
  }

  return NextResponse.json({ ok: true })
}
