import { Actor, log } from 'apify';

await Actor.init();

const MAX_SEARCH_PAGES = 200;
const TERMINAL_STATUSES = new Set(['completed', 'failed', 'timeout']);
const COUNTRY_CODE_ALIASES = new Map([
    ['美国', 'US'],
    ['美國', 'US'],
    ['united states', 'US'],
    ['united states of america', 'US'],
    ['usa', 'US'],
    ['us', 'US'],
    ['英国', 'GB'],
    ['英國', 'GB'],
    ['united kingdom', 'GB'],
    ['uk', 'GB'],
    ['great britain', 'GB'],
    ['加拿大', 'CA'],
    ['canada', 'CA'],
    ['澳大利亚', 'AU'],
    ['澳大利亞', 'AU'],
    ['australia', 'AU'],
    ['德国', 'DE'],
    ['德國', 'DE'],
    ['germany', 'DE'],
    ['法国', 'FR'],
    ['法國', 'FR'],
    ['france', 'FR'],
    ['意大利', 'IT'],
    ['italy', 'IT'],
    ['西班牙', 'ES'],
    ['spain', 'ES'],
    ['日本', 'JP'],
    ['japan', 'JP'],
    ['韩国', 'KR'],
    ['韓國', 'KR'],
    ['south korea', 'KR'],
    ['korea', 'KR'],
    ['中国', 'CN'],
    ['中國', 'CN'],
    ['china', 'CN'],
    ['巴西', 'BR'],
    ['brazil', 'BR'],
    ['墨西哥', 'MX'],
    ['mexico', 'MX'],
    ['印度', 'IN'],
    ['india', 'IN'],
    ['香港', 'HK'],
    ['hong kong', 'HK'],
    ['台湾', 'TW'],
    ['台灣', 'TW'],
    ['taiwan', 'TW'],
    ['新加坡', 'SG'],
    ['singapore', 'SG'],
    ['马来西亚', 'MY'],
    ['馬來西亞', 'MY'],
    ['malaysia', 'MY'],
    ['泰国', 'TH'],
    ['泰國', 'TH'],
    ['thailand', 'TH'],
    ['越南', 'VN'],
    ['vietnam', 'VN'],
    ['印度尼西亚', 'ID'],
    ['印尼', 'ID'],
    ['indonesia', 'ID'],
    ['菲律宾', 'PH'],
    ['菲律賓', 'PH'],
    ['philippines', 'PH'],
    ['沙特阿拉伯', 'SA'],
    ['saudi arabia', 'SA'],
    ['阿联酋', 'AE'],
    ['阿聯酋', 'AE'],
    ['united arab emirates', 'AE'],
    ['uae', 'AE'],
    ['俄罗斯', 'RU'],
    ['俄羅斯', 'RU'],
    ['russia', 'RU'],
    ['荷兰', 'NL'],
    ['荷蘭', 'NL'],
    ['netherlands', 'NL'],
    ['瑞典', 'SE'],
    ['sweden', 'SE'],
    ['挪威', 'NO'],
    ['norway', 'NO'],
    ['波兰', 'PL'],
    ['波蘭', 'PL'],
    ['poland', 'PL'],
    ['土耳其', 'TR'],
    ['turkey', 'TR'],
    ['埃及', 'EG'],
    ['egypt', 'EG'],
    ['尼日利亚', 'NG'],
    ['尼日利亞', 'NG'],
    ['nigeria', 'NG'],
    ['南非', 'ZA'],
    ['south africa', 'ZA'],
    ['肯尼亚', 'KE'],
    ['肯尼亞', 'KE'],
    ['kenya', 'KE'],
    ['阿根廷', 'AR'],
    ['argentina', 'AR'],
    ['哥伦比亚', 'CO'],
    ['哥倫比亞', 'CO'],
    ['colombia', 'CO'],
    ['智利', 'CL'],
    ['chile', 'CL'],
    ['秘鲁', 'PE'],
    ['秘魯', 'PE'],
    ['peru', 'PE'],
    ['新西兰', 'NZ'],
    ['新西蘭', 'NZ'],
    ['new zealand', 'NZ'],
    ['爱尔兰', 'IE'],
    ['愛爾蘭', 'IE'],
    ['ireland', 'IE'],
    ['以色列', 'IL'],
    ['israel', 'IL'],
    ['巴基斯坦', 'PK'],
    ['pakistan', 'PK'],
    ['孟加拉', 'BD'],
    ['孟加拉国', 'BD'],
    ['孟加拉國', 'BD'],
    ['bangladesh', 'BD'],
    ['柬埔寨', 'KH'],
    ['cambodia', 'KH'],
    ['缅甸', 'MM'],
    ['緬甸', 'MM'],
    ['myanmar', 'MM'],
    ['老挝', 'LA'],
    ['老撾', 'LA'],
    ['laos', 'LA'],
    ['东南亚', 'TH,VN,ID,PH,MY,SG,KH,MM,LA'],
    ['東南亞', 'TH,VN,ID,PH,MY,SG,KH,MM,LA'],
    ['southeast asia', 'TH,VN,ID,PH,MY,SG,KH,MM,LA'],
    ['欧洲', 'GB,DE,FR,ES,IT,NL,SE,NO,PL,PT,IE,AT,CH,BE,DK,FI,GR,CZ,RO,HU'],
    ['歐洲', 'GB,DE,FR,ES,IT,NL,SE,NO,PL,PT,IE,AT,CH,BE,DK,FI,GR,CZ,RO,HU'],
    ['europe', 'GB,DE,FR,ES,IT,NL,SE,NO,PL,PT,IE,AT,CH,BE,DK,FI,GR,CZ,RO,HU'],
    ['中东', 'SA,AE,QA,KW,BH,OM,JO,IL,EG,IQ'],
    ['中東', 'SA,AE,QA,KW,BH,OM,JO,IL,EG,IQ'],
    ['middle east', 'SA,AE,QA,KW,BH,OM,JO,IL,EG,IQ'],
    ['拉美', 'BR,MX,AR,CO,CL,PE,EC,VE'],
    ['南美', 'BR,MX,AR,CO,CL,PE,EC,VE'],
    ['latin america', 'BR,MX,AR,CO,CL,PE,EC,VE'],
    ['south america', 'BR,MX,AR,CO,CL,PE,EC,VE'],
    ['北美', 'US,CA'],
    ['north america', 'US,CA'],
    ['东亚', 'JP,KR,CN,HK,TW'],
    ['東亞', 'JP,KR,CN,HK,TW'],
    ['east asia', 'JP,KR,CN,HK,TW'],
    ['南亚', 'IN,PK,BD,LK,NP'],
    ['南亞', 'IN,PK,BD,LK,NP'],
    ['south asia', 'IN,PK,BD,LK,NP'],
    ['非洲', 'NG,ZA,KE,EG,GH,ET,TZ'],
    ['africa', 'NG,ZA,KE,EG,GH,ET,TZ'],
]);
const LANGUAGE_CODE_ALIASES = new Map([
    ['英语', 'en'],
    ['英文', 'en'],
    ['english', 'en'],
    ['en', 'en'],
    ['中文', 'zh'],
    ['汉语', 'zh'],
    ['普通话', 'zh'],
    ['chinese', 'zh'],
    ['zh', 'zh'],
    ['西班牙语', 'es'],
    ['spanish', 'es'],
    ['es', 'es'],
    ['法语', 'fr'],
    ['french', 'fr'],
    ['fr', 'fr'],
    ['德语', 'de'],
    ['german', 'de'],
    ['de', 'de'],
    ['日语', 'ja'],
    ['日文', 'ja'],
    ['japanese', 'ja'],
    ['ja', 'ja'],
    ['韩语', 'ko'],
    ['韩文', 'ko'],
    ['korean', 'ko'],
    ['ko', 'ko'],
    ['葡萄牙语', 'pt'],
    ['portuguese', 'pt'],
    ['pt', 'pt'],
    ['俄语', 'ru'],
    ['russian', 'ru'],
    ['ru', 'ru'],
    ['阿拉伯语', 'ar'],
    ['arabic', 'ar'],
    ['ar', 'ar'],
    ['印地语', 'hi'],
    ['hindi', 'hi'],
    ['hi', 'hi'],
    ['意大利语', 'it'],
    ['italian', 'it'],
    ['it', 'it'],
    ['荷兰语', 'nl'],
    ['dutch', 'nl'],
    ['nl', 'nl'],
    ['泰语', 'th'],
    ['thai', 'th'],
    ['th', 'th'],
    ['越南语', 'vi'],
    ['vietnamese', 'vi'],
    ['vi', 'vi'],
    ['印尼语', 'id'],
    ['indonesian', 'id'],
    ['id', 'id'],
    ['马来语', 'ms'],
    ['malay', 'ms'],
    ['ms', 'ms'],
    ['菲律宾语', 'tl'],
    ['tagalog', 'tl'],
    ['tl', 'tl'],
]);
const CHARGE_EVENTS = {
    creatorResultS1: 'creator-result-s1',
    creatorResultS2: 'creator-result-s2',
    creatorResultS3: 'creator-result-s3',
    videoResult: 'video-result',
    lookalikeResult: 'lookalike-result',
    collectionSubmit: 'collection-submit',
    collectionExport: 'collection-export',
    collectionDataResult: 'collection-data-result',
    videoAuditSubmit: 'video-audit-submit',
    mediaUpload: 'media-upload',
    outreachEmail: 'outreach-email',
    outreachAttachmentUpload: 'outreach-attachment-upload',
};
const NUMERIC_FIELDS = new Set([
    'followers_count', 'followers_cnt', 'likes_count', 'video_count', 'view_count',
    'avg_views', 'avg_views_short', 'avg_views_long', 'engagement_rate',
    'engagement_rate_short', 'engagement_rate_long', 'views_per_follower',
    'last10_video_views_per_sub', 'last10_video_views_per_sub_short',
    'last10_video_views_per_sub_long', 'last10_med_video_views_cnt',
    'last10_med_video_views_cnt_short', 'last10_med_video_views_cnt_long',
    'last10_med_video_views_per_sub', 'last10_med_video_views_per_sub_short',
    'last10_med_video_views_per_sub_long', 'audience_female_rate',
    'match_score', 'viewsCount', 'likesCount', 'commentsCount', 'sharesCount',
    'interactionRate', 'duration', 'progress', 'total', 'completed', 'failed',
    'row_count', 'size_bytes',
]);
const BOOLEAN_FIELDS = new Set([
    'has_showcase', 'has_email', 'has_mcn', 'has_line', 'has_zalo',
    'has_whatsapp', 'is_verified', 'is_product_kol', 'is_ai_creator',
    'include_history', 'include_summary', 'include_unread', 'include_overdue',
    'force_new', 'is_benchmark', 'enable_benchmark',
]);

