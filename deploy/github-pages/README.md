# 架在 GitHub Pages 上（不用服务器）

## 结论

**能，已经验证过。** 我把当前的站做了一次静态导出测试：

```
✓ Compiled successfully
✓ Generating static pages (23/23)
Route (app)
├ ○ /            ├ ○ /notes      ├ ○ /topics
├ ○ /blog        ├ ● /blog/[slug]      (6 条)
├ ○ /gallery     ├ ● /topics/[topic]   (7 个题目)
└ ○ /timeline    └ ○ /about
out/ 已生成，23 个 HTML，18.4 MB
```

## 代价（必须先接受）

| 能力 | 服务器版 | GitHub Pages 版 |
|---|---|---|
| 前台浏览 | ✅ | ✅ 完全一样 |
| 浏览器里登录后台、在线发文、上传图片/视频 | ✅ | ❌ **没有** |
| 视频自动转码 | ✅ | ❌ |
| 发新内容的流程 | 打开后台点点点 | **改文件 → git push → 自动发布** |
| 成本 | 服务器钱 | **0** |
| 稳定性 | 看机器 | GitHub 的 SLA，基本不会挂 |

简单说：**从「动态博客」变成「静态博客」**，像 Hexo / Hugo 那样。

---

## 推荐工作流：后台留本地，线上只托管成品

这是两全的做法，你依然能用现在这个后台：

```
① 本地 npm run dev        → http://localhost:3000/admin  写想法、传图、传视频
② git add . && git commit && git push
③ GitHub Actions 自动构建 → 静态站点更新
```

线上是纯静态（免费、快、不会挂），写作体验完全保留。

---

## 一次性配置

### 1. 仓库

把项目根目录推到 GitHub（`package.json` 要在仓库根）：

```bash
cd myblog-dev
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin git@github.com:你的用户名/myblog.git
git push -u origin main
```

`.gitignore` 里确认有：`node_modules`、`.next`、`.env`。

⚠️ **`.env` 绝对不能进仓库**。静态站没有服务端，也用不到这些密钥。

### 2. 放好工作流文件

```bash
mkdir -p .github/workflows
cp deploy/github-pages/deploy.yml .github/workflows/deploy.yml
git add .github && git commit -m "ci: deploy to pages" && git push
```

### 3. 打开 Pages

仓库 → **Settings → Pages** → Build and deployment → Source 选 **GitHub Actions**。

### 4. 首次发布

push 之后去 **Actions** 标签看 `Deploy to GitHub Pages` 跑起来。第一次大约 3–5 分钟。

成功后地址是：

```
https://你的用户名.github.io/myblog/
```

⚠️ 如果仓库名不是 `你的用户名.github.io`，站点会挂在子路径下，需要在 workflow 里加一行：

```yaml
env:
  BASE_PATH: /myblog
```

（`prepare-static.sh` 已经支持 `BASE_PATH`，Next 会生成正确的资源路径）

---

## 绑定自己的域名（shidagu.online）

### ① 先在 Cloudflare 把 DNS 改掉

| 记录 | 现在 | 改成 |
|---|---|---|
| `shidagu.online` | CNAME 指向旧隧道 | A 记录 → `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153`（四条都加） |
| `www` | — | CNAME → `你的用户名.github.io` |

**关键：这四条 A 记录必须是「灰色云朵」（DNS only），不能开 Cloudflare 代理。** 开了橙云，GitHub 就签不出证书，`Enforce HTTPS` 会一直失败。

### ② 告诉 GitHub 你的域名

仓库 → Settings → Pages → Custom domain 填 `shidagu.online` → Save。

等 DNS 检查通过（几分钟到几小时），再勾上 **Enforce HTTPS**。

### ③ 或者在 CI 里自动写 CNAME

workflow 里加环境变量，脚本会自动生成 `out/CNAME`：

```yaml
- name: Prepare static build
  env:
    CNAME_DOMAIN: shidagu.online
  run: bash deploy/github-pages/prepare-static.sh
```

---

## 发布新内容（三种方式）

### 方式 A · 本地后台（最舒服）

```bash
cd myblog-dev
npm run dev                        # localhost:3000，后台照常用
# 写完 → Ctrl+C
git add content public
git commit -m "post: 今天的想法"
git push
```

注意只提交 `content/` 和 `public/`，别把 `.next`、`node_modules` 带上去。

### 方式 B · GitHub 网页版（手机也能用）

1. 打开仓库 → `content/posts/` → **Add file → Create new file**
2. 文件名 `thought-xxx.mdx`，内容：

```yaml
---
kind: thought
date: "2026-11-03"
topics: ["哲学"]
---

在这里写想法。
```

3. 直接 Commit → Actions 自动构建 → 1 分钟后线上更新

**这就是「不用服务器也能发内容」的答案**：GitHub 的网页编辑器就是你的后台。

### 方式 C · 图片

GitHub 网页 → `public/photos/` → **Add file → Upload files**，拖进去。然后在 mdx 里：

```yaml
media: ["2026-11-03-flower.jpg"]
```

---

## 限制（提前知道，别踩）

| 项 | 限制 | 说明 |
|---|---|---|
| 仓库体积 | 建议 < 1 GB | 现在 18 MB，还能放很多；原图要压 |
| 单文件 | 100 MB（>50 MB 会警告） | 视频要注意，最好压到 10 MB 内 |
| 流量 | 软限制 100 GB/月 | 个人博客远远够 |
| 构建 | Actions 免费 2000 分钟/月 | 一次约 3 分钟，每月能部署 600 多次 |
| 60 天内无活动 | Actions 定时任务会被停 | 我们只用 push 触发，不受影响 |

## 原图建议

那张 3072×4096 的 jpg 有 8 MB。放几张就顶到仓库限制。上传前压一下：

```bash
# 有 ImageMagick 的话
magick input.jpg -resize 2000x2000\> -quality 82 output.jpg
```

或者手机上用「照片压缩」类 App 处理后再传。

---

## 这套方案 vs 服务器

| | GitHub Pages | 服务器（香港轻量） |
|---|---|---|
| 成本 | 0 | ¥24/月 |
| 后台在线发文 | ❌ | ✅ |
| 上传即转码 | ❌ | ✅ |
| 需要运维 | 不需要 | 要（备份、更新） |
| 会挂吗 | 基本不会 | 会（断电、欠费、被回收） |
| 备案 | 不需要（服务器在境外） | 香港也不需要 |

**如果你主要是在电脑上写、能接受 git push 这个动作，GitHub Pages 是更省心的选择。**
**如果你希望随时随地打开浏览器就能发，那就还是要服务器。**
