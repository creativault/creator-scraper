/**
 * TikTok Creator Search Actor (MVP)
 *
 * 调用 Creatilab OpenAPI 搜索 TikTok 创作者，支持多维度筛选，
 * 并将结果推送到 Apify Dataset。
 *
 * CV OpenAPI 规范要点（来自 docs/api/Creatilab SKU Open API 接口文档（外部）.md）：
 * - 统一 POST + JSON Body，禁止 query param
 * - 认证：X-API-Key（必填）+ X-User-Identity（必填）
 * - 响应包装：{ success, data, error, meta }
 * - 注意：所有 data 字段值被强制 stringify（数字、布尔也变字符串）
 * - meta.total 仅在筛选条件 > 2 时返回，否则为 null
 * - service_level 决定返回字段范围与积分单价
 */

import { Actor } from 'apify';

// 初始化 Actor
await Actor.init();

const SEARCH_PATH = '/openapi/v1/creators/tiktok/search';
const MAX_PAGES_SAFETY = 200; // CV 文档规定 page 范围 1-200，兜底防护

const input = await Actor.getInput();
const log = Actor.log;

// ---------- 1. 参数校验 ----------
if (!input.apiKey) {
    throw new Error('缺少必填参数 apiKey：请在 Input 中填入你的 Creatilab OpenAPI API Key。');
}
if (!input.userIdentity || !input.userIdentity.includes('@')) {
    log.warning('userIdentity 不是合法邮箱，可能导致部分接口被拒。');
}

const baseUrl = (input.apiBaseUrl || 'https://openapi.creativault.vip').replace(/\/+$/, '');
const url = baseUrl + SEARCH_PATH;
const maxResults = input.maxResults || 100;
const sizePerPage = Math.min(input.sizePerPage || 50, 100);
const maxPages = Math.min(Math.ceil(maxResults / sizePerPage), MAX_PAGES_SAFETY);

log.info(`Actor 启动 | 目标 ${maxResults} 条 | 每页 ${sizePerPage} | 最多请求 ${maxPages} 次`);
log.info(`API 端点：${url} | service_level=${input.serviceLevel || 'S2'} | lang=${input.lang || 'en'}`);

// ---------- 2. 构建请求体（剔除空值）----------
// 注意：CV 规则：筛选条件（不含 page/size/sort_*/service_level/lang）> 2 个时才返回 meta.total。
// 因此未填的筛选项必须从 body 里剔除，否则可能改变 total 返回行为。
const body = {
    page: 1,
    size: sizePerPage,
    sort_field: input.sortField || 'followers_cnt',
    sort_order: input.sortOrder || 'desc',
    service_level: input.serviceLevel || 'S2',
    lang: input.lang || 'en',
};
if (input.keyword) body.keyword = input.keyword;
if (input.countryCode) body.country_code = input.countryCode;
if (input.languageCode) body.language_code = input.languageCode;
if (input.followersCntGte) body.followers_cnt_gte = input.followersCntGte;
if (input.followersCntLte) body.followers_cnt_lte = input.followersCntLte;
if (input.last10AvgVideoViewsGte) body.last10_avg_video_views_cnt_gte = input.last10AvgVideoViewsGte;
if (input.last10AvgVideoInteractionRateGte) body.last10_avg_video_interaction_rate_gte = input.last10AvgVideoInteractionRateGte;
if (input.hasEmail) body.has_email = input.hasEmail;
if (input.hasMcn) body.has_mcn = input.hasMcn;
if (input.gender) body.gender = input.gender;
if (input.lastVideoPublishDateGte) body.last_video_publish_date_gte = input.lastVideoPublishDateGte;
if (input.lastVideoPublishDateLte) body.last_video_publish_date_lte = input.lastVideoPublishDateLte;

log.info(`筛选条件体：${JSON.stringify(body)}`);

// ---------- 3. 分页抓取 ----------
let collected = 0;
let totalReported = null; // CV 可能不返回 total
let totalCreditsConsumed = 0;

