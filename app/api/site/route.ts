import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import fs from 'fs'
import path from 'path'
import { readSite, SITE_PATH, VALID_SKINS, type SiteConfig } from '@/lib/site'

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

export async function GET() {
  return NextResponse.json(readSite())
}

export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const body = (await req.json()) as Partial<SiteConfig>
  const current = readSite()

  const next: SiteConfig = {
    name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : current.name,
    nameEn: typeof body.nameEn === 'string' ? body.nameEn.trim() : current.nameEn,
    tagline1: typeof body.tagline1 === 'string' ? body.tagline1 : current.tagline1,
    tagline2: typeof body.tagline2 === 'string' ? body.tagline2 : current.tagline2,
    epigraph: typeof body.epigraph === 'string' ? body.epigraph : current.epigraph,
    skin:
      typeof body.skin === 'string' && (VALID_SKINS as readonly string[]).includes(body.skin)
        ? body.skin
        : current.skin,
    footerNote: typeof body.footerNote === 'string' ? body.footerNote : current.footerNote,
  }

  const dir = path.dirname(SITE_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(SITE_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8')

  return NextResponse.json({ ok: true, site: next })
}
