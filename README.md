# CreatiVault OpenAPI Actor

Apify actor for the CreatiVault OpenAPI creator ecosystem.

This actor is no longer limited to the MVP TikTok search endpoint. It supports:

- Creator search: TikTok, YouTube, Instagram
- Video search: cross-platform short-video discovery
- Lookalike creator discovery
- Collection tasks: link, username, creator-video, post-video, keyword collection
- Collection status, paged data fetch, and xlsx/csv/html export
- File delivery URL lookup
- Video script audit submit/status/result
- Media upload for video audit
- Outreach send/task/contact/todo/metrics/config
- Outreach attachment upload
- Raw POST calls to any CreatiVault OpenAPI path

## Required Input

```json
{
  "operation": "creatorSearch",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com"
}
```

The actor sends:

- `X-API-Key: apiKey`
- `X-User-Identity: userIdentity`
- `Content-Type: application/json` for normal endpoints

Default base URL:

```text
https://creativault-business.creativault.ai
```

## Creator Search

```json
{
  "operation": "creatorSearch",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com",
  "platform": "tiktok",
  "countryCode": "US",
  "hasEmail": true,
  "followersCntGte": 100000,
  "last10AvgVideoInteractionRateGte": 3,
  "serviceLevel": "S2",
  "maxResults": 100
}
```

The actor maps common fields to platform-specific backend fields:

- TikTok: `last10_avg_video_views_cnt_*`, `last10_avg_video_interaction_rate_*`
- YouTube: `last10_avg_video_view_count_all_*`, `last10_avg_interaction_rate_all_*`
- Instagram: `last10_avg_video_view_count_*`, `last10_avg_video_interaction_rate_*`

Use `requestBody` or `rawBodyJson` for fields not exposed in the UI.

## Video Search

```json
{
  "operation": "videoSearch",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com",
  "platform": "tiktok",
  "hashtag": ["skincare"],
  "videoViewsCntGte": 100000,
  "videoInteractionRateGte": 5,
  "maxResults": 30
}
```

Video search uses `/openapi/v1/videos/search`. Backend page size is capped at 10.

## Collection With Poll And Export

```json
{
  "operation": "collectionSubmit",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com",
  "platform": "tiktok",
  "taskType": "LINK_BATCH",
  "values": [
    "https://www.tiktok.com/@creator1",
    "https://www.tiktok.com/@creator2"
  ],
  "waitForCompletion": true,
  "pollIntervalSeconds": 60,
  "maxPollAttempts": 45,
  "exportFormat": "xlsx"
}
```

Supported collection task types:

- `LINK_BATCH`
- `FILE_UPLOAD`
- `CREATOR_VIDEO`
- `POST_VIDEO`

Twitter/X supports `LINK_BATCH` and `FILE_UPLOAD`; video collection is not supported by the backend for Twitter/X.

## Keyword Collection

```json
{
  "operation": "keywordCollectionSubmit",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com",
  "platform": "instagram",
  "keywords": ["beauty tips", "skincare routine"],
  "waitForCompletion": true,
  "exportFormat": "csv"
}
```

## Lookalike

```json
{
  "operation": "lookalike",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com",
  "profileUrl": "https://www.tiktok.com/@somecreator",
  "targetPlatform": "instagram",
  "countryCode": "US",
  "limit": 20
}
```

## Video Audit

Submit by social video URL:

```json
{
  "operation": "videoAuditSubmit",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com",
  "videoUrl": "https://www.tiktok.com/@creator/video/123",
  "brief": "Evaluate hook, product integration, and conversion potential.",
  "waitForCompletion": true,
  "pollIntervalSeconds": 10,
  "maxPollAttempts": 60
}
```

Or upload a media file first:

```json
{
  "operation": "mediaUpload",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com",
  "fileUrl": "https://example.com/video.mp4",
  "filename": "video.mp4"
}
```

Then pass the returned `oss_key` as `uploadedOssKey` to `videoAuditSubmit`.

## Outreach

Single send:

```json
{
  "operation": "outreachSend",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com",
  "to": "creator@example.com",
  "uid": "creator_uid_from_search",
  "platform": "tiktok",
  "subject": "Collaboration opportunity",
  "bodyText": "Hi, we would like to discuss a campaign...",
  "channel": "ses"
}
```

Batch send:

```json
{
  "operation": "outreachSend",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com",
  "recipients": [
    { "email": "a@example.com", "uid": "uid_a", "nickname": "A", "platform": "tiktok" },
    { "email": "b@example.com", "uid": "uid_b", "nickname": "B", "platform": "instagram" }
  ],
  "subject": "Collaboration opportunity",
  "bodyHtml": "<p>Hi, we would like to discuss a campaign...</p>",
  "channel": "ses",
  "waitForCompletion": true
}
```

## Raw Request

Use raw requests when the backend adds a field before the actor UI has a named input.

```json
{
  "operation": "rawRequest",
  "apiKey": "cv_live_xxx",
  "userIdentity": "operator@example.com",
  "endpointPath": "/openapi/v1/creators/tiktok/search",
  "requestBody": {
    "page": 1,
    "size": 50,
    "country_code": "US",
    "service_level": "S2"
  }
}
```

`requestBody` overrides generated fields. `rawBodyJson` overrides both generated fields and `requestBody`.

## Output

Paged result operations push individual records to the Apify dataset.

Task and single-response operations push an object containing:

```json
{
  "operation": "collectionExport",
  "data": {},
  "meta": {}
}
```

A run summary is also written to the key-value store as `OUTPUT`.

## Notes

- Do not treat `meta.quota_remaining` as credits. Only OpenAPI error code `40201` means insufficient credits.
- Search responses may return `meta.total: null` when the backend intentionally skips count queries.
- The backend stringifies many search data fields. The actor restores common numeric and boolean fields in dataset output.
