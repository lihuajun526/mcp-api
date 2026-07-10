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
