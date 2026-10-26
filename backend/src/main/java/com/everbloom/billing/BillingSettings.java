package com.everbloom.billing;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Preview never contacts a payment provider. Live requires an explicitly configured store setup. */
@Component
public record BillingSettings(String mode, String secretApiKey, String webhookAuthorization,
        String appleApiKey, String googleApiKey, String entitlementId, String appleProductId, String googleProductId, String offeringId,
        boolean allowSandbox) {
    public BillingSettings(
            @Value("${app.billing.mode:preview}") String mode,
            @Value("${app.billing.secret-api-key:}") String secretApiKey,
            @Value("${app.billing.webhook-authorization:}") String webhookAuthorization,
            @Value("${app.billing.apple-api-key:}") String appleApiKey,
            @Value("${app.billing.google-api-key:}") String googleApiKey,
            @Value("${app.billing.entitlement-id:everbloom_plus}") String entitlementId,
            @Value("${app.billing.apple-product-id:everbloom_plus_monthly}") String appleProductId,
            @Value("${app.billing.google-product-id:everbloom_plus:monthly}") String googleProductId,
            @Value("${app.billing.offering-id:default}") String offeringId,
            @Value("${app.billing.allow-sandbox:false}") boolean allowSandbox) {
        if (!mode.equals("preview") && !mode.equals("live")) throw new IllegalStateException("Billing mode must be preview or live.");
        if (mode.equals("live") && (secretApiKey.isBlank() || webhookAuthorization.length() < 32
                || !appleApiKey.startsWith("appl_") || !googleApiKey.startsWith("goog_")
                || entitlementId.isBlank() || appleProductId.isBlank() || !googleProductId.matches("[^:]+:[^:]+") || offeringId.isBlank()))
            throw new IllegalStateException("Live billing requires the RevenueCat server key, webhook authorization, both public store keys and product identifiers.");
        this.mode = mode; this.secretApiKey = secretApiKey; this.webhookAuthorization = webhookAuthorization;
        this.appleApiKey = appleApiKey; this.googleApiKey = googleApiKey; this.entitlementId = entitlementId;
        this.appleProductId = appleProductId; this.googleProductId = googleProductId; this.offeringId = offeringId; this.allowSandbox = allowSandbox;
    }
    public boolean live() { return mode.equals("live"); }
    @Override public String toString() { return "BillingSettings[mode=" + mode + "]"; }
}
