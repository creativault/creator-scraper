# CreatiVault Video Audit

Submit TikTok, Instagram Reels, or YouTube Shorts for hook, script, storyboard, benchmark, and viral-factor analysis.

## Pricing

$0.80/audit and $0.08/media upload.

## Owner configuration

Configure these as Apify Actor environment variables/secrets:

```text
CV_API_KEY=your_creativault_openapi_key
CV_USER_IDENTITY=apify-store@creativault.ai
CV_API_BASE_URL=https://creativault-business.creativault.ai
```

`CV_API_KEY` must be secret.

## Operation

Default operation: `videoAuditSubmit`

Available operations: `videoAuditSubmit`, `mediaUpload`, `videoAuditStatus`, `videoAuditResult`.

## Notes

- Empty searches and failed requests are not charged.
- Status polling is free unless a future PPE event is added.
- This actor uses the shared CreatiVault OpenAPI runner generated from the root project.
