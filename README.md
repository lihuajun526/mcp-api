# mcp-api

MCP API 首版后端（Spring Boot）实现，已覆盖：

- API Key 鉴权
- 按用户 QPS 限流（默认 5 QPS，可按用户配置）
- 按接口扣点（每个接口可配置不同价格）
- 第三方会话轮询（当前实现 SellerSprite）
- 数据转换层（第三方返回 -> MCP 返回）
- 预留缓存模块（本地内存 TTL）

## 1. 环境要求

- Java 18
- Maven 3.9+
- MySQL 8+

## 2. 数据库初始化

1. 创建数据库：

```sql
CREATE DATABASE mcp_api DEFAULT CHARACTER SET utf8mb4;
```

2. 启动应用后会自动执行：

- `src/main/resources/schema.sql`
- `src/main/resources/data.sql`

3. 修改测试会话信息（必须）

将 `third_party_session` 表中的以下字段替换成可用值：

- `cookie_value`
- `proxytoken`

## 3. 本地启动

```bash
mvn spring-boot:run
```

默认端口：`8080`

## 4. 接口示例

### Asin 详情接口

- URL: `POST /api/v1/mcp/asin/detail`
- Header: `X-API-Key: demo-key-001`

请求体示例：

```json
{
	"market": "US",
	"month_name": "bsr_sales_nearly",
	"asins": ["B00MNV8E0C"],
	"page": 1,
	"size": 60,
	"symbol_flag": true
}
```

返回体示例：

```json
{
	"success": true,
	"message": "OK",
	"data": {
		"page": 1,
		"size": 60,
		"total": 1,
		"items": [
			{
				"asin": "B00MNV8E0C",
				"title": "Amazon Basics ...",
				"brand": "Amazon Basics",
				"price": 15.29,
				"rating": 4.7,
				"reviews": 943125,
				"estimated_monthly_sales": 4303789,
				"bsr_category": "Health & Household",
				"bsr_rank": 4,
				"image_url": "https://..."
			}
		]
	}
}
```

## 5. 首版数据表说明

- `user_account`: 用户、API Key、点数、QPS
- `api_endpoint_pricing`: 接口定价
- `third_party_session`: 第三方登录态
- `usage_record`: 调用扣点记录

## 6. 现阶段限制

- 当前仅接入 `SellerSprite` 的 Asin 详情能力
- 缓存为本地内存实现，后续可切换 Redis
- 管理后台、官网前台尚未在本轮实现

## 7. 下一步建议

- 增加管理后台 API（用户、密钥、价格、会话配置）
- 接入 Redis 做分布式限流和缓存
- 增加更多第三方平台适配器（H10/SIF/西柚找词）
