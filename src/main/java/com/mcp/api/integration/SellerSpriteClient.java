package com.mcp.api.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.mcp.api.common.BusinessException;
import com.mcp.api.domain.ThirdPartySession;
import com.mcp.api.dto.AsinDetailRequest;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
public class SellerSpriteClient {

    private static final String DEFAULT_MONTH_NAME = "bsr_sales_nearly";
    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_SIZE = 60;
    private static final boolean DEFAULT_SYMBOL_FLAG = true;
    private static final String DEFAULT_LOW_PRICE = "N";

    private final WebClient webClient;

    @Value("${mcp.third-party.sellersprite.competing-lookup-path}")
    private String competingLookupPath;

    @Value("${mcp.third-party.sellersprite.request-timeout-ms:10000}")
    private long timeoutMs;

    public SellerSpriteClient(@Value("${mcp.third-party.sellersprite.base-url}") String baseUrl) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    public JsonNode fetchAsinDetail(AsinDetailRequest request, ThirdPartySession session) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("market", request.getMarketplace());
        payload.put("monthName", DEFAULT_MONTH_NAME);
        payload.put("asins", Collections.singletonList(request.getAsin()));
        payload.put("page", DEFAULT_PAGE);
        payload.put("size", DEFAULT_SIZE);
        payload.put("symbolFlag", DEFAULT_SYMBOL_FLAG);
        payload.put("nodeIdPaths", new Object[]{});
        Map<String, Object> order = new HashMap<>();
        order.put("field", "amz_unit");
        order.put("desc", true);
        payload.put("order", order);
        payload.put("lowPrice", DEFAULT_LOW_PRICE);

        try {
            return webClient.post()
                    .uri(competingLookupPath)
                    .header("accept", valueOrDefault(session.getAccept(), "application/json, text/plain, */*"))
                    .header("accept-language", valueOrDefault(session.getAcceptLanguage(), "zh-CN,zh;q=0.9"))
                    .header("content-type", valueOrDefault(session.getContentType(), "application/json;charset=UTF-8"))
                    .header("cookie", valueOrDefault(session.getCookie(), ""))
                    .header("user-agent", valueOrDefault(session.getUserAgent(), "Mozilla/5.0"))
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();
        } catch (Exception ex) {
            log.error("SellerSprite请求失败", ex);
            throw new BusinessException("调用第三方平台失败: SellerSprite");
        }
    }

    private String valueOrDefault(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) {
            return fallback;
        }
        return value;
    }
}
