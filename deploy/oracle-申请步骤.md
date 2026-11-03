# Oracle Cloud 申请：一步步来

整个过程大概 30–40 分钟，其中注册 10 分钟、等账号 5–24 小时、开机器 5 分钟、部署 15 分钟。

---

## 第 0 步：准备东西（10 分钟，这一步决定成败）

| 要准备的 | 具体要求 | 为什么 |
|---|---|---|
| 邮箱 | Gmail / Outlook 优先 | QQ、163 有时收不到验证信，也更容易被判风险 |
| 手机号 | 能收短信，+86 可以 | 注册时验证 |
| 银行卡 | Visa / Mastercard 的**实体**借记卡或信用卡，开通国际支付，余额 ≥ $2 | 要做 $1 预授权验证。虚拟卡、预付卡基本必被拒 |
| 地址 | 真实地址的拼音 | 与卡账单地址尽量一致 |
| 姓名 | 证件姓名拼音 | 与卡一致 |
| 网络 | **关掉 VPN 和代理**，用家宽或手机热点 | IP 国家与地址、卡不一致，是最常见的被拒原因 |
| 浏览器 | Chrome / Edge，无痕模式 | 避免旧 cookie 干扰 |

> 一张卡、一台设备、一个邮箱，只注册一个账号。重复注册会被风控直接拉黑。

---

## 第 1 步：填注册表

打开 **https://signup.cloud.oracle.com**

按顺序填（界面是英文，下面是逐项对照）：

| 字段 | 填什么 |
|---|---|
| Country / Territory | **China**（如果卡是国内办的） |
| First name | 名，拼音，如 `San` |
| Last name | 姓，拼音，如 `Zhang` |
| Email | 准备好的邮箱 |
| 勾选同意条款 | ✅ |
| 点 **Continue** | |

然后：

1. **收邮件** → 点里面的验证链接（5 分钟没收到就看垃圾箱）
2. **设置密码** → 12 位以上，含大小写、数字、符号。记下来
3. **选 Cloud Account Name** → 随便起个英文名，如 `zhangsan2026`（登录时会用到）
4. **选 Home Region** ⚠️ **这一步不可逆**

   | 选项 | 延迟 | 建议 |
   |---|---|---|
   | South Korea Central (Seoul) | 40–70ms | **首选** |
   | Japan East (Tokyo) | 50–90ms | 次选 |
   | Japan Central (Osaka) | 50–90ms | 次选 |
   | Singapore | 60–100ms | 备选 |

   **选错就是终身错**，账号建好后无法更改主区域。别选美国、欧洲。

5. **手机验证** → 选 China (+86)，填手机号，收 6 位验证码
6. **添加付款方式**

   | 字段 | 填什么 |
   |---|---|
   | Card type | Visa / Mastercard |
   | Card number | 卡号 |
   | Expiry | 有效期 |
   | CVV | 背面三位 |
   | Name on card | 卡面姓名拼音 |
   | Billing address | 账单地址（英文或拼音） |

7. 点 **Start my free trial**

这时会做一次 **$1 预授权**（不是扣费，1–3 天自动释放）。

---

## 第 2 步：等账号开通

- 正常：几分钟内收到邮件 **"Your Oracle Cloud account is ready"**
- 有时要等几小时，甚至第二天
- **别重复提交**，重复会被当成攻击

账号名格式是 `Cloud Account Name` + 你设的登录名，登录地址：
**https://cloud.oracle.com**（或 `https://cloud.oracle.com/?tenant=你的账号名`）

---

## 第 3 步：如果被拒（很常见，别慌）

会收到 "We couldn't verify your payment" 或 "Your account has been declined"。

按顺序排查：

| 原因 | 怎么改 |
|---|---|
| 用了 VPN / 代理 / 云服务器 IP | 换家宽或手机热点，清 cookie，换浏览器，**隔 24 小时**再试 |
| 虚拟卡 / 预付卡 | 换实体卡；卡必须支持国际支付 |
| 卡余额不足 | 至少留 $2 |
| 地址、IP、卡国家三者不一致 | 尽量统一成一个国家 |
| 同一张卡注册过 | 一人一号，换卡也别用同一设备狂试 |
| 邮箱是临时邮箱 | 换 Gmail / Outlook |

连续失败 3 次以上：隔一两天再试，或从控制台提交工单问原因。**不要一天内反复提交**，会进黑名单。

---

## 第 4 步：登录后先做三件事