const input = await Actor.getInput() || {};

try {
    const auth = resolveAuth(input);
    validateAuth(auth);

    const client = createClient(input, auth);
    const operation = normalizeOperation(input.operation || process.env.CV_ACTOR_OPERATION || 'creatorSearch');

    log.info(`Starting CreatiVault OpenAPI actor | operation=${operation}`);

    const summary = await runOperation(operation, input, client);
    await Actor.setValue('OUTPUT', summary);
    log.info(`Finished operation=${operation}`);
    await Actor.exit();
} catch (error) {
    log.exception(error, 'Actor failed');
    await Actor.fail(error);
}

async function runOperation(operation, input, client) {
    switch (operation) {
        case 'creatorSearch':
            return creatorSearch(input, client);
        case 'videoSearch':
            return videoSearch(input, client);
        case 'lookalike':
            return lookalike(input, client);
        case 'collectionSubmit':
            return collectionSubmit(input, client);
        case 'keywordCollectionSubmit':
            return keywordCollectionSubmit(input, client);
        case 'collectionStatus':
            return postSingle('/openapi/v1/collection/tasks/status', buildBody(input, { task_id: input.taskId }), input, client);
        case 'collectionData':
            return collectionData(input, client);
        case 'collectionExport':
            return postSingle('/openapi/v1/collection/tasks/export', buildBody(input, {
                task_id: input.taskId,
                format: input.exportFormat || 'xlsx',
            }), input, client, CHARGE_EVENTS.collectionExport);
        case 'fileDownloadUrl':
            return postSingle('/openapi/v1/files/download-url', buildBody(input, {
                delivery_type: input.deliveryType,
                params: input.deliveryParams,
            }), input, client);
        case 'webhookVerify':
            return postSingle('/openapi/v1/webhook/verify', buildBody(input, {
                challenge: clean(input.challenge),
            }), input, client);
        case 'mediaUpload':
            return uploadFromUrl('/openapi/v1/media/upload', input, client, CHARGE_EVENTS.mediaUpload);
        case 'videoAuditSubmit':
            return videoAuditSubmit(input, client);
        case 'videoAuditStatus':
            return postSingle('/openapi/v1/video-script-audit/tasks/status', buildBody(input, { task_id: input.taskId }), input, client);
        case 'videoAuditResult':
            return postSingle('/openapi/v1/video-script-audit/tasks/result', buildBody(input, { task_id: input.taskId }), input, client);
        case 'outreachSend':
            return outreachSend(input, client);
        case 'outreachTask':
            return postSingle('/openapi/v1/outreach/task', buildBody(input, {
                task_id: input.taskId,
                include_result: boolOrDefault(input.includeResult, false),
                result_page: input.page || 1,
                result_size: input.size || 50,
                result_filter: input.resultFilter || 'all',
            }), input, client);
        case 'outreachContact':
            return postSingle('/openapi/v1/outreach/contact', buildBody(input, {
                email: input.email,
                include_history: boolOrDefault(input.includeHistory, true),
                include_summary: boolOrDefault(input.includeSummary, true),
            }), input, client);
        case 'outreachTodo':
            return postSingle('/openapi/v1/outreach/todo', buildBody(input, {
                overdue_hours: input.overdueHours || 24,
                include_unread: boolOrDefault(input.includeUnread, true),
                include_overdue: boolOrDefault(input.includeOverdue, true),
            }), input, client);
        case 'outreachMetrics':
            return postSingle('/openapi/v1/outreach/metrics', buildBody(input, {
                date_from: input.dateFrom,
                date_to: input.dateTo,
                group_by: input.groupBy,
            }), input, client);
        case 'outreachConfig':
            return postSingle('/openapi/v1/outreach/config', buildBody(input, {
                include_templates: boolOrDefault(input.includeTemplates, true),
                template_page: input.page || 1,
                template_size: input.size || 20,
            }), input, client);
        case 'outreachUpload':
            return uploadFromUrl('/openapi/v1/outreach/upload', input, client, CHARGE_EVENTS.outreachAttachmentUpload);
        case 'rawRequest':
            if (process.env.CV_ENABLE_RAW_REQUEST !== 'true') {
                throw new Error('rawRequest is disabled for public Store runs.');
            }
            if (!input.endpointPath) throw new Error('endpointPath is required for rawRequest.');
            return postSingle(input.endpointPath, buildBody(input), input, client);
        default:
            throw new Error(`Unsupported operation: ${input.operation}`);
    }
}

