'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { SiteConfig } from '@/lib/site'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/notes', label: '想法' },
  { href: '/blog', label: '文章' },
  { href: '/topics', label: '题目' },
  { href: '/about', label: '关于' },
]

export default function Navbar({ site }: { site: SiteConfig }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin') ?? false
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  if (isAdmin) return null

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'backdrop-blur-xl bg-canvas/85 border-b border-line py-3'
            : 'bg-transparent py-5'
          }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="group flex items-baseline gap-2.5">
            <span className="type-display-2 !text-[1rem] !leading-none !tracking-[0.18em] text-ink">
              {site.name}
            </span>
            <span className="font-mono text-[0.5rem] tracking-[0.3em] text-ink-dim uppercase">
              {site.nameEn}
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-baseline gap-7">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative text-[12.5px] tracking-[0.12em] transition-colors duration-200 ${active ? 'text-ink' : 'text-ink-dim hover:text-ink-muted'
                      }`}
                  >
                    {label}

                  </Link>
                )
              })}
            </nav>
          </div>

          <button
            className="md:hidden text-ink/80 p-2"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </header>


        {menuOpen && (
          <div

            className="fixed inset-0 z-40 md:hidden pt-24 bg-canvas/95 backdrop-blur-xl"
          >
            <nav className="flex flex-col items-center gap-4 mt-10 px-6">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`w-full max-w-sm rounded-2xl border px-6 py-4 text-center text-sm tracking-[0.22em] ${pathname === href
                      ? 'border-accent/40 bg-accent/15 text-accent'
                      : 'border-line bg-panel-2 text-ink-muted/70'
                    }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}

    </>
  )
}