# Influencer Outreach Email

Send creator outreach emails, check task status, inspect contact history, todo follow-ups, metrics, config, and upload attachments.

## Pricing

$0.04/email and $0.08/attachment upload.

## Owner configuration

Configure these as Apify Actor environment variables/secrets:

```text
CV_API_KEY=your_creativault_openapi_key
CV_USER_IDENTITY=apify-store@creativault.ai
CV_API_BASE_URL=your_creativault_openapi_base_url
```

`CV_API_KEY` must be secret. `CV_API_BASE_URL` is required and should be configured as an environment variable instead of being hard-coded in source files.

## Operation

Default operation: `outreachSend`

Available operations: `outreachSend`, `outreachTask`, `outreachContact`, `outreachTodo`, `outreachMetrics`, `outreachConfig`, `outreachUpload`.

## Notes

- Empty searches and failed requests are not charged.
- Status polling is free unless a future PPE event is added.
- This actor uses the shared CreatiVault OpenAPI runner generated from the root project.
