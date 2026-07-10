package com.mcp.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mcp.api.domain.ThirdPartySession;
import com.mcp.api.dto.AsinDetailRequest;
import com.mcp.api.dto.AsinDetailResponse;
import com.mcp.api.dto.UserContext;
import com.mcp.api.integration.SellerSpriteClient;
import com.mcp.api.transformer.AsinTransformer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AsinDetailService {

    public static final String ENDPOINT_CODE = "ASIN_DETAIL";

    private final ObjectMapper objectMapper;
    private final CacheService cacheService;
    private final PricingService pricingService;
    private final BillingService billingService;
    private final ProviderSessionRouter providerSessionRouter;
    private final SellerSpriteClient sellerSpriteClient;
    private final AsinTransformer asinTransformer;
    private static final String CACHE_KEY_PREFIX = "asin:detail:v2:";

    @Value("${mcp.cache.read-enabled:true}")
    private boolean cacheReadEnabled;

    public AsinDetailResponse query(UserContext user, AsinDetailRequest request) {
        String cacheKey = buildCacheKey(request);
        if (cacheReadEnabled) {
            AsinDetailResponse cached = cacheService.get(cacheKey, AsinDetailResponse.class);
            if (cached != null) {
                billingSuccess(user, "CACHE");
                return cached;
            }
        }

        ThirdPartySession session = providerSessionRouter.pickSession("SELLERSPRITE");
        JsonNode raw = sellerSpriteClient.fetchAsinDetail(request, session);
        AsinDetailResponse transformed = asinTransformer.transform(raw);
        enrichResponse(request, transformed);

        cacheService.put(cacheKey, transformed);
        billingSuccess(user, "SELLERSPRITE");
        return transformed;
    }

    private void enrichResponse(AsinDetailRequest request, AsinDetailResponse response) {
        if (response == null || response.getItems() == null) {
            return;
        }
        for (com.mcp.api.dto.AsinDetailItem item : response.getItems()) {
            if (item.getMarketplace() == null || item.getMarketplace().trim().isEmpty()) {
                item.setMarketplace(request.getMarketplace());
            }
            if ((item.getAsinUrl() == null || item.getAsinUrl().trim().isEmpty())
                    && item.getAsin() != null
                    && !item.getAsin().trim().isEmpty()) {
                item.setAsinUrl("https://www.amazon.com/dp/" + item.getAsin());
            }
        }
    }

    private void billingSuccess(UserContext user, String provider) {
        Integer cost = pricingService.getCostPoints(ENDPOINT_CODE);
        billingService.deductAndRecord(user.getUserId(), ENDPOINT_CODE, cost, UUID.randomUUID().toString(), provider);
    }

    private String buildCacheKey(AsinDetailRequest request) {
        try {
            String raw = objectMapper.writeValueAsString(request);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return CACHE_KEY_PREFIX + bytesToHex(hashed);
        } catch (Exception ex) {
            return CACHE_KEY_PREFIX + "fallback:" + request.getMarketplace() + ":" + request.getAsin();
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
