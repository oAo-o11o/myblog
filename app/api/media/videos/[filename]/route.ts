import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  const safeName = path.basename(filename)
  const filePath = path.join(process.cwd(), 'public', 'videos', safeName)

  if (!fs.existsSync(filePath)) {
    return new Response('Not Found', { status: 404 })
  }

  const stat = fs.statSync(filePath)
  const ext = path.extname(safeName).toLowerCase()

  let contentType = 'application/octet-stream'
  if (ext === '.mp4') contentType = 'video/mp4'
  if (ext === '.webm') contentType = 'video/webm'
  if (ext === '.mov') contentType = 'video/quicktime'
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'

  const buffer = fs.readFileSync(filePath)

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(stat.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