async function creatorSearch(input, client) {
    const platform = requirePlatform(input.platform, ['tiktok', 'youtube', 'instagram', 'twitter']);
    const size = clampNumber(input.size || input.sizePerPage || 50, 1, 100);
    const maxResults = clampNumber(input.maxResults || size, 1, 100000);
    const maxPages = Math.min(Math.ceil(maxResults / size), MAX_SEARCH_PAGES);
    const baseBody = await buildCreatorSearchBody(input, platform, size);
    const endpoint = `/openapi/v1/creators/${platform}/search`;

    return collectPaged({
        client,
        endpoint,
        baseBody,
        maxResults,
        maxPages,
        size,
        itemsFromData: data => Array.isArray(data) ? data : [],
        normalizeItems: items => items.map(restoreTypes),
        label: `${platform} creator search`,
        chargeEventName: creatorChargeEvent(baseBody.service_level),
    });
}

async function videoSearch(input, client) {
    const size = clampNumber(input.size || input.sizePerPage || 10, 1, 10);
    const maxResults = clampNumber(input.maxResults || size, 1, 100);
    const maxPages = Math.min(Math.ceil(maxResults / size), 10);
    const body = buildBody(input, {
        platform: clean(input.platform),
        union_user_ids: clean(input.unionUserIds),
        hashtag: parseList(input.hashtag),
        video_title: clean(input.videoTitle || input.keyword),
        video_views_cnt_gte: positiveOrUndefined(input.videoViewsCntGte),
        video_views_cnt_lte: positiveOrUndefined(input.videoViewsCntLte),
        video_interaction_rate_gte: positiveOrUndefined(input.videoInteractionRateGte),
        video_interaction_rate_lte: positiveOrUndefined(input.videoInteractionRateLte),
        video_publish_date_gte: clean(input.videoPublishDateGte || input.dateFrom),
        video_publish_date_lte: clean(input.videoPublishDateLte || input.dateTo),
        page: 1,
        size,
    });

    return collectPaged({
        client,
        endpoint: '/openapi/v1/videos/search',
        baseBody: body,
        maxResults,
        maxPages,
        size,
        itemsFromData: data => Array.isArray(data) ? data : [],
        normalizeItems: items => items.map(restoreTypes),
        label: 'video search',
        chargeEventName: CHARGE_EVENTS.videoResult,
    });
}

async function lookalike(input, client) {
    const body = buildBody(input, {
        username: clean(input.username),
        platform: clean(input.platform),
        profile_url: clean(input.profileUrl),
        target_platform: clean(input.targetPlatform),
        target_region: normalizeCountryCodes(input.targetRegion || input.countryCode),
        target_language: normalizeLanguageCodes(input.targetLanguage || input.languageCode),
        limit: input.limit || input.maxResults || 20,
        follower_min: positiveOrUndefined(input.followersCntGte),
        follower_max: positiveOrUndefined(input.followersCntLte),
        avg_views_min: positiveOrUndefined(input.avgViewsMin || input.last10AvgVideoViewsGte),
        avg_views_max: positiveOrUndefined(input.avgViewsMax || input.last10AvgVideoViewsLte),
        female_rate_min: positiveOrUndefined(input.audienceFemaleRateGte),
        lang: clean(input.lang),
        service_level: clean(input.serviceLevel),
    });
    const response = await client.post('/openapi/v1/creators/lookalike', body);
    const data = response.data || {};
    const items = Array.isArray(data.items) ? data.items.map(restoreTypes) : [];
    const chargedItems = await chargeAndLimitItems(CHARGE_EVENTS.lookalikeResult, items);
    await pushOutput(chargedItems.length ? chargedItems : data, response.meta, 'lookalike');
    return makeSummary('lookalike', response, {
        pushed: chargedItems.length || 1,
        charged: chargedItems.length,
        total: data.total ?? items.length,
        charge_event: CHARGE_EVENTS.lookalikeResult,
    });
}

async function collectionSubmit(input, client) {
    const body = buildBody(input, {
        task_type: input.taskType || 'LINK_BATCH',
        platform: requirePlatform(input.platform, ['tiktok', 'youtube', 'instagram', 'twitter']),
        values: parseList(input.values),
        task_name: clean(input.taskName),
        webhook_url: clean(input.webhookUrl),
        start_time: input.startTime,
        end_time: input.endTime,
    });
    ensureChargeCapacity(CHARGE_EVENTS.collectionSubmit, 1);
    const submit = await client.post('/openapi/v1/collection/tasks/submit', body);
    return afterAsyncSubmit('collection', submit, input, client);
}

async function keywordCollectionSubmit(input, client) {
    const body = buildBody(input, {
        platform: requirePlatform(input.platform, ['tiktok', 'youtube', 'instagram', 'twitter']),
        keywords: parseList(input.keywords || input.values || input.keyword),
        task_name: clean(input.taskName),
        webhook_url: clean(input.webhookUrl),
        start_time: input.startTime,
        end_time: input.endTime,
    });
    ensureChargeCapacity(CHARGE_EVENTS.collectionSubmit, 1);
    const submit = await client.post('/openapi/v1/collection/tasks/keyword-submit', body);
    return afterAsyncSubmit('collection', submit, input, client);
}

