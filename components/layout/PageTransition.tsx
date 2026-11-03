import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

/** 静态模式：不做入场动画，只保留结构容器 */
export default function PageTransition({ children }: PageTransitionProps) {
  return <div>{children}</div>
}
