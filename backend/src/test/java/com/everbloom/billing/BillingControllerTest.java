package com.everbloom.billing;

import com.everbloom.auth.AuthService;
import com.everbloom.auth.EverbloomAuthentication;
import com.everbloom.common.api.ApiException;
import com.everbloom.game.GameModels;
import com.everbloom.game.GameService;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;
import static com.everbloom.billing.BillingModels.*;
import static com.everbloom.game.BossModels.*;
import static com.everbloom.game.GameModels.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"app.billing.mode=live", "app.billing.secret-api-key=sk_server_test_only",
        "app.billing.webhook-authorization=test-webhook-authorization-32-characters", "app.billing.apple-api-key=appl_public",
        "app.billing.google-api-key=goog_public"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BillingControllerTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired BillingService billing;
    @Autowired BillingDeletionWorker deletion;
    @Autowired AuthService accounts;
    @Autowired PasswordEncoder passwords;
    @Autowired GameService game;
    @Autowired ObjectMapper json;
    @MockitoBean RevenueCatClient provider;
    @MockitoBean(name = "clock") Clock clock;
    @MockitoBean(name = "gameClock") Clock gameClock;
    private UUID owner, other;
    private final Instant now = Instant.parse("2026-10-05T12:00:00Z");
    @BeforeEach void setup() {
        jdbc.update("delete from accounts"); jdbc.update("delete from billing_webhook_events");
        jdbc.update("delete from billing_deletion_jobs"); jdbc.update("delete from auth_rate_limits");
        at(now); when(clock.getZone()).thenReturn(java.time.ZoneOffset.UTC); when(gameClock.instant()).thenReturn(now);
        owner = account("member@example.test"); other = account("free@example.test");
        when(provider.fetch(any())).thenReturn(new Verified(false, null, null, null, null));
    }
    private void at(Instant instant) { when(clock.instant()).thenReturn(instant); when(clock.millis()).thenReturn(instant.toEpochMilli()); }
    private UUID account(String email) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into accounts(id,email,password_hash,email_verified_at,session_version) values(?,?,?,CURRENT_TIMESTAMP,0)", id, email, "test-unused-hash");
        return id;
    }
    private EverbloomAuthentication auth(UUID id) { return new EverbloomAuthentication(id, "member@example.test"); }
    private Verified active() { return new Verified(true, now.plusSeconds(3600), true, "app_store", "https://apps.apple.com/account/subscriptions"); }
    private String event(String id) { return "{\"event\":{\"id\":\"" + id + "\",\"type\":\"RENEWAL\",\"app_user_id\":\"" + owner + "\"}}"; }
    private void seedLevel(int target) {
        var s = game.load(owner); var c = s.character();
        long xp = (long)(target - 1) * 1200 + (long)(target - 1) * (target - 2) * 100;
        var state = new Snapshot(s.dayKey(), new GameModels.Character(true, c.id(), c.name(), c.title(), xp, c.attributes(), c.appearance()),
                s.skills(), s.quests(), s.boss(), s.activities(), s.unlockedAuras(), s.momentum(), s.bossProgress());
        jdbc.update("update game_states set snapshot_json=? where account_id=?", json.writeValueAsString(state), owner);
    }
    @Test void billingRequiresSessionCsrfExpectedOwnerAndEmptyServerOwnedRequest() throws Exception {
        mvc.perform(get("/api/billing/membership")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/billing/refresh").with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isForbidden());
        mvc.perform(get("/api/billing/membership").with(authentication(auth(owner))).header("X-Everbloom-Account", other)).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ACCOUNT_CHANGED"));
        mvc.perform(post("/api/billing/refresh").with(authentication(auth(owner))).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"active\":true}")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/billing/refresh").with(authentication(auth(owner))).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(" ".repeat(17000))).andExpect(status().isContentTooLarge());
        verifyNoInteractions(provider);
    }
    @Test void refreshVerifiesAuthenticatedOwnerAndReturnsOnlyPublicConfiguration() throws Exception {
        doReturn(active()).when(provider).fetch(owner);
        var result = mvc.perform(post("/api/billing/refresh").with(authentication(auth(owner))).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.characterXpBonusPercent").value(10)).andExpect(jsonPath("$.advancedBosses").value(true))
                .andExpect(jsonPath("$.purchaseConfig.appUserId").value(owner.toString()))
                .andExpect(jsonPath("$.purchaseConfig.appleProductId").value("everbloom_plus_monthly"))
                .andExpect(jsonPath("$.purchaseConfig.googleProductId").value("everbloom_plus:monthly"))
                .andReturn().getResponse().getContentAsString();
        assertFalse(result.contains("sk_server")); assertFalse(result.contains("webhook-authorization"));
        assertFalse(billing.membership(other).active()); verify(provider).fetch(owner); verify(provider, never()).fetch(other);
    }
    @Test void expiryIsEnforcedEvenBeforeCacheRefreshAndRevocationRefreshesAfterFiveMinutes() {
        when(provider.fetch(owner)).thenReturn(new Verified(true, now.plusSeconds(60), false, "app_store", null));
        assertTrue(billing.refresh(owner).active()); at(now.plusSeconds(60));
        assertFalse(billing.membership(owner).active()); verify(provider, times(1)).fetch(owner);
        doReturn(active()).when(provider).fetch(owner); at(now); billing.refresh(owner);
        when(provider.fetch(owner)).thenReturn(new Verified(false, now, false, "app_store", null)); at(now.plusSeconds(301));
        assertFalse(billing.membership(owner).active()); assertEquals(0, billing.membership(owner).characterXpBonusPercent());
    }
    @Test void providerFailureCannotCreateOrExtendRightsAndAcceptedActivityRetryRemainsSafe() {
        when(provider.fetch(owner)).thenThrow(RevenueCatClient.unavailable());
        assertThrows(ApiException.class, () -> billing.refresh(owner)); assertFalse(billing.membership(owner).active());
        doReturn(active()).when(provider).fetch(owner); billing.refresh(owner);
        var command = new Command("exercise", "calisthenics", 60);
        var first = game.record(owner, command); assertEquals(314, first.snapshot().character().totalXp());
        assertEquals(24, first.reward().membershipXp()); assertEquals(240, first.snapshot().skills().getFirst().totalXp());
        at(now.plusSeconds(301)); when(provider.fetch(owner)).thenThrow(RevenueCatClient.unavailable());
        assertThrows(ApiException.class, () -> game.record(owner, new Command("later", "reading", 10)));
        assertEquals(1, game.load(owner).activities().size());
        assertTrue(game.record(owner, command).reward().duplicate());
        assertEquals(314, game.load(owner).character().totalXp());
    }
    @Test void freePlayKeepsTheFirstFiveNormalBossesButStopsAtTheLevelSixtyBossWithoutCappingCharacterXp() throws Exception {
        seedLevel(130);
        for (String boss : List.of("mosswarden", "emberwyrm", "dusk-prowler", "frost-titan", "cloud-sovereign")) {
            for (String mode : List.of("hard", "epic", "ultimate"))
                mvc.perform(post("/api/game/bosses/" + boss + "/fight").with(authentication(auth(owner))).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"requestId\":\"" + boss + mode + "\",\"difficulty\":\"" + mode + "\",\"tactic\":\"balanced\"}"))
                        .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("PLUS_REQUIRED"));
            assertEquals("victory", game.fight(owner, new FightCommand(boss, boss, "normal", "balanced")).replay().outcome());
        }
        var before = game.load(owner);
        mvc.perform(post("/api/game/bosses/bloodmoon-regent/fight").with(authentication(auth(owner))).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"requestId\":\"free-late-normal\",\"difficulty\":\"normal\",\"tactic\":\"balanced\"}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("PLUS_REQUIRED"));
        assertEquals(before, game.load(owner));
        assertEquals(5, before.bossProgress().unlockedCosmetics().size());
        assertEquals(5, jdbc.queryForObject("select count(*) from game_boss_requests where account_id=?", Integer.class, owner));
        assertTrue(game.record(owner, new Command("above-fifty", "reading", 10)).snapshot().character().totalXp() > before.character().totalXp());
        verifyNoInteractions(provider);
    }
    @Test void verifiedPlusUnlocksLateNormalBossesButExpiryBlocksNewFightsAndPreservesAcceptedReplaysAndLoot() {
        seedLevel(130);
        when(provider.fetch(owner)).thenReturn(new Verified(true, now.plusSeconds(60), false, "app_store", null));
        billing.refresh(owner);
        for (String boss : List.of("mosswarden", "emberwyrm", "dusk-prowler", "frost-titan", "cloud-sovereign", "bloodmoon-regent", "astral-sovereign", "void-devourer", "primordial-dragon", "relic-sovereign"))
            assertEquals("victory", game.fight(owner, new FightCommand("accepted-" + boss, boss, "normal", "balanced")).replay().outcome());
        var earned = game.load(owner);
        assertEquals(10, earned.bossProgress().unlockedCosmetics().size());
        at(now.plusSeconds(60));
        assertFalse(billing.membership(owner).active());
        for (String boss : List.of("bloodmoon-regent", "astral-sovereign", "void-devourer", "primordial-dragon", "relic-sovereign")) {
            for (String mode : List.of("normal", "hard", "epic", "ultimate")) {
                ApiException denied = assertThrows(ApiException.class, () -> game.fight(owner, new FightCommand("new-" + boss + mode, boss, mode, "balanced")));
                assertEquals("PLUS_REQUIRED", denied.code());
                assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, denied.status());
            }
            var retry = game.fight(owner, new FightCommand("accepted-" + boss, boss, "normal", "balanced"));
            assertTrue(retry.duplicate());
            assertEquals("victory", retry.replay().outcome());
            assertEquals(earned.bossProgress(), retry.snapshot().bossProgress());
        }
        assertEquals(earned, game.load(owner));
        assertEquals(10, jdbc.queryForObject("select count(*) from game_boss_requests where account_id=?", Integer.class, owner));
        var appearance = new java.util.LinkedHashMap<>(earned.character().appearance());
        appearance.put("cosmeticHair", "bloodmoon-crown");
        assertEquals("bloodmoon-crown", game.updateCharacter(owner, new Profile("Nori", appearance)).snapshot().character().appearance().get("cosmeticHair"));
        // A free replay of the opening chapter still works after membership expires.
        assertEquals("victory", game.fight(owner, new FightCommand("free-cloud", "cloud-sovereign", "normal", "balanced")).replay().outcome());
        verify(provider, times(1)).fetch(owner);
    }
    @Test void clientCatalogFieldsProfileClaimsAndAnotherOwnersSubscriptionCannotUnlockLateNormalBosses() throws Exception {
        seedLevel(130);
        for (String boss : List.of("mosswarden", "emberwyrm", "dusk-prowler", "frost-titan", "cloud-sovereign"))
            game.fight(owner, new FightCommand(boss, boss, "normal", "balanced"));
        var before = game.load(owner);
        for (String forged : List.of("\"baseLevel\":10", "\"futurePlus\":false", "\"active\":true"))
            mvc.perform(post("/api/game/bosses/bloodmoon-regent/fight").with(authentication(auth(owner))).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                    .content("{\"requestId\":\"forged\",\"difficulty\":\"normal\",\"tactic\":\"balanced\"," + forged + "}"))
                    .andExpect(status().isBadRequest());
        var forgedAppearance = new java.util.LinkedHashMap<>(before.character().appearance());
        forgedAppearance.put("membership", "plus");
        mvc.perform(put("/api/game/character").with(authentication(auth(owner))).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(java.util.Map.of("name", "Nori", "appearance", forgedAppearance))))
                .andExpect(status().isBadRequest());
        doReturn(active()).when(provider).fetch(other); assertTrue(billing.refresh(other).active());
        mvc.perform(post("/api/game/bosses/bloodmoon-regent/fight").with(authentication(auth(owner))).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"requestId\":\"other-member\",\"difficulty\":\"normal\",\"tactic\":\"balanced\"}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("PLUS_REQUIRED"));
        assertEquals(before, game.load(owner));
        assertEquals(5, jdbc.queryForObject("select count(*) from game_boss_requests where account_id=?", Integer.class, owner));
        verify(provider, never()).fetch(owner);
    }
    @Test void expiredMemberKeepsEarnedCosmeticsAndCanReplayAnAcceptedPaidFight() {
        seedLevel(40); doReturn(active()).when(provider).fetch(owner); billing.refresh(owner);
        var command = new FightCommand("paid-fight", "mosswarden", "ultimate", "balanced");
        var accepted = game.fight(owner, command); assertTrue(accepted.firstClear());
        when(provider.fetch(owner)).thenReturn(new Verified(false, now, false, "app_store", null)); billing.refresh(owner);
        var retry = game.fight(owner, command); assertTrue(retry.duplicate()); assertEquals(accepted.replay(), retry.replay());
        assertEquals(List.of("ancient-guardian"), retry.snapshot().bossProgress().unlockedCosmetics());
        var appearance = new java.util.LinkedHashMap<>(retry.snapshot().character().appearance()); appearance.put("aura", "guardian");
        assertEquals("guardian", game.updateCharacter(owner, new Profile("Nori", appearance)).snapshot().character().appearance().get("aura"));
        assertThrows(ApiException.class, () -> game.fight(owner, new FightCommand("new", "mosswarden", "ultimate", "balanced")));
    }
    @Test void webhookUsesExactAuthorizationNoCsrfAndDeduplicatesVerifiedRefreshes() throws Exception {
        mvc.perform(post("/api/billing/revenuecat/webhook").contentType(MediaType.APPLICATION_JSON).content(event("one"))).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/billing/revenuecat/webhook").header("Authorization", "wrong").contentType(MediaType.APPLICATION_JSON).content(event("one"))).andExpect(status().isUnauthorized());
        doReturn(active()).when(provider).fetch(owner);
        for (int i = 0; i < 2; i++) mvc.perform(post("/api/billing/revenuecat/webhook").header("Authorization", "test-webhook-authorization-32-characters").contentType(MediaType.APPLICATION_JSON).content(event("one"))).andExpect(status().isOk());
        verify(provider, times(1)).fetch(owner); assertTrue(billing.membership(owner).active());
        mvc.perform(post("/api/billing/revenuecat/webhook").header("Authorization", "test-webhook-authorization-32-characters").content("a".repeat(65537))).andExpect(status().isContentTooLarge());
    }
    @Test void failedWebhookRollsBackDeduplicationSoProviderRetryCanSucceed() throws Exception {
        when(provider.fetch(owner)).thenThrow(RevenueCatClient.unavailable());
        assertThrows(ApiException.class, () -> billing.webhook(json.readTree(event("retry"))));
        assertEquals(0, jdbc.queryForObject("select count(*) from billing_webhook_events", Integer.class));
        doReturn(active()).when(provider).fetch(owner); billing.webhook(json.readTree(event("retry")));
        assertTrue(billing.membership(owner).active()); assertEquals(1, jdbc.queryForObject("select count(*) from billing_webhook_events", Integer.class));
    }
    @Test void transfersAndFutureEventTypesReconcileAllKnownOwnersButNeverCreateAccounts() {
        doReturn(active()).when(provider).fetch(owner); billing.refresh(owner);
        when(provider.fetch(owner)).thenReturn(new Verified(false, null, null, null, null)); when(provider.fetch(other)).thenReturn(active());
        billing.webhook(json.readTree("{\"event\":{\"id\":\"transfer\",\"type\":\"TRANSFER\",\"transferred_from\":[\"" + owner + "\"],\"transferred_to\":[\"" + other + "\"]}}"));
        assertFalse(billing.membership(owner).active()); assertTrue(billing.membership(other).active());
        billing.webhook(json.readTree("{\"event\":{\"id\":\"future\",\"type\":\"NEW_PROVIDER_EVENT\",\"app_user_id\":\"" + UUID.randomUUID() + "\",\"aliases\":[\"" + other + "\",\"$RCAnonymousID:test\"],\"future_field\":42}}"));
        assertEquals(2, jdbc.queryForObject("select count(*) from accounts", Integer.class)); verify(provider, times(2)).fetch(other);
    }
    @Test void accountExportOmitsSecretsAndDeletionQueuesProviderErasureWithRetry() {
        doReturn(active()).when(provider).fetch(owner); billing.refresh(owner);
        String exported = json.writeValueAsString(accounts.export(owner));
        assertTrue(exported.contains("membership")); assertTrue(exported.contains("app_store"));
        assertFalse(exported.contains("purchaseConfig")); assertFalse(exported.contains("sk_server"));
        jdbc.update("update accounts set password_hash=? where id=?", passwords.encode("correct-password-123"), owner);
        accounts.delete(owner, "correct-password-123");
        assertEquals(0, jdbc.queryForObject("select count(*) from billing_memberships where account_id=?", Integer.class, owner));
        assertEquals(1, jdbc.queryForObject("select count(*) from billing_deletion_jobs where account_id=?", Integer.class, owner));
        doThrow(RevenueCatClient.unavailable()).doNothing().when(provider).delete(owner);
        deletion.process(); assertEquals(1, jdbc.queryForObject("select attempts from billing_deletion_jobs where account_id=?", Integer.class, owner));
        deletion.process(); verify(provider, times(1)).delete(owner);
        at(now.plusSeconds(901)); deletion.process();
        assertEquals(0, jdbc.queryForObject("select count(*) from billing_deletion_jobs", Integer.class));
        verify(provider, times(2)).delete(owner);
    }

    @Test void refreshRateLimitStopsRepeatedProviderCalls() throws Exception {
        for (int i = 0; i < 20; i++) mvc.perform(post("/api/billing/refresh").with(authentication(auth(owner))).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isOk());
        mvc.perform(post("/api/billing/refresh").with(authentication(auth(owner))).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isTooManyRequests());
        verify(provider, times(20)).fetch(owner);
    }

    @Test void failedRecheckOfAlreadyFreeAccountDoesNotBlockItsCoreTracking() {
        billing.refresh(owner); at(now.plusSeconds(301)); when(provider.fetch(owner)).thenThrow(RevenueCatClient.unavailable());
        assertEquals(290, game.record(owner, new Command("free-exercise", "calisthenics", 60)).snapshot().character().totalXp());
    }
}
