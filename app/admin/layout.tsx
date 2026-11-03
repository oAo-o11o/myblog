import Link from 'next/link'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { readSite } from '@/lib/site'
import AdminNav from '@/components/admin/AdminNav'
import SkinSwitcher from '@/components/ui/SkinSwitcher'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'change-this-secret-in-production'
)

async function hasSession() {
  try {
    const jar = await cookies()
    const token = jar.get('admin_token')?.value
    if (!token) return false
    await jwtVerify(token, SECRET)
    return true
  } catch {
    return false
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await hasSession()
  const site = readSite()

  // 未登录（登录页）：不套后台外壳，也不显示侧栏
  if (!authed) return <>{children}</>

  return (
    <div className="min-h-screen lg:flex">
      <aside className="lg:w-56 lg:shrink-0 lg:border-r lg:border-line/70 lg:h-screen lg:sticky lg:top-0 px-1 lg:px-6 pt-28 lg:pt-12 pb-6">
        <Link href="/admin/dashboard" className="block mb-10">
          <span className="type-display-2 !text-[.9375rem] !leading-none !tracking-[0.16em] text-ink">
            {site.name}
          </span>
          <span className="mt-1 block font-mono text-[.5rem] tracking-[.3em] text-ink-dim uppercase">
            admin
          </span>
        </Link>

        <AdminNav />

        <div className="mt-12 flex flex-col gap-4">
          <SkinSwitcher />
          <Link
            href="/"
            className="text-[.75rem] tracking-[0.12em] text-ink-dim hover:text-ink transition-colors"
          >
            ← 回到站点
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 px-6 lg:px-10 pt-10 lg:pt-12 pb-24">
        {children}
      </div>
    </div>
  )
}
