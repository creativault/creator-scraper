# Influencer Collection & Export

Submit batch influencer collection jobs, then check status, fetch records, or export the completed task to xlsx/csv/html.

## Pricing

$0.05/task, $0.03/export, $2/1k fetched records.

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
- Status polling is free.
