-- =====================================================================
--  mcp-api-node 迁移脚本：切换至 SellerDexMCP（sdx_ 前缀）账户/计费表
--  日期：2026-10-05
--
--  背景：mcp-api 与 sellerdex-api 共用同一库 mcp_api。
--  原自有表（user_account / api_endpoint_pricing / usage_record）
--  由 sdx_ 前缀表统一承载：
--    user_account         -> sdx_user_account + sdx_api_key（明文密钥改存 SHA-256）
--    api_endpoint_pricing -> sdx_api_endpoint_pricing（enabled 改为 status）
--    usage_record         -> sdx_usage_record（tool_code/tool_name/credits/month 等）
--
--  字段关系（依据已有数据示例）：
--    sdx_api_key.user_id      -> sdx_user_account.uid
--    sdx_usage_record.user_id -> sdx_user_account.uid
--    sdx_usage_record.kid     -> sdx_api_key.kid
--    sdx_usage_record.tool_code -> sdx_api_endpoint_pricing.code
--
--  执行顺序：1) 建索引 -> 2) 补录定价 -> 3) 删除旧表
-- =====================================================================
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 1) 索引优化（按业务场景）
--    sdx_usage_record 已有 idx_usage_user_month / idx_usage_user_tool_month /
--    idx_usage_key_time；补两个平台侧常用维度：
-- ---------------------------------------------------------------------
-- 平台级「某接口某月」用量统计（运营看板 / 计费核对）
ALTER TABLE sdx_usage_record ADD INDEX idx_usage_tool_month (tool_code, month);
-- 按时间范围的调用明细检索与历史数据清理（保留期策略）
ALTER TABLE sdx_usage_record ADD INDEX idx_usage_created_at (created_at);

-- ---------------------------------------------------------------------
-- 2) 补录 mcp-api 工具定价（编码对齐小写工具名，与工具公开名一致）
--    本地工具幂等更新，代理工具（ss_ 前缀）新登记
-- ---------------------------------------------------------------------
INSERT INTO sdx_api_endpoint_pricing (code, name, description, credits_per_call, status, updated_at) VALUES
  ('asin_detail', 'ASIN 详情', '单个 ASIN 的详情数据（价格、排名、评分）', 5, 'online', NOW()),
  ('competitor_lookup', '查竞品', '按关键词 / ASIN 查询竞品销量、价格与评论数据', 10, 'online', NOW()),
  ('bsr_prediction', 'BSR 销量预测', '按 BSR 榜单预测销量', 5, 'online', NOW()),
  ('asin_prediction', 'ASIN 销量预测', '单个 ASIN 的销量与销售额预测', 5, 'online', NOW()),
  ('traffic_keyword', '关键词反查', '反查 ASIN 的流量关键词列表', 10, 'online', NOW()),
  ('keyword_research', '关键词选品', '按关键词筛选潜力产品', 10, 'online', NOW()),
  ('keyword_miner', '关键词挖掘', '关键词扩展、搜索量与流量估算', 10, 'online', NOW()),
  ('traffic_extend', '拓展流量词', '拓展 ASIN 的关联流量词', 10, 'online', NOW()),
  ('keyword_order', '出单词反查', '反查关键词的出单 ASIN', 10, 'online', NOW()),
  ('google_trend', '谷歌趋势', '关键词谷歌趋势数据', 5, 'online', NOW()),
  ('keyword_conversion', '关键词转化率', '关键词转化率数据', 10, 'online', NOW()),
  ('aba_research_weekly', 'ABA 数据选品（周）', 'ABA 周维度选品数据', 10, 'online', NOW()),
  ('aba_research_monthly', 'ABA 数据选品（月）', 'ABA 月维度选品数据', 10, 'online', NOW()),
  ('traffic_keyword_stat', '流量词统计', 'ASIN 流量词统计', 5, 'online', NOW()),
  ('traffic_listing_stat', '关联流量统计', '关联流量统计', 5, 'online', NOW()),
  ('traffic_listing', '关联流量列表', '关联流量明细列表', 10, 'online', NOW()),
  ('market_research', '选市场列表', '类目与市场容量、竞争度分析', 10, 'online', NOW()),
  ('product_node', '查产品类目', '查询亚马逊类目节点', 5, 'online', NOW()),
  ('asin_competitor', '查 ASIN 竞品数据', '查询 ASIN 的竞品数据', 10, 'online', NOW()),
  ('product_research', '选产品', '多维条件筛选潜力产品', 10, 'online', NOW()),
  ('asin_sales_trend', 'ASIN 销量趋势', 'ASIN 历史销量趋势', 10, 'online', NOW()),
  -- 卖家精灵官方 MCP 代理工具（编码 = ss_ + 上游工具名）
  ('ss_keepa_info', 'Keepa 信息', NULL, 10, 'online', NOW()),
  ('ss_review', '评论分析', NULL, 10, 'online', NOW()),
  ('ss_asin_coupon_trend', 'ASIN 优惠券趋势', NULL, 10, 'online', NOW()),
  ('ss_asin_detail_with_coupon_trend', 'ASIN 详情（含优惠券趋势）', NULL, 10, 'online', NOW()),
  ('ss_keyword_order', '出单词反查（代理）', NULL, 10, 'online', NOW()),
  ('ss_keyword_research_trends', '关键词趋势分析', NULL, 10, 'online', NOW()),
  ('ss_traffic_source', '流量来源', NULL, 10, 'online', NOW()),
  ('ss_aba_research_trend', 'ABA 趋势分析', NULL, 10, 'online', NOW()),
  ('ss_market_research_statistics', '市场统计', NULL, 5, 'online', NOW()),
  ('ss_market_brand_concentration', '品牌集中度', NULL, 5, 'online', NOW()),
  ('ss_market_product_concentration', '产品集中度', NULL, 5, 'online', NOW()),
  ('ss_market_seller_concentration', '卖家集中度', NULL, 5, 'online', NOW()),
  ('ss_market_seller_type_concentration', '卖家类型集中度', NULL, 5, 'online', NOW()),
  ('ss_market_seller_country_distribution', '卖家国家分布', NULL, 5, 'online', NOW()),
  ('ss_market_price_distribution', '价格分布', NULL, 5, 'online', NOW()),
  ('ss_market_rating_distribution', '评分分布', NULL, 5, 'online', NOW()),
  ('ss_market_ratings_count_distribution', '评分数分布', NULL, 5, 'online', NOW()),
  ('ss_market_ebc_distribution', 'EBC 卖家分布', NULL, 5, 'online', NOW()),
  ('ss_market_listing_date_distribution', '上架时间分布', NULL, 5, 'online', NOW()),
  ('ss_market_listing_trend_distribution', '上架趋势分布', NULL, 5, 'online', NOW()),
  ('ss_market_product_demand_trend', '产品需求趋势', NULL, 5, 'online', NOW()),
  ('ss_trademark_list', '商标列表', NULL, 5, 'online', NOW()),
  ('ss_trademark_detail', '商标详情', NULL, 5, 'online', NOW()),
  ('ss_trademark_stats', '商标统计', NULL, 5, 'online', NOW()),
  ('ss_trademark_country_list', '商标国家列表', NULL, 2, 'online', NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  credits_per_call = VALUES(credits_per_call),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

-- ---------------------------------------------------------------------
-- 3) 删除不再使用的旧表（数据不迁移，已确认丢弃测试残留）
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS usage_record;
DROP TABLE IF EXISTS api_endpoint_pricing;
DROP TABLE IF EXISTS user_account;
