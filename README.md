# CYBERLOG - 个人技术博客

一个现代化的个人技术博客平台，采用 Next.js 16 + React 19 + Tailwind CSS 构建，支持 MDX 文章、JWT 认证和自托管部署。

## 功能特性

- 🎨 **现代化设计** - 全息主题、渐变动画、玻璃态卡片
- 📝 **MDX 支持** - 使用 Markdown 编写文章，支持 React 组件
- 🔐 **管理后台** - JWT 认证、文章 CRUD、实时编辑
- 🚀 **自托管部署** - Docker 容器化、Nginx 反向代理、Let's Encrypt SSL
- 📱 **响应式设计** - 完美适配桌面、平板、手机
- ⚡ **高性能** - Next.js 优化、静态生成、增量静态再生成

## 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 创建环境变量文件
cp .env.example .env.local

# 3. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 管理后台

- 地址：http://localhost:3000/admin/login
- 默认用户名：admin
- 默认密码：admin123

## 使用指南

### 发布文章

1. 登录管理后台 `/admin/login`
2. 点击"新建文章"
3. 填写以下信息：
   - **Slug** - 文章 URL 标识（如 `my-first-post`）
   - **标题** - 文章标题
   - **日期** - 发布日期
   - **摘要** - 一句话简介
   - **标签** - 逗号分隔的标签
   - **正文** - Markdown 格式的内容

4. 点击"发布文章"

### 编辑文章

1. 在管理后台点击文章列表中的"编辑"
2. 修改内容
3. 点击"保存修改"

### 删除文章

1. 在管理后台点击文章列表中的"删除"
2. 确认删除

## 项目结构

```
cyber-blog/
├── app/
│   ├── api/                    # API 路由
│   │   ├── auth/              # 认证接口
│   │   └── posts/             # 文章接口
│   ├── admin/                 # 管理后台
│   │   ├── login/             # 登录页面
│   │   ├── dashboard/         # 仪表板
│   │   ├── new/               # 新建文章
│   │   └── edit/[slug]/       # 编辑文章
│   ├── blog/                  # 博客页面
│   ├── globals.css            # 全局样式
│   └── page.tsx               # 首页
├── components/                # React 组件
│   ├── home/                  # 首页组件
│   ├── blog/                  # 博客组件
│   └── ui/                    # UI 组件
├── content/
│   └── posts/                 # MDX 文章文件
├── lib/                       # 工具函数
├── Dockerfile                 # Docker 配置
├── docker-compose.yml         # Docker Compose 配置
└── DEPLOYMENT.md              # 部署指南
```

## 环境变量

创建 `.env.local` 文件（本地开发）或 `.env` 文件（生产环境）：

```env
# JWT 密钥（生成强随机字符串）
JWT_SECRET=your-super-secret-key

# 管理员用户名
ADMIN_USERNAME=admin

# 管理员密码（明文或哈希）
ADMIN_PASSWORD=admin123

# 节点环境
NODE_ENV=production
```

## 部署

### Docker 部署

```bash
# 1. 配置环境变量
cp .env.example .env
nano .env

# 2. 启动容器
docker-compose up -d

# 3. 查看日志
docker-compose logs -f app
```

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## API 文档

### 认证

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### 登出
```
POST /api/auth/logout
```

### 文章

#### 获取文章列表
```
GET /api/posts
```

#### 创建文章
```
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "slug": "my-post",
  "title": "文章标题",
  "date": "2024-04-16",
  "excerpt": "摘要",
  "tags": ["技术", "Next.js"],
  "content": "# Markdown 内容"
}
```

#### 更新文章
```
PUT /api/posts/[slug]
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新标题",
  "date": "2024-04-16",
  "excerpt": "新摘要",
  "tags": ["技术"],
  "content": "# 新内容"
}
```

#### 删除文章
```
DELETE /api/posts/[slug]
Authorization: Bearer <token>
```

## 技术栈

- **框架** - Next.js 16.2.3
- **运行时** - React 19.2.4
- **样式** - Tailwind CSS 4
- **动画** - Framer Motion 12
- **认证** - JWT (jose)
- **密码** - bcryptjs
- **内容** - MDX (next-mdx-remote)
- **部署** - Docker

## 许可证

MIT
