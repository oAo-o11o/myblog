import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import fs from 'fs'
import path from 'path'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'change-this-secret-in-production'
)

const filePath = path.join(process.cwd(), 'content', 'about.json')

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

export async function GET() {
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'about.json not found' }, { status: 404 })
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8')

  return NextResponse.json({ ok: true })
}
