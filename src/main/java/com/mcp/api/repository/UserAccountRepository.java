package com.mcp.api.repository;

import com.mcp.api.domain.UserAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByApiKeyAndStatus(String apiKey, String status);
}
