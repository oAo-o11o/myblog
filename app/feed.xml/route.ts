import { getAllEntries } from '@/lib/mdx'
import { readSite } from '@/lib/site'

export const dynamic = 'force-static'

/** XML 转义 */
function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** RSS 里不能放 Markdown 语法，简单剥掉常见标记 */
function plain(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET() {
  const site = readSite()
  const base = site.url || 'http://localhost:3000'
  const entries = getAllEntries()

  const items = entries
    .map((e) => {
      const url = `${base}/blog/${e.slug}/`
      const title = e.title || plain(e.body).slice(0, 24) || '一条想法'
      const desc = e.excerpt || plain(e.body).slice(0, 200)
      const date = new Date(`${e.date}T00:00:00+08:00`).toUTCString()

      return `    <item>
      <title>${esc(title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(desc)}</description>
${e.topics.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${esc(base)}/</link>
    <description>${esc(site.epigraph)}</description>
    <language>zh-CN</language>
    <atom:link href="${esc(base)}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date(entries[0]?.date ? `${entries[0].date}T00:00:00+08:00` : Date.now()).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
