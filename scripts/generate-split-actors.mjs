import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outRoot = join(root, 'dist-actors');
const sharedRuntimeFiles = [
    '_industry_mapper.mjs',
    'influencer_industry_tree.json',
];

const commonProps = {
    platform: {
        title: 'Platform',
        type: 'string',
        description: 'Social platform.',
        editor: 'select',
        enum: ['', 'tiktok', 'youtube', 'instagram', 'twitter'],
        enumTitles: ['Not set', 'TikTok', 'YouTube', 'Instagram', 'Twitter/X'],
        default: 'tiktok',
    },
    maxResults: {
        title: 'Max billable records',
        type: 'integer',
        description: 'Maximum records to return and charge for.',
        default: 100,
        minimum: 1,
        maximum: 100000,
    },
    size: {
        title: 'Page size',
        type: 'integer',
        description: 'Creator/collection page size max 100. Video search is capped at 10.',
        default: 50,
        minimum: 1,
        maximum: 100,
    },
    lang: {
        title: 'Response language',
        type: 'string',
        description: 'Language for translated code values.',
        editor: 'select',
        enum: ['en', 'cn'],
        enumTitles: ['English', 'Chinese'],
        default: 'en',
    },
    taskId: {
        title: 'Task ID',
        type: 'string',
        description: 'Task ID for status, data, export, or result operations.',
        editor: 'textfield',
    },
    waitForCompletion: {
        title: 'Wait for task completion',
        type: 'boolean',
        description: 'Poll task status before finishing. Status polling itself is free.',
        default: false,
    },
    pollIntervalSeconds: {
        title: 'Poll interval seconds',
        type: 'integer',
        description: 'Polling interval for async tasks.',
        default: 60,
        minimum: 1,
    },
    maxPollAttempts: {
        title: 'Max poll attempts',
        type: 'integer',
        description: 'Maximum polling attempts before timing out.',
        default: 45,
        minimum: 1,
    },
    maxRetries: {
        title: 'Max retries',
        type: 'integer',
        description: 'Retries for temporary CreatiVault API rate-limit and server errors.',
        default: 3,
        minimum: 1,
        maximum: 10,
    },
};

