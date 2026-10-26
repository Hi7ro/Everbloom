package com.everbloom.billing;

import com.everbloom.common.api.ApiException;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.List;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.Flow;
import java.util.concurrent.TimeUnit;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import static com.everbloom.billing.BillingModels.*;

@Component
public class RevenueCatClient {
    private final BillingSettings settings;
    private final ObjectMapper json;
    private final Clock clock;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    public RevenueCatClient(BillingSettings settings, ObjectMapper json, Clock clock) {
        this.settings = settings; this.json = json; this.clock = clock;
    }
    public Verified fetch(UUID accountId) {
        try {
            var response = send(request(accountId).GET().build());
            if (response.statusCode() != 200 && response.statusCode() != 201) throw unavailable();
            return parse(json.readTree(response.body()));
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt(); throw unavailable();
        } catch (Exception error) { throw unavailable(); }
    }
    public void delete(UUID accountId) {
        try {
            var response = send(request(accountId).DELETE().build());
            if (response.statusCode() != 200 && response.statusCode() != 404) throw unavailable();
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt(); throw unavailable();
        } catch (Exception error) { throw unavailable(); }
    }
    private HttpResponse<byte[]> send(HttpRequest request) throws Exception {
        var pending = http.sendAsync(request, ignored -> new BoundedBody(256 * 1024));
        try { return pending.get(5, TimeUnit.SECONDS); }
        finally { if (!pending.isDone()) pending.cancel(true); }
    }
    /** Bounds both payload allocation and the complete response deadline, including slow response bodies. */
    static final class BoundedBody implements HttpResponse.BodySubscriber<byte[]> {
        private final HttpResponse.BodySubscriber<byte[]> delegate = HttpResponse.BodySubscribers.ofByteArray();
        private final int limit;
        private Flow.Subscription subscription;
        private long received;
        private boolean failed;
        BoundedBody(int limit) { this.limit = limit; }
        @Override public CompletionStage<byte[]> getBody() { return delegate.getBody(); }
        @Override public void onSubscribe(Flow.Subscription subscription) { this.subscription = subscription; delegate.onSubscribe(subscription); }
        @Override public void onNext(List<ByteBuffer> buffers) {
            if (failed) return;
            for (ByteBuffer buffer : buffers) received += buffer.remaining();
            if (received > limit) {
                failed = true; subscription.cancel(); delegate.onError(new IOException("Provider response exceeds limit"));
            } else delegate.onNext(buffers);
        }
        @Override public void onError(Throwable error) { if (!failed) delegate.onError(error); }
        @Override public void onComplete() { if (!failed) delegate.onComplete(); }
    }
    private HttpRequest.Builder request(UUID id) {
        return HttpRequest.newBuilder(URI.create("https://api.revenuecat.com/v1/subscribers/" + id))
                .timeout(Duration.ofSeconds(5)).header("Authorization", "Bearer " + settings.secretApiKey())
                .header("Accept", "application/json");
    }
    Verified parse(JsonNode body) {
        JsonNode subscriber = body.path("subscriber");
        if (!subscriber.isObject() || !subscriber.path("entitlements").isObject()) throw unavailable();
        JsonNode entitlement = subscriber.path("entitlements").path(settings.entitlementId());
        if (entitlement.isMissingNode() || entitlement.isNull()) return new Verified(false, null, null, null, null);
        if (!entitlement.isObject()) throw unavailable();
        String product = text(entitlement, "product_identifier");
        JsonNode subscription = subscriber.path("subscriptions").path(product);
        if (!subscription.isObject() || !subscription.path("is_sandbox").isBoolean()) throw unavailable();
        String store = text(subscription, "store");
        if ((!"app_store".equals(store) && !"play_store".equals(store))
                || (subscription.path("is_sandbox").asBoolean() && !settings.allowSandbox()))
            return new Verified(false, null, null, null, null);
        // REST v1 exposes Google's subscription and base plan separately. Compare both;
        // accepting just the subscription ID would also grant other base plans.
        String exactProduct = "play_store".equals(store) ? product + ":" + text(entitlement, "product_plan_identifier") : product;
        String configured = "play_store".equals(store) ? settings.googleProductId() : settings.appleProductId();
        if (!configured.equals(exactProduct)) return new Verified(false, null, null, null, null);
        Instant expires = timestamp(entitlement, "expires_date");
        Instant grace = timestamp(entitlement, "grace_period_expires_date");
        if (expires == null) throw unavailable(); // The first release supports monthly subscriptions only.
        if (grace != null && grace.isAfter(expires)) expires = grace;
        Instant cancelled = timestamp(subscription, "unsubscribe_detected_at");
        Instant billingIssue = timestamp(subscription, "billing_issues_detected_at");
        boolean active = expires.isAfter(clock.instant());
        return new Verified(active, expires, cancelled == null && billingIssue == null, store,
                "app_store".equals(store) ? "https://apps.apple.com/account/subscriptions" : "https://play.google.com/store/account/subscriptions");
    }
    private static String text(JsonNode node, String key) {
        JsonNode value = node.path(key);
        return value.isTextual() ? value.asText() : null;
    }
    private static Instant timestamp(JsonNode node, String key) {
        JsonNode value = node.path(key);
        if (value.isNull() || value.isMissingNode()) return null;
        if (!value.isTextual()) throw unavailable();
        try { return Instant.parse(value.asText()); } catch (RuntimeException error) { throw unavailable(); }
    }
    static ApiException unavailable() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "BILLING_UNAVAILABLE", "Deine Membership konnte gerade nicht bestätigt werden. Bitte versuche es erneut.");
    }
}