1. **确认主区域**
   右上角头像 → `Region`，显示应该是 Seoul / Tokyo / Osaka / Singapore。不是的话立刻提工单，越早越好。

2. **开二次验证**
   右上角头像 → `My profile` → `Security` → 开启 MFA。这机器上以后会放你的站，别只用密码。

3. **设预算告警（重要）**
   左上汉堡菜单 → `Billing & Cost Management` → `Budgets` → `Create Budget`
   - 金额填 **1**
   - 加一条告警规则：预测消耗达到 1% 时发邮件

   这样万一误开了付费资源，当天就能收到邮件，不会月底才发现。

---

## 第 5 步：开 ARM 机器

左上汉堡菜单 → **Compute → Instances → Create instance**

| 界面项 | 选什么 |
|---|---|
| Name | `myblog` |
| Compartment | 默认（root） |
| Placement | 先选 **AD-1**（抢不到再换 AD-2 / AD-3） |
| Image and shape → Change image | **Canonical Ubuntu → 24.04** |
| Shape | **Ampere → VM.Standard.A1.Flex** |
| OCPUs / Memory | **4 / 24 GB**（抢不到就先 2 / 12） |
| Primary VNIC → Assign a public IPv4 | ✅ 勾上 |
| Add SSH keys | **Generate a key pair for me** → 点 **Download private key**（只给一次，丢了只能重建） |
| Boot volume | 展开 Advanced options → 自定义 **100–150 GB** |

点 **Create**。等状态从 PROVISIONING 变成 **RUNNING**（1–3 分钟）。

### 抢不到 ARM（`Out of host capacity`）

Always Free 的 4 核 ARM 在热门区域经常没容量。按这个顺序试：

1. **换可用性域**：AD-1 → AD-2 → AD-3（同一区域，免费额度共享）
2. **降规格**：先开 2 OCPU / 12 GB，开出来后在实例详情里在线扩到 4 / 24
3. **隔几小时再试**，容量是动态释放的
4. **账户升级为 Pay As You Go**：配额宽松很多，Always Free 资源仍然免费（但要求卡里有余额，启用前先设好预算告警）

> ⚠️ **不要换区域重建**。Always Free 只在主区域有效，换区域就是付费资源。

---

## 第 6 步：连上服务器

拿到 **Public IP** 后，在 Windows PowerShell：

```powershell
# 1) 修私钥权限（Windows 的 OpenSSH 对权限很挑，不做会报 UNPROTECTED KEY）
icacls .\ssh-key-2026-11-02.key /inheritance:r /grant:r "$env:USERNAME:R"

# 2) 连接（Oracle 的 Ubuntu 镜像默认用户是 ubuntu，不是 root）
ssh -i .\ssh-key-2026-11-02.key ubuntu@<公网IP>
```

第一次会问 `Are you sure you want to continue connecting?` → 输入 `yes`。

进去之后：

```bash
sudo -i          # 后续脚本要用 root
free -h          # 确认内存 24G（或 12G）
df -h            # 确认磁盘
```

---

## 第 7 步：把站跑起来

```bash
# 本地传脚本
scp -i ssh-key.key deploy/bootstrap.sh deploy/oracle-open-ports.sh ubuntu@IP:/tmp/

# 服务器上
sudo bash /tmp/bootstrap.sh
sudo bash /tmp/oracle-open-ports.sh
```

然后走 `deploy/oracle-cloud.md` 第四、五节：推代码 → 配 `.env`（**换 JWT_SECRET 和密码**）→ `npm ci && npm run build` → `pm2 start` → nginx 或 cloudflared → `verify.mjs`。

---

## 时间线参考

| 阶段 | 耗时 | 卡点 |
|---|---|---|
| 准备材料 | 10 分钟 | 卡是否支持国际支付 |
| 填表 + 手机验证 | 10 分钟 | 主区域别选错 |
| 等账号开通 | 5 分钟 – 24 小时 | 被拒的话要重来 |
| 开 ARM 实例 | 1 分钟 – 几天 | 容量 |
| 系统初始化 | 5 分钟 | 无 |
| 部署 + 验收 | 20 分钟 | 端口没开 |

顺利的话当天能上线；不顺利的最长卡在「抢 ARM」和「注册被拒」这两处。

---

## 成功后的第一件事

```bash
# 记下这两个值，以后提工单或恢复要用
# 控制台 → 右上角头像 → Tenancy: 你的 tenancy OCID
# 实例详情 → Instance OCID
```

以及：**把私钥和 `.env` 各存一份到本地**。这台机器是单点，机器没了这些就是全部。