const creatorFilters = {
    serviceLevel: {
        title: 'Creator data depth',
        type: 'string',
        description: 'S1 basic profile, S2 enriched profile/contact data, S3 deep audience profile.',
        editor: 'select',
        enum: ['S1', 'S2', 'S3'],
        enumTitles: ['S1 basic - $1.20/1k creators', 'S2 enriched - $4/1k creators', 'S3 audience profile - $8/1k creators'],
        default: 'S2',
    },
    keyword: { title: 'Keyword', type: 'string', description: 'Creator keyword, topic, niche, or username.', editor: 'textfield' },
    countryCode: { title: 'Creator country code', type: 'string', description: 'Comma-separated ISO country codes, for example US,CA. Common country names such as United States/美国 are normalized automatically.', editor: 'textfield', default: 'US' },
    languageCode: { title: 'Creator language code', type: 'string', description: 'Comma-separated creator content language codes, for example en,es. Common language names such as English/英语 are normalized automatically.', editor: 'textfield' },
    industry: { title: 'Industry or category', type: 'string', description: 'Industry/category filter. Use supported English category names or IDs. For TikTok, Chinese labels such as 美妆 may not be accepted by the OpenAPI.', editor: 'textfield' },
    followersCntGte: { title: 'Minimum followers', type: 'integer', description: 'Minimum followers/subscribers.', default: 10000, minimum: 0 },
    followersCntLte: { title: 'Maximum followers', type: 'integer', description: 'Maximum followers/subscribers. Leave as 0 to omit.', default: 0, minimum: 0 },
    last10AvgVideoViewsGte: { title: 'Minimum average views', type: 'number', description: 'Minimum average views.', default: 0, minimum: 0 },
    last10AvgVideoViewsLte: { title: 'Maximum average views', type: 'number', description: 'Maximum average views. Leave as 0 to omit.', default: 0, minimum: 0 },
    last10AvgVideoInteractionRateGte: { title: 'Minimum interaction rate (%)', type: 'number', description: '0-100 percentage.', default: 0, minimum: 0, maximum: 100 },
    last10AvgVideoInteractionRateLte: { title: 'Maximum interaction rate (%)', type: 'number', description: '0-100 percentage. Leave as 0 to omit.', default: 0, minimum: 0, maximum: 100 },
    last10AvgShortVideoViewsGte: { title: 'Minimum short-video average views', type: 'number', description: 'YouTube only. Minimum last-10 short-video average views.', default: 0, minimum: 0 },
    last10AvgShortVideoViewsLte: { title: 'Maximum short-video average views', type: 'number', description: 'YouTube only. Leave as 0 to omit.', default: 0, minimum: 0 },
    last10AvgShortVideoInteractionRateGte: { title: 'Minimum short-video interaction rate (%)', type: 'number', description: 'YouTube only. 0-100 percentage.', default: 0, minimum: 0, maximum: 100 },
    last10AvgShortVideoInteractionRateLte: { title: 'Maximum short-video interaction rate (%)', type: 'number', description: 'YouTube only. Leave as 0 to omit.', default: 0, minimum: 0, maximum: 100 },
    last10AvgVideoLikesCntGte: { title: 'Minimum average likes', type: 'number', description: 'Twitter/X only. Minimum last-10 average likes.', default: 0, minimum: 0 },
    last10AvgVideoLikesCntLte: { title: 'Maximum average likes', type: 'number', description: 'Twitter/X only. Leave as 0 to omit.', default: 0, minimum: 0 },
    lastVideoViewsCntGte: { title: 'Minimum latest video views', type: 'integer', description: 'Twitter/X only. Minimum latest video views.', default: 0, minimum: 0 },
    lastVideoViewsCntLte: { title: 'Maximum latest video views', type: 'integer', description: 'Twitter/X only. Leave as 0 to omit.', default: 0, minimum: 0 },
    last10VideoViewsPerSubGte: { title: 'Minimum views/followers (%)', type: 'number', description: 'Twitter/X only. Last-10 average views per follower.', default: 0, minimum: 0, maximum: 100 },
    last10VideoViewsPerSubLte: { title: 'Maximum views/followers (%)', type: 'number', description: 'Twitter/X only. Leave as 0 to omit.', default: 0, minimum: 0, maximum: 100 },
    last10MedVideoViewsPerSubGte: { title: 'Minimum median views/followers (%)', type: 'number', description: 'Twitter/X only. Last-10 median views per follower.', default: 0, minimum: 0, maximum: 100 },
    last10MedVideoViewsPerSubLte: { title: 'Maximum median views/followers (%)', type: 'number', description: 'Twitter/X only. Leave as 0 to omit.', default: 0, minimum: 0, maximum: 100 },
    hasEmail: { title: 'Only creators with email', type: 'boolean', description: 'Return only creators with public email contact when supported.', default: false },
    hasWhatsapp: { title: 'Only creators with WhatsApp', type: 'boolean', description: 'YouTube/Instagram filter.', default: false },
    hasMcn: { title: 'TikTok has MCN', type: 'boolean', description: 'TikTok only.', default: false },
    hasLine: { title: 'TikTok has LINE', type: 'boolean', description: 'TikTok only.', default: false },
    hasZalo: { title: 'TikTok has Zalo', type: 'boolean', description: 'TikTok only.', default: false },
    isProductKol: { title: 'Instagram product KOL', type: 'boolean', description: 'Instagram only.', default: false },
    isAiCreator: { title: 'AI creator', type: 'boolean', description: 'YouTube/Instagram filter when supported.', default: false },
    isBlueVerified: { title: 'Twitter/X blue verified', type: 'boolean', description: 'Twitter/X only.', default: false },
    isVerified: { title: 'Verification status', type: 'string', description: 'Twitter/X optional verification filter.', editor: 'select', enum: ['', '1', '0'], enumTitles: ['Any', 'Verified', 'Not verified'], default: '' },
    kolStyle: { title: 'KOL style tags', type: 'string', description: 'Twitter/X only. Comma-separated style tags.', editor: 'textfield' },
    gender: {
        title: 'Creator gender',
        type: 'string',
        description: 'Optional creator gender filter.',
        editor: 'select',
        enum: ['', 'female', 'male'],
        enumTitles: ['Any', 'Female', 'Male'],
        default: '',
    },
    audienceCountryCodeList: { title: 'Audience country codes', type: 'string', description: 'Comma-separated ISO country codes. Common country names are normalized automatically. Best used with S3.', editor: 'textfield' },
    audienceLanguageCodeList: { title: 'Audience language codes', type: 'string', description: 'Comma-separated language codes. Common language names are normalized automatically. Best used with S3.', editor: 'textfield' },
    audienceAgeList: { title: 'Audience age groups', type: 'string', description: 'Comma-separated age group IDs or labels when supported. Best used with S3.', editor: 'textfield' },
    audienceFemaleRateGte: { title: 'Minimum female audience (%)', type: 'number', description: 'Best used with S3.', default: 0, minimum: 0, maximum: 100 },
    audienceFemaleRateLte: { title: 'Maximum female audience (%)', type: 'number', description: 'Best used with S3. Leave as 0 to omit.', default: 0, minimum: 0, maximum: 100 },
    lastVideoPublishDateGte: { title: 'Last post from', type: 'string', description: 'YYYY-MM-DD.', editor: 'textfield' },
    lastVideoPublishDateLte: { title: 'Last post to', type: 'string', description: 'YYYY-MM-DD.', editor: 'textfield' },
    productCategoryIdArray: { title: 'TikTok product category IDs', type: 'string', description: 'TikTok only. Comma-separated product category IDs.', editor: 'textfield' },
    last30dayGmvGte: { title: 'TikTok minimum 30-day GMV', type: 'number', description: 'TikTok commerce filter.', default: 0, minimum: 0 },
    last30dayGmvLte: { title: 'TikTok maximum 30-day GMV', type: 'number', description: 'TikTok commerce filter. Leave as 0 to omit.', default: 0, minimum: 0 },
    last30dayGpmGte: { title: 'TikTok minimum 30-day GPM', type: 'number', description: 'TikTok commerce filter.', default: 0, minimum: 0 },
    last30dayGpmLte: { title: 'TikTok maximum 30-day GPM', type: 'number', description: 'TikTok commerce filter. Leave as 0 to omit.', default: 0, minimum: 0 },
    last30dayGmvPerBuyerGte: { title: 'TikTok minimum 30-day GMV/buyer', type: 'number', description: 'TikTok commerce filter.', default: 0, minimum: 0 },
    last30dayGmvPerBuyerLte: { title: 'TikTok maximum 30-day GMV/buyer', type: 'number', description: 'TikTok commerce filter. Leave as 0 to omit.', default: 0, minimum: 0 },
    last30dayCommissionRateGte: { title: 'TikTok minimum commission rate (%)', type: 'number', description: 'TikTok commerce filter.', default: 0, minimum: 0, maximum: 100 },
    last30dayCommissionRateLte: { title: 'TikTok maximum commission rate (%)', type: 'number', description: 'TikTok commerce filter. Leave as 0 to omit.', default: 0, minimum: 0, maximum: 100 },
    sortField: { title: 'Sort field', type: 'string', description: 'Optional. Leave empty to use a platform-safe default.', editor: 'textfield' },
    sortOrder: {
        title: 'Sort order',
        type: 'string',
        description: 'Sort direction.',
        editor: 'select',
        enum: ['desc', 'asc'],
        enumTitles: ['Descending', 'Ascending'],
        default: 'desc',
    },
};