async function afterAsyncSubmit(kind, submit, input, client) {
    const taskId = submit.data?.task_id || submit.data?.taskId;
    if (!taskId) {
        await pushOutput({ operation: `${kind}Submit`, data: submit.data }, submit.meta, `${kind}Submit`);
        return makeSummary(`${kind}Submit`, submit, { pushed: 1 });
    }

    const submitCharge = await chargeForEvent(CHARGE_EVENTS.collectionSubmit, 1);
    const summary = makeSummary(`${kind}Submit`, submit, {
        taskId,
        pushed: 0,
        charged: submitCharge.chargedCount,
        charge_event: CHARGE_EVENTS.collectionSubmit,
    });
    if (submitCharge.chargedCount <= 0) {
        summary.charge_limit_reached = true;
        return summary;
    }
    const records = [{ operation: `${kind}Submit`, task_id: taskId, data: submit.data, meta: submit.meta }];

    if (input.waitForCompletion) {
        const status = await pollCollectionStatus(taskId, input, client);
        records.push({ operation: 'collectionStatus', task_id: taskId, data: status.data, meta: status.meta });
        summary.status = status.data?.status;
        summary.progress = status.data?.progress;

        if (status.data?.status === 'completed') {
            if (input.fetchData) {
                const dataSummary = await collectionData({ ...input, taskId }, client);
                summary.data = dataSummary;
            }
            if (input.exportFormat) {
                ensureChargeCapacity(CHARGE_EVENTS.collectionExport, 1);
                const exported = await client.post('/openapi/v1/collection/tasks/export', {
                    task_id: taskId,
                    format: input.exportFormat,
                });
                const exportCharge = await chargeForEvent(CHARGE_EVENTS.collectionExport, 1);
                records.push({ operation: 'collectionExport', task_id: taskId, data: exported.data, meta: exported.meta });
                summary.export = exported.data;
                summary.export_charged = exportCharge.chargedCount;
            }
        }
    }

    await Actor.pushData(records);
    summary.pushed = records.length;
    return summary;
}

async function collectionData(input, client) {
    if (!input.taskId) throw new Error('taskId is required.');
    const size = clampNumber(input.size || input.sizePerPage || 100, 1, 100);
    const maxResults = clampNumber(input.maxResults || size, 1, 100000);
    const maxPages = Math.ceil(maxResults / size);
    return collectPaged({
        client,
        endpoint: '/openapi/v1/collection/tasks/data',
        baseBody: buildBody(input, { task_id: input.taskId, page: 1, size }),
        maxResults,
        maxPages,
        size,
        itemsFromData: extractCollectionItems,
        normalizeItems: items => items.map(restoreTypes),
        label: 'collection data',
        chargeEventName: CHARGE_EVENTS.collectionDataResult,
    });
}

async function videoAuditSubmit(input, client) {
    const body = buildBody(input, {
        url: clean(input.videoUrl || input.url),
        uploaded_oss_key: clean(input.uploadedOssKey),
        brief: clean(input.brief),
        user_id: clean(input.userId),
        campaign_id: clean(input.campaignId),
        audit_mode: input.auditMode || 'high',
        is_benchmark: input.isBenchmark,
        enable_benchmark: input.enableBenchmark,
        oss_url_override: clean(input.ossUrlOverride),
    });
    ensureChargeCapacity(CHARGE_EVENTS.videoAuditSubmit, 1);
    const submit = await client.post('/openapi/v1/video-script-audit/tasks/submit', body);
    const taskId = submit.data?.task_id || submit.data?.taskId;
    const submitCharge = await chargeForEvent(CHARGE_EVENTS.videoAuditSubmit, 1);
    const records = [{ operation: 'videoAuditSubmit', task_id: taskId, data: submit.data, meta: submit.meta }];
    const summary = makeSummary('videoAuditSubmit', submit, {
        taskId,
        pushed: 0,
        charged: submitCharge.chargedCount,
        charge_event: CHARGE_EVENTS.videoAuditSubmit,
    });
    if (submitCharge.chargedCount <= 0) {
        summary.charge_limit_reached = true;
        return summary;
    }

    if (input.waitForCompletion && taskId) {
        const status = await pollVideoAuditStatus(taskId, input, client);
        records.push({ operation: 'videoAuditStatus', task_id: taskId, data: status.data, meta: status.meta });
        summary.status = status.data?.status;
        summary.progress = status.data?.progress;

        if (status.data?.status === 'completed') {
            const result = await client.post('/openapi/v1/video-script-audit/tasks/result', { task_id: taskId });
            records.push({ operation: 'videoAuditResult', task_id: taskId, data: result.data, meta: result.meta });
            summary.resultAvailable = true;
        }
    }

    await Actor.pushData(records);
    summary.pushed = records.length;
    return summary;
}

async function outreachSend(input, client) {
    const body = buildBody(input, {
        to: clean(input.to || input.email),
        uid: clean(input.uid),
        nickname: clean(input.nickname),
        platform: clean(input.platform),
        recipients: normalizeRecipients(input.recipients),
        subject: clean(input.subject),
        body_html: clean(input.bodyHtml),
        body_text: clean(input.bodyText),
        channel: input.channel || 'ses',
        template_id: input.templateId,
        send_mode: input.sendMode || 'immediate',
        force_new: boolOrDefault(input.forceNew, false),
        attachment_ids: parseList(input.attachmentIds),
    });
    const recipientCount = body.recipients ? body.recipients.length : 1;
    ensureChargeCapacity(CHARGE_EVENTS.outreachEmail, recipientCount);
    const send = await client.post('/openapi/v1/outreach/send', body);
    const sendCharge = await chargeForEvent(CHARGE_EVENTS.outreachEmail, recipientCount);
    const taskId = send.data?.task_id || send.data?.taskId;
    const records = [{ operation: 'outreachSend', task_id: taskId, data: send.data, meta: send.meta }];
    const summary = makeSummary('outreachSend', send, {
        taskId,
        pushed: 0,
        charged: sendCharge.chargedCount,
        charge_event: CHARGE_EVENTS.outreachEmail,
    });
    if (sendCharge.chargedCount <= 0) {
        summary.charge_limit_reached = true;
        return summary;
    }

    if (input.waitForCompletion && taskId) {
        const task = await pollOutreachTask(taskId, input, client);
        records.push({ operation: 'outreachTask', task_id: taskId, data: task.data, meta: task.meta });
        summary.status = task.data?.status;
    }

    await Actor.pushData(records);
    summary.pushed = records.length;
    return summary;
}

async function postSingle(endpoint, body, input, client, chargeEventName = null) {
    if (chargeEventName) ensureChargeCapacity(chargeEventName, 1);
    const response = await client.post(endpoint, body);
    const charge = chargeEventName ? await chargeForEvent(chargeEventName, 1) : null;
    if (chargeEventName && charge.chargedCount <= 0) {
        return makeSummary(input.operation || endpoint, response, {
            pushed: 0,
            charged: 0,
            charge_event: chargeEventName,
            charge_limit_reached: true,
        });
    }
    await pushOutput(response.data, response.meta, input.operation || endpoint);
    return makeSummary(input.operation || endpoint, response, {
        pushed: 1,
        charged: charge?.chargedCount || 0,
        charge_event: chargeEventName,
    });
}

