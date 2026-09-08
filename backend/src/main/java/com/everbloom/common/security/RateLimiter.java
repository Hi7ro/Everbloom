package com.everbloom.common.security;

import com.everbloom.common.api.ApiException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Small single-instance guard for the first local slice; replace with shared limiting before scale-out. */
@Component
public class RateLimiter {
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public void check(String bucket, String key, int limit, Duration duration) {
        String composite = bucket + ":" + key;
        long now = System.nanoTime();
        Window window = windows.compute(composite, (ignored, old) -> old == null || now - old.started() > duration.toNanos() ? new Window(now, 1) : new Window(old.started(), old.count() + 1));
        if (window.count() > limit) throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED", "Bitte versuche es später erneut.");
    }

    private record Window(long started, int count) {}
}