const publicCreatorFilters = {
    ...creatorFilters,
    audienceCountryCodeList: {
        ...creatorFilters.audienceCountryCodeList,
        description: 'Comma-separated ISO country codes. Common country names are normalized automatically.',
    },
    audienceLanguageCodeList: {
        ...creatorFilters.audienceLanguageCodeList,
        description: 'Comma-separated language codes. Common language names are normalized automatically.',
    },
    audienceAgeList: {
        ...creatorFilters.audienceAgeList,
        description: 'Comma-separated age group IDs or labels when supported.',
    },
    audienceFemaleRateGte: {
        ...creatorFilters.audienceFemaleRateGte,
        description: 'Minimum female audience percentage.',
    },
    audienceFemaleRateLte: {
        ...creatorFilters.audienceFemaleRateLte,
        description: 'Maximum female audience percentage. Leave as 0 to omit.',
    },
};
delete publicCreatorFilters.serviceLevel;

const actors = [
    {
        slug: 'creator-search',
        name: 'creativault-creator-search',
        title: 'Influencer Scraper',
        defaultOperation: 'creatorSearch',
        forceCreatorServiceLevel: 'S3',
        needsIndustryMapper: true,
        description: 'Search TikTok, Instagram, YouTube, and Twitter/X creators with follower, country, engagement, email, industry, and audience filters.',
        pricing: '$8.00 / 1,000 creators.',
        properties: {
            platform: { ...commonProps.platform, enum: ['tiktok', 'youtube', 'instagram', 'twitter'], enumTitles: ['TikTok', 'YouTube', 'Instagram', 'Twitter/X'] },
            ...publicCreatorFilters,
            maxResults: commonProps.maxResults,
            size: commonProps.size,
            lang: commonProps.lang,
            maxRetries: commonProps.maxRetries,
        },
    },
    {
        slug: 'lookalike-finder',
        name: 'creativault-lookalike-finder',
        title: 'Lookalike Influencer Finder',
        defaultOperation: 'lookalike',
        needsIndustryMapper: true,
        description: 'Find similar creators from a seed username or profile URL across TikTok, Instagram, and YouTube.',
        pricing: '$6.00 / 1,000 similar creators.',
        properties: {
            profileUrl: { title: 'Seed profile URL', type: 'string', description: 'Creator profile URL. If provided, platform and username are resolved automatically.', editor: 'textfield', default: 'https://www.tiktok.com/@khaby.lame' },
            username: { title: 'Seed username', type: 'string', description: 'Seed creator username when no profile URL is provided.', editor: 'textfield' },
            platform: { ...commonProps.platform, enum: ['', 'tiktok', 'youtube', 'instagram'], enumTitles: ['Auto / not set', 'TikTok', 'YouTube', 'Instagram'], default: 'tiktok' },
            targetPlatform: { title: 'Target platform', type: 'string', description: 'Target platform for lookalike results.', editor: 'select', enum: ['', 'tiktok', 'youtube', 'instagram'], enumTitles: ['Same as seed', 'TikTok', 'YouTube', 'Instagram'], default: 'tiktok' },
            countryCode: { title: 'Target country code', type: 'string', description: 'Optional target ISO country code. Common country names such as United States/美国 are normalized automatically.', editor: 'textfield' },
            languageCode: { title: 'Target language code', type: 'string', description: 'Optional target language code. Common language names such as English/英语 are normalized automatically.', editor: 'textfield' },
            followersCntGte: creatorFilters.followersCntGte,
            followersCntLte: creatorFilters.followersCntLte,
            last10AvgVideoViewsGte: creatorFilters.last10AvgVideoViewsGte,
            audienceFemaleRateGte: creatorFilters.audienceFemaleRateGte,
            limit: { title: 'Max similar creators', type: 'integer', description: 'Maximum similar creators to return.', default: 10, minimum: 1, maximum: 50 },
            serviceLevel: creatorFilters.serviceLevel,
            lang: commonProps.lang,
            maxRetries: commonProps.maxRetries,
        },
    },
    {
        slug: 'video-search',
        name: 'creativault-video-search',
        title: 'Short Video Scraper',
        defaultOperation: 'videoSearch',
        description: 'Search short-form videos across TikTok, Instagram, and YouTube by hashtag, title, views, interaction rate, and publish date.',
        pricing: '$1.50 / 1,000 videos.',
        properties: {
            platform: { ...commonProps.platform, enum: ['', 'tiktok', 'youtube', 'instagram'], enumTitles: ['All supported', 'TikTok', 'YouTube', 'Instagram'], default: '' },
            unionUserIds: { title: 'Creator IDs', type: 'string', description: 'Optional comma-separated creator IDs to filter videos.', editor: 'textfield' },
            hashtag: { title: 'Hashtags', type: 'array', description: 'Video hashtags, max 3.', editor: 'stringList', items: { type: 'string' } },
            videoTitle: { title: 'Video title keyword', type: 'string', description: 'Video title keyword.', editor: 'textfield' },
            videoViewsCntGte: { title: 'Minimum video views', type: 'integer', description: 'Minimum video views.', minimum: 0 },
            videoViewsCntLte: { title: 'Maximum video views', type: 'integer', description: 'Maximum video views.', minimum: 0 },
            videoInteractionRateGte: { title: 'Minimum interaction rate (%)', type: 'number', description: '0-100 percentage.', minimum: 0, maximum: 100 },
            videoInteractionRateLte: { title: 'Maximum interaction rate (%)', type: 'number', description: '0-100 percentage.', minimum: 0, maximum: 100 },
            videoPublishDateGte: { title: 'Publish date from', type: 'string', description: 'YYYY-MM-DD. Defaults to the last 15 days if both dates are omitted.', editor: 'textfield' },
            videoPublishDateLte: { title: 'Publish date to', type: 'string', description: 'YYYY-MM-DD.', editor: 'textfield' },
            maxResults: { ...commonProps.maxResults, default: 30, maximum: 100 },
            size: { ...commonProps.size, default: 10, maximum: 10 },
            maxRetries: commonProps.maxRetries,
        },
    },
    {
        slug: 'collection-export',
        name: 'creativault-collection-export',
        title: 'Influencer Collection & Export',
        defaultOperation: 'collectionSubmit',
        description: 'Submit batch influencer collection jobs, then check status, fetch records, or export the completed task to xlsx/csv/html.',
        pricing: '$0.05/task, $0.03/export, $2/1k fetched records.',
        operationEnum: ['collectionSubmit', 'keywordCollectionSubmit', 'collectionStatus', 'collectionData', 'collectionExport'],
        operationTitles: ['Start a collection from URLs/usernames/videos - $0.05/task', 'Start a keyword collection - $0.05/task', 'Check an existing task status - free', 'Fetch records from an existing task - $2/1k records', 'Export an existing task - $0.03/export'],
        properties: {
            platform: {
                ...commonProps.platform,
                title: 'Platform for new collection tasks',
                description: 'Platform used when starting a new collection task. Twitter/X supports only profile URLs and usernames.',
                sectionCaption: 'Start a new collection task',
                sectionDescription: 'Use these fields when you choose one of the two start options above. Starting a task returns a task ID that you can later use for status, fetch, or export.',
            },
            taskType: {
                title: 'What will you provide?',
                type: 'string',
                description: 'Choose what the Values list contains. Twitter/X supports only profile URLs and usernames, not video collection.',
                editor: 'select',
                enum: ['LINK_BATCH', 'FILE_UPLOAD', 'CREATOR_VIDEO', 'POST_VIDEO'],
                enumTitles: ['Creator profile URLs -> collect creator profiles', 'Creator usernames -> collect creator profiles', 'Creator profile URLs -> collect videos from those creators', 'Post/video URLs -> collect those videos'],
                default: 'LINK_BATCH',
            },
            values: {
                title: 'Values for URL/username/video collection',
                type: 'array',
                description: 'Used by URL/username/video collection. Add profile URLs for profile collection, usernames for username collection, profile URLs for creator-video collection, or post/video URLs for post-video collection.',
                editor: 'stringList',
                default: ['https://www.tiktok.com/@momentosforest'],
                prefill: ['https://www.tiktok.com/@momentosforest'],
                items: { type: 'string' },
            },
            keywords: {
                title: 'Keywords for keyword collection',
                type: 'array',
                description: 'Used only by keyword collection. Add up to 10 keywords or hashtags to discover and collect matching creators.',
                editor: 'stringList',
                items: { type: 'string' },
            },
            taskName: { title: 'New task name', type: 'string', description: 'Optional name shown in collection task records.', editor: 'textfield', default: 'Apify sample collection' },
            webhookUrl: { title: 'Completion webhook URL', type: 'string', description: 'Optional HTTPS callback URL called when the collection task completes.', editor: 'textfield' },
            startTime: { title: 'Video/keyword collection start time', type: 'integer', description: 'Optional Unix timestamp in seconds. Mainly used by creator-video and keyword collection. Leave empty to use the backend default.', minimum: 0 },
            endTime: { title: 'Video/keyword collection end time', type: 'integer', description: 'Optional Unix timestamp in seconds. Defaults to current time when omitted.', minimum: 0 },
            waitForCompletion: {
                ...commonProps.waitForCompletion,
                sectionCaption: 'Wait after submitting a task',
                sectionDescription: 'Optional polling after starting a new task. Polling is free, but the run will use Apify compute time while it waits.',
            },
            pollIntervalSeconds: commonProps.pollIntervalSeconds,
            maxPollAttempts: commonProps.maxPollAttempts,
            taskId: {
                ...commonProps.taskId,
                title: 'Existing collection task ID',
                description: 'Required for checking status, fetching records, or exporting a completed collection task.',
                sectionCaption: 'Use an existing task',
                sectionDescription: 'Use these fields after you already have a task ID from a previous collection run.',
            },
            fetchData: {
                title: 'After waiting, also fetch records',
                type: 'boolean',
                description: 'Only used when starting a task with Wait for task completion enabled. For the standalone Fetch records operation, records are fetched automatically. Returned records are charged at $2 per 1,000 records.',
                default: false,
            },
            exportFormat: {
                title: 'Export file format',
                type: 'string',
                description: 'Used by Export an existing task. Also used after submitting a task when Wait for task completion is enabled. Leave as Do not export to avoid automatic export after submit. Standalone export defaults to xlsx if omitted.',
                editor: 'select',
                enum: ['', 'xlsx', 'csv', 'html', 'feishu_doc'],
                enumTitles: ['Do not export after submit', 'Excel xlsx', 'CSV', 'HTML', 'Feishu Doc'],
                default: '',
            },
            maxResults: {
                ...commonProps.maxResults,
                title: 'Max records to fetch',
                description: 'Maximum records to fetch and charge for when using Fetch task data.',
                sectionCaption: 'Fetch/export options',
                sectionDescription: 'These options apply when fetching records or exporting an existing completed task.',
            },
            size: { ...commonProps.size, description: 'Page size for fetching task records.' },
            maxRetries: {
                ...commonProps.maxRetries,
                sectionCaption: 'Retry settings',
                sectionDescription: 'Controls retries for temporary CreatiVault API errors. This is separate from Apify platform run options such as memory and timeout.',
            },
        },
    },
    {
        slug: 'video-audit',
        name: 'creativault-video-audit',
        title: 'Video Audit',
        defaultOperation: 'videoAuditSubmit',
        description: 'Submit TikTok, Instagram Reels, or YouTube Shorts for hook, script, storyboard, benchmark, and viral-factor analysis.',
        pricing: '$0.80/audit and $0.08/media upload.',
        operationEnum: ['videoAuditSubmit', 'mediaUpload', 'videoAuditStatus', 'videoAuditResult'],
        operationTitles: ['Submit video audit - $0.80/audit', 'Upload media for audit - $0.08/upload', 'Check audit status - free', 'Get audit result - free'],
        properties: {
            videoUrl: { title: 'Video URL', type: 'string', description: 'TikTok, Instagram Reels, or YouTube Shorts URL.', editor: 'textfield' },
            fileUrl: { title: 'Media file URL', type: 'string', description: 'Public file URL for media upload before audit.', editor: 'textfield' },
            filename: { title: 'Upload filename', type: 'string', description: 'Optional filename override.', editor: 'textfield' },
            uploadedOssKey: { title: 'Uploaded OSS key', type: 'string', description: 'OSS key returned by media upload.', editor: 'textfield' },
            brief: { title: 'Audit brief', type: 'string', description: 'Optional brand/customer brief.', editor: 'textarea' },
            campaignId: { title: 'Campaign ID', type: 'string', description: 'Optional campaign identifier.', editor: 'textfield' },
            auditMode: { title: 'Audit mode', type: 'string', description: 'Audit depth.', editor: 'select', enum: ['high', 'low'], enumTitles: ['High', 'Low'], default: 'high' },
            isBenchmark: { title: 'Use as benchmark', type: 'boolean', description: 'Mark this audit as a benchmark sample.', default: false },
            enableBenchmark: { title: 'Enable benchmark comparison', type: 'boolean', description: 'Compare against benchmark library.', default: false },
            ossUrlOverride: { title: 'OSS URL override', type: 'string', description: 'Legacy override URL. Prefer Uploaded OSS key for new flows.', editor: 'textfield' },
            taskId: commonProps.taskId,
            waitForCompletion: { ...commonProps.waitForCompletion, default: true },
            pollIntervalSeconds: { ...commonProps.pollIntervalSeconds, default: 10 },
            maxPollAttempts: { ...commonProps.maxPollAttempts, default: 60 },
            maxRetries: commonProps.maxRetries,
        },
    },
    {
        slug: 'outreach-email',
        name: 'creativault-outreach-email',
        title: 'Influencer Outreach Email',
        defaultOperation: 'outreachSend',
        description: 'Send creator outreach emails, check task status, inspect contact history, todo follow-ups, metrics, config, and upload attachments.',
        pricing: '$0.04/email and $0.08/attachment upload.',
        operationEnum: ['outreachSend', 'outreachTask', 'outreachContact', 'outreachTodo', 'outreachMetrics', 'outreachConfig', 'outreachUpload'],
        operationTitles: ['Send outreach email - $0.04/email', 'Check send task - free', 'Check contact history - free', 'Follow-up todo list - free', 'Outreach metrics - free', 'Outreach config - free', 'Upload attachment - $0.08/upload'],
        properties: {
            to: { title: 'Recipient email', type: 'string', description: 'Single outreach recipient email.', editor: 'textfield' },
            uid: { title: 'Creator UID', type: 'string', description: 'Creator UID from search results. Required for single send.', editor: 'textfield' },
            nickname: { title: 'Creator nickname', type: 'string', description: 'Optional creator nickname.', editor: 'textfield' },
            platform: { ...commonProps.platform, enum: ['', 'tiktok', 'youtube', 'instagram'], enumTitles: ['Not set', 'TikTok', 'YouTube', 'Instagram'], default: '' },
            recipients: { title: 'Batch recipients', type: 'array', description: 'JSON array. Each item should include email and uid. Charged per accepted email.', editor: 'json', items: { type: 'object' } },
            subject: { title: 'Email subject', type: 'string', description: 'Outreach email subject.', editor: 'textfield' },
            bodyText: { title: 'Email text body', type: 'string', description: 'Plain-text outreach body.', editor: 'textarea' },
            bodyHtml: { title: 'Email HTML body', type: 'string', description: 'HTML outreach body.', editor: 'textarea' },
            channel: { title: 'Email channel', type: 'string', description: 'Outreach channel.', editor: 'select', enum: ['ses', 'gmail', 'outlook'], enumTitles: ['SES', 'Gmail', 'Outlook'], default: 'ses' },
            templateId: { title: 'Template ID', type: 'integer', description: 'Optional template ID for metrics/filtering.', minimum: 1 },
            sendMode: { title: 'Send mode', type: 'string', description: 'Immediate send or smart scheduling.', editor: 'select', enum: ['immediate', 'smart'], enumTitles: ['Immediate', 'Smart'], default: 'immediate' },
            forceNew: { title: 'Force new conversation', type: 'boolean', description: 'Start a new conversation instead of reusing an existing one.', default: false },
            attachmentIds: { title: 'Attachment IDs', type: 'array', description: 'Attachment IDs returned by upload.', editor: 'stringList', items: { type: 'string' } },
            taskId: commonProps.taskId,
            email: { title: 'Contact email', type: 'string', description: 'Email for contact history lookup.', editor: 'textfield' },
            fileUrl: { title: 'Attachment file URL', type: 'string', description: 'Public file URL for attachment upload.', editor: 'textfield' },
            filename: { title: 'Attachment filename', type: 'string', description: 'Optional filename override.', editor: 'textfield' },
            waitForCompletion: commonProps.waitForCompletion,
            pollIntervalSeconds: { ...commonProps.pollIntervalSeconds, default: 15 },
            maxPollAttempts: { ...commonProps.maxPollAttempts, default: 60 },
            maxRetries: commonProps.maxRetries,
        },
    },
    {
        slug: 'files-webhook-utilities',
        name: 'creativault-files-webhook-utilities',
        title: 'File & Webhook Utilities',
        defaultOperation: 'fileDownloadUrl',
        description: 'Utility actor for file delivery URL lookup and webhook connectivity verification.',
        pricing: 'File download URL and webhook verification are free utility operations unless future pricing is configured.',
        operationEnum: ['fileDownloadUrl', 'webhookVerify'],
        operationTitles: ['Get file download URL - free', 'Verify webhook connectivity - free'],
        properties: {
            deliveryType: { title: 'Delivery type', type: 'string', description: 'Delivery type for file download URL lookup.', editor: 'textfield' },
            deliveryParams: { title: 'Delivery params', type: 'object', description: 'Strategy-specific delivery params.', editor: 'json' },
            challenge: { title: 'Webhook challenge', type: 'string', description: 'Optional challenge string returned by webhook verification.', editor: 'textfield' },
            maxRetries: commonProps.maxRetries,
        },
    },
    {
        slug: 'openapi-suite-internal',
        name: 'creativault-openapi-suite-internal',
        title: 'OpenAPI Suite Internal',
        defaultOperation: 'creatorSearch',
        needsIndustryMapper: true,
        description: 'Internal all-in-one actor covering every CreatiVault OpenAPI operation, including debug/raw operations when enabled by environment variables.',
        pricing: 'Internal suite. Use public single-purpose actors for Store listings.',
        includeSuiteSchema: true,
    },
];

