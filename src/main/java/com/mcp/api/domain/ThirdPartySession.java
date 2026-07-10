package com.mcp.api.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThirdPartySession {

    private String accept;

    private String acceptLanguage;

    private String contentType;

    private String cookie;

    private String userAgent;
}
