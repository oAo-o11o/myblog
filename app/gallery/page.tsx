import PageTransition from '@/components/layout/PageTransition'
import GalleryClient from '@/components/gallery/GalleryClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '画廊' }

export default function GalleryPage() {
  return (
    <PageTransition>
      <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-6">
        <header className="mb-16">
          <div className="label-rule mb-8">
            画廊 <em>gallery</em>
          </div>
          <h1 className="type-display-2">有些日子，只留下了照片。</h1>
          <p className="epigraph mt-7 max-w-[48ch]">
            写不成句子的，就交给画面。它们和想法放在同一段时间里，只是不说理。
          </p>
        </header>

        <GalleryClient />
      </div>
    </PageTransition>
  )
}
