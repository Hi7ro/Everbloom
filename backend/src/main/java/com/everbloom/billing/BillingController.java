package com.everbloom.billing;

import com.everbloom.common.api.ApiException;
import com.everbloom.common.security.ClientAddresses;
import com.everbloom.common.security.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/billing")
public class BillingController {
    private final BillingService billing;
    private final BillingSettings settings;
    private final RateLimiter limiter;
    private final ClientAddresses addresses;
    private final ObjectMapper json;
    public BillingController(BillingService billing, BillingSettings settings, RateLimiter limiter, ClientAddresses addresses, ObjectMapper json) {
        this.billing = billing; this.settings = settings; this.limiter = limiter; this.addresses = addresses; this.json = json;
    }
    @GetMapping("/membership") BillingModels.Membership membership(Authentication auth) {
        limiter.check("membership-read", auth.getName(), 120, Duration.ofMinutes(1));
        return billing.membership(UUID.fromString(auth.getName()));
    }
    @PostMapping("/refresh") BillingModels.Membership refresh(Authentication auth, @RequestBody JsonNode body, HttpServletRequest request) {
        if (!body.isObject() || !body.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Ungültige Membership-Anfrage.");
        limiter.check("membership-refresh", auth.getName(), 20, Duration.ofMinutes(15));
        limiter.check("membership-refresh-ip", addresses.client(request), 100, Duration.ofMinutes(15));
        return billing.refresh(UUID.fromString(auth.getName()));
    }
    @PostMapping("/revenuecat/webhook") void webhook(HttpServletRequest request) throws IOException {
        if (!settings.live()) throw new ApiException(HttpStatus.NOT_FOUND, "BILLING_DISABLED", "Membership ist noch nicht verfügbar.");
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !MessageDigest.isEqual(authorization.getBytes(StandardCharsets.UTF_8), settings.webhookAuthorization().getBytes(StandardCharsets.UTF_8)))
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_WEBHOOK_AUTH", "Ungültige Benachrichtigung.");
        byte[] body = request.getInputStream().readNBytes(64 * 1024 + 1);
        if (body.length > 64 * 1024) throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "REQUEST_TOO_LARGE", "Die Anfrage ist zu groß.");
        JsonNode event;
        try { event = json.readTree(body); }
        catch (RuntimeException error) { throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_WEBHOOK", "Ungültige Benachrichtigung."); }
        if (event == null) throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_WEBHOOK", "Ungültige Benachrichtigung.");
        billing.webhook(event);
    }
}
