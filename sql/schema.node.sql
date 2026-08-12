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
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    site VARCHAR(32) NOT NULL,
    market_id INT NOT NULL,
    node_id VARCHAR(32) NOT NULL,
    parent_node_id VARCHAR(32) NULL,
    label VARCHAR(255) NULL,
    node_label_locale VARCHAR(255) NULL,
    node_label_path_locale VARCHAR(1024) NULL,
    products BIGINT NULL,
    children_count INT NOT NULL DEFAULT 0,
    depth INT NOT NULL DEFAULT 0,
    leaf TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uk_amz_category_site_market_node (site, market_id, node_id),
    INDEX idx_amz_category_parent (site, market_id, parent_node_id)
);

INSERT INTO user_account (id, username, api_key, points, qps_limit, admin, status)
VALUES (1, 'demo_user', 'demo-key-001', 100000, 5, false, 'ACTIVE')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO api_endpoint_pricing (id, endpoint_code, cost_points, enabled)
VALUES (1, 'ASIN_DETAIL', 5, true),
       (2, 'COMPETING_LOOKUP', 10, true)
ON DUPLICATE KEY UPDATE endpoint_code = endpoint_code;
