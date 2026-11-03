'use client'

import Link from 'next/link'
import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'
import clsx from 'clsx'

interface BaseProps {
  children: ReactNode
  variant?: 'cyan' | 'purple' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

type NeonButtonProps = BaseProps & (
  | ({ href: string; onClick?: never } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: never; onClick?: () => void } & ButtonHTMLAttributes<HTMLButtonElement>)
)

export default function NeonButton({
  href,
  onClick,
  children,
  variant = 'cyan',
  size = 'md',
  className = '',
  ...props
}: NeonButtonProps) {
  // 基础样式：圆角、字体、过渡、玻璃模糊背景、边框
  const baseStyles =
    'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 border backdrop-blur-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'

  // 尺寸样式
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm md:text-base',
  }

  // 变体样式：全息效果
  const variantStyles = {
    cyan: 'bg-accent/15 text-ink border-accent/40 hover:bg-accent/25 hover:border-accent-2/50 hover:shadow-[0_0_36px_var(--skin-accent)]',
    purple: 'bg-accent-2/15 text-ink border-accent-2/40 hover:bg-accent-2/25 hover:border-accent/50 hover:shadow-[0_0_36px_var(--skin-accent-2)]',
    outline: 'bg-accent/8 text-accent border-accent/30 hover:bg-accent/15 hover:border-accent-2/40 hover:shadow-[0_0_28px_var(--skin-accent)]',
  }

  const classes = clsx(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  )

  // 如果提供了 href，渲染为 Link；否则渲染为 button
  if (href) {
    return (
      <Link href={href} className={classes} {...(props as any)}>
        {children}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}