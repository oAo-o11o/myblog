#!/usr/bin/env bash
# bootstrap.sh — 新服务器初始化（Ubuntu 22.04 / 24.04，root 执行）
# 用法：sudo bash bootstrap.sh
# 做完之后这台机器就能跑这个博客了，不用再手动装东西。
set -euo pipefail

echo "==> 基础软件"
apt-get update
apt-get install -y curl git ffmpeg nginx ufw rsync ca-certificates

echo "==> swap（2G 内存的机器构建 Next 会吃满，必须加）"
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "    已创建 2G swap"
else
  echo "    swap 已存在，跳过"
fi

echo "==> Node 22 LTS"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "==> pm2"
command -v pm2 >/dev/null 2>&1 || npm i -g pm2

echo "==> 防火墙"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> 目录"
mkdir -p /opt/myblog /var/log/cyberlog

echo ""
echo "==> 版本确认"
node -v
npm -v
ffmpeg -version | head -n1
pm2 -v
nginx -v
free -h | head -n2

echo ""
echo "完成。下一步："
echo "  1. rsync 把项目推到 /opt/myblog/app"
echo "  2. cd /opt/myblog/app && cp .env.example .env && 改密钥"
echo "  3. npm ci && npm run build"
echo "  4. pm2 start deploy/ecosystem.config.js && pm2 save && pm2 startup"
echo "  5. nginx / cloudflared / certbot 三选一"
