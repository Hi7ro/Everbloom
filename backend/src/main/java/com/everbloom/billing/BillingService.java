package com.everbloom.billing;

import com.everbloom.auth.AccountDeletionContributor;
import com.everbloom.auth.AccountExportContributor;
import com.everbloom.common.api.ApiException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeSet;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import static com.everbloom.billing.BillingModels.*;

@Service
public class BillingService implements AccountExportContributor, AccountDeletionContributor {
    private static final Duration MAX_CACHE_AGE = Duration.ofMinutes(5);
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final BillingSettings settings;
    private final RevenueCatClient provider;
    public BillingService(JdbcTemplate jdbc, Clock clock, BillingSettings settings, RevenueCatClient provider) {
        this.jdbc = jdbc; this.clock = clock; this.settings = settings; this.provider = provider;
    }
    @Transactional
    public Membership membership(UUID owner) {
        lock(owner);
        if (!settings.live()) return response(owner, null);
        Cached cached = read(owner);
        if (cached != null && cached.verifiedAt().plus(MAX_CACHE_AGE).isBefore(clock.instant())) {
            // Never silently omit an existing member's XP bonus when verification is unavailable.
            try { return refreshLocked(owner); }
            catch (ApiException failure) {
                if (cached.state().active()) throw failure;
                // Core free play remains available during a provider outage.
            }
        }
        return response(owner, cached);
    }
    @Transactional
    public Membership refresh(UUID owner) {
        lock(owner);
        return settings.live() ? refreshLocked(owner) : response(owner, null);
    }
    private Membership refreshLocked(UUID owner) {
        Verified state = provider.fetch(owner);
        Instant verifiedAt = clock.instant();
        jdbc.update("insert into billing_memberships(account_id,active,verified_at,expires_at,will_renew,store,management_url) values(?,?,?,?,?,?,?) on conflict do nothing",
                owner, state.active(), verifiedAt.toEpochMilli(), millis(state.expiresAt()), state.willRenew(), state.store(), state.managementUrl());
        jdbc.update("update billing_memberships set active=?,verified_at=?,expires_at=?,will_renew=?,store=?,management_url=? where account_id=?",
                state.active(), verifiedAt.toEpochMilli(), millis(state.expiresAt()), state.willRenew(), state.store(), state.managementUrl(), owner);
        return response(owner, new Cached(state, verifiedAt));
    }
    private Membership response(UUID owner, Cached cached) {
        if (!settings.live()) return new Membership("preview", false, null, null, null, null, null, 0, true, null);
        Verified state = cached == null ? new Verified(false, null, null, null, null) : cached.state();
        boolean active = state.active() && state.expiresAt() != null && state.expiresAt().isAfter(clock.instant());
        return new Membership("live", active, cached == null ? null : cached.verifiedAt(), state.expiresAt(),
                state.willRenew(), state.store(), state.managementUrl(), active ? 10 : 0, active,
                new PurchaseConfig(owner.toString(), settings.entitlementId(), settings.appleProductId(), settings.googleProductId(), settings.offeringId(), settings.appleApiKey(), settings.googleApiKey()));
    }
    @Transactional
    public void webhook(JsonNode body) {
        if (!settings.live()) throw new ApiException(HttpStatus.NOT_FOUND, "BILLING_DISABLED", "Membership ist noch nicht verfügbar.");
        JsonNode event = body.path("event");
        String id = text(event, "id");
        if (!event.isObject() || id == null || id.isBlank() || id.length() > 200) throw invalid();
        if (jdbc.update("insert into billing_webhook_events(event_id,received_at) values(?,?) on conflict do nothing", id, clock.millis()) == 0) return;
        TreeSet<UUID> owners = new TreeSet<>();
        add(owners, event.path("app_user_id")); add(owners, event.path("original_app_user_id"));
        for (String key : new String[]{"aliases", "transferred_from", "transferred_to"}) {
            JsonNode ids = event.path(key);
            if (ids.isArray()) ids.forEach(value -> add(owners, value));
        }
        if (owners.size() > 8) throw invalid();
        for (UUID owner : owners) {
            boolean exists = jdbc.query("select id from accounts where id=? and email_verified_at is not null for update", rs -> { return rs.next(); }, owner);
            if (exists) refreshLocked(owner);
        }
        // Event IDs contain no receipt/customer payload; keep only a bounded deduplication window.
        jdbc.update("delete from billing_webhook_events where received_at < ?", clock.millis() - Duration.ofDays(30).toMillis());
    }
    @Override public Map<String, Object> export(UUID owner) {
        Cached cached = read(owner);
        Map<String, Object> membership = new LinkedHashMap<>();
        if (cached != null) {
            membership.put("active", cached.state().active() && cached.state().expiresAt() != null && cached.state().expiresAt().isAfter(clock.instant()));
            membership.put("verifiedAt", cached.verifiedAt().toString());
            membership.put("expiresAt", cached.state().expiresAt() == null ? null : cached.state().expiresAt().toString());
            membership.put("store", cached.state().store()); membership.put("willRenew", cached.state().willRenew());
        }
        return Map.of("membership", membership);
    }
    @Override public void beforeDelete(UUID owner) {
        if (settings.live() || read(owner) != null) jdbc.update("insert into billing_deletion_jobs(account_id,requested_at,next_attempt_at,attempts) values(?,?,?,0) on conflict do nothing", owner, clock.millis(), clock.millis());
    }
    private void lock(UUID owner) {
        boolean exists = jdbc.query("select id from accounts where id=? and email_verified_at is not null for update", rs -> { return rs.next(); }, owner);
        if (!exists) throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Bitte melde dich mit einem bestätigten Konto an.");
    }
    private record Cached(Verified state, Instant verifiedAt) {}
    private Cached read(UUID owner) {
        return jdbc.query("select active,verified_at,expires_at,will_renew,store,management_url from billing_memberships where account_id=?", rs -> {
            if (!rs.next()) return null;
            Long expires = rs.getObject("expires_at", Long.class);
            return new Cached(new Verified(rs.getBoolean("active"), expires == null ? null : Instant.ofEpochMilli(expires),
                    rs.getObject("will_renew", Boolean.class), rs.getString("store"), rs.getString("management_url")), Instant.ofEpochMilli(rs.getLong("verified_at")));
        }, owner);
    }
    private static Long millis(Instant value) { return value == null ? null : value.toEpochMilli(); }
    private static String text(JsonNode node, String key) { return node.path(key).isTextual() ? node.path(key).asText() : null; }
    private static void add(TreeSet<UUID> owners, JsonNode value) {
        if (!value.isTextual()) return;
        try { UUID id = UUID.fromString(value.asText()); if (id.toString().equalsIgnoreCase(value.asText())) owners.add(id); }
        catch (IllegalArgumentException ignored) { /* Anonymous RevenueCat IDs never create Everbloom accounts. */ }
    }
    private static ApiException invalid() { return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_WEBHOOK", "Ungültige Benachrichtigung."); }
}
