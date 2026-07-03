# Apify 子 Actor 输入字段对齐记录

本记录用于维护 Apify Store 子 Actor 的 `INPUT_SCHEMA.json` 与 CreatiVault 后端 OpenAPI / `creator-scraper-cv` skill 的入参一致性。

## 参考来源

- 后端达人搜索模型：`D:\creativault\backend\src\openapi\models\creator_request.py`
- 后端视频搜索模型：`D:\creativault\backend\src\openapi\models\video.py`
- 后端找相似路由：`D:\creativault\backend\src\openapi\channels\http\routers\v1\lookalike.py`
- 后端采集路由：`D:\creativault\backend\src\openapi\channels\http\routers\v1\collection.py`
- 后端建联路由：`D:\creativault\backend\src\openapi\channels\http\routers\v1\outreach.py`
- 后端视频审核路由：`D:\creativault\backend\src\openapi\channels\http\routers\v1\video_script_audit.py`
- Skill：`D:\creativault\.kiro\skills\creator-scraper-cv`

## 覆盖情况

| 子 Actor | 对应能力 | 覆盖状态 |
| --- | --- | --- |
| Influencer Scraper | TikTok / YouTube / Instagram / Twitter/X creator search | 已覆盖后端搜索请求模型中的公开筛选字段，并保留平台专属字段 |
| Lookalike Influencer Finder | `/openapi/v1/creators/lookalike` | 已覆盖 username/profile_url、目标平台、地区、语言、粉丝、均播、女性受众、service_level |
| Short Video Scraper | `/openapi/v1/videos/search` | 已覆盖 platform、union_user_ids、hashtag、title、播放、互动率、发布日期、分页 |
| Influencer Collection & Export | collection submit / keyword submit / status / data / export | 已覆盖 task_type、values、keywords、webhook、start/end time、data/export、xlsx/csv/html/feishu_doc |
| Video Audit | video audit submit/status/result + media upload | 已覆盖 url/uploaded_oss_key、brief、campaign_id、audit_mode、benchmark、oss_url_override |
| Influencer Outreach Email | outreach send/task/contact/todo/metrics/config/upload | 已覆盖单发/批量、template_id、send_mode、force_new、attachment_ids、任务/联系人/指标/配置参数 |

## 达人搜索字段范围

通用字段：`platform`、`serviceLevel`、`keyword`、`countryCode`、`languageCode`、`industry`、粉丝区间、均播区间、互动率区间、邮箱、WhatsApp、性别、受众国家/语言/年龄/女性比例、发布日期、排序、分页。

TikTok 专属字段：`hasMcn`、`hasLine`、`hasZalo`、`productCategoryIdArray`、30 天 GMV/GPM/客单价/佣金率区间。

YouTube 专属字段：短视频均播区间、短视频互动率区间、AI creator。

Instagram 专属字段：`isProductKol`、AI creator、女性受众别名字段。

Twitter/X 专属字段：蓝标、认证状态、KOL style、平均点赞区间、最新视频播放区间、播放/粉丝比区间。

## 生成与检查

修改字段后统一改 `scripts/generate-split-actors.mjs`，再执行：

```text
npm run generate:actors
npm run check
```

生成后的 schema 已通过字段覆盖检查。
