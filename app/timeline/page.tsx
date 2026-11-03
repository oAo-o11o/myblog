import PageTransition from '@/components/layout/PageTransition'
import TimelineContent from '@/components/timeline/TimelineContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Timeline' }

export default function TimelinePage() {
  return (
    <PageTransition>
      <div className="min-h-screen pt-28 pb-20 max-w-4xl mx-auto px-6">
        <header className="mb-16">
          <div className="label-rule mb-8">
            时间线 <em>timeline</em>
          </div>
          <h1 className="type-display-2">做过的事，按时间排开。</h1>
          <p className="epigraph mt-7 max-w-[48ch]">
            记录比总结诚实。这里按发生顺序放着，不按重要性排序。
          </p>
        </header>
        <TimelineContent />
      </div>
    </PageTransition>
  )
}
