import Link from 'next/link'
import { readSite } from '@/lib/site'

export default function Footer() {
  const year = new Date().getFullYear()
  const site = readSite()

  return (
    <footer className="relative mt-28 border-t border-line/70 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-baseline md:justify-between">

          <div className="flex items-baseline gap-3">
            <span className="type-display-2 !text-[0.9375rem] !leading-none !tracking-[0.18em] text-ink-muted">
              {site.name}
            </span>
            <span className="font-mono text-[0.5rem] tracking-[0.3em] text-ink-dim uppercase">
              {site.nameEn}
            </span>
          </div>

          {/* 只放不在主导航里的入口，避免和顶栏重复 */}
          <p className="text-[0.75rem] text-ink-dim">
            别处
            <span className="mx-2 opacity-40">—</span>
            <Link href="/gallery" className="hover:text-ink-muted transition-colors">画廊</Link>
            <span className="mx-2 opacity-40">·</span>
            <Link href="/timeline" className="hover:text-ink-muted transition-colors">时间线</Link>
          </p>

          <p className="font-mono text-[0.5625rem] tracking-[0.18em] text-ink-dim/70 uppercase">
            {year} · {site.footerNote}
          </p>
        </div>
      </div>
    </footer>
  )
}
