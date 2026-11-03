'use client'

import { motion } from 'framer-motion'

export default function ParticleCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <motion.div
        className="absolute -top-40 left-[-12%] h-[42rem] w-[42rem] rounded-full aurora-blob aurora-mist"
        animate={{
          x: [0, 60, 20, 0],
          y: [0, 30, 80, 0],
          scale: [1, 1.06, 0.96, 1],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[8%] right-[-12%] h-[36rem] w-[36rem] rounded-full aurora-blob aurora-lavender"
        animate={{
          x: [0, -50, -10, 0],
          y: [0, 50, 10, 0],
          scale: [1, 0.94, 1.04, 1],
        }}
        transition={{ duration: 38, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-12rem] left-[22%] h-[32rem] w-[32rem] rounded-full aurora-blob aurora-rose"
        animate={{
          x: [0, 35, -15, 0],
          y: [0, -25, -5, 0],
          scale: [1, 1.04, 0.98, 1],
        }}
        transition={{ duration: 42, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
