package com.mcp.api.repository;

import com.mcp.api.domain.ApiEndpointPricing;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApiEndpointPricingRepository extends JpaRepository<ApiEndpointPricing, Long> {
    Optional<ApiEndpointPricing> findByEndpointCodeAndEnabled(String endpointCode, Boolean enabled);
}
