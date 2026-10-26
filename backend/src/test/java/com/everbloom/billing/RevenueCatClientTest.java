package com.everbloom.billing;

import com.everbloom.common.api.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;
import static org.junit.jupiter.api.Assertions.*;

class RevenueCatClientTest {
    private final JsonMapper json = JsonMapper.builder().build();
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-05T12:00:00Z"), ZoneOffset.UTC);
    static BillingSettings settings(boolean sandbox) {
        return new BillingSettings("live", "sk_test_server_only", "test-webhook-authorization-32-characters", "appl_public", "goog_public", "everbloom_plus", "everbloom_plus_monthly", "everbloom_plus:monthly", "default", sandbox);
    }
    private RevenueCatClient client(boolean sandbox) { return new RevenueCatClient(settings(sandbox), json, clock); }
    private ObjectNode response(String store, boolean sandbox) {
        ObjectNode root = json.createObjectNode(), subscriber = root.putObject("subscriber");
        String product = store.equals("play_store") ? "everbloom_plus" : "everbloom_plus_monthly";
        var entitlement = subscriber.putObject("entitlements").putObject("everbloom_plus");
        entitlement.put("product_identifier", product).put("expires_date", "2026-11-05T12:00:00Z");
        if (store.equals("play_store")) entitlement.put("product_plan_identifier", "monthly");
        subscriber.putObject("subscriptions").putObject(product).put("store", store).put("is_sandbox", sandbox);
        subscriber.put("management_url", "https://attacker.invalid");
        return root;
    }
    private ObjectNode entitlement(ObjectNode root) { return (ObjectNode) root.path("subscriber").path("entitlements").path("everbloom_plus"); }
    private ObjectNode subscription(ObjectNode root) { return (ObjectNode) root.path("subscriber").path("subscriptions").path(entitlement(root).path("product_identifier").asText()); }

    @Test void verifiesBothStoreProductsAndNeverForwardsAnArbitraryManagementUrl() {
        var apple = client(false).parse(response("app_store", false));
        assertTrue(apple.active()); assertTrue(apple.willRenew());
        assertEquals("https://apps.apple.com/account/subscriptions", apple.managementUrl());
        var google = client(false).parse(response("play_store", false));
        assertTrue(google.active()); assertEquals("play_store", google.store());
        assertEquals("https://play.google.com/store/account/subscriptions", google.managementUrl());
    }
    @Test void wrongGoogleBasePlanAndMissingPlanCannotGrantPlus() {
        var body = response("play_store", false);
        entitlement(body).put("product_plan_identifier", "yearly");
        assertFalse(client(false).parse(body).active());
        entitlement(body).remove("product_plan_identifier");
        assertFalse(client(false).parse(body).active());
    }
    @Test void sandboxRequiresExplicitOptInAndPromotionalEntitlementsCannotGrantPlus() {
        assertFalse(client(false).parse(response("app_store", true)).active());
        assertTrue(client(true).parse(response("app_store", true)).active());
        assertFalse(client(true).parse(response("promotional", false)).active());
    }
    @Test void cancelledSubscriptionsKeepTheirPaidPeriodButExpireAtExactBoundary() {
        var body = response("app_store", false);
        subscription(body).put("unsubscribe_detected_at", "2026-10-04T12:00:00Z");
        assertTrue(client(false).parse(body).active()); assertFalse(client(false).parse(body).willRenew());
        entitlement(body).put("expires_date", "2026-10-05T12:00:00Z");
        assertFalse(client(false).parse(body).active());
    }
    @Test void onlyProviderGraceExtendsAnExpiredSubscription() {
        var body = response("app_store", false);
        entitlement(body).put("expires_date", "2026-10-04T12:00:00Z").put("grace_period_expires_date", "2026-10-07T12:00:00Z");
        subscription(body).put("billing_issues_detected_at", "2026-10-04T12:00:00Z");
        var state = client(false).parse(body);
        assertTrue(state.active()); assertFalse(state.willRenew());
        assertEquals(Instant.parse("2026-10-07T12:00:00Z"), state.expiresAt());
    }
    @Test void absentEntitlementIsFreeButMalformedProviderDataFailsClosed() {
        assertFalse(client(false).parse(json.readTree("{\"subscriber\":{\"entitlements\":{}}}")).active());
        assertThrows(ApiException.class, () -> client(false).parse(json.readTree("{}")));
        var body = response("app_store", false);
        subscription(body).remove("is_sandbox");
        assertThrows(ApiException.class, () -> client(false).parse(body));
        var invalidExpiry = response("app_store", false);
        entitlement(invalidExpiry).putNull("expires_date");
        assertThrows(ApiException.class, () -> client(false).parse(invalidExpiry));
    }
    @Test void liveConfigurationIsExplicitAndNeverPrintsSecretKeys() {
        assertThrows(IllegalStateException.class, () -> new BillingSettings("live", "", "", "", "", "e", "a", "g:m", "default", false));
        assertThrows(IllegalStateException.class, () -> new BillingSettings("live", "sk_secret", "a".repeat(32), "appl_public", "goog_public", "e", "a", "without-base-plan", "default", false));
        assertFalse(settings(false).toString().contains("sk_test"));
        assertFalse(new BillingSettings("preview", "", "", "", "", "e", "a", "g:m", "default", false).live());
    }

    @Test void providerResponseLimitCancelsAnOversizedBodyBeforeAccumulatingIt() {
        var subscription = org.mockito.Mockito.mock(java.util.concurrent.Flow.Subscription.class);
        var body = new RevenueCatClient.BoundedBody(4);
        body.onSubscribe(subscription);
        body.onNext(java.util.List.of(java.nio.ByteBuffer.wrap(new byte[]{1, 2, 3})));
        body.onNext(java.util.List.of(java.nio.ByteBuffer.wrap(new byte[]{4, 5})));
        org.mockito.Mockito.verify(subscription).cancel();
        assertTrue(body.getBody().toCompletableFuture().isCompletedExceptionally());
        body.onComplete(); // Late signals cannot turn a rejected payload into a successful response.
        assertTrue(body.getBody().toCompletableFuture().isCompletedExceptionally());
    }
}
