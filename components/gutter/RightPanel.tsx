'use client'

import { motion } from 'framer-motion'

export default function RightPanel() {
  const stats = [
    { label: '文章数', value: '12' },
    { label: '总字数', value: '45K+' },
    { label: '阅读时间', value: '2h' },
  ]

  const tags = ['技术', '生活', 'Next.js', 'React', 'TypeScript', '设计']

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0 }}
        className="gutter-panel"
      >
        <h3>统计</h3>
        <div className="space-y-2">
          {stats.map(stat => (
            <div key={stat.label} className="flex justify-between items-center">
              <span className="text-ink-muted/70">{stat.label}</span>
              <span className="text-accent font-mono font-bold">{stat.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="gutter-panel"
      >
        <h3>标签</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full border border-[rgba(0,255,255,0.3)] text-accent bg-[rgba(0,255,255,0.1)] hover:bg-[rgba(0,255,255,0.2)] transition-all cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
