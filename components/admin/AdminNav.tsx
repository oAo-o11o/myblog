'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const GROUPS: { title: string; items: { href: string; label: string; hint?: string }[] }[] = [
  {
    title: '内容',
    items: [
      { href: '/admin/dashboard', label: '概览' },
      { href: '/admin/new', label: '写一条' },
      { href: '/admin/topics', label: '题目' },
    ],
  },
  {
    title: '媒体',
    items: [
      { href: '/admin/gallery', label: '图片' },
      { href: '/admin/videos', label: '视频' },
    ],
  },
  {
    title: '页面',
    items: [
      { href: '/admin/about', label: '关于' },
      { href: '/admin/timeline', label: '时间线' },
      { href: '/admin/settings', label: '站点设置' },
    ],
  },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-8">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <div className="label-rule mb-3">{group.title}</div>
          <ul className="space-y-1">
            {group.items.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`block py-1.5 text-[.8125rem] transition-colors ${
                      active ? 'text-ink' : 'text-ink-dim hover:text-ink-muted'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