async function uploadFromUrl(endpoint, input, client, chargeEventName = null) {
    const fileUrl = input.fileUrl || input.mediaFileUrl;
    if (!fileUrl) throw new Error('fileUrl is required for upload operations.');
    if (chargeEventName) ensureChargeCapacity(chargeEventName, 1);

    log.info(`Downloading file for upload: ${fileUrl}`);
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) throw new Error(`Failed to download file: HTTP ${fileResponse.status}`);
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
    const blob = await fileResponse.blob();
    const filename = input.filename || input.mediaFilename || filenameFromUrl(fileUrl) || 'upload.bin';

    const form = new FormData();
    form.append('file', blob, filename);
    const response = await client.postForm(endpoint, form, contentType);
    const charge = chargeEventName ? await chargeForEvent(chargeEventName, 1) : null;
    if (chargeEventName && charge.chargedCount <= 0) {
        return makeSummary(input.operation || endpoint, response, {
            pushed: 0,
            charged: 0,
            filename,
            charge_event: chargeEventName,
            charge_limit_reached: true,
        });
    }
    await pushOutput(response.data, response.meta, input.operation || endpoint);
    return makeSummary(input.operation || endpoint, response, {
        pushed: 1,
        charged: charge?.chargedCount || 0,
        charge_event: chargeEventName,
        filename,
    });
}

async function collectPaged(options) {
    const { client, endpoint, baseBody, maxResults, maxPages, size, itemsFromData, normalizeItems, label, chargeEventName } = options;
    let collected = 0;
    let charged = 0;
    let page = baseBody.page || 1;
    let totalReported = null;
    let creditsConsumed = 0;
    let lastMeta = null;

    for (let i = 0; i < maxPages && collected < maxResults; i++, page++) {
        const body = { ...baseBody, page, size };
        log.info(`Requesting ${label} page ${page}/${maxPages}`);
        const response = await client.post(endpoint, body);
        lastMeta = response.meta || {};

        const pageCredits = Number(lastMeta.credits_consumed);
        if (!Number.isNaN(pageCredits)) creditsConsumed += pageCredits;
        if (page === (baseBody.page || 1) && typeof lastMeta.total === 'number') totalReported = lastMeta.total;

        const rawItems = itemsFromData(response.data);
        const remaining = maxResults - collected;
        const pageItems = normalizeItems(rawItems).slice(0, remaining);

        if (pageItems.length > 0) {
            const chargedItems = await chargeAndLimitItems(chargeEventName, pageItems);
            if (chargedItems.length === 0) {
                log.info(`Charge limit reached for ${chargeEventName}; stopping before pushing more ${label} records.`);
                break;
            }
            await Actor.pushData(chargedItems);
            collected += chargedItems.length;
            charged += chargeEventName ? chargedItems.length : 0;
            if (chargedItems.length < pageItems.length) {
                log.info(`Only ${chargedItems.length}/${pageItems.length} ${label} records were charged within the user limit.`);
                break;
            }
        }

        log.info(`Fetched ${rawItems.length} records on page ${page}; pushed ${collected}/${maxResults}`);

        if (rawItems.length === 0 || rawItems.length < size) break;
    }

    return {
        operation: label,
        records_pushed: collected,
        records_charged: charged,
        charge_event: chargeEventName || null,
        total_reported: totalReported,
        credits_consumed: creditsConsumed,
        last_meta: lastMeta,
    };
}

async function pollCollectionStatus(taskId, input, client) {
    const intervalMs = 1000 * clampNumber(input.pollIntervalSeconds || 60, 1, 3600);
    const maxAttempts = clampNumber(input.maxPollAttempts || 45, 1, 10000);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const response = await client.post('/openapi/v1/collection/tasks/status', { task_id: taskId });
        const status = response.data?.status;
        log.info(`Collection task ${taskId} status=${status || 'unknown'} progress=${response.data?.progress ?? 'n/a'} attempt=${attempt}/${maxAttempts}`);
        if (TERMINAL_STATUSES.has(status)) return response;
        await sleep(intervalMs);
    }

    throw new Error(`Collection task ${taskId} did not finish within ${maxAttempts} polling attempts.`);
}

async function pollVideoAuditStatus(taskId, input, client) {
    const intervalMs = 1000 * clampNumber(input.pollIntervalSeconds || 10, 1, 3600);
    const maxAttempts = clampNumber(input.maxPollAttempts || 60, 1, 10000);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const response = await client.post('/openapi/v1/video-script-audit/tasks/status', { task_id: taskId });
        const status = response.data?.status;
        log.info(`Audit task ${taskId} status=${status || 'unknown'} progress=${response.data?.progress ?? 'n/a'} attempt=${attempt}/${maxAttempts}`);
        if (status === 'completed' || status === 'failed') return response;
        await sleep(intervalMs);
    }

    throw new Error(`Video audit task ${taskId} did not finish within ${maxAttempts} polling attempts.`);
}

async function pollOutreachTask(taskId, input, client) {
    const intervalMs = 1000 * clampNumber(input.pollIntervalSeconds || 15, 1, 3600);
    const maxAttempts = clampNumber(input.maxPollAttempts || 60, 1, 10000);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const response = await client.post('/openapi/v1/outreach/task', {
            task_id: taskId,
            include_result: boolOrDefault(input.includeResult, true),
            result_page: input.page || 1,
            result_size: input.size || 50,
            result_filter: input.resultFilter || 'all',
        });
        const status = response.data?.status;
        log.info(`Outreach task ${taskId} status=${status || 'unknown'} attempt=${attempt}/${maxAttempts}`);
        if (status && !['queued', 'pending', 'processing', 'accepted', 'running'].includes(status)) return response;
        await sleep(intervalMs);
    }

    throw new Error(`Outreach task ${taskId} did not finish within ${maxAttempts} polling attempts.`);
}

function createClient(input, auth) {
    const allowInputBaseUrl = process.env.CV_ALLOW_INPUT_BASE_URL === 'true' || Boolean(clean(input.apiKey));
    const baseUrl = resolveBaseUrl(input, allowInputBaseUrl);
    const headers = {
        'X-API-Key': auth.apiKey,
        'X-User-Identity': auth.userIdentity,
        'User-Agent': 'CreatiVault-Apify-Actor/1.0',
    };

    return {
        async post(endpoint, body) {
            return requestJson(baseUrl + normalizeEndpoint(endpoint), body, headers, input.maxRetries);
        },
        async postForm(endpoint, form) {
            return requestForm(baseUrl + normalizeEndpoint(endpoint), form, headers, input.maxRetries);
        },
    };
}

function resolveBaseUrl(input, allowInputBaseUrl) {
    const baseUrl = clean((allowInputBaseUrl ? input.apiBaseUrl : null) || process.env.CV_API_BASE_URL);
    if (!baseUrl) {
        throw new Error('CV_API_BASE_URL environment variable is required.');
    }
    return baseUrl.replace(/\/+$/, '');
}

async function requestJson(url, body, headers, maxRetries = 3) {
    return withRetry(async () => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pruneEmpty(body || {})),
        });
        return parseOpenApiResponse(response);
    }, maxRetries);
}

async function requestForm(url, form, headers, maxRetries = 3) {
    return withRetry(async () => {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: form,
        });
        return parseOpenApiResponse(response);
    }, maxRetries);
}

