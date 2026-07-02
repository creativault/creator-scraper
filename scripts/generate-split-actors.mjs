import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outRoot = join(root, 'dist-actors');

const commonRequiredEnv = [
    'CV_API_KEY=your_creativault_openapi_key',
    'CV_USER_IDENTITY=apify-store@creativault.ai',
    'CV_API_BASE_URL=your_creativault_openapi_base_url',
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
        description: 'Retries for temporary rate-limit and server errors.',
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
    countryCode: { title: 'Creator country code', type: 'string', description: 'Comma-separated country codes, for example US,CA.', editor: 'textfield', default: 'US' },
    languageCode: { title: 'Creator language code', type: 'string', description: 'Comma-separated creator content language codes, for example en,es.', editor: 'textfield' },
    industry: { title: 'Industry or category', type: 'string', description: 'Industry/category filter. Category names or supported IDs can be used.', editor: 'textfield' },
    followersCntGte: { title: 'Minimum followers', type: 'integer', description: 'Minimum followers/subscribers.', default: 10000, minimum: 0 },
    followersCntLte: { title: 'Maximum followers', type: 'integer', description: 'Maximum followers/subscribers. Leave as 0 to omit.', default: 0, minimum: 0 },
    last10AvgVideoViewsGte: { title: 'Minimum average views', type: 'number', description: 'Minimum average views.', default: 0, minimum: 0 },
    last10AvgVideoViewsLte: { title: 'Maximum average views', type: 'number', description: 'Maximum average views. Leave as 0 to omit.', default: 0, minimum: 0 },
    last10AvgVideoInteractionRateGte: { title: 'Minimum interaction rate (%)', type: 'number', description: '0-100 percentage.', default: 0, minimum: 0, maximum: 100 },
    last10AvgVideoInteractionRateLte: { title: 'Maximum interaction rate (%)', type: 'number', description: '0-100 percentage. Leave as 0 to omit.', default: 0, minimum: 0, maximum: 100 },
    hasEmail: { title: 'Only creators with email', type: 'boolean', description: 'Return only creators with public email contact when supported.', default: false },
    hasWhatsapp: { title: 'Only creators with WhatsApp', type: 'boolean', description: 'YouTube/Instagram filter.', default: false },
    hasMcn: { title: 'TikTok has MCN', type: 'boolean', description: 'TikTok only.', default: false },
    isProductKol: { title: 'Instagram product KOL', type: 'boolean', description: 'Instagram only.', default: false },
    isAiCreator: { title: 'AI creator', type: 'boolean', description: 'YouTube/Instagram filter when supported.', default: false },
    gender: {
        title: 'Creator gender',
        type: 'string',
        description: 'Optional creator gender filter.',
        editor: 'select',
        enum: ['', 'female', 'male'],
        enumTitles: ['Any', 'Female', 'Male'],
        default: '',
    },
    audienceCountryCodeList: { title: 'Audience country codes', type: 'string', description: 'Comma-separated. Best used with S3.', editor: 'textfield' },
    audienceLanguageCodeList: { title: 'Audience language codes', type: 'string', description: 'Comma-separated. Best used with S3.', editor: 'textfield' },
    audienceFemaleRateGte: { title: 'Minimum female audience (%)', type: 'number', description: 'Best used with S3.', default: 0, minimum: 0, maximum: 100 },
    lastVideoPublishDateGte: { title: 'Last post from', type: 'string', description: 'YYYY-MM-DD.', editor: 'textfield' },
    lastVideoPublishDateLte: { title: 'Last post to', type: 'string', description: 'YYYY-MM-DD.', editor: 'textfield' },
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

const actors = [
    {
        slug: 'creator-search',
        name: 'creativault-creator-search',
        title: 'Influencer Scraper',
        defaultOperation: 'creatorSearch',
        description: 'Search TikTok, Instagram, YouTube, and Twitter/X creators with follower, country, engagement, email, industry, and audience filters.',
        pricing: 'S1 $1.20/1k creators, S2 $4/1k creators, S3 $8/1k creators.',
        properties: {
            platform: { ...commonProps.platform, enum: ['tiktok', 'youtube', 'instagram', 'twitter'], enumTitles: ['TikTok', 'YouTube', 'Instagram', 'Twitter/X'] },
            ...creatorFilters,
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
        description: 'Find similar creators from a seed username or profile URL across TikTok, Instagram, and YouTube.',
        pricing: '$6.00 / 1,000 similar creators.',
        properties: {
            profileUrl: { title: 'Seed profile URL', type: 'string', description: 'Creator profile URL. If provided, platform and username are resolved automatically.', editor: 'textfield' },
            username: { title: 'Seed username', type: 'string', description: 'Seed creator username when no profile URL is provided.', editor: 'textfield' },
            platform: { ...commonProps.platform, enum: ['', 'tiktok', 'youtube', 'instagram'], enumTitles: ['Auto / not set', 'TikTok', 'YouTube', 'Instagram'], default: '' },
            targetPlatform: { title: 'Target platform', type: 'string', description: 'Target platform for lookalike results.', editor: 'select', enum: ['', 'tiktok', 'youtube', 'instagram'], enumTitles: ['Same as seed', 'TikTok', 'YouTube', 'Instagram'], default: '' },
            countryCode: { title: 'Target country code', type: 'string', description: 'Optional target region/country code.', editor: 'textfield' },
            languageCode: { title: 'Target language code', type: 'string', description: 'Optional target language code.', editor: 'textfield' },
            followersCntGte: creatorFilters.followersCntGte,
            followersCntLte: creatorFilters.followersCntLte,
            last10AvgVideoViewsGte: creatorFilters.last10AvgVideoViewsGte,
            audienceFemaleRateGte: creatorFilters.audienceFemaleRateGte,
            limit: { title: 'Max similar creators', type: 'integer', description: 'Maximum similar creators to return.', default: 20, minimum: 1, maximum: 50 },
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
        description: 'Submit creator collection jobs by profile links, usernames, keywords, creator videos, or post videos, then fetch data or export xlsx/csv/html files.',
        pricing: '$0.05/task, $0.03/export, $2/1k fetched records.',
        operationEnum: ['collectionSubmit', 'keywordCollectionSubmit', 'collectionStatus', 'collectionData', 'collectionExport'],
        operationTitles: ['Submit link/username/video collection - $0.05/task', 'Submit keyword collection - $0.05/task', 'Check task status - free', 'Fetch task data - $2/1k records', 'Export task data - $0.03/export'],
        properties: {
            platform: commonProps.platform,
            taskType: { title: 'Collection task type', type: 'string', description: 'Twitter/X supports only profile links and usernames.', editor: 'select', enum: ['LINK_BATCH', 'FILE_UPLOAD', 'CREATOR_VIDEO', 'POST_VIDEO'], enumTitles: ['Profile links', 'Usernames', 'Creator videos', 'Post videos'], default: 'LINK_BATCH' },
            values: { title: 'Collection values', type: 'array', description: 'Profile links, usernames, creator profile URLs, or post URLs.', editor: 'stringList', items: { type: 'string' } },
            keywords: { title: 'Keyword collection terms', type: 'array', description: 'Keyword collection terms, max 10.', editor: 'stringList', items: { type: 'string' } },
            taskName: { title: 'Task name', type: 'string', description: 'Optional collection task name.', editor: 'textfield' },
            taskId: commonProps.taskId,
            webhookUrl: { title: 'Webhook URL', type: 'string', description: 'Optional HTTPS callback URL for collection completion.', editor: 'textfield' },
            waitForCompletion: commonProps.waitForCompletion,
            pollIntervalSeconds: commonProps.pollIntervalSeconds,
            maxPollAttempts: commonProps.maxPollAttempts,
            fetchData: { title: 'Fetch completed collection data', type: 'boolean', description: 'Charged per returned record.', default: false },
            exportFormat: { title: 'Export format', type: 'string', description: 'Charged per successful export.', editor: 'select', enum: ['', 'xlsx', 'csv', 'html'], enumTitles: ['Do not export', 'Excel xlsx', 'CSV', 'HTML'], default: '' },
            maxResults: commonProps.maxResults,
            size: commonProps.size,
            maxRetries: commonProps.maxRetries,
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
            auditMode: { title: 'Audit mode', type: 'string', description: 'Audit depth.', editor: 'select', enum: ['high', 'low'], enumTitles: ['High', 'Low'], default: 'high' },
            enableBenchmark: { title: 'Enable benchmark comparison', type: 'boolean', description: 'Compare against benchmark library.', default: false },
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

function makeReadme(actor) {
    return `# ${actor.title}

${actor.description}

## Pricing

${actor.pricing}

## Owner configuration

Configure these as Apify Actor environment variables/secrets:

\`\`\`text
${commonRequiredEnv.join('\n')}
\`\`\`

\`CV_API_KEY\` must be secret. \`CV_API_BASE_URL\` is required and should be configured as an environment variable instead of being hard-coded in source files.

## Operation

Default operation: \`${actor.defaultOperation}\`

${actor.operationEnum ? `Available operations: ${actor.operationEnum.map((x) => `\`${x}\``).join(', ')}.` : 'This actor uses a fixed operation selected by its listing.'}

## Notes

- Empty searches and failed requests are not charged.
- Status polling is free unless a future PPE event is added.
- This actor uses the shared CreatiVault OpenAPI runner generated from the root project.
`;
}

function makeDockerfile(actor) {
    const base = String(readText(join(root, 'Dockerfile')));
    return base.replace('FROM apify/actor-node:20', `FROM apify/actor-node:20\nENV CV_ACTOR_OPERATION=${actor.defaultOperation}`);
}

function readText(path) {
    return existsSync(path) ? String(readFileSync(path, 'utf8')) : '';
}

function writeJson(path, value) {
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

rmSync(outRoot, { recursive: true, force: true });
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
    writeFileSync(join(dir, 'README.md'), makeReadme(actor));
    writeFileSync(join(dir, 'Dockerfile'), makeDockerfile(actor));
    copyFileSync(join(root, 'main.js'), join(dir, 'main.js'));
    copyFileSync(join(root, 'package.json'), join(dir, 'package.json'));
    copyFileSync(join(root, 'package-lock.json'), join(dir, 'package-lock.json'));
}

writeFileSync(join(outRoot, 'README.md'), `# CreatiVault Split Apify Actors

Generated by \`npm run generate:actors\`.

Each subdirectory is a self-contained Apify Actor that can be published separately.

${actors.map((actor) => `- [${actor.title}](./${actor.slug}) - ${actor.description}`).join('\n')}
`);

console.log(`Generated ${actors.length} actors in ${outRoot}`);