function makeSchema(actor) {
    const properties = {};
    if (actor.operationEnum) {
        properties.operation = {
            title: 'What do you want to do?',
            type: 'string',
            description: 'Choose the workflow. Failed requests and status polling are not charged.',
            editor: 'select',
            enum: actor.operationEnum,
            enumTitles: actor.operationTitles,
            default: actor.defaultOperation,
        };
    }
    Object.assign(properties, actor.properties || {});
    return {
        title: actor.title,
        description: `${actor.description} Pricing: ${actor.pricing}`,
        type: 'object',
        schemaVersion: 1,
        properties,
        required: actor.operationEnum ? ['operation'] : [],
    };
}

function makeActorJson(actor) {
    return {
        actorSpecification: 1,
        name: actor.name,
        title: actor.title,
        description: actor.description,
        version: '1.0',
        buildTag: 'latest',
        meta: { templateId: 'starter-javascript' },
        input: './INPUT_SCHEMA.json',
        output: './output_schema.json',
        storages: {
            dataset: {
                actorSpecification: 1,
                title: 'CreatiVault Results',
                views: {
                    overview: {
                        title: 'Overview',
                        transformation: {
                            fields: ['operation', 'platform', 'uid', 'username', 'nickname', 'followers_count', 'avg_views', 'engagement_rate', 'country_code', 'has_email', 'email', 'videoTitle', 'videoUrl', 'task_id', 'status', 'file_url'],
                        },
                        display: {
                            component: 'table',
                            columns: [
                                { label: 'Operation', source: 'operation', align: 'left' },
                                { label: 'Platform', source: 'platform', align: 'left' },
                                { label: 'UID', source: 'uid', align: 'left' },
                                { label: 'Username', source: 'username', align: 'left' },
                                { label: 'Nickname', source: 'nickname', align: 'left' },
                                { label: 'Followers', source: 'followers_count', align: 'right' },
                                { label: 'Avg Views', source: 'avg_views', align: 'right' },
                                { label: 'Engagement', source: 'engagement_rate', align: 'right' },
                                { label: 'Country', source: 'country_code', align: 'center' },
                                { label: 'Has Email', source: 'has_email', align: 'center' },
                                { label: 'Email', source: 'email', align: 'left' },
                                { label: 'Video', source: 'videoTitle', align: 'left' },
                                { label: 'Video URL', source: 'videoUrl', align: 'left' },
                                { label: 'Task ID', source: 'task_id', align: 'left' },
                                { label: 'Status', source: 'status', align: 'left' },
                                { label: 'File URL', source: 'file_url', align: 'left' },
                            ],
                        },
                    },
                },
            },
        },
    };
}

