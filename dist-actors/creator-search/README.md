# CreatiVault Creator Search

Search TikTok, Instagram, YouTube, and Twitter/X creators with follower, country, engagement, email, industry, and audience filters.

## Pricing

S1 $1.20/1k creators, S2 $4/1k creators, S3 $8/1k creators.

## Owner configuration

Configure these as Apify Actor environment variables/secrets:

```text
CV_API_KEY=your_creativault_openapi_key
CV_USER_IDENTITY=apify-store@creativault.ai
CV_API_BASE_URL=https://creativault-business.creativault.ai
```

`CV_API_KEY` must be secret.

## Operation

Default operation: `creatorSearch`

This actor uses a fixed operation selected by its listing.

## Notes

- Empty searches and failed requests are not charged.
- Status polling is free unless a future PPE event is added.
- This actor uses the shared CreatiVault OpenAPI runner generated from the root project.
