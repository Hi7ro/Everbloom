package com.everbloom.billing;

import java.time.Instant;

public final class BillingModels {
    private BillingModels() {}
    public record PurchaseConfig(String appUserId, String entitlementId, String appleProductId, String googleProductId, String offeringId,
            String appleApiKey, String googleApiKey) {}
    public record Membership(String mode, boolean active, Instant verifiedAt, Instant expiresAt, Boolean willRenew,
            String store, String managementUrl, int characterXpBonusPercent, boolean advancedBosses,
            PurchaseConfig purchaseConfig) {}
    /** Provider-verified state only. Expiry is checked again every time access is used. */
    public record Verified(boolean active, Instant expiresAt, Boolean willRenew, String store, String managementUrl) {}
}
