package com.mcp.api.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AsinDetailResponse {
    private Integer page;
    private Integer size;
    private Integer total;
    private List<AsinDetailItem> items;
}
