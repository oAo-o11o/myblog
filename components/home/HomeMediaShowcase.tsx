import Link from 'next/link'
import Image from 'next/image'

interface HomePhoto {
  id: string
  src: string
  alt: string
  width: number
  height: number
  tags: string[]
}

interface HomeVideo {
  id: string
  src: string
  poster: string | null
  title: string
  desc: string
  tags: string[]
}

interface Props {
  photos: HomePhoto[]
  videos: HomeVideo[]
}

function SectionTitle({
  title,
  accent,
}: {
  title: string
  accent: string
}) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${accent}`} />
      <h2 className="text-2xl md:text-3xl font-black tracking-[0.22em] uppercase text-ink">
        {title}
      </h2>
      <div className={`h-px flex-1 bg-gradient-to-l from-transparent ${accent}`} />
    </div>
  )
}

function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(244,184,160,0.1)] text-accent border border-[rgba(244,184,160,0.14)]">
      {children}
    </span>
  )
}

export default function HomeMediaShowcase({ photos, videos }: Props) {
  if (photos.length === 0 && videos.length === 0) return null

  return (
    <section className="py-24 max-w-6xl mx-auto px-6">
      <SectionTitle
        title="Latest Visuals"
        accent="to-[rgba(212,160,200,0.38)]"
      />

      <div className="text-center mb-14">
        <p className="text-ink-muted/58 text-sm md:text-base tracking-[0.12em] uppercase">
          最近上传的图片与视频
        </p>
      </div>

      {photos.length > 0 && (
        <div className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-ink">
                最新图片
              </h3>
              <p className="text-ink-muted/50 text-sm mt-1">
                光影、瞬间与生活切片
              </p>
            </div>

            <Link
              href="/gallery"
              className="text-ink-muted/70 text-sm hover:text-accent transition-colors"
            >
              查看全部 →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {photos.map((photo, index) => (
              <Link
                key={photo.id}
                href="/gallery"
                className="group relative block rounded-[28px] overflow-hidden border border-line bg-panel hover:border-accent/30 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--skin-accent),transparent_45%)] opacity-0 group-hover:opacity-[0.14] transition-opacity duration-500 pointer-events-none" />

                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    priority={index === 0}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.82)] via-[rgba(0,0,0,0.18)] to-transparent opacity-85" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[11px] tracking-[0.14em] uppercase bg-[rgba(15,15,15,0.45)] border border-line/10 text-ink/80 backdrop-blur-sm">
                      Photo {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-ink text-base font-medium line-clamp-1">
                      {photo.alt}
                    </p>

                    {photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {photo.tags.slice(0, 3).map((tag) => (
                          <TagPill key={tag}>{tag}</TagPill>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-ink">
                最新视频
              </h3>
              <p className="text-ink-muted/50 text-sm mt-1">
                更动态的记录方式
              </p>
            </div>

            <Link
              href="/gallery"
              className="text-ink-muted/70 text-sm hover:text-accent transition-colors"
            >
              查看全部 →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.map((video, index) => (
              <Link
                key={video.id}
                href="/gallery"
                className="group block rounded-[28px] overflow-hidden border border-line bg-[rgba(255,255,255,0.02)] hover:border-[rgba(212,160,200,0.3)] transition-all duration-500 hover:-translate-y-1"
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <video
                    src={video.src}
                    poster={video.poster ?? undefined}
                    muted
                    playsInline
                    preload="none"
                    className="w-full h-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-[1.03]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.88)] via-[rgba(0,0,0,0.25)] to-[rgba(0,0,0,0.1)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,160,200,0.18),transparent_55%)] opacity-70" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[11px] tracking-[0.14em] uppercase bg-[rgba(15,15,15,0.45)] border border-line/10 text-ink/80 backdrop-blur-sm">
                      Video {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[rgba(8,8,8,0.48)] border border-line/15 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(212,160,200,0.18)] group-hover:scale-105 transition-transform duration-300">
                      <span className="text-ink text-2xl ml-1">▶</span>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-ink text-base font-medium line-clamp-1">
                      {video.title}
                    </p>

                    {video.desc && (
                      <p className="text-ink-muted/62 text-sm leading-6 mt-2 line-clamp-2">
                        {video.desc}
                      </p>
                    )}

                    {video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {video.tags.slice(0, 3).map((tag) => (
                          <TagPill key={tag}>{tag}</TagPill>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
