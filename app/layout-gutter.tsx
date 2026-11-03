import type { ReactNode } from 'react'

interface GutterLayoutProps {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}

export default function GutterLayout({ left, center, right }: GutterLayoutProps) {
  return (
    <div className="gutter-layout">
      <aside className="gutter-left">
        {left}
      </aside>

      <main className="gutter-center">
        {center}
      </main>

      <aside className="gutter-right">
        {right}
      </aside>
    </div>
  )
}
