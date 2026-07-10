package com.mcp.api.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class AsinDetailRequest {

    @NotBlank(message = "marketplace不能为空")
    private String marketplace;

    @NotBlank(message = "asin不能为空")
    private String asin;
}