async function withRetry(fn, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (!isRetryable(error) || attempt >= maxRetries) break;
            const delayMs = retryDelay(error, attempt);
            log.warning(`Request failed: ${error.message}. Retrying in ${delayMs}ms (${attempt}/${maxRetries})`);
            await sleep(delayMs);
        }
    }
    throw lastError;
}

async function parseOpenApiResponse(response) {
    const text = await response.text();
    let json;
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        json = { success: false, error: { message: text || response.statusText } };
    }

    if (!response.ok) {
        const message = json?.error?.message || json?.detail || response.statusText;
        const error = new Error(`HTTP ${response.status}: ${formatDetail(message)}`);
        error.status = response.status;
        error.retryAfter = response.headers.get('retry-after');
        error.payload = json;
        throw error;
    }

    if (json && json.success === false) {
        const code = json.error?.code;
        const message = json.error?.message || 'OpenAPI request failed';
        const error = new Error(`CreatiVault OpenAPI error${code ? ` ${code}` : ''}: ${message}`);
        error.code = code;
        error.payload = json;
        error.retryable = code === 42901 || code === 50001;
        throw error;
    }

    maybeLogSkillUpdate(json?.meta);
    return json;
}

async function buildCreatorSearchBody(input, platform, size) {
    const common = {
        page: input.page || 1,
        size,
        sort_field: clean(input.sortField),
        sort_order: input.sortOrder || 'desc',
        service_level: input.serviceLevel || 'S2',
        lang: input.lang || 'en',
        keyword: clean(input.keyword),
        country_code: normalizeCountryCodes(input.countryCode),
        language_code: normalizeLanguageCodes(input.languageCode),
        gender: normalizeGender(input.gender),
        has_email: trueFlag(input.hasEmail),
        followers_cnt_gte: positiveOrUndefined(input.followersCntGte),
        followers_cnt_lte: positiveOrUndefined(input.followersCntLte),
        industry: await normalizeIndustry(input.industry),
        audience_country_code_list: normalizeCountryCodes(input.audienceCountryCodeList),
        audience_age_list: clean(input.audienceAgeList),
        audience_female_rate_gte: positiveOrUndefined(input.audienceFemaleRateGte),
        audience_female_rate_lte: positiveOrUndefined(input.audienceFemaleRateLte),
    };

    const platformFields = {};
    if (platform === 'tiktok') {
        Object.assign(platformFields, {
            sort_field: input.sortField || 'followers_cnt',
            has_mcn: trueFlag(input.hasMcn),
            has_line: trueFlag(input.hasLine),
            has_zalo: trueFlag(input.hasZalo),
            last10_avg_video_views_cnt_gte: positiveOrUndefined(input.last10AvgVideoViewsGte),
            last10_avg_video_views_cnt_lte: positiveOrUndefined(input.last10AvgVideoViewsLte),
            last10_avg_video_interaction_rate_gte: positiveOrUndefined(input.last10AvgVideoInteractionRateGte),
            last10_avg_video_interaction_rate_lte: positiveOrUndefined(input.last10AvgVideoInteractionRateLte),
            last_video_publish_date_gte: clean(input.lastVideoPublishDateGte),
            last_video_publish_date_lte: clean(input.lastVideoPublishDateLte),
            product_category_id_array: clean(input.productCategoryIdArray),
            audience_language_code_list: normalizeLanguageCodes(input.audienceLanguageCodeList),
            last30day_gmv_gte: positiveOrUndefined(input.last30dayGmvGte),
            last30day_gmv_lte: positiveOrUndefined(input.last30dayGmvLte),
            last30day_gpm_gte: positiveOrUndefined(input.last30dayGpmGte),
            last30day_gpm_lte: positiveOrUndefined(input.last30dayGpmLte),
            last30day_gmv_per_buyer_gte: positiveOrUndefined(input.last30dayGmvPerBuyerGte),
            last30day_gmv_per_buyer_lte: positiveOrUndefined(input.last30dayGmvPerBuyerLte),
            last30day_commission_rate_gte: positiveOrUndefined(input.last30dayCommissionRateGte),
            last30day_commission_rate_lte: positiveOrUndefined(input.last30dayCommissionRateLte),
        });
    } else if (platform === 'youtube') {
        Object.assign(platformFields, {
            sort_field: input.sortField || 'followers_cnt',
            has_whatsapp: trueFlag(input.hasWhatsapp),
            is_ai_creator: trueFlag(input.isAiCreator),
            last10_avg_video_view_count_all_gte: positiveOrUndefined(input.last10AvgVideoViewsGte),
            last10_avg_video_view_count_all_lte: positiveOrUndefined(input.last10AvgVideoViewsLte),
            last10_avg_video_view_count_short_gte: positiveOrUndefined(input.last10AvgShortVideoViewsGte),
            last10_avg_video_view_count_short_lte: positiveOrUndefined(input.last10AvgShortVideoViewsLte),
            last10_avg_interaction_rate_all_gte: positiveOrUndefined(input.last10AvgVideoInteractionRateGte),
            last10_avg_interaction_rate_all_lte: positiveOrUndefined(input.last10AvgVideoInteractionRateLte),
            last10_avg_interaction_rate_short_gte: positiveOrUndefined(input.last10AvgShortVideoInteractionRateGte),
            last10_avg_interaction_rate_short_lte: positiveOrUndefined(input.last10AvgShortVideoInteractionRateLte),
            last_video_publish_date_gte: clean(input.lastVideoPublishDateGte),
            last_video_publish_date_lte: clean(input.lastVideoPublishDateLte),
            audience_language_code_list: normalizeLanguageCodes(input.audienceLanguageCodeList),
        });
    } else if (platform === 'instagram') {
        Object.assign(platformFields, {
            sort_field: input.sortField || 'followers_cnt',
            has_whatsapp: trueFlag(input.hasWhatsapp),
            is_product_kol: trueFlag(input.isProductKol),
            is_ai_creator: trueFlag(input.isAiCreator),
            last10_avg_video_view_count_gte: positiveOrUndefined(input.last10AvgVideoViewsGte),
            last10_avg_video_view_count_lte: positiveOrUndefined(input.last10AvgVideoViewsLte),
            last10_avg_video_interaction_rate_gte: positiveOrUndefined(input.last10AvgVideoInteractionRateGte),
            last10_avg_video_interaction_rate_lte: positiveOrUndefined(input.last10AvgVideoInteractionRateLte),
            last_video_publish_time_gte: clean(input.lastVideoPublishDateGte),
            last_video_publish_time_lte: clean(input.lastVideoPublishDateLte),
            female_ratio_gte: positiveOrUndefined(input.femaleRatioGte || input.audienceFemaleRateGte),
            female_ratio_lte: positiveOrUndefined(input.femaleRatioLte || input.audienceFemaleRateLte),
            audience_language_list: normalizeLanguageCodes(input.audienceLanguageList || input.audienceLanguageCodeList),
        });
        delete common.audience_female_rate_gte;
        delete common.audience_female_rate_lte;
    } else if (platform === 'twitter') {
        Object.assign(platformFields, {
            sort_field: input.sortField || 'followers_cnt',
            has_whatsapp: trueFlag(input.hasWhatsapp),
            is_blue_verified: trueFlag(input.isBlueVerified),
            is_verified: clean(input.isVerified),
            is_ai_creator: trueFlag(input.isAiCreator),
            kol_style: clean(input.kolStyle),
            last10_avg_video_views_cnt_gte: positiveOrUndefined(input.last10AvgVideoViewsGte),
            last10_avg_video_views_cnt_lte: positiveOrUndefined(input.last10AvgVideoViewsLte),
            last10_avg_video_interaction_rate_gte: positiveOrUndefined(input.last10AvgVideoInteractionRateGte),
            last10_avg_video_interaction_rate_lte: positiveOrUndefined(input.last10AvgVideoInteractionRateLte),
            last10_avg_video_likes_cnt_gte: positiveOrUndefined(input.last10AvgVideoLikesCntGte),
            last10_avg_video_likes_cnt_lte: positiveOrUndefined(input.last10AvgVideoLikesCntLte),
            last_video_views_cnt_gte: positiveOrUndefined(input.lastVideoViewsCntGte),
            last_video_views_cnt_lte: positiveOrUndefined(input.lastVideoViewsCntLte),
            last_video_publish_date_gte: clean(input.lastVideoPublishDateGte),
            last_video_publish_date_lte: clean(input.lastVideoPublishDateLte),
            last10_video_views_per_sub_gte: positiveOrUndefined(input.last10VideoViewsPerSubGte),
            last10_video_views_per_sub_lte: positiveOrUndefined(input.last10VideoViewsPerSubLte),
            last10_med_video_views_per_sub_gte: positiveOrUndefined(input.last10MedVideoViewsPerSubGte),
            last10_med_video_views_per_sub_lte: positiveOrUndefined(input.last10MedVideoViewsPerSubLte),
            audience_language_code_list: normalizeLanguageCodes(input.audienceLanguageCodeList),
        });
    }

    return buildBody(input, { ...common, ...platformFields });
}

