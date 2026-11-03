#!/usr/bin/env bash
# deploy.sh — 本地跑，一条命令把改动推到服务器
# 用法：
#   SERVER=root@1.2.3.4 bash deploy.sh
#   SERVER=root@1.2.3.4 APP_DIR=/opt/myblog/app bash deploy.sh
set -euo pipefail

SERVER="${SERVER:?用法: SERVER=root@IP bash deploy.sh}"
APP_DIR="${APP_DIR:-/opt/myblog/app}"

echo "==> 同步源码到 $SERVER:$APP_DIR"
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'public/photos' \
  --exclude 'public/videos' \
  --exclude 'content/posts' \
  --exclude 'content/site.json' \
  --exclude '_screenshots' \
  --exclude '*.log' \
  ./ "$SERVER:$APP_DIR/"

echo "==> 远端安装依赖 + 构建"
ssh "$SERVER" "set -e; cd $APP_DIR; npm ci; npm run build"

echo "==> 重启"
ssh "$SERVER" "cd $APP_DIR; pm2 restart cyberlog || pm2 start deploy/ecosystem.config.js; pm2 save"

echo "==> 健康检查"
ssh "$SERVER" "sleep 2; curl -s -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:3000/"

echo "完成。"
