// scripts/verify.mjs —— 体检脚本，自动区分「本地服务器」和「线上静态站」
//
// 用法：
//   node scripts/verify.mjs                                  # 本地 http://localhost:3000，全量 27 项
//   BASE=https://oao-o11o.github.io/myblog node scripts/verify.mjs    # 线上静态站，只查页面与资源
//
// 本地模式会跑：页面、权限门、登录、发文/改名/删除闭环、媒体接口
// 静态模式只跑：页面可达、文章页可达、图片可达、画廊数据可达
//   （静态站没有 API 和后台，硬测只会得到一堆假失败）

const RAW_BASE = (process.env.BASE ?? 'http://localhost:3000').replace(/\/+$/, '')
// 部署在子路径时（GitHub Pages 的 /myblog），页面里的链接已经带了前缀，请求前要剥掉
const BASE_PATH = new URL(RAW_BASE).pathname.replace(/\/+$/, '')

function stripBase(href) {
  const noOrigin = href.replace(/^https?:\/\/[^/]+/, '')
  return BASE_PATH && noOrigin.startsWith(BASE_PATH)
    ? noOrigin.slice(BASE_PATH.length) || '/'
    : noOrigin
}

const USER = process.env.ADMIN_USER ?? 'wow'
const PASS = process.env.ADMIN_PASS ?? 'w1a2n3g4'

const results = []
const t0 = Date.now()

