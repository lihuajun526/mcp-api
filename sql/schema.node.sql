-- =====================================================================
--  mcp-api-node MySQL Schema
--
--  用户账户 / API 密钥 / 接口定价 / 调用记录 已统一迁移至 SellerDexMCP
--  （sellerdex-api）的 sdx_ 前缀表，与旧表口径不再兼容：
--    user_account        -> sdx_user_account + sdx_api_key
--    api_endpoint_pricing-> sdx_api_endpoint_pricing
--    usage_record        -> sdx_usage_record
--  建表脚本见 sellerdex-api/sql/schema.sql；
--  本仓库的迁移/工具定价补录见 sql/migration_*.sql。
--
--  本文件仅保留 mcp-api 自有的类目数据表。
-- =====================================================================
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS amz_category (
    node_id VARCHAR(512) NOT NULL PRIMARY KEY,
    site VARCHAR(32) NOT NULL,
    market_id INT NOT NULL,
    parent_node_id VARCHAR(32) NULL,
    label VARCHAR(512) NULL,
    node_label_locale VARCHAR(512) NULL,
    node_label_path_locale VARCHAR(512) NULL,
    products BIGINT NULL,
    children_count INT NOT NULL DEFAULT 0,
    depth INT NOT NULL DEFAULT 0,
    leaf TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_amz_category_parent (site, market_id, parent_node_id)
);
