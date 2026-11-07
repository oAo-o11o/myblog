import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdminAware from '@/components/layout/AdminAware'
import Intro from '@/components/layout/Intro'
import { readSite } from '@/lib/site'

/**
 * 首屏同步脚本：在浏览器解析到这里时立即执行，早于任何绘制。
 * 1) 恢复上次选的皮肤，避免闪烁
 * 2) 决定进站画面播不播（同一会话只看一次 / 后台 / 减少动效 / ?nointro）
 */
const BOOT_SCRIPT = `
try{
  try{var s=localStorage.getItem('skin');if(s){document.documentElement.dataset.skin=s}}catch(e){}
  var skip=false;
  try{
    if(location.pathname.indexOf('/admin')>=0)skip=true;
    if(new URLSearchParams(location.search).has('nointro'))skip=true;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)skip=true;
    if(sessionStorage.getItem('intro-seen')==='1')skip=true;
  }catch(e){skip=true}
  if(skip){document.documentElement.dataset.intro='skip'}else{sessionStorage.setItem('intro-seen','1')}
}catch(e){}
`

export function generateMetadata(): Metadata {
  const site = readSite()
  const base = site.url || 'http://localhost:3000'

  return {
    metadataBase: new URL(base),
    title: {
      default: site.name,
      template: `%s · ${site.name}`,
    },
    description: site.epigraph,
    keywords: ['思考', '数学', '计算机', '哲学', '记录'],
    authors: [{ name: site.name }],
    alternates: {
      canonical: '/',
      types: {
        'application/rss+xml': `${base}/feed.xml`,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      siteName: site.name,
      url: base,
      title: site.name,
      description: site.epigraph,
      images: [`${base}/og.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.name,
      description: site.epigraph,
      images: [`${base}/og.png`],
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
        {/*
          真正同步执行的内联脚本，必须放在 body 最前面。
          （Next 的 <Script strategy="beforeInteractive"> 在 App Router 里是
           排队执行，会晚于首屏绘制，所以「皮肤闪烁」和「进站画面晚到」都得靠这段解决。）
        */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />

        <Intro nameEn={site.nameEn} />

        <Navbar site={site} />

        <main className="flex-1 relative z-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
