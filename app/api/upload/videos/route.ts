import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

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

// GET /api/upload/videos — list all videos
export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'videos')

  if (!fs.existsSync(dir)) {
    return NextResponse.json({ videos: [] })
  }

  const files = fs.readdirSync(dir).filter(f => /\.(mp4|webm|mov)$/i.test(f))
  const metaPath = path.join(process.cwd(), 'content', 'videos.json')

  let metadata: Record<string, any> = {}
  if (fs.existsSync(metaPath)) {
    metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
  }

  const videos = files.map(file => ({
    id: file,
    src: `/api/media/videos/${file}`,
    poster: metadata[file]?.poster ? `/api/media/videos/${metadata[file].poster}` : null,
    title: metadata[file]?.title || file,
    desc: metadata[file]?.desc || '',
    tags: metadata[file]?.tags || [],
  }))

  return NextResponse.json({ videos })
}

// POST /api/upload/videos — upload + auto transcode video (admin only)
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const title = (formData.get('title') as string) || ''
  const desc = (formData.get('desc') as string) || ''
  const tags = JSON.parse((formData.get('tags') as string) || '[]')

  if (!file) {
    return NextResponse.json({ error: '未提供文件' }, { status: 400 })
  }

  // MIME 与扩展名任一命中即放行：浏览器会给对 MIME，脚本/curl 往往只带 octet-stream
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  const allowedExt = ['.mp4', '.webm', '.mov']
  const originalExt = path.extname(file.name).toLowerCase()

  if (!allowedTypes.includes(file.type) && !allowedExt.includes(originalExt)) {
    return NextResponse.json({ error: '不支持的视频类型' }, { status: 400 })
  }

  // 先保守一点：50MB
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: '视频过大（最大 50MB）' }, { status: 400 })
  }

  const dir = path.join(process.cwd(), 'public', 'videos')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const timestamp = Date.now()

  // 临时原文件
  const tempFilename = `${timestamp}_source${originalExt || '.mp4'}`
  const tempFilePath = path.join(dir, tempFilename)

  // 最终转码文件
  const finalFilename = `${timestamp}.mp4`
  const finalFilePath = path.join(dir, finalFilename)

  try {
    // 保存原始上传文件
    const buffer = await file.arrayBuffer()
    fs.writeFileSync(tempFilePath, Buffer.from(buffer))

    // 自动转码为浏览器更稳的格式
    await execFileAsync('ffmpeg', [
      '-y',
      '-i', tempFilePath,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-profile:v', 'main',
      '-level', '4.0',
      '-c:a', 'aac',
      '-movflags', '+faststart',
      finalFilePath,
    ])

    // 删除临时原文件
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath)
    }

    // 抽一帧当封面：避开首帧的黑场/水印
    const posterFilename = `${timestamp}.poster.jpg`
    const posterPath = path.join(dir, posterFilename)
    let poster: string | null = null

    const grabPoster = async (atSecond: string | null) => {
      const args = ['-y']
      if (atSecond) args.push('-ss', atSecond)
      args.push('-i', finalFilePath, '-frames:v', '1', '-vf', 'scale=720:-2', '-q:v', '4', posterPath)
      await execFileAsync('ffmpeg', args, { timeout: 25000 })
      if (fs.existsSync(posterPath) && fs.statSync(posterPath).size > 0) poster = posterFilename
    }

    try {
      await grabPoster('2')
    } catch {
      // 不足 2 秒的片子退回第一帧
      try {
        await grabPoster(null)
      } catch {
        poster = null
      }
    }

    // 保存元数据
    const metaDir = path.join(process.cwd(), 'content')
    if (!fs.existsSync(metaDir)) {
      fs.mkdirSync(metaDir, { recursive: true })
    }

    const metaPath = path.join(metaDir, 'videos.json')
    let metadata: Record<string, any> = {}
    if (fs.existsSync(metaPath)) {
      metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    }

    metadata[finalFilename] = {
      title: title || file.name,
      desc,
      tags,
      originalName: file.name,
      poster,
    }

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2))

    return NextResponse.json(
      { ok: true, filename: finalFilename, src: `/api/media/videos/${finalFilename}` },
      { status: 201 }
    )
  } catch (error) {
    // 出错时清理文件
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath)
    }
    if (fs.existsSync(finalFilePath)) {
      fs.unlinkSync(finalFilePath)
    }
    const posterGuess = path.join(dir, `${timestamp}.poster.jpg`)
    if (fs.existsSync(posterGuess)) {
      fs.unlinkSync(posterGuess)
    }

    console.error('视频转码失败:', error)
    return NextResponse.json(
      { error: '视频转码失败，请检查 ffmpeg 是否安装或视频文件是否损坏' },
      { status: 500 }
    )
  }
}

// DELETE /api/upload/videos?filename=xxx
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

  const filePath = path.join(process.cwd(), 'public', 'videos', safeName)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '文件不存在' }, { status: 404 })
  }

  fs.unlinkSync(filePath)

  const metaPath = path.join(process.cwd(), 'content', 'videos.json')
  if (fs.existsSync(metaPath)) {
    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    const poster = metadata[safeName]?.poster
    if (poster) {
      const posterPath = path.join(process.cwd(), 'public', 'videos', path.basename(poster))
      if (fs.existsSync(posterPath)) {
        fs.unlinkSync(posterPath)
      }
    }
    delete metadata[safeName]
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2))
  }

  return NextResponse.json({ ok: true })
}