function makeOutputSchema(actor) {
    const outputBySlug = {
        'creator-search': {
            title: 'Influencer Scraper output',
            resultTitle: 'Creator results',
            description: 'Creator search results stored in the default dataset.',
            resultDescription: 'Creator profiles returned by the Actor.',
        },
        'lookalike-finder': {
            title: 'Lookalike Influencer Finder output',
            resultTitle: 'Similar creator results',
            description: 'Lookalike creator results stored in the default dataset.',
            resultDescription: 'Similar creators returned by the Actor.',
        },
        'video-search': {
            title: 'Short Video Scraper output',
            resultTitle: 'Video results',
            description: 'Short-form video search results stored in the default dataset.',
            resultDescription: 'Short-form video records returned by the Actor.',
        },
        'collection-export': {
            title: 'Influencer Collection & Export output',
            resultTitle: 'Collection results',
            description: 'Collection task records, fetched records, and export metadata stored in the default dataset.',
            resultDescription: 'Submitted task records, fetched creator records, and export metadata.',
        },
        'video-audit': {
            title: 'Video Audit output',
            resultTitle: 'Audit results',
            description: 'Video audit task records and audit results stored in the default dataset.',
            resultDescription: 'Submitted audit tasks, uploaded media records, task statuses, and audit result records.',
        },
        'outreach-email': {
            title: 'Influencer Outreach Email output',
            resultTitle: 'Outreach results',
            description: 'Outreach email tasks, attachment uploads, and query results stored in the default dataset.',
            resultDescription: 'Outreach task records, accepted email sends, attachment uploads, and related query results.',
        },
        'files-webhook-utilities': {
            title: 'File & Webhook Utilities output',
            resultTitle: 'Utility results',
            description: 'File download URL and webhook verification results stored in the default dataset.',
            resultDescription: 'Utility operation results returned by the Actor.',
        },
        'openapi-suite-internal': {
            title: 'OpenAPI Suite Internal output',
            resultTitle: 'OpenAPI results',
            description: 'Internal CreatiVault OpenAPI operation results stored in the default dataset.',
            resultDescription: 'Records returned by the selected CreatiVault OpenAPI operation.',
        },
    };
    const details = outputBySlug[actor.slug] || {
        title: `${actor.title} output`,
        resultTitle: 'Results',
        description: `${actor.title} results stored in the default dataset.`,
        resultDescription: 'Records returned by the Actor.',
    };

    return {
        actorOutputSchemaVersion: 1,
        title: details.title,
        description: details.description,
        type: 'object',
        properties: {
            results: {
                type: 'string',
                title: details.resultTitle,
                description: details.resultDescription,
                template: '{{links.apiDefaultDatasetUrl}}/items',
            },
        },
    };
}

