package com.mcp.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CacheService {

    private static final String CACHE_KEY_PREFIX = "mcp:cache:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${mcp.cache.enabled:true}")
    private boolean enabled;

    @Value("${mcp.cache.ttl-seconds:300}")
    private long ttlSeconds;

    public <T> T get(String key, Class<T> targetType) {
        if (!enabled) {
            return null;
        }
        String raw = redisTemplate.opsForValue().get(CACHE_KEY_PREFIX + key);
        if (raw == null || raw.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(raw, targetType);
        } catch (Exception ex) {
            redisTemplate.delete(CACHE_KEY_PREFIX + key);
            return null;
        }
    }

    public void put(String key, Object value) {
        if (!enabled) {
            return;
        }
        try {
            String raw = objectMapper.writeValueAsString(value);
            redisTemplate.opsForValue().set(CACHE_KEY_PREFIX + key, raw, Duration.ofSeconds(ttlSeconds));
        } catch (Exception ignored) {
            // 如果缓存序列化失败，不影响主流程
        }
    }
}
