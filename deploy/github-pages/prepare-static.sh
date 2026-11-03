#!/usr/bin/env bash
# prepare-static.sh —— 在 CI 里把「必须服务端」的部分临时移出，然后静态导出
# 本地开发完全不受影响：这个脚本只在 GitHub Actions 里跑
set -euo pipefail

export BUILD_TARGET=static

echo "==> 移出服务端专属部分"
mkdir -p .disabled
[ -d app/api ]       && mv app/api       .disabled/api       || true
[ -d app/admin ]     && mv app/admin     .disabled/admin     || true
[ -f proxy.ts ]      && mv proxy.ts      .disabled/proxy.ts  || true
[ -f middleware.ts ] && mv middleware.ts .disabled/middleware.ts || true

echo "==> 去掉 force-dynamic（export 模式不允许动态渲染）"
grep -rl "export const dynamic = 'force-dynamic'" app 2>/dev/null | while read -r f; do
  sed -i "/export const dynamic = 'force-dynamic'/d" "$f"
  echo "    $f"
done

echo "==> 媒体改直链（public 目录天然可访问，不需要 API 中转）"
grep -rl "/api/media/photos/" components app 2>/dev/null | while read -r f; do
  sed -i "s|/api/media/photos/|/photos/|g" "$f"
done
grep -rl "/api/media/videos/" components app 2>/dev/null | while read -r f; do
  sed -i "s|/api/media/videos/|/videos/|g" "$f"
done

echo "==> 画廊数据静态化"
node scripts/build-gallery-json.mjs
grep -rl "/api/upload/photos" components app 2>/dev/null | while read -r f; do
  sed -i "s|/api/upload/photos|/gallery-photos.json|g" "$f"
done
grep -rl "/api/upload/videos" components app 2>/dev/null | while read -r f; do
  sed -i "s|/api/upload/videos|/gallery-videos.json|g" "$f"
done

echo "==> 静态导出"
npx next build

echo "==> 收尾"
# GitHub Pages 默认跑 Jekyll，会吞掉 _next 目录；这个空文件是必须的
touch out/.nojekyll
# 自定义域名（可选）：CI 里设 CNAME_DOMAIN=你的域名
if [ -n "${CNAME_DOMAIN:-}" ]; then
  echo "$CNAME_DOMAIN" > out/CNAME
  echo "    CNAME -> $CNAME_DOMAIN"
fi

echo "==> 产物检查"
test -d out && echo "out/ 已生成，页面数：$(find out -name '*.html' | wc -l)，大小：$(du -sh out | cut -f1)"