function makeReadme(actor) {
    return `# ${actor.title}

${actor.description}

## Pricing

${actor.pricing}

${actor.slug === 'collection-export' ? `## How to use

1. Start a new collection task from profile URLs, usernames, creator profile URLs, post/video URLs, or keywords.
2. Copy the returned \`task_id\` from the run output.
3. Use the same \`task_id\` to check status, fetch records, or export a completed task.
4. To run everything in one run, enable \`Wait for task completion\`, then choose whether to fetch records or export a file after completion.

Task type guide:

| Input type | Choose this task type | What it returns |
|---|---|---|
| Creator profile URLs | \`LINK_BATCH\` | Creator profile records |
| Creator usernames | \`FILE_UPLOAD\` | Creator profile records |
| Creator profile URLs | \`CREATOR_VIDEO\` | Videos from those creators |
| Post/video URLs | \`POST_VIDEO\` | Records for those videos |
| Keywords or hashtags | \`keywordCollectionSubmit\` operation | Matching creator collection task |

Twitter/X supports only profile URLs and usernames.
` : ''}

## Notes

- Empty searches and failed requests are not charged.
- Status polling is free.
`;
}

function makeDockerfile(actor) {
    const mapperCopyLine = 'COPY --chown=myuser _industry_mapper.mjs influencer_industry_tree.json ./';
    const envLines = [`ENV CV_ACTOR_OPERATION=${actor.defaultOperation}`];
    if (actor.forceCreatorServiceLevel) {
        envLines.push(`ENV CV_FORCE_CREATOR_SERVICE_LEVEL=${actor.forceCreatorServiceLevel}`);
    }
    let base = String(readText(join(root, 'Dockerfile')))
        .replace('FROM apify/actor-node:20', `FROM apify/actor-node:20\n${envLines.join('\n')}`)
        .replace(new RegExp(`\\n${escapeRegExp(mapperCopyLine)}`), '');
    if (actor.needsIndustryMapper) {
        base = base.replace('COPY --chown=myuser main.js ./', `COPY --chown=myuser main.js ./\n${mapperCopyLine}`);
    }
    return base;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readText(path) {
    return existsSync(path) ? String(readFileSync(path, 'utf8')) : '';
}

function writeJson(path, value) {
    writeTextIfChanged(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeTextIfChanged(path, value) {
    const text = String(value);
    if (existsSync(path) && readText(path) === text) return;
    writeFileSync(path, text);
}

function copyIfChanged(source, destination) {
    const sourceContent = readFileSync(source);
    if (existsSync(destination)) {
        const destinationContent = readFileSync(destination);
        if (Buffer.compare(sourceContent, destinationContent) === 0) return;
    }
    copyFileSync(source, destination);
}

mkdirSync(outRoot, { recursive: true });

for (const actor of actors) {
    const dir = join(outRoot, actor.slug);
    const actorDir = join(dir, '.actor');
    mkdirSync(actorDir, { recursive: true });

    const schema = actor.includeSuiteSchema
        ? JSON.parse(readText(join(root, '.actor', 'INPUT_SCHEMA.json')))
        : makeSchema(actor);

    writeJson(join(actorDir, 'INPUT_SCHEMA.json'), schema);
    writeJson(join(actorDir, 'actor.json'), makeActorJson(actor));
    writeJson(join(actorDir, 'output_schema.json'), makeOutputSchema(actor));
    writeTextIfChanged(join(dir, 'README.md'), makeReadme(actor));
    writeTextIfChanged(join(dir, 'Dockerfile'), makeDockerfile(actor));
    copyIfChanged(join(root, 'main.js'), join(dir, 'main.js'));
    copyIfChanged(join(root, 'package.json'), join(dir, 'package.json'));
    copyIfChanged(join(root, 'package-lock.json'), join(dir, 'package-lock.json'));
    if (actor.needsIndustryMapper) {
        for (const file of sharedRuntimeFiles) {
            const source = join(root, file);
            if (existsSync(source)) copyIfChanged(source, join(dir, file));
        }
    } else {
        for (const file of sharedRuntimeFiles) {
            rmSync(join(dir, file), { force: true });
        }
    }
}

writeTextIfChanged(join(outRoot, 'README.md'), `# CreatiVault Split Apify Actors

Generated by \`npm run generate:actors\`.

Each subdirectory is a self-contained Apify Actor that can be published separately.

${actors.map((actor) => `- [${actor.title}](./${actor.slug}) - ${actor.description}`).join('\n')}
`);

console.log(`Generated ${actors.length} actors in ${outRoot}`);
