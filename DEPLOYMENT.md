# 自托管部署指南

## 快速开始

### 1. 本地开发

```bash
# 安装依赖
npm install

# 创建环境变量文件
cp .env.example .env.local

# 编辑 .env.local，设置你的密钥和密码
# JWT_SECRET=你的密钥
# ADMIN_PASSWORD=你的密码

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 2. 管理后台

- 登录地址：http://localhost:3000/admin/login
- 默认用户名：admin
- 默认密码：admin123（请在 .env.local 中修改）

### 3. 发布文章

1. 登录管理后台
2. 点击"新建文章"
3. 填写 Slug、标题、内容等信息
4. 点击"发布文章"

文章会自动保存到 `content/posts/` 目录

---

## Docker 自托管部署

### 前置要求

- Docker 和 Docker Compose
- 一台服务器（VPS、云主机等）

### 部署步骤

#### 1. 克隆项目

```bash
git clone <your-repo-url> cyber-blog
cd cyber-blog
```

#### 2. 配置环境变量

```bash
cp .env.example .env

# 编辑 .env 文件
nano .env
```

**重要配置项：**

```env
JWT_SECRET=生成一个强随机密钥（至少32字符）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=设置一个强密码
NODE_ENV=production
```

**生成强密钥：**

```bash
# 方法1：使用 openssl
openssl rand -base64 32

# 方法2：使用 node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3. 启动容器

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止
docker-compose down
```

#### 4. 访问应用

- 主页：http://your-domain.com
- 管理后台：http://your-domain.com/admin/login

---

## 使用 Nginx 反向代理

### 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 使用 Let's Encrypt 获取免费 SSL 证书

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 自动续期
sudo systemctl enable certbot.timer
```

---

## 数据备份

### 备份文章

```bash
# 备份 content 目录
docker-compose exec app tar -czf /tmp/content-backup.tar.gz content/

# 复制到本地
docker cp cyber-blog-app-1:/tmp/content-backup.tar.gz ./backup/
```

### 恢复文章

```bash
# 复制备份文件到容器
docker cp ./backup/content-backup.tar.gz cyber-blog-app-1:/tmp/

# 恢复
docker-compose exec app tar -xzf /tmp/content-backup.tar.gz
```

---

## 常见问题

### Q: 如何修改管理员密码？

编辑 `.env` 文件中的 `ADMIN_PASSWORD`，然后重启容器：

```bash
docker-compose restart app
```

### Q: 如何使用密码哈希而不是明文密码？

1. 生成密码哈希：

```bash
node -e "require('bcryptjs').hash('yourpassword',10).then(console.log)"
```

2. 在 `.env` 中设置：

```env
ADMIN_PASSWORD_HASH=生成的哈希值
```

3. 重启容器

### Q: 如何增加上传文件大小限制？

编辑 `next.config.ts`，添加：

```typescript
export default {
  serverRuntimeConfig: {
    maxBodySize: '50mb',
  },
}
```

### Q: 如何在生产环境中更新代码？

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build
```

---

## 性能优化

### 1. 启用 Gzip 压缩

在 Nginx 配置中添加：

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. 使用 CDN

将静态资源（图片、CSS、JS）上传到 CDN，在 `next.config.ts` 中配置：

```typescript
export default {
  images: {
    domains: ['cdn.example.com'],
  },
}
```

### 3. 启用缓存

在 Nginx 中配置缓存头：

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 监控和日志

### 查看容器日志

```bash
# 实时日志
docker-compose logs -f app

# 最后 100 行
docker-compose logs --tail=100 app
```

### 使用 PM2 管理进程（可选）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "cyber-blog" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs cyber-blog
```

---

## 安全建议

1. **更改默认密码** - 部署后立即修改管理员密码
2. **使用强 JWT 密钥** - 至少 32 字符的随机字符串
3. **启用 HTTPS** - 使用 Let's Encrypt 获取免费证书
4. **定期备份** - 每周备份 `content/` 目录
5. **更新依赖** - 定期运行 `npm update` 更新依赖包
6. **限制访问** - 使用防火墙限制管理后台访问 IP

---

## 故障排除

### 容器无法启动

```bash
# 查看详细错误
docker-compose logs app

# 检查端口是否被占用
lsof -i :3000

# 重新构建
docker-compose down
docker-compose up -d --build
```

### 文章无法保存

```bash
# 检查 content 目录权限
docker-compose exec app ls -la content/

# 修复权限
docker-compose exec app chmod -R 755 content/
```

### 登录失败

1. 检查 `.env` 中的用户名和密码
2. 检查 JWT_SECRET 是否正确设置
3. 清除浏览器 Cookie 后重试

---

## 支持

如有问题，请提交 Issue 或联系作者。
