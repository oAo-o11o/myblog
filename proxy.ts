import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

/**
 * 上线守卫（Next 16 起叫 proxy，原 middleware）：
 * 1) /admin/**（除登录页）必须有有效 admin_token，否则跳登录
 * 2) 写接口（POST/PUT/DELETE）除 /api/auth/** 外必须有有效 admin_token，否则 401
 * 3) 读接口与前台页面不受影响
 */

const PUBLIC_ADMIN_PATHS = ['/admin/login']
const PUBLIC_WRITE_PATHS = ['/api/auth/login', '/api/auth/logout']
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? 'change-this-secret-in-production')
}

async function hasValidToken(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload.role === 'admin' || typeof payload.sub === 'string'
  } catch {
    return false
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const method = req.method

  // 登录页与登录/登出接口直接放行
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) return NextResponse.next()
  if (PUBLIC_WRITE_PATHS.includes(pathname)) return NextResponse.next()

  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')
  const isWriteApi = pathname.startsWith('/api/') && !SAFE_METHODS.includes(method)

  if (!isAdminPage && !isWriteApi) return NextResponse.next()

  if (await hasValidToken(req)) return NextResponse.next()

  if (isAdminPage) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.json({ error: '未授权' }, { status: 401 })
}

export default proxy

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
