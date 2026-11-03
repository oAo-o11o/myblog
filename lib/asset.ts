/**
 * 静态部署在子路径（GitHub Pages 的 /myblog/）时，
 * public 里的资源必须手动补上 basePath —— next/image 的 unoptimized 模式
 * 不会自动加前缀，否则线上图片 404。
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function asset(p: string): string {
  if (!p) return p
  if (/^(https?:)?\/\//.test(p)) return p
  const path = p.startsWith('/') ? p : `/${p}`
  return `${BASE_PATH}${path}`
}