function buildBody(input, defaults = {}) {
    const directBody = input.requestBody && typeof input.requestBody === 'object' ? input.requestBody : {};
    const rawBody = parseRawBody(input.rawBodyJson);
    return pruneEmpty({
        ...defaults,
        ...directBody,
        ...rawBody,
    });
}

function parseRawBody(rawBodyJson) {
    if (!rawBodyJson) return {};
    if (typeof rawBodyJson === 'object') return rawBodyJson;
    try {
        return JSON.parse(rawBodyJson);
    } catch (error) {
        throw new Error(`rawBodyJson is not valid JSON: ${error.message}`);
    }
}

function extractCollectionItems(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.records)) return data.records;
    if (Array.isArray(data?.creators)) return data.creators;
    return [];
}

async function pushOutput(data, meta, operation) {
    if (Array.isArray(data)) {
        if (data.length) await Actor.pushData(data.map(restoreTypes));
        return;
    }
    await Actor.pushData({ operation, data: restoreTypes(data || {}), meta: meta || null });
}

async function chargeAndLimitItems(eventName, items) {
    if (!eventName || items.length === 0) return items;
    const charge = await chargeForEvent(eventName, items.length);
    const allowedCount = Math.min(charge.chargedCount, items.length);
    if (allowedCount < items.length) {
        log.warning(`Charge limit reduced output for ${eventName}: ${allowedCount}/${items.length} records allowed.`);
    }
    return items.slice(0, allowedCount);
}

async function chargeForEvent(eventName, count = 1) {
    if (!eventName || count <= 0) {
        return { eventChargeLimitReached: false, chargedCount: 0, chargeableWithinLimit: {} };
    }
    if (process.env.CV_DISABLE_APIFY_CHARGING === 'true') {
        return { eventChargeLimitReached: false, chargedCount: count, chargeableWithinLimit: {} };
    }

    const manager = Actor.getChargingManager();
    const pricingInfo = manager.getPricingInfo();
    if (!pricingInfo.isPayPerEvent) {
        return { eventChargeLimitReached: false, chargedCount: count, chargeableWithinLimit: {} };
    }
    if (!(eventName in pricingInfo.perEventPrices)) {
        throw new Error(`Apify PPE event "${eventName}" is not configured in Actor monetization settings.`);
    }

    const charge = await Actor.charge({ eventName, count });
    if (charge.eventChargeLimitReached) {
        log.info(`Apify charge limit reached for event ${eventName}. charged=${charge.chargedCount}/${count}`);
    }
    return charge;
}

function ensureChargeCapacity(eventName, count = 1) {
    if (!eventName || count <= 0 || process.env.CV_DISABLE_APIFY_CHARGING === 'true') return;

    const manager = Actor.getChargingManager();
    const pricingInfo = manager.getPricingInfo();
    if (!pricingInfo.isPayPerEvent) return;
    if (!(eventName in pricingInfo.perEventPrices)) {
        throw new Error(`Apify PPE event "${eventName}" is not configured in Actor monetization settings.`);
    }

    const capacity = manager.calculateMaxEventChargeCountWithinLimit(eventName);
    if (capacity < count) {
        throw new Error(`The run charge limit allows only ${capacity} "${eventName}" events, but ${count} are required.`);
    }
}

function makeSummary(operation, response, extra = {}) {
    return {
        operation,
        success: response.success !== false,
        meta: response.meta || null,
        ...extra,
    };
}

function restoreTypes(value) {
    if (Array.isArray(value)) return value.map(restoreTypes);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, raw] of Object.entries(value)) {
        if (Array.isArray(raw) || (raw && typeof raw === 'object')) {
            output[key] = restoreTypes(raw);
        } else if (typeof raw === 'string' && BOOLEAN_FIELDS.has(key)) {
            output[key] = raw === 'true';
        } else if (typeof raw === 'string' && NUMERIC_FIELDS.has(key) && raw.trim() !== '') {
            const number = Number(raw);
            output[key] = Number.isNaN(number) ? raw : number;
        } else {
            output[key] = raw;
        }
    }
    return output;
}

function resolveAuth(input) {
    return {
        apiKey: clean(input.apiKey) || clean(process.env.CV_API_KEY),
        userIdentity: clean(input.userIdentity) || clean(process.env.CV_USER_IDENTITY) || buildStoreUserIdentity(),
    };
}

function validateAuth(auth) {
    if (!auth.apiKey) throw new Error('Missing CV_API_KEY environment variable.');
    if (!auth.userIdentity) throw new Error('Missing CV_USER_IDENTITY environment variable.');
    if (!String(auth.userIdentity).includes('@')) {
        log.warning('userIdentity does not look like an email address. The OpenAPI may reject it.');
    }
}

function buildStoreUserIdentity() {
    const rawId = process.env.APIFY_USER_ID || process.env.ACTOR_RUN_ID || process.env.APIFY_ACTOR_RUN_ID || 'anonymous';
    const safeId = String(rawId).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(0, 64);
    return `apify-store+${safeId}@creativault.ai`;
}

