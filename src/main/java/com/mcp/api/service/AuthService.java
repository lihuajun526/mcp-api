package com.mcp.api.service;

import com.mcp.api.common.BusinessException;
import com.mcp.api.domain.UserAccount;
import com.mcp.api.dto.UserContext;
import com.mcp.api.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userAccountRepository;

    @Value("${mcp.security.api-key-header}")
    private String apiKeyHeader;

    public String getApiKeyHeader() {
        return apiKeyHeader;
    }

    public UserContext authenticate(String apiKey) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new BusinessException("缺少API Key");
        }

        UserAccount user = userAccountRepository
                .findByApiKeyAndStatus(apiKey, "ACTIVE")
                .orElseThrow(() -> new BusinessException("API Key无效或用户已禁用"));

        return UserContext.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .apiKey(user.getApiKey())
                .points(user.getPoints())
                .qpsLimit(user.getQpsLimit())
                .admin(user.getAdmin())
                .build();
    }
}
