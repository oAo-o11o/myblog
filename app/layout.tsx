import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdminAware from '@/components/layout/AdminAware'
import { readSite } from '@/lib/site'

export function generateMetadata(): Metadata {
  const site = readSite()
  return {
    title: {
      default: site.name,
      template: `%s · ${site.name}`,
    },
    description: site.epigraph,
    keywords: ['思考', '数学', '计算机', '哲学', '记录'],
    authors: [{ name: site.name }],
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      siteName: site.name,
      description: site.epigraph,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const site = readSite()

  return (
    <html
      lang="zh-CN"
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      data-skin={site.skin}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        {/* 防换肤闪烁：在 hydration 前把上次选中的皮肤写回 <html> */}
        <Script id="skin-boot" strategy="beforeInteractive">
          {`try{var s=localStorage.getItem('skin');if(s)document.documentElement.dataset.skin=s}catch(e){}`}
        </Script>

        <Navbar site={site} />

        <main className="flex-1 relative z-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
