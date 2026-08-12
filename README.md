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

需要提前写入 `mcp:session:SELLERSPRITE` 列表（多个账号则写入多个元素，网关按轮询使用），元素示例：

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

缓存键：`mcp:cache:{provider}:{接口}:v1:{请求参数SHA1}`，对 ASIN 大小写与顺序做了归一化，分页参数不影响命中。

## MCP 工具列表

| 工具名 | 说明 | 定价 |
|---|---|---|
| `asin_detail_lookup` | ASIN 详情（marketplace + asin） | 5 点 |
| `competitor_lookup` | 查竞品（marketplace + asins[]，可多 ASIN） | 10 点 |
