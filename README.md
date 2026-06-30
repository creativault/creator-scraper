# TikTok Creator Search

> TikTok creator search with multi-dimensional filtering — followers, engagement, audience demographics, contact info & commerce (GMV). Powered by [Creatilab OpenAPI](https://creativault.vip).

An [Apify Actor](https://docs.apify.com/actors) that wraps the Creatilab (Creativault) OpenAPI to search TikTok creators with 20+ filters and export structured data to Apify datasets.

---

## ✨ Features

- **Multi-dimensional filtering** — keyword, country, language, follower range, engagement rate, last-video date, gender, MCN, contact-info flags
- **Tiered data depth (S1 / S2 / S3)** — choose between pure-name list, precision-reach, or deep-audience-profile tiers
- **Contact info & commerce data** — emails, WhatsApp, Line, Zalo, MCN, GMV / GPM / commission data (tier-dependent)
- **Audience demographics (S3)** — gender ratio, age distribution, country & language breakdowns
- **Automatic pagination** with configurable result cap and retry/backoff
- **Type restoration** — Creatilab stringifies all values server-side; this Actor restores numeric/boolean fields for clean datasets

---

## 🚀 Quick Start (local with Apify CLI)

```bash
# 1. 安装 Apify CLI
npm install -g apify

# 2. 安装依赖
npm install

# 3. 本地运行（会打开表单让你填参数）
apify run
```

### Deploy to Apify Store

```bash
apify login          # 用你的 Apify 账号登录
apify push           # 构建并推送到 Apify 平台
```

---

## 🔑 Authentication

This Actor calls the Creatilab OpenAPI and **requires your own API Key**:

1. 在 [Creatilab 平台](https://creativault.vip) 注册并获取 API Key（格式如 `cv_live_xxx`）。
2. 在 Actor Input 的 **`apiKey`** 字段填入该 Key。
3. 在 **`userIdentity`** 填入你的操作人员邮箱（用于 `X-User-Identity` 头）。

> 💱 每次调用按 `service_level` 计费（详见下方费率表），Cost 由你的 Creatilab 账户余额扣减，与 Apify 平台计费独立。

---

## 📥 Input Parameters

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `apiKey` | string | — | **必填**。Creatilab API Key |
| `userIdentity` | string | `apify-user@example.com` | 操作人员邮箱 |
| `apiBaseUrl` | string | `https://openapi.creativault.vip` | API 基础地址 |
| `keyword` | string | — | 搜索关键词 |
| `countryCode` | string | `US` | 国家代码，逗号分隔 |
| `followersCntGte` | integer | `10000` | 粉丝数 ≥ |
| `followersCntLte` | integer | `0` | 粉丝数 ≤（0=不限） |
| `last10AvgVideoViewsGte` | number | `0` | 近10条平均播放量 ≥ |
| `last10AvgVideoInteractionRateGte` | number | `0` | 近10条互动率 ≥（百分比） |
| `hasEmail` | boolean | `false` | 仅含邮箱 |
| `hasMcn` | boolean | `false` | 仅含 MCN |
| `gender` | enum | `""` | `male` / `female` / 不限 |
| `sortField` | enum | `followers_cnt` | 排序字段 |
| `sortOrder` | enum | `desc` | `asc` / `desc` |
| `serviceLevel` | enum | `S2` | **S1 / S2 / S3**（决定返回字段范围与计费） |
| `lang` | enum | `en` | 码值翻译语言 |
| `maxResults` | integer | `100` | 抓取上限（控制积分消耗） |
| `sizePerPage` | integer | `50` | 每页条数（1-100） |

---

## 📊 Service Levels & Pricing (S1 / S2 / S3)

Creatilab 按数据深度分三档计费（每条记录扣减积分）：

| 等级 | 定位 | 包含字段（节选） |
|---|---|---|
| **S1** | 纯名单筛选 | uid、username、nickname、avatar、followers/likes/video count、has_email/mcn 标识 |
| **S2** ⭐ | 精准触达 | S1 全部 + country、gender、engagement_rate、avg_views、**真实 email/WhatsApp/Line/Zalo**、product_categories、bio、hashtags |
| **S3** | 深度画像 | S2 全部 + **audience_female_rate、audience_country/language/age 分布** |

具体积分单价以 Creatilab 平台公示为准。

---

## 📤 Output

结果写入 Apify Dataset，每个 item 是一个 TikTok creator 对象（已还原类型）。字段取决于 `serviceLevel`：

```json
{
  "uid": "7001234567890",
  "username": "beautyqueen",
  "nickname": "Beauty Queen",
  "avatar_url": "https://...",
  "profile_url": "https://www.tiktok.com/@beautyqueen",
  "followers_count": 150000,      // number（已还原）
  "likes_count": 2400000,
  "video_count": 320,
  "has_email": true,              // boolean（已还原）
  "country_code": "US",
  "gender": "female",
  "engagement_rate": 8.5,
  "avg_views": 50000,
  "email": "contact@beautyqueen.com",
  "bio": "Beauty & skincare 💄",
  "hashtags": ["skincare", "makeup"]
}
```

Apify Dataset 自带的 **Overview 视图**已配置好（uid / username / followers / engagement / email 等列）。

---

## ⚠️ Notes & Limitations (MVP)

- 仅支持 **TikTok 创作者搜索**（YouTube / Instagram / 视频搜索后续版本支持）
- `meta.total` 行为：当筛选条件 ≤ 2 个时，Creatilab 不返回总数（`null`），日志会提示
- 所有 API 调用走服务端，**无需代理**
- 当前的 API Key 为 **用户自备模式**；后续可加内置 Key + 配额管理

---

## 🗂 Project Structure

```
.
├── .actor/
│   ├── actor.json          # Actor 元信息 + Dataset 视图配置
│   └── INPUT_SCHEMA.json   # 用户表单参数定义
├── main.js                 # Actor 主逻辑（调用 CV OpenAPI + 分页 + pushData）
├── Dockerfile              # Apify 构建镜像
├── package.json
└── README.md
```

---

## License

MIT
