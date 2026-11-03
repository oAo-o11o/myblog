'use client'

import { motion } from 'framer-motion'
import TypeWriter from '@/components/ui/TypeWriter'
import NeonButton from '@/components/ui/NeonButton'

const phrases = [
  'writing code and keeping notes',
  'recording thoughts, visuals, and progress',
  'building my own digital space',
  'learning, making, and refining',
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--skin-accent)_0%,transparent_55%)] opacity-[0.07] pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 gradient-blob blob-green opacity-30 blur-3xl liquid-blob" />
      <div className="absolute bottom-20 left-10 w-80 h-80 gradient-blob blob-cyan opacity-25 blur-3xl liquid-blob" />
      <div className="absolute top-1/2 left-1/4 w-72 h-72 gradient-blob blob-pink opacity-20 blur-3xl liquid-blob" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-accent/40 bg-accent/10 text-accent text-[11px] tracking-[0.24em] uppercase"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          PERSONAL SITE · DIGITAL ARCHIVE
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-[3.4rem] sm:text-6xl md:text-7xl lg:text-[6.4rem] font-black tracking-[-0.03em] text-ink leading-[0.92] mb-6 hologram-text"
          data-text="DIGITAL CORNER"
        >
          <span className="block">DIGITAL</span>
          <span className="block gradient-text">CORNER</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-base md:text-xl text-ink-muted mb-4 tracking-wide"
        >
          A small place for code, notes, visuals, and everything still taking shape.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="text-sm md:text-lg font-mono text-accent mb-12 h-8"
        >
          <TypeWriter phrases={phrases} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <NeonButton href="/blog" variant="cyan" size="lg">
            Read Posts
          </NeonButton>
          <NeonButton href="/gallery" variant="outline" size="lg">
            View Gallery
          </NeonButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-16 flex flex-col items-center gap-2 text-[#606080]/80 text-[11px] tracking-[0.24em]"
        >
          <span>SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="w-px h-10 bg-gradient-to-b from-accent/60 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  )
}
