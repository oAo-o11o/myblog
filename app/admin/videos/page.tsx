'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface VideoItem {
  id: string
  src: string
  title: string
  desc: string
  tags: string[]
}

export default function AdminVideosPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVideos = async () => {
    const res = await fetch('/api/upload/videos')
    if (res.status === 401) {
      router.push('/admin/login')
      return
    }
    const data = await res.json()
    setVideos(data.videos)
    setLoading(false)
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const deleteVideo = async (filename: string) => {
    if (!confirm(`确定删除「${filename}」？`)) return
    await fetch(`/api/upload/videos?filename=${filename}`, { method: 'DELETE' })
    fetchVideos()
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-black tracking-widest text-ink">
            CYBER<span className="text-accent-2">LOG</span>
            <span className="text-ink-muted/50 text-base font-normal ml-3 tracking-normal">视频管理</span>
          </h1>
          <div className="flex gap-3">
            <Link
              href="/admin/videos/upload"
              className="px-4 py-2 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm hover:bg-accent/20 transition-all"
            >
              + 上传视频
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-panel-2 border border-line text-ink-muted/70 text-sm hover:text-ink transition-all"
            >
              返回
            </Link>
          </div>
        </div>

        <div className="surface p-6">
          {loading ? (
            <p className="text-ink-muted/40 text-sm text-center py-8">加载中…</p>
          ) : videos.length === 0 ? (
            <p className="text-ink-muted/40 text-sm text-center py-8">还没有视频，去上传一个吧</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map(video => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl overflow-hidden border border-line bg-panel-2"
                >
                  <video src={video.src} controls className="w-full aspect-video bg-black" />
                  <div className="p-3">
                    <p className="text-ink/80 text-sm font-mono truncate">{video.title}</p>
                    <p className="text-ink-muted/60 text-xs mt-1 line-clamp-2">{video.desc}</p>

                    {video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {video.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(244,184,160,0.1)] text-accent">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 pt-3 border-t border-line">
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="flex-1 text-ink-muted/50 text-xs hover:text-accent transition-colors"
                      >
                        删除
                      </button>
                      <a
                        href={video.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-ink-muted/50 text-xs hover:text-accent transition-colors text-right"
                      >
                        查看
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
