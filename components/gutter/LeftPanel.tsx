'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LeftPanel() {
  const sections = [
    {
      title: '导航',
      items: [
        { label: '首页', href: '/' },
        { label: '文章', href: '/blog' },
        { label: '相册', href: '/gallery' },
        { label: '时间线', href: '/timeline' },
        { label: '关于', href: '/about' },
      ]
    },
    {
      title: '快速链接',
      items: [
        { label: 'GitHub', href: '#' },
        { label: 'Twitter', href: '#' },
        { label: 'Email', href: '#' },
      ]
    }
  ]

  return (
    <div>
      {sections.map((section, idx) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="gutter-panel"
        >
          <h3>{section.title}</h3>
          <ul>
            {section.items.map(item => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-accent transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  )
}
