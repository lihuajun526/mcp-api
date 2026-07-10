package com.mcp.api.service;

import com.mcp.api.common.BusinessException;
import com.mcp.api.domain.ApiEndpointPricing;
import com.mcp.api.repository.ApiEndpointPricingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final ApiEndpointPricingRepository pricingRepository;

    public Integer getCostPoints(String endpointCode) {
        ApiEndpointPricing pricing = pricingRepository
                .findByEndpointCodeAndEnabled(endpointCode, true)
                .orElseThrow(() -> new BusinessException("接口未配置价格: " + endpointCode));
        return pricing.getCostPoints();
    }
}
