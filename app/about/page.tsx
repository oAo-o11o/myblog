import PageTransition from '@/components/layout/PageTransition'
import AboutContent from '@/components/about/AboutContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '关于' }

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen pt-28 pb-20 max-w-5xl mx-auto px-6">
        <header className="mb-16">
          <div className="label-rule mb-8">
            关于 <em>about</em>
          </div>
          <h1 className="type-display-2">一个还在学的人。</h1>
          <p className="epigraph mt-7 max-w-[48ch]">
            我关心的问题不多：一个东西是怎么运作的，一个证明为什么成立，一个人为什么活着。
            它们在这儿是同一个问题的不同入口，只是切进去的角度不同。
          </p>
        </header>
        <AboutContent />
      </div>
    </PageTransition>
  )
}
