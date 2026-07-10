package com.mcp.api.controller;

import com.mcp.api.common.ApiResponse;
import com.mcp.api.dto.AsinDetailRequest;
import com.mcp.api.dto.AsinDetailResponse;
import com.mcp.api.dto.UserContext;
import com.mcp.api.service.AsinDetailService;
import com.mcp.api.service.AuthService;
import com.mcp.api.service.RateLimitService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/mcp")
@RequiredArgsConstructor
public class McpController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;
    private final AsinDetailService asinDetailService;

    @PostMapping("/asin/detail")
    public ApiResponse<AsinDetailResponse> asinDetail(
            @RequestHeader(name = "X-API-Key", required = false) String apiKey,
            @Valid @RequestBody AsinDetailRequest request) {

        UserContext user = authService.authenticate(apiKey);
        rateLimitService.tryConsume(user.getUserId(), user.getQpsLimit());

        AsinDetailResponse response = asinDetailService.query(user, request);
        return ApiResponse.ok(response);
    }
}
