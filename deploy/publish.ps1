# publish.ps1 —— 一条命令：检查 → 提交 → 推送 → 等部署
# 用法：
#   npm run publish -- "改了什么"
#   powershell -File deploy/publish.ps1 -Message "改了什么"
param(
  [Parameter(Position = 0)]
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

if (-not $Message) {
  $Message = "update: " + (Get-Date -Format "yyyy-MM-dd HH:mm")
}

Write-Host "==> 检查有没有改动" -ForegroundColor Cyan
$status = git status --porcelain
if (-not $status) {
  Write-Host "    没有改动，什么都不用做。" -ForegroundColor Yellow
  exit 0
}

# 安全闸：.env 绝不能进仓库
if (git status --porcelain | Select-String -Quiet "\.env(\s|$)") {
  Write-Host "!! .env 在待提交列表里，已中止。" -ForegroundColor Red
  Write-Host "   执行 git rm --cached .env 后再试。" -ForegroundColor Red
  exit 1
}

Write-Host "==> 类型检查" -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
  Write-Host "!! 类型检查没过，已中止（改动仍在本地）。" -ForegroundColor Red
  exit 1
}

Write-Host "==> 待提交的文件" -ForegroundColor Cyan
$status -split "`n" | Where-Object { $_.Trim() } | ForEach-Object { "    $_" }

Write-Host "==> 提交" -ForegroundColor Cyan
git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  Write-Host "!! 提交失败。" -ForegroundColor Red
  exit 1
}

Write-Host "==> 推送" -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) {
  Write-Host "!! 推送失败（国内网络常见）。稍后重试：git push" -ForegroundColor Yellow
  exit 1
}

Write-Host "==> 等部署（约 1 分钟）" -ForegroundColor Cyan
$sha = (git rev-parse HEAD).Trim()
$runId = ""
for ($i = 0; $i -lt 12; $i++) {
  Start-Sleep -Seconds 5
  $runId = (gh run list --repo oAo-o11o/myblog --limit 10 --json databaseId,headSha -q "[.[] | select(.headSha == `"$sha`")][0].databaseId" 2>$null)
  if ($runId) { break }
}
if (-not $runId) {
  Write-Host "    还没看到这次提交的运行，去网页看：" -ForegroundColor Yellow
  Write-Host "    https://github.com/oAo-o11o/myblog/actions" -ForegroundColor Yellow
  exit 0
}
gh run watch $runId --repo oAo-o11o/myblog --exit-status --compact | Select-Object -Last 6
if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "完成：https://oao-o11o.github.io/myblog/" -ForegroundColor Green
} else {
  Write-Host "!! 部署失败，去这里看日志：" -ForegroundColor Red
  Write-Host "   https://github.com/oAo-o11o/myblog/actions" -ForegroundColor Red
}
