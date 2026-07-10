package com.mcp.api.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "api_endpoint_pricing")
public class ApiEndpointPricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "endpoint_code", nullable = false, unique = true, length = 64)
    private String endpointCode;

    @Column(name = "cost_points", nullable = false)
    private Integer costPoints;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled;
}
