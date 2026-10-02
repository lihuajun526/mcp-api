'use strict';

/**
 * 代理工具（ss_*）入参适配层。
 *
 * 背景：本地工具在进入 query 层前会把「模型友好入参」换算为上游参数；
 * 而代理工具此前把 args 原样转发给卖家精灵官方 MCP，导致两类问题：
 * 1. 部分官方工具要求参数包裹在 request 对象中（如 keyword_order / market_*）；
 * 2. 部分参数应由系统换算而非模型计算（如 keyword_order 的 date 需按年/月/周换算为周六日期）。
 *
 * 因此为代理调用增加一层「按工具注册」的适配，默认不调整：
 * - adaptProxyArgs(toolName, args)：调整发往上游的入参；未注册的工具原样返回；
 * - adaptProxyToolSchema(toolName, schema)：调整 tools/list 对外暴露的入参 schema，
 *   让模型看到的是友好参数而非上游原始写法；未注册的工具原样返回。
 *
 * 新增适配时，在 ADAPTERS 中按「上游工具名（不含 ss_ 前缀）」注册即可。
 */

/** 参数校验错误：带 JSON-RPC 数字错误码，由 mcpProtocolRoute 转成标准 error 响应 */
function paramError(message) {
    const err = new Error(message);
    err.code = -32602;
    return err;
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 计算某年某月第 week 个周六的「日」（如 9 → 09）；不存在返回 null。
 * week 从 1 开始；日期用 UTC 计算，避免时区影响。
 */
function nthSaturday(year, month, week) {
    const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=周日 .. 6=周六
    const day = 1 + ((6 - firstDow + 7) % 7) + (week - 1) * 7;
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return day <= daysInMonth ? day : null;
}

/**
 * keyword_order（ss_keyword_order）入参适配：
 * 1. 兼容「扁平入参」与上游「request 包裹」两种写法；
 * 2. reverseType 归一化为 W/M；
 * 3. date 未显式传入时，按 year/month（周查询再加 week）换算：
 *    - W：该月第 week 个周六 → yyyyMMdd（与官方「该周最后一天」一致）；
 *    - M：yyyyMM；
 * 4. 统一包裹为上游要求的 { request: {...} } 结构，并剔除仅供换算的 year/month/week。
 */
function adaptKeywordOrderArgs(args) {
    const src = isPlainObject(args.request) ? { ...args.request } : { ...args };
    delete src.request;

    const reverseType = src.reverseType != null ? String(src.reverseType).trim().toUpperCase() : '';
    if (reverseType !== 'W' && reverseType !== 'M') {
        throw paramError('reverseType must be one of: W, M');
    }

    const out = { ...src };
    delete out.year;
    delete out.month;
    delete out.week;
    out.reverseType = reverseType;

    // asins 兼容单个 ASIN 字符串
    if (typeof out.asins === 'string') out.asins = [out.asins];

    if (src.date == null || String(src.date).trim() === '') {
        const year = Number(src.year);
        const month = Number(src.month);
        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            throw paramError('year is required and must be a valid 4-digit year');
        }
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw paramError('month is required and must be between 1 and 12');
        }
        if (reverseType === 'M') {
            out.date = `${year}${pad2(month)}`;
        } else {
            const week = Number(src.week);
            if (!Number.isInteger(week) || week < 1 || week > 5) {
                throw paramError('week is required for weekly query and must be between 1 and 5');
            }
            const day = nthSaturday(year, month, week);
            if (day == null) {
                throw paramError(`week ${week} does not exist in ${year}-${pad2(month)}`);
            }
            out.date = `${year}${pad2(month)}${pad2(day)}`;
        }
    } else {
        out.date = String(src.date).trim();
    }

    return { request: out };
}

/** 对外暴露的 keyword_order 友好入参 schema：隐藏 request 包裹，日期由系统按年/月/周换算 */
const KEYWORD_ORDER_SCHEMA = {
    type: 'object',
    properties: {
        marketplace: {
            type: 'string',
            description: 'Amazon 站点代码：US, JP, UK, DE, FR, IT, ES, CA, IN, MX, BR, AU, AE'
        },
        asins: {
            type: 'array',
            items: { type: 'string' },
            description: 'ASIN 列表，最多 20 个'
        },
        reverseType: {
            type: 'string',
            enum: ['W', 'M'],
            description: '反查模式：W-按周 M-按月'
        },
        year: {
            type: 'integer',
            description: '查询年份，例如 2026'
        },
        month: {
            type: 'integer',
            description: '查询月份（1-12），例如 9'
        },
        week: {
            type: 'integer',
            description: '该月第几周（1-5），reverseType=W 时必填；系统会换算为该周最后一个周六日期，无需自行计算'
        },
        conversionType: {
            type: 'string',
            description: '转化类型，多个用逗号分隔：E-转化优质词 S-转化平稳词 L-转化流失词 I-无效曝光词'
        },
        variation: {
            type: 'string',
            enum: ['Y', 'N'],
            description: '是否查询变体 ASIN：Y-排除变体 N-包含变体（默认 N）'
        },
        page: {
            type: 'integer',
            description: '页码，默认 1'
        },
        size: {
            type: 'integer',
            description: '每页条数'
        },
        order: {
            type: 'object',
            properties: {
                field: {
                    type: 'string',
                    description:
                        '排序字段：searchRank-搜索量 searchRankGrowthValue-搜索量增长值 searchRankGrowthRate-搜索量增长率 sumClickRate-点击率'
                },
                desc: { type: 'boolean', description: '是否倒序，默认 false' }
            }
        },
        returnFields: {
            type: 'string',
            description: '指定返回的字段，多个用逗号分隔；不传返回全部'
        }
    },
    required: ['marketplace', 'asins', 'reverseType', 'year', 'month']
};

// 按「上游工具名」注册的适配器；未注册 = 默认不调整
const ADAPTERS = {
    keyword_order: {
        adaptArgs: adaptKeywordOrderArgs,
        adaptSchema: () => KEYWORD_ORDER_SCHEMA
    }
};

/** 调整发往上游的入参；未注册适配器的工具原样返回 */
function adaptProxyArgs(toolName, args) {
    const adapter = ADAPTERS[toolName];
    if (!adapter || typeof adapter.adaptArgs !== 'function') return args;
    return adapter.adaptArgs(args || {});
}

/** 调整 tools/list 对外暴露的入参 schema；未注册适配器的工具原样返回 */
function adaptProxyToolSchema(toolName, schema) {
    const adapter = ADAPTERS[toolName];
    if (!adapter || typeof adapter.adaptSchema !== 'function') return schema;
    return adapter.adaptSchema(schema);
}

module.exports = {
    adaptProxyArgs,
    adaptProxyToolSchema,
    // 导出内部函数便于单测
    nthSaturday
};
