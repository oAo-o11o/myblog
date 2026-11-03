import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'change-this-secret-in-production'
)

// Password hash is stored in env, generate with: node -e "require('bcryptjs').hash('yourpassword',10).then(console.log)"
const ADMIN_USER = process.env.ADMIN_USERNAME ?? 'admin'
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH ?? ''

// 简易登录限流：单进程内存计数，重启即清零（单实例自托管足够用）
const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 8
const attempts = new Map<string, { count: number; first: number }>()

function clientIp(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'local'
}

function isThrottled(ip: string) {
  const rec = attempts.get(ip)
  if (!rec) return false
  if (Date.now() - rec.first > WINDOW_MS) {
    attempts.delete(ip)
    return false
  }
  return rec.count >= MAX_ATTEMPTS
}

function recordFailure(ip: string) {
  const rec = attempts.get(ip)
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: Date.now() })
  } else {
    rec.count += 1
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)

  if (isThrottled(ip)) {
    return NextResponse.json(
      { error: '尝试次数过多，请 10 分钟后再试' },
      { status: 429 }
    )
  }

  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: '请填写用户名和密码' }, { status: 400 })
  }

  const userMatch = username === ADMIN_USER
  const passMatch = ADMIN_HASH
    ? await bcrypt.compare(password, ADMIN_HASH)
    : password === (process.env.ADMIN_PASSWORD ?? 'admin123')

  if (!userMatch || !passMatch) {
    recordFailure(ip)
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
  }

  attempts.delete(ip)

  const token = await new SignJWT({ sub: username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    // 默认生产环境要求 HTTPS；纯 HTTP 部署（无证书）可设 COOKIE_SECURE=false 放行
    secure: process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
