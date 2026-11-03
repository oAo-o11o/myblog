import type { NextConfig } from 'next'
import path from 'path'

// 静态导出开关：CI 里设 BUILD_TARGET=static 才会启用，本地开发不受影响
const isStatic = process.env.BUILD_TARGET === 'static'
const basePath = process.env.BASE_PATH || ''

const nextConfig: NextConfig = {
  // 关掉开发模式左下角那个 Next.js 浮标（只在 next dev 出现，不影响线上）
  devIndicators: false,

  ...(isStatic ? { output: 'export' as const, trailingSlash: true } : {}),
  ...(isStatic && basePath ? { basePath } : {}),

  // 让 lib/asset.ts 能拿到 basePath（构建时内联）
  env: { NEXT_PUBLIC_BASE_PATH: basePath },

  images: {
    // 静态导出没有图片优化服务端，必须关掉
    unoptimized: isStatic,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