function creatorChargeEvent(serviceLevel) {
    const level = String(serviceLevel || 'S2').toUpperCase();
    if (level === 'S1') return CHARGE_EVENTS.creatorResultS1;
    if (level === 'S3') return CHARGE_EVENTS.creatorResultS3;
    return CHARGE_EVENTS.creatorResultS2;
}

function normalizeOperation(operation) {
    const aliases = {
        search: 'creatorSearch',
        creator_search: 'creatorSearch',
        creatorSearch: 'creatorSearch',
        video_search: 'videoSearch',
        videoSearch: 'videoSearch',
        lookalike: 'lookalike',
        collection_submit: 'collectionSubmit',
        collectionSubmit: 'collectionSubmit',
        keyword_collection_submit: 'keywordCollectionSubmit',
        keywordCollectionSubmit: 'keywordCollectionSubmit',
        collection_status: 'collectionStatus',
        collectionStatus: 'collectionStatus',
        collection_data: 'collectionData',
        collectionData: 'collectionData',
        collection_export: 'collectionExport',
        collectionExport: 'collectionExport',
        file_download_url: 'fileDownloadUrl',
        fileDownloadUrl: 'fileDownloadUrl',
        media_upload: 'mediaUpload',
        mediaUpload: 'mediaUpload',
        video_audit_submit: 'videoAuditSubmit',
        videoAuditSubmit: 'videoAuditSubmit',
        video_audit_status: 'videoAuditStatus',
        videoAuditStatus: 'videoAuditStatus',
        video_audit_result: 'videoAuditResult',
        videoAuditResult: 'videoAuditResult',
        outreach_send: 'outreachSend',
        outreachSend: 'outreachSend',
        outreach_task: 'outreachTask',
        outreachTask: 'outreachTask',
        outreach_contact: 'outreachContact',
        outreachContact: 'outreachContact',
        outreach_todo: 'outreachTodo',
        outreachTodo: 'outreachTodo',
        outreach_metrics: 'outreachMetrics',
        outreachMetrics: 'outreachMetrics',
        outreach_config: 'outreachConfig',
        outreachConfig: 'outreachConfig',
        outreach_upload: 'outreachUpload',
        outreachUpload: 'outreachUpload',
        webhook_verify: 'webhookVerify',
        webhookVerify: 'webhookVerify',
        raw: 'rawRequest',
        rawRequest: 'rawRequest',
    };
    return aliases[operation] || operation;
}

function requirePlatform(platform, allowed) {
    const normalized = clean(platform)?.toLowerCase();
    if (!normalized) throw new Error(`platform is required. Allowed values: ${allowed.join(', ')}`);
    if (!allowed.includes(normalized)) throw new Error(`Invalid platform "${platform}". Allowed values: ${allowed.join(', ')}`);
    return normalized;
}

function normalizeEndpoint(endpoint) {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

function pruneEmpty(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const output = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value) && value.length === 0) continue;
        output[key] = value;
    }
    return output;
}

function clean(value) {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
    }
    return value;
}

function positiveOrUndefined(value) {
    if (value === undefined || value === null || value === '') return undefined;
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return undefined;
    if (n === 0) return undefined;
    return n;
}

function clampNumber(value, min, max) {
    const n = Number(value);
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, Math.floor(n)));
}

function parseList(value) {
    if (value === undefined || value === null || value === '') return undefined;
    if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
    return String(value).split('\n').flatMap(part => part.split(',')).map(v => v.trim()).filter(Boolean);
}

function normalizeCountryCodes(value) {
    const values = parseList(value);
    if (!values?.length) return undefined;
    return values.map(mapCountryCode).filter(Boolean).join(',');
}

function mapCountryCode(value) {
    const raw = clean(value);
    if (!raw) return undefined;
    const normalized = raw.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
    const alias = COUNTRY_CODE_ALIASES.get(normalized);
    if (alias) return alias;
    if (/^[a-z]{2}$/i.test(raw)) return raw.toUpperCase();
    return raw;
}

function normalizeLanguageCodes(value) {
    const values = parseList(value);
    if (!values?.length) return undefined;
    return values.map(mapLanguageCode).filter(Boolean).join(',');
}

function mapLanguageCode(value) {
    const raw = clean(value);
    if (!raw) return undefined;
    const normalized = raw.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
    const alias = LANGUAGE_CODE_ALIASES.get(normalized);
    if (alias) return alias;
    if (/^[a-z]{2}$/i.test(raw)) return raw.toLowerCase();
    return raw;
}

async function normalizeIndustry(value) {
    const raw = clean(value);
    if (!raw) return undefined;
    const { convertToLeafIds, suggestIndustryMatches } = await import('./_industry_mapper.mjs');
    const leafIds = convertToLeafIds(raw);
    if (leafIds.length > 0) return leafIds.join(',');

    const suggestions = suggestIndustryMatches(raw, 3)
        .flatMap(item => item.suggestions || [])
        .map(item => `${item.name} (${item.id})`)
        .slice(0, 3);

    const suffix = suggestions.length
        ? ` Suggestions: ${suggestions.join(', ')}.`
        : ' Use a supported category ID, English category name, or known alias.';
    throw new Error(`Unknown industry/category "${raw}".${suffix}`);
}

function normalizeRecipients(value) {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            // Fall through.
        }
    }
    throw new Error('recipients must be an array or a JSON array string.');
}

function normalizeGender(value) {
    const v = clean(value);
    if (!v) return undefined;
    const lower = String(v).toLowerCase();
    if (['female', 'woman', 'women', 'f', '0'].includes(lower)) return '0';
    if (['male', 'man', 'men', 'm', '1'].includes(lower)) return '1';
    return String(v);
}

function boolOrDefault(value, defaultValue) {
    return value === undefined || value === null ? defaultValue : Boolean(value);
}

function trueFlag(value) {
    return value === true ? true : undefined;
}

function formatDetail(detail) {
    return typeof detail === 'string' ? detail : JSON.stringify(detail);
}

function isRetryable(error) {
    if (error.retryable) return true;
    if (error.status === 429) return true;
    if (error.status >= 500) return true;
    return false;
}

function retryDelay(error, attempt) {
    const retryAfter = Number(error.retryAfter);
    if (!Number.isNaN(retryAfter) && retryAfter > 0) return retryAfter * 1000;
    return Math.min(30000, 1000 * attempt * attempt);
}

function maybeLogSkillUpdate(meta) {
    if (!meta?.skill_update_available) return;
    const current = meta.skill_current_version || 'unknown';
    const latest = meta.skill_latest_version || 'unknown';
    const required = meta.skill_update_required ? 'required' : 'available';
    log.warning(`CreatiVault skill update ${required}: ${current} -> ${latest}. Run "node scripts/skill_update.mjs --yes" in the skill package if you use local skill scripts.`);
}

function filenameFromUrl(fileUrl) {
    try {
        const url = new URL(fileUrl);
        const last = url.pathname.split('/').filter(Boolean).pop();
        return last ? decodeURIComponent(last) : null;
    } catch {
        return null;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
