# CreatiVault OpenAPI Actor

Apify Store actor for the CreatiVault creator ecosystem.

The public Store version does not ask users for a CreatiVault API key. The Actor owner configures the upstream key as an Apify secret/environment variable, and the actor charges Store users with Apify Pay per event (PPE).

## Capabilities

- Creator search: TikTok, YouTube, Instagram, Twitter/X
- Video search: cross-platform short-video discovery
- Lookalike creator discovery
- Collection tasks: link, username, creator-video, post-video, keyword collection
- Collection status, paged data fetch, and xlsx/csv/html export
- File delivery URL lookup
- Video script audit submit/status/result
- Media upload for video audit
- Outreach send/task/contact/todo/metrics/config
- Outreach attachment upload
- Raw POST calls for internal/debug usage

## Owner Configuration

Configure these in Apify Console as Actor environment variables or secrets:

```text
CV_API_KEY=your_creativault_openapi_key
CV_USER_IDENTITY=apify-store@creativault.ai
CV_API_BASE_URL=https://creativault-business.creativault.ai
```

Optional internal/debug variables:

```text
CV_DISABLE_APIFY_CHARGING=true
CV_ALLOW_INPUT_BASE_URL=true
CV_ENABLE_RAW_REQUEST=true
```

Do not expose `CV_API_KEY` or `CV_ALLOW_INPUT_BASE_URL` in the public input schema.

## Monetization Events

Create these custom PPE events in Apify Console under Publication -> Monetization:

| Event name | Suggested price |
|---|---:|
| `creator-result-s1` | `$0.0012` |
| `creator-result-s2` | `$0.0040` |
| `creator-result-s3` | `$0.0080` |
| `video-result` | `$0.0015` |
| `lookalike-result` | `$0.0060` |
| `collection-submit` | `$0.0500` |
| `collection-export` | `$0.0300` |
| `collection-data-result` | `$0.0020` |
| `video-audit-submit` | `$0.8000` |
| `media-upload` | `$0.0800` |
| `outreach-email` | `$0.0400` |
| `outreach-attachment-upload` | `$0.0800` |

Recommended: remove or set `apify-default-dataset-item` to zero/disabled. This actor uses custom events because `S1`, `S2`, `S3`, video search, audits, and outreach have different values and costs.

## Public Input Example

```json
{
  "operation": "creatorSearch",
  "platform": "tiktok",
  "countryCode": "US",
  "hasEmail": true,
  "followersCntGte": 100000,
  "last10AvgVideoInteractionRateGte": 3,
  "serviceLevel": "S2",
  "maxResults": 100
}
```

The actor sends these headers to CreatiVault:

- `X-API-Key: process.env.CV_API_KEY`
- `X-User-Identity: CV_USER_IDENTITY` or a synthetic Apify Store identity
- `Content-Type: application/json` for normal endpoints

## Charging Behavior

The actor charges only after successful CreatiVault OpenAPI responses.

- Empty searches are not charged.
- Failed OpenAPI calls are not charged.
- Status polling is not charged.
- Paged result operations charge only the records pushed to the default dataset.
- Fixed operations such as collection submit, export, media upload, video audit submit, and outreach send use one custom event per accepted action.
- If a user's Apify max charge limit is too low, the actor stops before producing more billable output.

## Operation Examples

### Creator Search

```json
{
  "operation": "creatorSearch",
  "platform": "instagram",
  "countryCode": "US",
  "industry": "Beauty",
  "hasEmail": true,
  "serviceLevel": "S2",
  "maxResults": 50
}
```

### Video Search

```json
{
  "operation": "videoSearch",
  "platform": "tiktok",
  "hashtag": ["skincare"],
  "videoViewsCntGte": 100000,
  "videoInteractionRateGte": 5,
  "maxResults": 30
}
```

### Collection With Poll And Export

```json
{
  "operation": "collectionSubmit",
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

### Lookalike

```json
{
  "operation": "lookalike",
  "profileUrl": "https://www.tiktok.com/@somecreator",
  "targetPlatform": "instagram",
  "countryCode": "US",
  "limit": 20
}
```

### Video Audit

```json
{
  "operation": "videoAuditSubmit",
  "videoUrl": "https://www.tiktok.com/@creator/video/123",
  "brief": "Evaluate hook, product integration, and conversion potential.",
  "waitForCompletion": true,
  "pollIntervalSeconds": 10,
  "maxPollAttempts": 60
}
```

### Outreach

```json
{
  "operation": "outreachSend",
  "to": "creator@example.com",
  "uid": "creator_uid_from_search",
  "platform": "tiktok",
  "subject": "Collaboration opportunity",
  "bodyText": "Hi, we would like to discuss a campaign...",
  "channel": "ses"
}
```

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
- Public Store listings should use the generated split actors in `dist-actors/`. See `docs/split-actors.md`.
