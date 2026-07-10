INSERT INTO user_account (id, username, api_key, points, qps_limit, admin, status)
VALUES (1, 'demo_user', 'demo-key-001', 100000, 5, false, 'ACTIVE')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO api_endpoint_pricing (id, endpoint_code, cost_points, enabled)
VALUES (1, 'ASIN_DETAIL', 5, true)
ON DUPLICATE KEY UPDATE endpoint_code = endpoint_code;
