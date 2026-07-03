# Apify Store 达人搜索/Influencer 封装器收费调研

调研日期：2026-07-02

目标：调研 Apify Store 上与 CreatiVault 达人搜索、达人发现、社媒创作者数据封装器相似的 Actor 收费标准，并给出比竞品便宜约 20% 的上线定价建议。

## 一、结论摘要

Apify 当前更推荐公开 Store Actor 使用 **Pay per event（PPE，按事件收费）** 模式。PPE 允许 Actor 在代码中按自定义事件收费，例如：

- 启动一次 Actor
- 生成一条 Dataset 结果
- 调用一次外部 API
- 上传一个文件
- 提交一次异步任务
- 返回一个达人/视频/相似达人结果

Apify 官方给出的收益公式是：

```text
利润 = 0.8 * 收入 - 平台运行成本
```

也就是说，Apify 大约抽取 20%，同时 Actor 运行消耗的计算、存储、流量等平台成本还会从收益里扣除。

官方参考：

- [Apify Pay per event 文档](https://docs.apify.com/platform/actors/publishing/monetize/pay-per-event)
- [Apify Monetization 设置说明](https://docs.apify.com/platform/actors/publishing/monetize)
- [Apify PPE pricing and costs](https://docs.apify.com/platform/actors/publishing/monetize/pricing-and-costs)
- [Apify JS SDK Pay-per-event](https://docs.apify.com/sdk/js/docs/concepts/pay-per-event)

本次调研看到的市场价格大致分三层：

| 类型 | 代表产品 | 观察到的价格区间 |
|---|---|---:|
| 普通帖子/视频采集 | TikTok posts、Instagram hashtag posts、YouTube videos | 约 `$0.30-$2.70 / 1,000 results` |
| 基础达人/profile/channel 查询 | Instagram profiles、YouTube channels、TikTok profiles | 约 `$0.50-$5.00 / 1,000 profiles` |
| 达人发现/线索增强/建联准备 | 带评分、邮箱、相似匹配、外联能力的 influencer discovery | 约 `$15-$50 / 1,000 creators` |

CreatiVault 不应该只按普通社媒帖子 scraper 来定价。我们的价值更接近：

```text
结构化达人搜索 + 多平台筛选 + 联系方式 + 受众画像 + 相似达人 + 采集导出 + 建联工作流
```

所以更适合对标“达人发现 / influencer discovery / enriched leads”类产品，但上线价格需要比它们便宜，形成进入 Apify Store 的价格优势。

## 二、竞品收费调研

| # | Actor | 开发者 | 与我们的相似点 | 公开价格 | 折算单位 | 来源 |
|---:|---|---|---|---:|---:|---|
| 1 | TikTok Scraper | Clockworks | TikTok 用户、视频、Hashtag 综合采集 | from `$1.70 / 1,000 results` | `$0.0017/result` | [Apify 页面](https://apify.com/clockworks/tiktok-scraper) |
| 2 | TikTok Scraper - Videos, Profiles and Hashtags via API | Automation Lab | TikTok profile/video PPE，明确区分事件 | Start `$0.02`；Profile `$0.005`；Video `$0.008` | `$0.005/profile`；`$0.008/video` | [Apify 页面](https://apify.com/automation-lab/tiktok-scraper) |
| 3 | Fast TikTok Scraper API | API Dojo | API 风格 TikTok 封装器，query + item 模式 | Query `$0.006`，含 20 条免费 posts；额外 item `$0.0003` | 约 `$0.30 / 1,000 posts` | [Apify 页面](https://apify.com/apidojo/tiktok-scraper-api) |
| 4 | Instagram Scraper | Apify | Instagram profiles/posts/comments/hashtags 综合采集 | Free plan `$2.70 / 1,000 results` | `$0.0027/result` | [Apify 页面](https://apify.com/apify/instagram-scraper) |
| 5 | Instagram Profile Scraper | Apify | Instagram 达人/profile 查询 | from `$1.60 / 1,000 profiles` | `$0.0016/profile` | [Apify 页面](https://apify.com/apify/instagram-profile-scraper) |
| 6 | Instagram Hashtag Scraper | Apify | Instagram hashtag/post 发现，可用于找达人 | from `$1.90 / 1,000 results`；Free plan `$2.60 / 1,000`；Starter `$2.30 / 1,000` | `$0.0019-$0.0026/result` | [Apify 页面](https://apify.com/apify/instagram-hashtag-scraper) |
| 7 | Instagram Profile Scraper - Fast & Affordable | API Dojo | Instagram user/profile discovery，query 计费 | keyword search `$0.02/search`，前 40 users 免费；handle/URL/user ID `$0.01/query + $0.0005/item` | `$0.0005/item` + query fee | [Apify 页面](https://apify.com/apidojo/instagram-user-scraper) |
| 8 | Instagram Hashtag Scraper | ScrapeSmith | 低价 Instagram post/reel hashtag discovery | `$0.50 / 1,000 posts` | `$0.0005/post` | [Apify 页面](https://apify.com/scrapesmith/instagram-hashtag-scraper) |
| 9 | YouTube Scraper | Streamers | YouTube videos/channels/search 采集 | from `$2.40 / 1,000 videos` | `$0.0024/video` | [Apify 页面](https://apify.com/streamers/youtube-scraper) |
| 10 | Fast YouTube Channel Scraper | Streamers | YouTube channel profile 查询 | `$0.50 / 1,000 search results` | `$0.0005/channel/search result` | [Apify 页面](https://apify.com/streamers/youtube-channel-scraper) |
| 11 | Fast YouTube Channel Scraper API | API Dojo | YouTube creator/channel info API 封装器 | from `$0.50 / 1,000 dataset items`；keyword search `$0.001`；URL/handle `$0.005`；额外 channel `$0.0005` | `$0.0005/channel` + query fee | [Apify 页面](https://apify.com/apidojo/youtube-channel-information-scraper) |
| 12 | Fast Instagram Scraper API | API Dojo | Instagram API 风格封装器 | `$0.005/query + $0.0005/post`，每次 query 含免费 posts | `$0.0005/post` + query fee | [Apify 页面](https://apify.com/apidojo/instagram-scraper) |
| 13 | Influencer Discovery - Find Influencers Across Social Platforms | Community | 最接近高价值竞品：达人发现 + 建联/email 能力 | `$0.05` / influencer profile；`$0.05` / outreach email；`$0.03` / AI personalization | `$50 / 1,000 profiles` | [Apify 页面](https://apify.com/alizarin_refrigerator-owner/influencer-discovery---find-influencers-across-social-platforms) |
| 14 | UGC Creator Finder - Instagram Influencer Discovery | Clare Digital | Creator lead finder，带打分/联系方式定位 | from `$15 / 1,000 creator-founds` | `$0.015/creator` | [Apify 页面](https://apify.com/claredigital/ugc-creator-finder/input-schema) |

## 三、价格观察

1. **普通帖子/视频 scraper 很便宜**  
   它们通常只返回 raw posts、videos、comments，需要用户自己再筛选达人，所以价格低，常见 `$0.30-$2.70 / 1,000`。

2. **基础 profile/channel 查询价格中等**  
   Instagram profile、YouTube channel、TikTok profile 这类按 profile/channel 收费，常见 `$0.0005-$0.005 / profile`。

3. **达人发现类产品价格明显更高**  
   只要包含 relevance matching、评分、邮箱、外联准备、AI 个性化等能力，价格可以到 `$0.015-$0.05 / creator`，即 `$15-$50 / 1,000 creators`。

4. **很多 API 风格 Actor 用两段式计费**  
   例如先收 query fee，再收 dataset item fee。这适合有固定上游 API 成本的产品。

5. **CreatiVault 适合按服务等级拆事件**  
   因为我们的 OpenAPI 有 `S1/S2/S3`，返回字段和上游成本不同，不适合只用 Apify 默认的 `apify-default-dataset-item` 一个价格。

## 四、CreatiVault 建议定价

建议使用 Apify PPE，自定义收费事件，而不是只按默认 Dataset item 收费。

原因：

- `S1/S2/S3` 返回字段不同，成本不同
- 达人搜索、视频搜索、相似达人、视频审核、建联邮件的价值完全不同
- 如果所有结果都用一个 `dataset item` 价格，会导致深度画像收费过低、普通任务记录收费过高

### 4.1 达人搜索 Creator Search

对标对象：

- 基础 profile/channel scraper：`$0.50-$5 / 1,000 profiles`
- 达人发现/enriched leads：`$15-$50 / 1,000 profiles`

建议上线价：

| 收费事件 | 含义 | 建议单价 | 折算每 1,000 条 |
|---|---|---:|---:|
| `creator-result-s1` | 基础达人/profile 结果 | `$0.0012/result` | `$1.20` |
| `creator-result-s2` | 标准增强达人结果，含更多指标/联系方式 | `$0.0040/result` | `$4.00` |
| `creator-result-s3` | 深度达人/受众画像结果 | `$0.0080/result` | `$8.00` |

定价理由：

- `S2 = $0.004/profile`，比常见 `$0.005/profile` 低 20%。
- `S3 = $0.008/profile`，仍明显低于 UGC / influencer discovery 的 `$0.015-$0.05/profile`。
- `S1 = $1.20/1,000`，接近普通结果型 scraper，但因为输出是达人 profile，所以不需要打到最低价。

### 4.2 视频搜索 Video Search

| 收费事件 | 含义 | 建议单价 | 折算每 1,000 条 |
|---|---|---:|---:|
| `video-result` | 视频搜索结果 | `$0.0015/video` | `$1.50` |

定价理由：

- TikTok Scraper 常见价格约 `$1.70 / 1,000 results`
- YouTube Scraper 约 `$2.40 / 1,000 videos`
- 我们定 `$1.50 / 1,000`，具备低价进入优势

### 4.3 相似达人 Lookalike Discovery

| 收费事件 | 含义 | 建议单价 | 折算每 1,000 条 |
|---|---|---:|---:|
| `lookalike-result` | 返回一个相似达人 | `$0.0060/result` | `$6.00` |

定价理由：

- 相似达人发现比普通 profile retrieval 更有价值
- 价格应高于 S2，低于或接近 S3
- 仍远低于 `$15-$50 / 1,000 creators` 的 enriched discovery 产品

### 4.4 采集任务 Collection

| 收费事件 | 含义 | 建议单价 |
|---|---|---:|
| `collection-submit` | 提交一个异步采集任务 | `$0.05/task` |
| `collection-export` | 导出一次 xlsx/csv/html 文件 | `$0.03/export` |
| `collection-data-result` | 可选：从采集任务中取回一条结果 | `$0.0020/result` |

定价理由：

- 采集任务有固定编排成本，需要任务提交费防止滥用
- 任务状态轮询不建议收费
- 只有真正导出/取回数据时再收费，用户更容易接受

### 4.5 视频脚本审核 Video Script Audit

| 收费事件 | 含义 | 建议单价 |
|---|---|---:|
| `video-audit-submit` | 提交一个视频审核任务 | `$0.80/audit` |
| `media-upload` | 上传一个视频素材 | `$0.08/upload` |

定价理由：

- 这不是普通 scraper，是 AI/分析工作流
- 包含下载、转写、分镜、爆点、benchmark、评分等能力
- 建议作为 premium API action 定价

### 4.6 建联 Outreach

| 收费事件 | 含义 | 建议单价 |
|---|---|---:|
| `outreach-email` | 成功接受发送一封建联邮件 | `$0.04/email` |
| `outreach-ai-personalization` | 可选：AI 个性化邮件内容 | `$0.024/personalization` |

定价理由：

- 直接竞品 Influencer Discovery 收 `$0.05/email`
- AI personalization 收 `$0.03`
- 我们分别定 `$0.04` 和 `$0.024`，刚好便宜 20%

## 五、建议对外展示的价格文案

建议 Apify Store 页面这样表达：

```text
只为成功结果付费。空搜索、失败任务、状态轮询不收费。

Creator Search:
- S1 基础达人资料：$1.20 / 1,000 creators
- S2 增强达人资料：$4.00 / 1,000 creators
- S3 深度受众画像：$8.00 / 1,000 creators

Video Search:
- $1.50 / 1,000 videos

Lookalike:
- $6.00 / 1,000 similar creators

Outreach:
- $0.04 / accepted email
```

## 六、对当前 Actor 的实现建议

如果目标是在 Apify Store 直接卖给外部用户，当前 Actor 需要从 **BYOK 模式** 改成 **Store 售卖模式**。

当前模式：

```text
用户输入 CreatiVault API Key
Actor 调我们的 OpenAPI
费用在 CreatiVault 后端积分系统扣
Apify 只算平台运行成本
```

Store 售卖模式建议：

```text
用户不输入 CreatiVault API Key
Actor 使用我们配置在 Apify Secret/环境变量里的 CV_API_KEY
Actor 调 CreatiVault OpenAPI
OpenAPI 成功后 Actor 调 Actor.charge(...)
Apify 向用户收费
我们从 Apify 获得收入
```

需要做的改动：

1. 从公开 input schema 里移除 `apiKey`，或改成高级内部字段。
2. 使用环境变量，例如 `CV_API_KEY`。
3. `userIdentity` 可以选填，或者由 Actor 根据 Apify 用户/运行上下文生成，例如 `apify-store:{APIFY_USER_ID}`。
4. 在 Apify Console 的 Publication -> Monetization 中添加自定义 PPE events。
5. 在代码里只对成功结果调用 `Actor.charge({ eventName, count })`。
6. 不对失败请求、空搜索、状态轮询收费。
7. 遵守用户设置的最大运行成本，如果 Apify 返回 `eventChargeLimitReached`，需要优雅停止。

示例：

```js
await Actor.charge({
  eventName: 'creator-result-s2',
  count: pageItems.length,
});

await Actor.pushData(pageItems);
```

视频审核示例：

```js
const charge = await Actor.charge({
  eventName: 'video-audit-submit',
  count: 1,
});

if (charge.eventChargeLimitReached) {
  await Actor.exit();
}
```

## 七、建议首版上线价格

| 功能 | 建议公开价格 |
|---|---:|
| Creator Search S1 | `$1.20 / 1,000 creators` |
| Creator Search S2 | `$4.00 / 1,000 creators` |
| Creator Search S3 | `$8.00 / 1,000 creators` |
| Video Search | `$1.50 / 1,000 videos` |
| Lookalike | `$6.00 / 1,000 creators` |
| Collection submit | `$0.05 / task` |
| Collection export | `$0.03 / export` |
| Video audit | `$0.80 / audit` |
| Outreach email | `$0.04 / email` |

这个价格策略的特点：

- 核心 S2 达人搜索比 `$0.005/profile` 的常见竞品便宜 20%
- 明显低于 `$15-$50 / 1,000 creators` 的 influencer discovery 高价产品
- 仍保留足够空间覆盖 CreatiVault OpenAPI 成本、Apify 20% 抽成和平台运行成本
- 价格结构清楚，适合 Apify Store 页面展示

