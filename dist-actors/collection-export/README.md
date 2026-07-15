# Influencer Collection & Export

Submit batch influencer collection jobs, then check status, fetch records, or export the completed task to xlsx/csv/html.

## Pricing

$0.05/task, $0.03/export, $2/1k fetched records.

## Owner configuration

Configure these as Apify Actor environment variables/secrets:

```text
CV_API_KEY=your_creativault_openapi_key
CV_USER_IDENTITY=apify-store@creativault.ai
CV_API_BASE_URL=your_creativault_openapi_base_url
```

`CV_API_KEY` must be secret. `CV_API_BASE_URL` is required and should be configured as an environment variable instead of being hard-coded in source files.

## Operation

Default operation: `collectionSubmit`

Available operations: `collectionSubmit`, `keywordCollectionSubmit`, `collectionStatus`, `collectionData`, `collectionExport`.

## How to use

1. Start a new collection task from profile URLs, usernames, creator profile URLs, post/video URLs, or keywords.
2. Copy the returned `task_id` from the run output.
3. Use the same `task_id` to check status, fetch records, or export a completed task.
4. To run everything in one run, enable `Wait for task completion`, then choose whether to fetch records or export a file after completion.

Task type guide:

| Input type | Choose this task type | What it returns |
|---|---|---|
| Creator profile URLs | `LINK_BATCH` | Creator profile records |
| Creator usernames | `FILE_UPLOAD` | Creator profile records |
| Creator profile URLs | `CREATOR_VIDEO` | Videos from those creators |
| Post/video URLs | `POST_VIDEO` | Records for those videos |
| Keywords or hashtags | `keywordCollectionSubmit` operation | Matching creator collection task |

Twitter/X supports only profile URLs and usernames.


## Notes

- Empty searches and failed requests are not charged.
- Status polling is free unless a future PPE event is added.
- This actor uses the shared CreatiVault OpenAPI runner generated from the root project.
