# CreatiVault Creator Collection & Export

Submit creator collection jobs by profile links, usernames, keywords, creator videos, or post videos, then fetch data or export xlsx/csv/html files.

## Pricing

$0.05/task, $0.03/export, $2/1k fetched records.

## Owner configuration

Configure these as Apify Actor environment variables/secrets:

```text
CV_API_KEY=your_creativault_openapi_key
CV_USER_IDENTITY=apify-store@creativault.ai
CV_API_BASE_URL=https://creativault-business.creativault.ai
```

`CV_API_KEY` must be secret.

## Operation

Default operation: `collectionSubmit`

Available operations: `collectionSubmit`, `keywordCollectionSubmit`, `collectionStatus`, `collectionData`, `collectionExport`.

## Notes

- Empty searches and failed requests are not charged.
- Status polling is free unless a future PPE event is added.
- This actor uses the shared CreatiVault OpenAPI runner generated from the root project.
