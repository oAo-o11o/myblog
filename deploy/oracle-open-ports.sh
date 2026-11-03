#!/usr/bin/env bash
# oracle-open-ports.sh — Oracle Cloud 的 Ubuntu 镜像默认用 iptables 拦掉 80/443
# 只改 VCN 安全列表是不够的，系统内也要放行。
# 用法：sudo bash oracle-open-ports.sh
set -euo pipefail

echo "==> 放行 80 / 443（插到 REJECT 规则之前）"

open_port() {
  local port="$1"
  # 已经放行就跳过
  if iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null; then
    echo "    $port 已放行，跳过"
    return
  fi
  # 找到 REJECT 的行号，把规则插在它前面
  local num
  num=$(iptables -L INPUT --line-numbers -n | awk '/REJECT/{print $1; exit}')
  if [ -n "${num:-}" ]; then
    iptables -I INPUT "$num" -p tcp --dport "$port" -j ACCEPT
  else
    iptables -A INPUT -p tcp --dport "$port" -j ACCEPT
  fi
  echo "    $port 已放行"
}

open_port 80
open_port 443

echo "==> 持久化"
if command -v netfilter-persistent >/dev/null 2>&1; then
  netfilter-persistent save
elif [ -d /etc/iptables ]; then
  iptables-save > /etc/iptables/rules.v4
else
  echo "    找不到 netfilter-persistent，规则重启后会丢"
  echo "    执行：apt-get install -y iptables-persistent && netfilter-persistent save"
fi

echo ""
echo "==> 当前 INPUT 链前 12 条"
iptables -L INPUT --line-numbers -n | head -n 12

echo ""
echo "提醒：还要在 Oracle 控制台放行一次——"
echo "  实例详情 → 主 VCN → 安全列表 → 添加入站规则"
echo "  源 0.0.0.0/0，协议 TCP，端口 80 和 443"
echo "  两边都开，缺一个都访问不通。"
