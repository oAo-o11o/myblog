import { asset } from '@/lib/asset'
'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

interface Photo {
  id: string
  src: string
  alt: string
  width: number
  height: number
  tags: string[]
}

interface VideoItem {
  id: string
  src: string
  poster?: string | null
  title: string
  desc: string
  tags: string[]
}

type GalleryItem =
  | ({ type: 'photo' } & Photo)
  | ({ type: 'video' } & VideoItem)

export default function GalleryClient() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'all' | 'photo' | 'video'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [photoRes, videoRes] = await Promise.all([
          fetch(asset('/api/upload/photos')),
          fetch(asset('/api/upload/videos')),
        ])

        const photoData = photoRes.ok ? await photoRes.json() : { photos: [] }
        const videoData = videoRes.ok ? await videoRes.json() : { videos: [] }

        const photoItems: GalleryItem[] = (photoData.photos || []).map((p: Photo) => ({
          ...p,
          type: 'photo' as const,
        }))

        const videoItems: GalleryItem[] = (videoData.videos || []).map((v: VideoItem) => ({
          ...v,
          type: 'video' as const,
        }))

        setItems([...photoItems, ...videoItems].reverse())
      } catch (error) {
        console.error('加载 Gallery 失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const allTags = Array.from(
    new Set(
      items.flatMap((item) => item.tags || [])
    )
  )

  const filtered = items.filter((item) => {
    const tagMatch = activeTag ? item.tags.includes(activeTag) : true
    const typeMatch = activeType === 'all' ? true : item.type === activeType
    return tagMatch && typeMatch
  })

  const openLightbox = useCallback((item: GalleryItem) => setLightbox(item), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (!lightbox) return
      const idx = filtered.findIndex((item) => item.id === lightbox.id)
      if (idx === -1) return
      const next = filtered[(idx + dir + filtered.length) % filtered.length]
      setLightbox(next)
    },
    [lightbox, filtered]
  )

  if (loading) {
    return (
      <div className="text-center py-16 text-ink/45">
        加载中…
      </div>
    )
  }

  return (
    <>
      {/* Type filter */}
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 mb-3">
        <button onClick={() => setActiveType('all')} data-active={activeType === 'all'} className="filter-term">
          ALL
        </button>
        <button onClick={() => setActiveType('photo')} data-active={activeType === 'photo'} className="filter-term">
          PHOTOS
        </button>
        <button onClick={() => setActiveType('video')} data-active={activeType === 'video'} className="filter-term">
          VIDEOS
        </button>
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 mb-10">
        <button onClick={() => setActiveTag(null)} data-active={!activeTag} className="filter-term">
          ALL TAGS
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag((t) => (t === tag ? null : tag))}
            data-active={activeTag === tag}
                  className="filter-term"
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          这里还没有内容，先去后台上传图片或视频吧。
        </div>
      ) : (
        <div className="masonry">
          
            {filtered.map((item, i) => (
              <div
                key={`${item.type}-${item.id}`}

                className="masonry-item group cursor-pointer"
                onClick={() => openLightbox(item)}
              >
                <div className="relative overflow-hidden rounded-xl glass-border border-line">
                  {item.type === 'photo' ? (
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={item.width}
                      height={item.height}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="relative">
                      <video
                        src={item.src}
                        poster={item.poster ?? undefined}
                        className="w-full h-auto object-cover bg-black"
                        muted
                        playsInline
                        preload="none"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-14 h-14 rounded-full bg-black/55 border border-line/20 flex items-center justify-center text-ink text-xl">
                          ▶
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-ink font-semibold text-sm">
                      {item.type === 'photo' ? item.alt : item.title}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {item.tags.map((t) => (
                        <span key={t} className="text-accent/70 text-xs">
                          # {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          
        </div>
      )}

      {/* Lightbox */}
      
        {lightbox && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-6 right-6 text-ink text-3xl hover:text-ink transition-colors z-10 opacity-70 hover:opacity-100"
              onClick={closeLightbox}
              aria-label="Close"
            >
              ×
            </button>

            {filtered.length > 1 && (
              <>
                <button
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-ink text-4xl hover:text-ink transition-colors z-10 p-2 opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(-1)
                  }}
                  aria-label="Previous"
                >
                  ‹
                </button>

                <button
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-ink text-4xl hover:text-ink transition-colors z-10 p-2 opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(1)
                  }}
                  aria-label="Next"
                >
                  ›
                </button>
              </>
            )}

            <div
              key={`${lightbox.type}-${lightbox.id}`}
              className="max-w-5xl max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.type === 'photo' ? (
                <>
                  <Image
                    src={lightbox.src}
                    alt={lightbox.alt}
                    width={lightbox.width}
                    height={lightbox.height}
                    className="max-h-[80vh] w-auto h-auto rounded-xl object-contain"
                    priority
                  />
                  <div className="mt-3 text-center">
                    <p className="text-ink font-semibold">{lightbox.alt}</p>
                  </div>
                </>
              ) : (
                <>
                  <video
                    src={lightbox.src}
                    poster={lightbox.poster ?? undefined}
                    controls
                    autoPlay
                    className="max-h-[80vh] w-auto max-w-full rounded-xl bg-black"
                  />
                  <div className="mt-3 text-center">
                    <p className="text-ink font-semibold">{lightbox.title}</p>
                    {lightbox.desc && (
                      <p className="text-ink/60 text-sm mt-1">{lightbox.desc}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      
    </>
  )
}
