# Oracle 注册：地址信息怎么填

## 一句话原则

**与银行卡预留的「账单地址」完全一致，用拼音或英文写，不用中文。**

因为 Oracle 把这串地址交给支付网关做 AVS（地址校验）比对，对不上就可能被拒。它不会给你寄东西。

---

## 先确认一件事：你的卡是哪国的

| 你的卡 | 地址填哪里 |
|---|---|
| 国内银行发的 Visa / Mastercard（招行、中行、交行等） | **你在中国大陆的真实地址**（拼音） |
| 境外银行 / 境外虚拟卡 | 卡所属国家的地址 |
| 不确定 | 打开银行 App → 卡片管理 → 找「账单地址 / Billing Address」 |

> ⚠️ 千万不要「为了让账号看起来像海外用户」而编造一个美国地址。地址、IP、发卡国三者不一致，是注册被拒最常见的原因。

---

## 字段拆解：中文地址 → 英文顺序

中文是「大→小」，英文地址是「小→大」，要倒过来写。

| 表单字段 | 填什么 | 说明 |
|---|---|---|
| First name | `San` | 名，拼音，与卡面一致 |
| Last name | `Zhang` | 姓 |
| Address Line 1 | 门牌号 + 路名 + 楼栋房号 | **核心行**，从最小单位写起 |
| Address Line 2 | 区 / 县 / 镇（可选） | 一行放不下就写这儿 |
| City | 城市 | 如 `Beijing`、`Luoyang` |
| State / Province | 省 / 直辖市 | 多数情况是下拉框，选对应英文名 |
| Postal Code | 6 位邮编 | 最容易填错的一项 |
| Country | `China` | |
| Phone | 国家码 `+86` + 手机号 | 11 位，不加 0、不加横线 |

---

## 三个真实例子（可直接照着套）

### 例 1 · 北京写字楼

中文：北京市朝阳区建国路 88 号 SOHO 现代城 A 座 1203 室，邮编 100022

```
Address Line 1:  Room 1203, Tower A, SOHO Modern City, 88 Jianguo Road
Address Line 2:  Chaoyang District
City:            Beijing
State/Province:  Beijing
Postal Code:     100022
Country:         China
Phone:           +86 13812345678
```

### 例 2 · 上海小区

中文：上海市浦东新区世纪大道 100 号 3 号楼 501，邮编 200120

```
Address Line 1:  Room 501, Building 3, 100 Century Avenue
Address Line 2:  Pudong New Area
City:            Shanghai
State/Province:  Shanghai
Postal Code:     200120
Country:         China
```

### 例 3 · 地级市 / 县城（大多数人的情况）

中文：河南省洛阳市涧西区中州西路 15 号院 2 号楼 302，邮编 471000

```
Address Line 1:  Room 302, Building 2, Yard 15, Zhongzhou West Road
Address Line 2:  Jianxi District
City:            Luoyang
State/Province:  Henan
Postal Code:     471000
Country:         China
```

县级市（如江苏海安市）这样拆：`City` 填上级市 `Nantong`，`Address Line 2` 填 `Hai'an`。

---

## 五个高频错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 写中文「北京市朝阳区…」 | 部分字段只收 ASCII，可能乱码或校验失败 | 全用拼音/英文 |
| `City` 填成省，`State` 填成市 | 省市颠倒，AVS 不匹配 | City=城市，State=省 |
| 邮编随手填 `100000` | 与卡预留地址对不上 | 填你真实邮编（6 位） |
| `Address Line 1` 里塞「China, Beijing, Chaoyang…」 | 国家重复、层级混乱 | 国家只用 Country 字段表达 |
| 电话写成 `+86 013812345678` | 多一个 0 | `+86` + `13812345678` |

---

## 下拉框里找不到我的省怎么办

Oracle 的 `State/Province` 对 China 通常给的是英文省名列表（Beijing、Shanghai、Guangdong、Zhejiang、Henan…）。

- **找不到**：先看是不是把 English 拼写记错了（如 `Inner Mongolia`、`Ningxia`、`Xinjiang`）
- 还没有：选最接近的一项，或选 `Other`，然后在 `Address Line 2` 里补上省的拼音
- 无论如何，**别为了迁就下拉框去改城市**

---

## 填完被提示地址验证失败

多半是邮编、省市三者之一与银行预留不一致。排查顺序：

1. 打开银行 App / 网银，找「账单地址」逐字比对
2. 特别看邮编是不是旧的（搬过家没更新）
3. 有些卡默认账单地址是**开户行地址**而不是你留的住址，这种情况问客服确认
4. 改完隔 24 小时再提交，别连续重试

---

## 一张小抄

```
First name:      名拼音
Last name:       姓拼音
Address Line 1:  房号, 楼栋, 小区/大厦, 门牌号 路名
Address Line 2:  区/县 District
City:            市
State/Province:  省
Postal Code:     6 位邮编
Country:         China
Phone:           +86 手机号（不带 0）
```

把这几行对着银行 App 抄一遍，基本不会错。
