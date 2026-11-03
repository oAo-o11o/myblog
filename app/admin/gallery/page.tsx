'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface Photo {
  id: string
  src: string
  alt: string
  tags: string[]
  width: number
  height: number
}

export default function AdminGalleryPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = async () => {
    const res = await fetch('/api/upload/photos')
    if (res.status === 401) {
      router.push('/admin/login')
      return
    }
    const data = await res.json()
    setPhotos(data.photos)
    setLoading(false)
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  const deletePhoto = async (filename: string) => {
    if (!confirm(`确定删除「${filename}」？`)) return
    await fetch(`/api/upload/photos?filename=${filename}`, { method: 'DELETE' })
    fetchPhotos()
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-black tracking-widest text-ink">
            CYBER<span className="text-accent-2">LOG</span>
            <span className="text-ink-muted/50 text-base font-normal ml-3 tracking-normal">图片管理</span>
          </h1>
          <div className="flex gap-3">
            <Link
              href="/admin/gallery/upload"
              className="px-4 py-2 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm hover:bg-accent/20 transition-all"
            >
              + 上传图片
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
          ) : photos.length === 0 ? (
            <p className="text-ink-muted/40 text-sm text-center py-8">还没有图片，去上传一张吧</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map(photo => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative rounded-xl overflow-hidden border border-line bg-panel-2 hover:border-line transition-all"
                >
                  <div className="relative w-full aspect-square bg-panel-2">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-3">
                    <p className="text-ink/80 text-sm font-mono truncate">{photo.id}</p>
                    <p className="text-ink-muted/60 text-xs mt-1 line-clamp-2">{photo.alt}</p>

                    {photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {photo.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(244,184,160,0.1)] text-accent">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 pt-3 border-t border-line">
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="flex-1 text-ink-muted/50 text-xs hover:text-accent transition-colors"
                      >
                        删除
                      </button>
                      <a
                        href={photo.src}
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