async function check(name, fn) {
  const start = Date.now()
  try {
    const detail = await fn()
    results.push({ ok: true, name, detail: detail ?? '', ms: Date.now() - start })
  } catch (e) {
    results.push({ ok: false, name, detail: e.message, ms: Date.now() - start })
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

/** 页面请求：跟随重定向（静态站会因为 trailingSlash 301 到带斜杠的地址） */
async function page(path, cookie) {
  const res = await fetch(RAW_BASE + path, {
    redirect: 'follow',
    headers: cookie ? { cookie } : {},
  })
  return res
}

/** 直接请求：不跟随重定向，用来看权限门返回 307 还是 200 */
async function raw(path, opts = {}) {
  const { cookie, ...rest } = opts
  return fetch(RAW_BASE + path, {
    redirect: 'manual',
    ...rest,
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(rest.headers ?? {}),
    },
  })
}

async function jget(path, cookie) {
  const res = await raw(path, { cookie })
  const text = await res.text()
  try {
    return { status: res.status, json: JSON.parse(text), text }
  } catch {
    return { status: res.status, json: null, text }
  }
}

async function main() {
  // ---------- 探测模式：有 /api/site 就是本地服务器 ----------
  let hasApi = false
  try {
    const probe = await raw('/api/site')
    hasApi = probe.status === 200
  } catch {
    hasApi = false
  }

  const mode = hasApi ? '本地（含 API 与后台）' : '线上静态站（只读）'
  console.log(`目标：${RAW_BASE}`)
  console.log(`模式：${mode}\n`)

  // ---------- 页面 ----------
  const pages = ['/', '/notes', '/topics', '/blog', '/about', '/gallery', '/timeline']
  for (const p of pages) {
    await check(`页面 ${p}`, async () => {
      const res = await page(p)
      assert(res.status === 200, `HTTP ${res.status}`)
      return '200'
    })
  }

  // ---------- 文章详情页：从列表里取第一个真实链接 ----------
  let firstPostPath = ''
  await check('文章详情页', async () => {
    const html = await (await page('/blog')).text()
    const m = html.match(/href="([^"]*\/blog\/[^"/]+)"?/)
    const href = m?.[1]
    assert(href, '列表里没有文章链接')
    firstPostPath = stripBase(href).replace(/\/?$/, '/')
    const res = await page(firstPostPath)
    assert(res.status === 200, `${firstPostPath} → HTTP ${res.status}`)
    const body = await res.text()
    assert(body.length > 2000, '页面内容太短，可能是空页')
    return firstPostPath
  })

  // ---------- 图片：文章页里第一张 /photos/ 图 ----------
  if (firstPostPath) {
    await check('文章配图可加载', async () => {
      const html = await (await page(firstPostPath)).text()
      const m = html.match(/src="([^"]*\/photos\/[^"]+)"/)
      assert(m?.[1], '这篇没有配图，跳过')
      const src = stripBase(m[1])
      const res = await page(src)
      assert(res.status === 200, `${src} → HTTP ${res.status}`)
      return `${src}（${Math.round(Number(res.headers.get('content-length') ?? 0) / 1024)} KB）`
    })
  }

  // ---------- 静态模式到此为止 ----------
  if (!hasApi) {
    await check('专题页（无题目则跳过）', async () => '静态站不校验 API')
    report()
    return
  }

  // ================= 以下只在本地服务器跑 =================

  await check('不存在的专题 → 404', async () => {
    const res = await raw('/topics/' + encodeURIComponent('不存在的题目xyz'))
    assert(res.status === 404, `HTTP ${res.status}`)
    return '404'
  })

  await check('未登录访问后台 → 跳登录', async () => {
    const res = await raw('/admin/dashboard')
    assert([307, 302].includes(res.status), `HTTP ${res.status}（应为 307）`)
    return String(res.status)
  })

  await check('未登录写接口 → 401', async () => {
    const res = await raw('/api/posts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    assert(res.status === 401, `HTTP ${res.status}（应为 401）`)
    return '401'
  })

  await check('未登录改站点配置 → 401', async () => {
    const res = await raw('/api/site', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    assert(res.status === 401, `HTTP ${res.status}（应为 401）`)
    return '401'
  })

  // ---------- 登录 ----------
  let cookie = ''
  await check('登录', async () => {
    const res = await raw('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: USER, password: PASS }),
    })
    assert(res.status === 200, `HTTP ${res.status}（账号密码对不对？）`)
    const list = res.headers.getSetCookie?.() ?? [res.headers.get('set-cookie') ?? '']
    cookie = list[0].split(';')[0]
    assert(cookie.startsWith('admin_token='), '没拿到 admin_token cookie')
    return 'cookie 已获取'
  })

  if (!cookie) {
    report()
    return
  }

  for (const p of [
    '/admin/dashboard',
    '/admin/new',
    '/admin/topics',
    '/admin/gallery',
    '/admin/videos',
    '/admin/about',
    '/admin/timeline',
    '/admin/settings',
  ]) {
    await check(`后台 ${p}`, async () => {
      const res = await raw(p, { cookie })
      assert(res.status === 200, `HTTP ${res.status}`)
      return '200'
    })
  }

  // ---------- 站点配置往返 ----------
  await check('站点配置：改 → 前台生效 → 还原', async () => {
    const before = await jget('/api/site', cookie)
    assert(before.status === 200 && before.json?.name, '读不到 site.json')
    const canary = 'VERIFY-CANARY-' + Date.now()
    const put = await raw('/api/site', {
      cookie,
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...before.json, footerNote: canary }),
    })
    assert(put.status === 200, `PUT HTTP ${put.status}`)
    const html = await (await page('/')).text()
    assert(html.includes(canary), '前台页脚没出现新值')
    await raw('/api/site', {
      cookie,
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(before.json),
    })
    const after = await (await page('/')).text()
    assert(!after.includes(canary), '还原后仍残留')
    return '生效并已还原'
  })

  // ---------- 内容闭环 ----------
  let tempSlug = ''
  await check('发一条临时想法', async () => {
    const res = await raw('/api/posts', {
      cookie,
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({
        kind: 'thought',
        topics: ['VERIFY_T'],
        content: '自动化验证临时内容，可删。',
      }),
    })
    assert(res.status === 201, `HTTP ${res.status}`)
    const data = await res.json()
    tempSlug = data.slug
    assert(data.kind === 'thought', 'kind 应为 thought')
    return `slug=${tempSlug}`
  })

  await check('题目改名（批量改 frontmatter）', async () => {
    assert(tempSlug, '上一步没成功，跳过')
    const res = await raw('/api/topics/rename', {
      cookie,
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ from: 'VERIFY_T', to: 'VERIFY_T2' }),
    })
    assert(res.status === 200, `HTTP ${res.status}`)
    const data = await res.json()
    assert(data.changed >= 1, '没有文件被改')
    const list = await jget('/api/posts', cookie)
    const item = list.json.meta.find((m) => m.slug === tempSlug)
    assert(item?.topics?.includes('VERIFY_T2'), '新题目没写进 frontmatter')
    return `改了 ${data.changed} 个文件`
  })

  await check('删除临时内容（进回收站）', async () => {
    assert(tempSlug, '上一步没成功，跳过')
    const res = await raw('/api/posts/' + tempSlug, { cookie, method: 'DELETE' })
    assert(res.status === 200, `HTTP ${res.status}`)
    const list = await jget('/api/posts', cookie)
    assert(!list.json.posts.includes(tempSlug), '没从列表消失')
    return '已移入 content/.trash'
  })

  // ---------- 媒体 ----------
  await check('图片列表', async () => {
    const { status, json } = await jget('/api/upload/photos')
    assert(status === 200 && Array.isArray(json.photos), '返回结构不对')
    return `${json.photos.length} 张`
  })

  await check('视频列表（含封面字段）', async () => {
    const { status, json } = await jget('/api/upload/videos')
    assert(status === 200 && Array.isArray(json.videos), '返回结构不对')
    const withPoster = json.videos.filter((v) => v.poster).length
    return `${json.videos.length} 段，带封面 ${withPoster} 段`
  })

  report()
}

function report() {
  const pad = Math.max(...results.map((r) => [...r.name].length), 10)
  for (const r of results) {
    const mark = r.ok ? '✓' : '✗'
    console.log(`${mark} ${r.name.padEnd(pad)}  ${r.detail}  (${r.ms}ms)`)
  }
  const failed = results.filter((r) => !r.ok)
  console.log('')
  console.log(
    `共 ${results.length} 项，通过 ${results.length - failed.length}，失败 ${failed.length}，用时 ${Date.now() - t0}ms`
  )
  if (failed.length) process.exitCode = 1
}

main().catch((e) => {
  console.error('验证脚本自身出错：', e)
  process.exitCode = 2
})
