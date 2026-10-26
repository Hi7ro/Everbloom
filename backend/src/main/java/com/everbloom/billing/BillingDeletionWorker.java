package com.everbloom.billing;

import java.time.Clock;
import java.time.Duration;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Only opaque provider IDs survive local deletion, until provider erasure has been requested. */
@Component
@EnableScheduling
public class BillingDeletionWorker {
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final BillingSettings settings;
    private final RevenueCatClient provider;
    public BillingDeletionWorker(JdbcTemplate jdbc, Clock clock, BillingSettings settings, RevenueCatClient provider) {
        this.jdbc = jdbc; this.clock = clock; this.settings = settings; this.provider = provider;
    }
    @Scheduled(fixedDelayString = "${app.billing.deletion-retry-delay-ms:60000}", initialDelay = 60000)
    public void process() {
        if (!settings.live()) return;
        var owners = jdbc.query("select account_id from billing_deletion_jobs where next_attempt_at <= ? order by requested_at limit 10",
                (rs, index) -> rs.getObject(1, UUID.class), clock.millis());
        for (UUID owner : owners) {
            try {
                provider.delete(owner);
                jdbc.update("delete from billing_deletion_jobs where account_id=?", owner);
            } catch (RuntimeException error) {
                jdbc.update("update billing_deletion_jobs set attempts=attempts+1,next_attempt_at=? where account_id=?",
                        clock.millis() + Duration.ofMinutes(15).toMillis(), owner);
            }
        }
    }
}
