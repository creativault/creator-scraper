# Lookalike Influencer Finder

Find similar creators from a seed username or profile URL across TikTok, Instagram, and YouTube.

## Pricing

$6.00 / 1,000 similar creators.

## Owner configuration

Configure these as Apify Actor environment variables/secrets:

```text
CV_API_KEY=your_creativault_openapi_key
CV_USER_IDENTITY=apify-store@creativault.ai
CV_API_BASE_URL=your_creativault_openapi_base_url
```

`CV_API_KEY` must be secret. `CV_API_BASE_URL` is required and should be configured as an environment variable instead of being hard-coded in source files.

## Operation

Default operation: `lookalike`

This actor uses a fixed operation selected by its listing.



## Notes

- Empty searches and failed requests are not charged.
- Status polling is free unless a future PPE event is added.
- This actor uses the shared CreatiVault OpenAPI runner generated from the root project.