for (let page = 1; page <= maxPages; page++) {
    body.page = page;
    log.info(`> 请求第 ${page}/${maxPages} 页 ...`);

    const resp = await fetchWithRetry(url, body, input.apiKey, input.userIdentity, log);

    if (!resp.success) {
        const errCode = resp.error?.code;
        const errMsg = resp.error?.message || '未知错误';
        log.error(`CV 返回错误 [${errCode}] ${errMsg}`);
        throw new Error(`CV OpenAPI 错误（code=${errCode}）：${errMsg}`);
    }

    const items = Array.isArray(resp.data) ? resp.data : [];
    const meta = resp.meta || {};

    // 累计成本
    if (typeof meta.credits_consumed === 'number') {
        totalCreditsConsumed += meta.credits_consumed;
    }

    // 首页抓取 total（后续页可能不返回）
    if (page === 1 && typeof meta.total === 'number') {
        totalReported = meta.total;
        log.info(`CV 报告匹配总数：${totalReported}`);
    }

    if (items.length === 0) {
        log.info(`第 ${page} 页无数据，结束抓取。`);
        break;
    }

    // 注意：CV 把所有字段值强制 stringify（连数字/布尔都变字符串）。
    // 这里还原常见数值/布尔字段，提升下游可用性。
    const normalized = items.map((item) => restoreTypes(item));

    // 推送到 Dataset（Apify 自动分批）
    await Actor.pushData(normalized);
    collected += items.length;
    log.info(`* 第 ${page} 页获取 ${items.length} 条 | 累计 ${collected}/${maxResults}`);

    // 达到目标数：截断
    if (collected >= maxResults) {
        log.info(`已达到目标条数 ${maxResults}，停止抓取。`);
        break;
    }
    // 本页不足一页：说明已到末尾
    if (items.length < sizePerPage) {
        log.info(`本页不足一页（${items.length} < ${sizePerPage}），已到结果末尾。`);
        break;
    }
}

// ---------- 4. 汇总输出 ----------
log.info('------------------------------------------------------------');
log.info(`抓取完成：共 ${collected} 条创作者`);
if (totalReported !== null) {
    log.info(`CV 报告匹配总数：${totalReported}${collected < totalReported ? '（仅抓取了前 N 条）' : ''}`);
} else {
    log.info('CV 未返回 total（筛选条件 <= 2 个时不查 COUNT）');
}
log.info(`累计积分消耗：${totalCreditsConsumed}`);
log.info('------------------------------------------------------------');

await Actor.exit();

// ====================================================================
// 工具函数
// ====================================================================

/**
 * 还原 CV 强制 stringify 的字段类型。
 * CV 后端把所有 data 字段值都强制转成字符串（数字 -> "123"、布尔 -> "true"），
 * 这里把常用的数值/布尔字段还原，提升 Dataset 下游可用性。
 */
function restoreTypes(item) {
    const NUMERIC_FIELDS = [
        'followers_count', 'likes_count', 'video_count',
        'avg_views', 'engagement_rate', 'views_per_follower',
        'last10_video_views_per_sub', 'last10_med_video_views_cnt', 'last10_med_video_views_per_sub',
        'audience_female_rate',
    ];
    const BOOLEAN_FIELDS = [
        'has_showcase', 'has_email', 'has_mcn', 'has_line', 'has_zalo', 'is_verified',
    ];
    for (const f of NUMERIC_FIELDS) {
        if (f in item && item[f] !== null && item[f] !== '') {
            const n = Number(item[f]);
            if (!Number.isNaN(n)) item[f] = n;
        }
    }
    for (const f of BOOLEAN_FIELDS) {
        if (f in item && typeof item[f] === 'string') {
            item[f] = item[f] === 'true';
        }
    }
    return item;
}

/**
 * 带 401/5xx 重试的 fetch。
 * 401/403 通常是认证问题，不重试直接抛错；429/5xx 短暂重试。
 */
async function fetchWithRetry(url, body, apiKey, userIdentity, log, maxRetries = 3) {
    const headers = {
        'X-API-Key': apiKey,
        'X-User-Identity': userIdentity,
        'Content-Type': 'application/json',
    };

    let lastErr;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const r = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            // 401/403：认证问题，不重试
            if (r.status === 401 || r.status === 403) {
                const txt = await r.text().catch(() => '');
                throw new Error(`HTTP ${r.status} 认证失败（检查 API Key / X-User-Identity）：${txt}`);
            }
            // 429 限流：等待后重试
            if (r.status === 429) {
                const wait = 2000 * attempt;
                log.warning(`HTTP 429 限流，${wait}ms 后重试（${attempt}/${maxRetries}）`);
                await sleep(wait);
                continue;
            }
            // 5xx：服务端错误，短暂重试
            if (r.status >= 500) {
                const wait = 1000 * attempt;
                log.warning(`HTTP ${r.status} 服务端错误，${wait}ms 后重试（${attempt}/${maxRetries}）`);
                await sleep(wait);
                continue;
            }
            // 解析 JSON
            const json = await r.json();
            return json;
        } catch (err) {
            lastErr = err;
            // 认证错误直接抛，不重试
            if (err.message && err.message.includes('认证失败')) throw err;
            if (attempt < maxRetries) {
                const wait = 1000 * attempt;
                log.warning(`请求异常：${err.message}，${wait}ms 后重试（${attempt}/${maxRetries}）`);
                await sleep(wait);
            }
        }
    }
    throw new Error(`请求失败（已重试 ${maxRetries} 次）：${lastErr?.message || lastErr}`);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
