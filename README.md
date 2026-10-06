# mcp-api Node.js 版本

这是将当前项目核心能力迁移到 Node.js 的可运行版本。

## 功能

- API Key 鉴权
- Redis 滑动窗口限流（默认 5 QPS，可按会员配置）
- 按接口扣点（ASIN_DETAIL=5点、COMPETING_LOOKUP=10点）
- 第三方会话轮询（Redis list，支持多账号多软件扩展）
- 数据缓存模块（Redis，命中直接返回，不扣点不调第三方）
- MCP 协议接口 `/mcp`（initialize / tools/list / tools/call）
- HTTP 接口：
  - `GET /api/v1/mcp/list_tools`
  - `POST /api/v1/mcp/asin/detail`（ASIN 详情）
  - `POST /api/v1/mcp/competing/lookup`（查竞品，支持多 ASIN）
- 独立类目采集脚本（BFS + Redis 防丢 + MySQL 落库）
- 业务架构流程图：`业务架构流程图.html`

## 安装

```bash
npm install
cp .env.example .env
```

## 建表

```bash
mysql -uroot -p mcp_api < sql/schema.node.sql
```

## 启动 API

```bash
npm run start
```

## 启动类目采集脚本

先在 `.env` 里设置 `SELLERSPRITE_CATEGORY_COOKIE`。

```bash
npm run crawl:category
```

## Redis 会话准备（用于 asin / 查竞品接口）

需要提前写入 `mcp:session:SELLERSPRITE` 哈希（hash 的每个 field 为一个账号标识，value 为该账号会话 JSON，网关按 field 轮询使用），value 示例：

```json
{
  "accept": "application/json, text/plain, */*",
  "acceptLanguage": "zh-CN,zh;q=0.9",
  "contentType": "application/json;charset=UTF-8",
  "cookie": "...",
  "userAgent": "Mozilla/5.0"
}
```

## 缓存配置（可选，默认开启）

| 环境变量 | 说明 | 默认值 |
|---|---|---|
| `CACHE_ENABLED` | 总开关 | `true` |
| `CACHE_READ_ENABLED` | 是否读缓存（命中则返回） | `true` |
| `CACHE_TTL_SECONDS` | 缓存有效期 | `300` |

缓存键：`mcp:cache:{provider}:{接口}:v2:{请求参数SHA1}`，对 `marketplace` 大小写、ASIN 大小写与顺序做了归一化；分页（`page`/`size`）与排序（`order`）参数会参与缓存键，避免不同分页/排序命中到错误结果。

## MCP 工具列表

工具名已与官方 MCP Code 完全一致（对齐 open.sellersprite.com）：

| 工具名（= 官方 MCP Code） | 官方接口 | 说明 |
|---|---|---|
| `asin_detail` | /api/3 | ASIN 详情 |
| `asin_prediction` | /api/27 | ASIN 销量预测 |
| `bsr_prediction` | /api/26 | BSR 销量预测 |
| `asin_sales_trend` | /api/61 | ASIN 销量趋势 |
| `asin_competitor` | /api/62 | ASIN 竞品数据 |
| `competitor_lookup` | /api/1 | 查竞品 |
| `product_research` | /api/2 | 选产品 |
| `market_research` | /api/29 | 选市场 |
| `product_node` | /api/9 | 查产品类目 |
| `keyword_miner` | /api/6 | 关键词挖掘 |
| `keyword_research` | /api/10 | 关键词选品 |
| `keyword_conversion` | /api/63 | 关键词转化率 |
| `traffic_keyword` | /api/14 | ASIN 流量词反查 |
| `traffic_keyword_stat` | /api/13 | 流量词统计 |
| `traffic_extend` | /api/46 | 拓展流量词 |
| `traffic_listing` | /api/16 | 关联流量列表 |
| `traffic_listing_stat` | /api/15 | 关联流量统计 |
| `google_trend` | /api/12 | 谷歌趋势 |
| `aba_research_weekly` | /api/19 | ABA 数据选品（按周） |
| `aba_research_monthly` | /api/20 | ABA 数据选品（按月） |

## 卖家精灵官方 MCP 代理转发（ss_ 前缀工具）

本地未实现的官方能力通过 MCP 代理转发补齐：服务作为 MCP Client 连接官方 MCP
（`https://mcp.sellersprite.com/mcp`），将白名单内的上游工具以 `ss_` 前缀挂载到 `/mcp`，
调用时透传转发并把上游响应统一包裹为 `{code, message, data}` 信封（复用内部字段剔除与
`returnFields` 裁剪）。

默认转发 25 个本地缺失工具：`ss_keepa_info`、`ss_review`、`ss_traffic_source`、
`ss_keyword_order`、`ss_asin_coupon_trend`、`ss_asin_detail_with_coupon_trend`、
`ss_keyword_research_trends`、`ss_aba_research_trend`、`ss_market_research_statistics`、
市场分布/集中度系列（11 个）、商标系列（4 个）。`secret_*` 元工具不对外暴露。
`keyword_order`（出单词反查 /api/24）本地实现已注销，改由代理以 `ss_keyword_order` 提供。

| 环境变量 | 说明 | 默认值 |
|---|---|---|
| `SELLERSPRITE_MCP_ENABLED` | 总开关 | `true` |
| `SELLERSPRITE_MCP_URL` | 上游 MCP 地址 | `https://mcp.sellersprite.com/mcp` |
| `SELLERSPRITE_MCP_SECRET_KEY` | MCP 密钥（与开放 API Key 不通用） | 空 |
| `SELLERSPRITE_MCP_TOOL_PREFIX` | 工具前缀 | `ss_` |
| `SELLERSPRITE_MCP_TOOLS` | 转发白名单：空=默认差集，`*`=全部，逗号分隔=指定 | 空 |
| `SELLERSPRITE_MCP_TIMEOUT_MS` | 上游调用超时 | `30000` |
| `SELLERSPRITE_MCP_REFRESH_MS` | 工具列表定时刷新 | `600000` |
| `SELLERSPRITE_MCP_PROXY` | 出站代理：`none` 直连；默认读 `HTTPS_PROXY` | 空 |

稳定性设计：惰性连接 + `_connecting` 单飞去重、失败指数退避（5s→60s 冷却期内快速失败）、
调用失败重连重试一次、tools/list 失败开放（上游挂了不影响本地工具）。
代理调用仍走本服务的 API Key 鉴权与限流，上游密钥只存在于服务端。

冒烟测试（不依赖 MySQL/Redis，真实连上游）：

```bash
npm run test:mcp-proxy
```

