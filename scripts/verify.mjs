// scripts/verify.mjs — 一条命令验证站点是否完好
// 用法：
//   node scripts/verify.mjs                     # 验证本地
//   BASE=https://shidagu.online node scripts/verify.mjs
//   ADMIN_USER=xxx ADMIN_PASS=yyy node scripts/verify.mjs
//
// 它只做「可回滚」的写操作：改 site.json 会还原，建临时想法会删掉。

const BASE = process.env.BASE ?? 'http://localhost:3000'
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

async function get(path, cookie) {
  const res = await fetch(BASE + path, {
    redirect: 'manual',
    headers: cookie ? { cookie } : {},
  })
  return res
}

async function jget(path, cookie) {
  const res = await get(path, cookie)
  const text = await res.text()
  try {
    return { status: res.status, json: JSON.parse(text), text }
  } catch {
    return { status: res.status, json: null, text }
  }
}

async function main() {
  // ---------- 1. 公共页面 ----------
  const publicPages = ['/', '/notes', '/topics', '/blog', '/about', '/gallery', '/timeline']
  for (const p of publicPages) {
    await check(`页面 ${p}`, async () => {
      const res = await get(p)
      assert(res.status === 200, `HTTP ${res.status}`)
      return '200'
    })
  }

  await check('专题页 /topics/计算机', async () => {
    const res = await get('/topics/' + encodeURIComponent('计算机'))
    assert(res.status === 200, `HTTP ${res.status}`)
    return '200'
  })

  await check('不存在的专题 → 404', async () => {
    const res = await get('/topics/' + encodeURIComponent('不存在的题目xyz'))
    assert(res.status === 404, `HTTP ${res.status}`)
    return '404'
  })

  // ---------- 2. 权限门 ----------
  await check('未登录访问后台 → 跳登录', async () => {
    const res = await get('/admin/dashboard')
    assert([307, 302].includes(res.status), `HTTP ${res.status}（应为 307）`)
    return String(res.status)
  })

  await check('未登录写接口 → 401', async () => {
    const res = await fetch(BASE + '/api/posts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    assert(res.status === 401, `HTTP ${res.status}（应为 401）`)
    return '401'
  })

  await check('未登录改站点配置 → 401', async () => {
    const res = await fetch(BASE + '/api/site', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    assert(res.status === 401, `HTTP ${res.status}（应为 401）`)
    return '401'
  })

  // ---------- 3. 登录 ----------
  let cookie = ''
  await check('登录', async () => {
    const res = await fetch(BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: USER, password: PASS }),
    })
    assert(res.status === 200, `HTTP ${res.status}（账号密码对不对？）`)
    const raw = res.headers.getSetCookie?.() ?? [res.headers.get('set-cookie') ?? '']
    cookie = raw[0].split(';')[0]
    assert(cookie.startsWith('admin_token='), '没拿到 admin_token cookie')
    return 'cookie 已获取'
  })

  if (!cookie) {
    report()
    return
  }

  // ---------- 4. 后台页面 ----------
  const adminPages = [
    '/admin/dashboard',
    '/admin/new',
    '/admin/topics',
    '/admin/gallery',
    '/admin/videos',
    '/admin/about',
    '/admin/timeline',
    '/admin/settings',
  ]
  for (const p of adminPages) {
    await check(`后台 ${p}`, async () => {
      const res = await get(p, cookie)
      assert(res.status === 200, `HTTP ${res.status}`)
      return '200'
    })
  }

  // ---------- 5. 站点配置往返 ----------
  await check('站点配置：改 → 前台生效 → 还原', async () => {
    const before = await jget('/api/site', cookie)
    assert(before.status === 200 && before.json?.name, '读不到 site.json')

    const canary = 'VERIFY-CANARY-' + Date.now()
    const put = await fetch(BASE + '/api/site', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ ...before.json, footerNote: canary }),
    })
    assert(put.status === 200, `PUT HTTP ${put.status}`)

    const page = await (await get('/')).text()
    assert(page.includes(canary), '前台页脚没出现新值')

    const revert = await fetch(BASE + '/api/site', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify(before.json),
    })
    assert(revert.status === 200, '还原失败')

    const after = await (await get('/')).text()
    assert(!after.includes(canary), '还原后仍残留')
    return '生效并已还原'
  })

  // ---------- 6. 内容往返（建 → 题目改名 → 删） ----------
  let tempSlug = ''
  await check('发一条临时想法', async () => {
    const res = await fetch(BASE + '/api/posts', {
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
    const res = await fetch(BASE + '/api/topics/rename', {
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

  await check('删除临时内容', async () => {
    const res = await fetch(BASE + '/api/posts/' + tempSlug, {
      method: 'DELETE',
      headers: { cookie },
    })
    assert(res.status === 200, `HTTP ${res.status}`)
    const list = await jget('/api/posts', cookie)
    assert(!list.json.posts.includes(tempSlug), '文件没删掉')
    return '已清理'
  })

  // ---------- 7. 媒体 ----------
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
  console.log('')
  for (const r of results) {
    const mark = r.ok ? '✓' : '✗'
    console.log(`${mark} ${r.name.padEnd(pad)}  ${r.detail}  (${r.ms}ms)`)
  }
  const failed = results.filter((r) => !r.ok)
  console.log('')
  console.log(`共 ${results.length} 项，通过 ${results.length - failed.length}，失败 ${failed.length}，用时 ${Date.now() - t0}ms`)
  if (failed.length) process.exitCode = 1
}

main().catch((e) => {
  console.error('验证脚本自身出错：', e)
  process.exitCode = 2
})
