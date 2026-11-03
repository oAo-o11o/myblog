#!/usr/bin/env bash
# 备份：只打包「会变的数据」，不碰 node_modules / .next
# crontab 示例（每天 03:10）：
#   10 3 * * * /opt/myblog/app/deploy/backup.sh >> /var/log/cyberlog/backup.log 2>&1
set -euo pipefail

APP="${APP_DIR:-/opt/myblog/app}"
DEST="${BACKUP_DIR:-/opt/myblog/backups}"
KEEP_DAYS="${KEEP_DAYS:-30}"

mkdir -p "$DEST"
STAMP="$(date +%F-%H%M)"
OUT="$DEST/cyberlog-$STAMP.tar.gz"

tar -czf "$OUT" \
  -C "$APP" \
  --exclude='*.log' \
  content public/photos public/videos .env

# 顺手把体积写进日志，方便发现异常膨胀
SIZE="$(du -h "$OUT" | cut -f1)"
echo "[$(date -Is)] backup ok -> $OUT ($SIZE)"

find "$DEST" -name 'cyberlog-*.tar.gz' -mtime +"$KEEP_DAYS" -delete
