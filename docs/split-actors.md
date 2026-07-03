# CreatiVault Apify Actor 拆分方案

生成时间：2026-07-02

本项目现在采用“双层结构”：

```text
根目录
- main.js                         共享 OpenAPI 运行器
- scripts/generate-split-actors.mjs  拆分 Actor 生成脚本
- dist-actors/                    生成后的可发布 Actor 目录
```

以后如果改了 `main.js` 或某个表单配置，执行：

```bash
npm run generate:actors
```

会重新生成 `dist-actors/` 下所有独立 Actor。

## 已拆分 Actor

| 目录 | Actor | 面向用户 | 覆盖 OpenAPI |
|---|---|---|---|
| `dist-actors/creator-search` | Influencer Scraper | 达人搜索 | `/openapi/v1/creators/tiktok/search`、`/youtube/search`、`/instagram/search`、`/twitter/search` |
| `dist-actors/lookalike-finder` | Lookalike Influencer Finder | 相似达人发现 | `/openapi/v1/creators/lookalike` |
| `dist-actors/video-search` | Short Video Scraper | 短视频搜索 | `/openapi/v1/videos/search` |
| `dist-actors/collection-export` | Influencer Collection & Export | 批量采集、任务状态、取数、导出 | `/openapi/v1/collection/tasks/submit`、`/keyword-submit`、`/status`、`/data`、`/export` |
| `dist-actors/video-audit` | Video Audit | 视频脚本/爆款审核 | `/openapi/v1/media/upload`、`/openapi/v1/video-script-audit/tasks/submit`、`/status`、`/result` |
| `dist-actors/outreach-email` | Influencer Outreach Email | 邮箱建联、任务、联系人、待办、指标、配置、附件 | `/openapi/v1/outreach/send`、`/task`、`/contact`、`/todo`、`/metrics`、`/config`、`/upload` |
| `dist-actors/files-webhook-utilities` | File & Webhook Utilities | 文件下载链接、Webhook 连通性验证 | `/openapi/v1/files/download-url`、`/openapi/v1/webhook/verify` |
| `dist-actors/openapi-suite-internal` | OpenAPI Suite Internal | 内部万能版 | 覆盖上述全部；可通过环境变量启用 raw request |

这样所有当前挂载在 `src/openapi/channels/http/app.py` 的 OpenAPI router 都有对应 Actor 覆盖。

## 推荐发布策略

公开 Store 推荐优先发布：

1. `creator-search`
2. `lookalike-finder`
3. `collection-export`
4. `video-audit`
5. `outreach-email`
6. `video-search`

`files-webhook-utilities` 更像客户支持/工具类 Actor，可以放低优先级。

`openapi-suite-internal` 不建议公开上架，建议设为 Private，用于内部测试、客服排查和高级 API 调试。

## 每个 Actor 的环境变量

每个公开 Actor 都需要配置：

```text
CV_API_KEY=你的 CreatiVault OpenAPI key
CV_USER_IDENTITY=apify-store@creativault.ai
CV_API_BASE_URL=你的 CreatiVault OpenAPI base URL
```

其中：

- `CV_API_KEY` 必须设置为 Secret
- `CV_USER_IDENTITY` 可不设，代码会自动生成 `apify-store+...@creativault.ai`
- `CV_API_BASE_URL` 必须设置为环境变量，不要写死在源码里

内部调试可选：

```text
CV_DISABLE_APIFY_CHARGING=true
CV_ALLOW_INPUT_BASE_URL=true
CV_ENABLE_RAW_REQUEST=true
```

这些不要给公开 Store Actor 开启。

## Monetization 事件覆盖

| Event name | 用在哪些 Actor | 建议价格 |
|---|---|---:|
| `creator-result-s1` | `creator-search` | `$0.0012` |
| `creator-result-s2` | `creator-search` | `$0.0040` |
| `creator-result-s3` | `creator-search` | `$0.0080` |
| `video-result` | `video-search` | `$0.0015` |
| `lookalike-result` | `lookalike-finder` | `$0.0060` |
| `collection-submit` | `collection-export` | `$0.0500` |
| `collection-export` | `collection-export` | `$0.0300` |
| `collection-data-result` | `collection-export` | `$0.0020` |
| `video-audit-submit` | `video-audit` | `$0.8000` |
| `media-upload` | `video-audit` | `$0.0800` |
| `outreach-email` | `outreach-email` | `$0.0400` |
| `outreach-attachment-upload` | `outreach-email` | `$0.0800` |

状态查询类接口不收费。

文件下载链接和 webhook verify 暂不收费。如果后续想收费，可以新增 PPE event 并在 `main.js` 对应 operation 上接入。

## 发布方式

每个 `dist-actors/<slug>` 都是自包含目录，里面有：

```text
.actor/actor.json
.actor/INPUT_SCHEMA.json
Dockerfile
main.js
package.json
package-lock.json
README.md
```

发布某个 Actor 时，把对应目录作为 Apify Actor source 即可。

例如发布达人搜索：

```text
dist-actors/creator-search
```

发布视频审核：

```text
dist-actors/video-audit
```

## 为什么不直接用一个大表单

Apify Input Schema 不适合复杂动态表单，不能根据用户选择自动隐藏无关字段。

如果所有功能放一个表单，用户选择“视频审核”时仍会看到“Creator data depth”，很容易误解计费逻辑。

拆分后每个 Actor 只展示对应业务字段：

- 达人搜索只展示达人筛选和数据深度
- 视频审核只展示视频 URL、brief、audit mode
- 邮箱建联只展示收件人、主题、正文、渠道
- 采集导出只展示 values、keywords、task ID、export format

这会更适合 Apify Store 的购买心智和 SEO。
