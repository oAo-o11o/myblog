'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/** 后台页面不显示前台页脚 */
export default function AdminAware({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <>{children}</>
}
