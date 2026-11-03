# Oracle Cloud Always Free 部署这个博客

结论先说：能给到 **4 核 ARM / 24G 内存 / 200G 盘 / 10T 月流量**，永久免费。跑这个博客性能过剩。
代价是注册有门槛、ARM 实例可能抢不到、有两处防火墙要开。

---

## 〇、注册前必须知道的三件事

1. **主区域（Home Region）选定后不能改**。选 **首尔 / 东京 / 大阪 / 新加坡**，别选美国——延迟 200ms 起。
2. **要一张信用卡做验证**（冻结约 $1，验证后退回）。国内地址 + 虚拟卡风控较严，失败就换卡或换邮箱重试，别死磕同一个。
3. **Always Free 只在你「不升级为付费账户」时成立**。免费额度：4 OCPU / 24G 的 ARM 实例 1 台，或 2 台 AMD 微型（1G 内存，太弱，别用）；块存储共 200G；出站流量 10T/月。

---

## 一、创建实例

控制台 → Compute → Instances → Create instance

| 项 | 选什么 |
|---|---|
| Image | **Ubuntu 24.04**（Canonical 官方镜像） |
| Shape | **VM.Standard.A1.Flex**（Ampere ARM），4 OCPU / 24 GB |
| Boot volume | 100–150 GB（200G 是总配额，留点给快照） |
| SSH key | 上传你的公钥，或让它生成并**立刻下载私钥** |
| Public IP | Assign a public IPv4 address ✅ |

**抢不到 ARM 怎么办**（`Out of host capacity`）：

- 换**可用性域**（AD-1 / AD-2 / AD-3）再试，同一个区域不同 AD 容量不同
- **不要换区域**：Always Free 只在「主区域」有效，换到别的区域就是付费资源
- 降低规格先开 2 OCPU / 12G，开出来再在线扩容到 4/24
- 写个轮询脚本每 2 分钟试一次，通常几小时内能开出来
- **账户升级为 Pay As You Go 后配额会宽松很多**，Always Free 资源仍然免费（但要保证卡里有余额，超额才会扣）——这是社区里最常用的解法

---

## 二、连上去，跑初始化

```bash
# 本地
chmod 600 ~/下载/ssh-key-*.key
ssh -i ~/下载/ssh-key-*.key ubuntu@<公网IP>

# 服务器上（Ubuntu 镜像默认用户是 ubuntu，先给 root 密码或全程 sudo）
sudo -i
```

把三个脚本传上去（本地执行）：

```bash
scp -i ssh-key.key deploy/bootstrap.sh deploy/oracle-open-ports.sh \
    ubuntu@<公网IP>:/tmp/
```

服务器上：

```bash
sudo bash /tmp/bootstrap.sh          # ffmpeg / nginx / ufw / Node22 / pm2 / 2G swap
sudo bash /tmp/oracle-open-ports.sh  # 放行 80/443（Oracle 镜像默认拦着）
```

> `bootstrap.sh` 里的 `ufw` 只放行 SSH 和 Nginx，和 Oracle 的 iptables 是两套东西，两个都要过。

---

## 三、两条上线路线，选一条

### 路线 1：直接公网 IP + 域名（简单）

1. 域名 DNS 加 A 记录 → 实例公网 IP
2. 服务器上：

```bash
cd /opt/myblog/app
cp deploy/nginx.conf /etc/nginx/conf.d/cyberlog.conf
sed -i 's/shidagu.online/你的域名/g' /etc/nginx/conf.d/cyberlog.conf
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d 你的域名 -d www.你的域名
```

- 服务器在海外 → **不需要备案**
- 缺点：公网 IP 暴露，Oracle 偶尔会给国内访问不稳定的 IP

### 路线 2：Cloudflare Tunnel（推荐，和之前一样）

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 \
  -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared

