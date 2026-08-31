CREATE TABLE IF NOT EXISTS user_account (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL UNIQUE,
    api_key VARCHAR(128) NOT NULL UNIQUE,
    points BIGINT NOT NULL,
    qps_limit INT NOT NULL DEFAULT 5,
    admin TINYINT(1) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS api_endpoint_pricing (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    endpoint_code VARCHAR(64) NOT NULL UNIQUE,
    cost_points INT NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS usage_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    endpoint_code VARCHAR(64) NOT NULL,
    request_id VARCHAR(64) NOT NULL,
    cost_points INT NOT NULL,
    provider VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_usage_user_id (user_id),
    INDEX idx_usage_created_at (created_at)
);

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

INSERT INTO user_account (id, username, api_key, points, qps_limit, admin, status)
VALUES (1, 'demo_user', 'demo-key-001', 100000, 5, false, 'ACTIVE')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO api_endpoint_pricing (id, endpoint_code, cost_points, enabled)
VALUES (1, 'ASIN_DETAIL', 5, true),
       (2, 'COMPETING_LOOKUP', 10, true),
       (3, 'BSR_SALES', 5, true),
       (4, 'ASIN_SALES', 5, true),
       (5, 'ASIN_REVERSING', 10, true),
       (6, 'KEYWORD_RESEARCH', 10, true),
       (7, 'KEYWORD_MINER', 10, true),
       (8, 'TRAFFIC_EXTEND', 10, true),
       (9, 'KEYWORD_ORDER', 10, true),
       (10, 'GOOGLE_TREND', 5, true),
       (11, 'KEYWORD_CONVERSION', 10, true),
       (12, 'ABA_RESEARCH_WEEKLY', 10, true),
       (13, 'ABA_RESEARCH_MONTHLY', 10, true),
       (14, 'TRAFFIC_KEYWORD_STAT', 5, true),
       (15, 'TRAFFIC_LISTING_STAT', 5, true),
       (16, 'TRAFFIC_LISTING', 10, true),
       (17, 'MARKET_RESEARCH', 10, true),
       (18, 'PRODUCT_NODE', 5, true),
       (19, 'ASIN_COMPETITOR', 10, true),
       (20, 'PRODUCT_RESEARCH', 10, true)
ON DUPLICATE KEY UPDATE endpoint_code = endpoint_code;
