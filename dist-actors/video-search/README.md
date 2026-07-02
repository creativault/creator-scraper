# Short Video Scraper

Search short-form videos across TikTok, Instagram, and YouTube by hashtag, title, views, interaction rate, and publish date.

## Pricing

$1.50 / 1,000 videos.

## Owner configuration

Configure these as Apify Actor environment variables/secrets:

```text
CV_API_KEY=your_creativault_openapi_key
CV_USER_IDENTITY=apify-store@creativault.ai
CV_API_BASE_URL=your_creativault_openapi_base_url
```

`CV_API_KEY` must be secret. `CV_API_BASE_URL` is required and should be configured as an environment variable instead of being hard-coded in source files.

## Operation

Default operation: `videoSearch`

This actor uses a fixed operation selected by its listing.

## Notes

- Empty searches and failed requests are not charged.
- Status polling is free unless a future PPE event is added.
- This actor uses the shared CreatiVault OpenAPI runner generated from the root project.
