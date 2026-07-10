package com.mcp.api.service;

import com.mcp.api.common.BusinessException;
import java.util.Collections;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private static final long WINDOW_MILLIS = 1000L;
    private static final DefaultRedisScript<Long> SLIDING_WINDOW_SCRIPT = new DefaultRedisScript<>(
            "local key = KEYS[1] "
                    + "local now = tonumber(ARGV[1]) "
                    + "local window = tonumber(ARGV[2]) "
                    + "local limit = tonumber(ARGV[3]) "
                    + "local member = ARGV[4] "
                    + "redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window) "
                    + "local current = redis.call('ZCARD', key) "
                    + "if current >= limit then return 0 end "
                    + "redis.call('ZADD', key, now, member) "
                    + "redis.call('PEXPIRE', key, window) "
                    + "return 1",
            Long.class);

    private final StringRedisTemplate redisTemplate;

    public void tryConsume(Long userId, Integer qpsLimit) {
        int effectiveQps = qpsLimit == null || qpsLimit <= 0 ? 5 : qpsLimit;
        long now = System.currentTimeMillis();
        String key = "mcp:ratelimit:" + userId;
        String member = now + "-" + UUID.randomUUID();

        Long allowed = redisTemplate.execute(
                SLIDING_WINDOW_SCRIPT,
                Collections.singletonList(key),
                String.valueOf(now),
                String.valueOf(WINDOW_MILLIS),
                String.valueOf(effectiveQps),
                member);

        if (allowed == null || allowed == 0L) {
            throw new BusinessException("请求过于频繁，请稍后再试");
        }
    }
}
