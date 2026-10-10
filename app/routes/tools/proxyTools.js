'use strict';

/**
 * 卖家精灵官方 MCP 代理工具。
 *
 * 定位：补齐本地尚未实现的官方能力，以「白名单 + 前缀」方式挂载到 /mcp：
 * - 白名单：只转发本地缺失的工具（默认 25 个差集），避免与本地 20 个工具重复，
 *   防止模型在同名/同义工具间选错路（本地 keyword_order 已注销，改由代理转发）；
 * - 前缀 ss_：与本地工具命名空间隔离，调用方一眼可辨数据来源；
 * - 信封统一：上游成功响应 {code,message,data} 解包后走本地 buildSuccess 重新包裹，
 *   免费获得内部字段剔除 + returnFields 裁剪（对齐官方 Token 优化行为）；
 * - 失败开放（fail-open）：上游不可用时 tools/list 仍返回本地工具，不影响存量能力。
 */

const config = require('../../config');
const client = require('../../services/sellerSpriteMcpClient');
const { buildSuccess } = require('../../toolResponse');
const billingService = require('../../services/billingService');
const localTools = require('./index');
const { adaptProxyArgs, adaptProxyToolSchema } = require('./proxyParamAdapter');

/**
 * 默认转发的上游工具：官方 49 个工具 - 本地 20 个 - secret_* 元工具 = 25 个差集。
 * 可通过环境变量 SELLERSPRITE_MCP_TOOLS 覆盖（逗号分隔；* 表示全部非 secret 工具）。
 */
const DEFAULT_PROXY_TOOLS = [
  // ASIN 维度补充
  'keepa_info',
  'review',
  'asin_coupon_trend',
  'asin_detail_with_coupon_trend',
  // 关键词/流量维度补充
  'keyword_order', // 原本地实现已注销，改由代理转发（对外 ss_keyword_order）
  'keyword_research_trends',
  'traffic_source',
  // ABA 趋势
  'aba_research_trend',
  // 市场分析分布/集中度系列
  'market_research_statistics',
  'market_brand_concentration',
  'market_product_concentration',
  'market_seller_concentration',
  'market_seller_type_concentration',
  'market_seller_country_distribution',
  'market_price_distribution',
  'market_rating_distribution',
  'market_ratings_count_distribution',
  'market_ebc_distribution',
  'market_listing_date_distribution',
  'market_listing_trend_distribution',
  'market_product_demand_trend',
  // 商标系列
  'trademark_list',
  'trademark_detail',
  'trademark_stats',
  'trademark_country_list'
];

// 上游元工具（密钥/额度状态），不对外暴露
const EXCLUDED_TOOLS = new Set(['secret_expired', 'secret_invalid', 'secret_unauthorized', 'secret_no_remaining']);

// 上游工具描述/入参说明中可能带第三方品牌名，对外返回前统一剔除（大小写不敏感）
const BRAND_KEYWORDS = /卖家精灵|sellersprite/gi;

/** 深度剔除字符串中的第三方品牌关键字（保留其余文案结构不变） */
function stripBrandNames(value) {
  if (typeof value === 'string') return value.replace(BRAND_KEYWORDS, '');
  if (Array.isArray(value)) return value.map(stripBrandNames);
  if (value !== null && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) out[key] = stripBrandNames(value[key]);
    return out;
  }
  return value;
}

function resolveWhitelist() {
  const raw = (config.sellerSpriteMcp.tools || '').trim();
  if (raw === '*') return null; // null = 全量（仍会排除 secret_* 与本地重名工具）
  if (raw) return new Set(raw.split(',').map((s) => s.trim()).filter(Boolean));
  return new Set(DEFAULT_PROXY_TOOLS);
}

function isProxyTool(toolName) {
  return typeof toolName === 'string' && toolName.startsWith(config.sellerSpriteMcp.prefix);
}

/**
 * 生成代理工具定义（供 tools/list 合并）。
 * 失败开放：上游不可用时返回空数组并告警，本地工具不受影响。
 */
async function listProxiedTools() {
  if (!config.sellerSpriteMcp.enabled) return [];
  try {
    await client.ensureReady();
  } catch (e) {
    console.error(`[proxy-tools] upstream unavailable, skip proxied tools in list: ${e.message}`);
    return [];
  }

  const whitelist = resolveWhitelist();
  const prefix = config.sellerSpriteMcp.prefix;

  return client
    .getCachedTools()
    .filter((t) => t && t.name && !EXCLUDED_TOOLS.has(t.name))
    .filter((t) => (whitelist ? whitelist.has(t.name) : true))
    .filter((t) => !localTools[t.name]) // 防御：与本地实现重名的一律不转发
    .map((t) => ({
      name: prefix + t.name,
      description: stripBrandNames((t.description || '').slice(0, 1024)),
      // 入参适配层：按工具覆盖对外 schema（如 keyword_order 暴露 year/month/week，隐藏 date 必填）
      // 同时剔除 schema 内残留的第三方品牌关键字
      inputSchema: stripBrandNames(
        adaptProxyToolSchema(t.name, t.inputSchema || { type: 'object', properties: {} })
      ),
      annotations: { readOnlyHint: true }
    }));
}

/**
 * 转发调用：剥离前缀 -> 上游 callTool -> 本地信封统一包裹 -> 积分扣除。
 * 复用 buildSuccess：自动剔除内部字段 + 支持 returnFields 裁剪。
 * @param {string} toolName - 带 ss_ 前缀的工具名
 * @param {object} args - 调用参数
 * @param {object} [user] - 已认证用户（含 userId），传入时执行积分扣除
 */
async function handleProxyCall(toolName, args, user) {
  const originName = toolName.slice(config.sellerSpriteMcp.prefix.length);
  // 入参适配层：按工具把模型友好入参换算为上游参数（未注册的工具原样透传）
  const upstreamArgs = adaptProxyArgs(originName, args || {});
  const { data } = await client.callTool(originName, upstreamArgs);

  // 积分扣除：调用成功后扣除（与本地工具行为一致）
  if (user) {
    // 计费编码对齐 sdx_api_endpoint_pricing.code：小写工具名（ss_ 前缀），如 ss_keepa_info
    const toolCode = config.sellerSpriteMcp.prefix + originName;
    const pricing = await billingService.getPricing(toolCode);
    await billingService.deductAndRecord(user, pricing, 'SS_MCP');
  }

  return buildSuccess(args, data);
}

function close() {
  client.stop();
}

module.exports = {
  DEFAULT_PROXY_TOOLS,
  isProxyTool,
  listProxiedTools,
  handleProxyCall,
  close
};
