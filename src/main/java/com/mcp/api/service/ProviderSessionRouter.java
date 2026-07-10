package com.mcp.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mcp.api.common.BusinessException;
import com.mcp.api.domain.ThirdPartySession;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProviderSessionRouter {

    private static final String SESSION_LIST_PREFIX = "mcp:session:";
    private static final String CURSOR_PREFIX = "mcp:session:cursor:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public ThirdPartySession pickSession(String provider) {
        String normalizedProvider = provider.toUpperCase();
        String listKey = SESSION_LIST_PREFIX + normalizedProvider;
        Long size = redisTemplate.opsForList().size(listKey);

        if (size == null || size <= 0) {
            throw new BusinessException("未找到可用第三方会话: " + provider);
        }

        Long cursor = redisTemplate.opsForValue().increment(CURSOR_PREFIX + normalizedProvider);
        if (cursor == null) {
            throw new BusinessException("获取第三方会话游标失败: " + provider);
        }

        int index = Math.floorMod(cursor.intValue() - 1, size.intValue());
        String raw = redisTemplate.opsForList().index(listKey, index);
        if (raw == null || raw.isEmpty()) {
            throw new BusinessException("第三方会话数据为空: " + provider);
        }

        try {
            return objectMapper.readValue(raw, ThirdPartySession.class);
        } catch (Exception ex) {
            log.error("反序列化第三方会话失败, provider={}", provider, ex);
            throw new BusinessException("第三方会话配置格式错误: " + provider);
        }
    }
}