cloudflared tunnel login
cloudflared tunnel create cyberlog
cp deploy/cloudflared.yml ~/.cloudflared/config.yml   # 换 TUNNEL_UUID
cloudflared tunnel route dns cyberlog shidagu.online
cloudflared service install
```

- 不用开 80/443（第三节那步其实可以跳过，但建议还是开着，方便排查）
- 免费 SSL、隐藏源 IP、国内访问比直连 Oracle 首尔 IP 更稳
- **注意架构**：ARM 机器要下 `cloudflared-linux-arm64`，不是 amd64

---

## 四、部署代码

本地：

```bash
SERVER=ubuntu@<公网IP> APP_DIR=/opt/myblog/app bash deploy/deploy.sh
```

首次还要单独搬数据和配置（`deploy.sh` 故意排除了它们）：

```bash
ssh -i ssh-key.key ubuntu@<公网IP> 'sudo mkdir -p /opt/myblog/app && sudo chown -R ubuntu:ubuntu /opt/myblog'
rsync -avz -e "ssh -i ssh-key.key" content/posts/            ubuntu@IP:/opt/myblog/app/content/posts/
rsync -avz -e "ssh -i ssh-key.key" content/site.json         ubuntu@IP:/opt/myblog/app/content/
rsync -avz -e "ssh -i ssh-key.key" public/photos public/videos ubuntu@IP:/opt/myblog/app/public/
```

密钥（不做这步前面全白干）：

```bash
ssh -i ssh-key.key ubuntu@<公网IP>
cd /opt/myblog/app
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # 新的 JWT_SECRET
nano .env      # JWT_SECRET / ADMIN_USERNAME / ADMIN_PASSWORD（12 位以上）
```

起服务：

```bash
npm ci && npm run build
pm2 start deploy/ecosystem.config.js && pm2 save
pm2 startup        # 按它输出的那行 sudo 命令执行一次
```

> **必须在服务器上 `npm ci`**。ARM 需要 arm64 的 `sharp` / `lightningcss` 原生包，从 Windows 拷过去会直接报 `invalid ELF header`。

---

## 五、验收

```bash
# 服务器上
curl -I http://127.0.0.1:3000          # 200
pm2 logs cyberlog --lines 20           # 无报错

# 本地
$env:BASE="https://你的域名"; node scripts\verify.mjs
```

27 项全绿再算上线成功。

---

## 六、免费额度的边界（别踩）

| 资源 | 免费额度 | 你大概会用 |
|---|---|---|
| ARM 实例 | 4 OCPU / 24G 共 1 台 | 全用 |
| 块存储 | 200 GB 总量（含 boot volume、备份） | 100–150G |
| 出站流量 | 10 TB / 月 | 几 G（图片视频不大的话） |
| 公网 IPv4 | 保留地址免费（2024 年起有调整，看账号说明） | 1 个 |

**设置预算告警**：控制台 → Billing → Budgets，设 ¥1 阈值，超额立刻邮件。这样万一踩到付费资源能第一时间知道。

---

## 七、这台机器是单点，备份必须做

Always Free 只有一台，而且**长期低负载有被回收的先例**。

```bash
chmod +x /opt/myblog/app/deploy/backup.sh
crontab -e
# 每天 03:10
10 3 * * * /opt/myblog/app/deploy/backup.sh >> /var/log/cyberlog/backup.log 2>&1
```

再把备份拉到本地（你电脑上执行，每周一次）：

```bash
scp -i ssh-key.key -r ubuntu@IP:/opt/myblog/backups ./myblog-backups
```

备份只有四样东西：`content/`、`public/photos/`、`public/videos/`、`.env`。恢复 = 解压 + `pm2 restart cyberlog`。

---

## 八、常见故障对照

| 现象 | 原因 |
|---|---|
| 浏览器一直转圈 / 连接超时 | VCN 安全列表没开 80/443，**或** 服务器 iptables 拦着（两个都要开） |
| `502 Bad Gateway` | Node 没起来：`pm2 list` / `pm2 logs` |
| 后台上传图片 500 | 目录权限：`chown -R ubuntu:ubuntu /opt/myblog/app/public` |
| 视频上传 500 | 没装 ffmpeg：`ffmpeg -version` 确认 |
| `invalid ELF header` | 在 Windows 拷了 node_modules，删掉重新 `npm ci` |
| `next build` 被杀 | 内存不足，确认 swap 生效：`free -h` |
| 域名打不开但 IP 能开 | DNS 没生效或 A 记录指错，`nslookup 你的域名` |
