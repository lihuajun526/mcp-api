package com.mcp.api.service;

import com.mcp.api.common.BusinessException;
import com.mcp.api.domain.UsageRecord;
import com.mcp.api.domain.UserAccount;
import com.mcp.api.repository.UsageRecordRepository;
import com.mcp.api.repository.UserAccountRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final UserAccountRepository userAccountRepository;
    private final UsageRecordRepository usageRecordRepository;

    @Transactional
    public void deductAndRecord(Long userId, String endpointCode, Integer costPoints, String requestId, String provider) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (user.getPoints() < costPoints) {
            throw new BusinessException("点数余额不足");
        }

        user.setPoints(user.getPoints() - costPoints);
        userAccountRepository.save(user);

        UsageRecord usage = new UsageRecord();
        usage.setUserId(userId);
        usage.setEndpointCode(endpointCode);
        usage.setRequestId(requestId);
        usage.setCostPoints(costPoints);
        usage.setProvider(provider);
        usage.setStatus("SUCCESS");
        usage.setCreatedAt(LocalDateTime.now());
        usageRecordRepository.save(usage);
    }
}
