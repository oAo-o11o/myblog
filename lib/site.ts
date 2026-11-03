import fs from 'fs'
import path from 'path'

export interface SiteConfig {
  name: string
  nameEn: string
  tagline1: string
  tagline2: string
  epigraph: string
  skin: string
  footerNote: string
}

export const SITE_PATH = path.join(process.cwd(), 'content', 'site.json')

export const DEFAULT_SITE: SiteConfig = {
  name: '数字角落',
  nameEn: 'digital corner',
  tagline1: '想清楚之前，',
  tagline2: '先写下来。',
  epigraph:
    '学计算机，学数学，读哲学，做的其实是同一件事：把没说清楚的东西，一点一点说清楚。这里留下的是过程。有些事情后来想通了，多数还没有。',
  skin: 'olive',
  footerNote: 'built with next.js',
}

/** 读站点配置；文件缺失或字段缺失时回落到默认值，页面永远不会因为配置坏掉而白屏 */
export function readSite(): SiteConfig {
  try {
    if (!fs.existsSync(SITE_PATH)) return DEFAULT_SITE
    const raw = JSON.parse(fs.readFileSync(SITE_PATH, 'utf-8'))
    return {
      name: typeof raw.name === 'string' && raw.name ? raw.name : DEFAULT_SITE.name,
      nameEn: typeof raw.nameEn === 'string' ? raw.nameEn : DEFAULT_SITE.nameEn,
      tagline1: typeof raw.tagline1 === 'string' ? raw.tagline1 : DEFAULT_SITE.tagline1,
      tagline2: typeof raw.tagline2 === 'string' ? raw.tagline2 : DEFAULT_SITE.tagline2,
      epigraph: typeof raw.epigraph === 'string' ? raw.epigraph : DEFAULT_SITE.epigraph,
      skin: typeof raw.skin === 'string' && raw.skin ? raw.skin : DEFAULT_SITE.skin,
      footerNote: typeof raw.footerNote === 'string' ? raw.footerNote : DEFAULT_SITE.footerNote,
    }
  } catch {
    return DEFAULT_SITE
  }
}

export const VALID_SKINS = ['olive', 'ink', 'plum', 'warm', 'neon'] as const
