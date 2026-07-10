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
@Table(name = "user_account")
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 64)
    private String username;

    @Column(name = "api_key", nullable = false, unique = true, length = 128)
    private String apiKey;

    @Column(name = "points", nullable = false)
    private Long points;

    @Column(name = "qps_limit", nullable = false)
    private Integer qpsLimit;

    @Column(name = "admin", nullable = false)
    private Boolean admin;

    @Column(name = "status", nullable = false, length = 32)
    private String status;
}
