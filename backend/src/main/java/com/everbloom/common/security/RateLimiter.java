package com.everbloom.common.security;

import com.everbloom.auth.AccountTokens;
import com.everbloom.common.api.ApiException;
import java.time.Clock;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Shared database counters; keys are digests, never email addresses or IPs in clear text. */
@Component
public class RateLimiter {
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final int maxKeys;
    public RateLimiter(JdbcTemplate jdbc, Clock clock, @Value("${app.auth.max-rate-keys:10000}") int maxKeys) {
        this.jdbc = jdbc; this.clock = clock; this.maxKeys = maxKeys;
    }
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void check(String bucket, String key, int limit, Duration duration) {
        long now = clock.millis();
        String hash = AccountTokens.digest(bucket + ":" + key);
        jdbc.update("delete from auth_rate_limits where expires_at <= ?", now);
        jdbc.update("insert into auth_rate_limits (bucket_key, attempts, expires_at) values (?, 0, ?) on conflict do nothing",
                hash, now + duration.toMillis());
        if (jdbc.queryForObject("select count(*) from auth_rate_limits", Long.class) > maxKeys) throw limited();
        var window = jdbc.queryForMap("select attempts, expires_at from auth_rate_limits where bucket_key = ? for update", hash);
        int attempts = ((Number) window.get("attempts")).intValue();
        if (attempts >= limit) throw limited();
        jdbc.update("update auth_rate_limits set attempts = attempts + 1 where bucket_key = ?", hash);
    }
    private static ApiException limited() {
        return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED", "Bitte versuche es später erneut.");
    }
}
