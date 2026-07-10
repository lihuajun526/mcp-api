package com.mcp.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserContext {
    private Long userId;
    private String username;
    private String apiKey;
    private Long points;
    private Integer qpsLimit;
    private Boolean admin;
}
