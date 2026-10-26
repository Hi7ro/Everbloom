package com.everbloom.game;

import com.everbloom.auth.EverbloomAuthentication;
import com.everbloom.common.api.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;
import static com.everbloom.game.BossModels.*;
import static com.everbloom.game.GameModels.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "app.billing.mode=preview")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BossControllerTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired GameService game;
    @Autowired com.everbloom.billing.BillingService billing;
    @Autowired ObjectMapper json;
    @MockitoBean(name = "gameClock") Clock clock;
    private UUID owner;
    private UUID other;
    @BeforeEach void setup() {
        jdbc.update("delete from accounts");
        when(clock.instant()).thenReturn(Instant.parse("2026-10-04T10:00:00Z"));
        owner = account("fighter@example.test"); other = account("other@example.test");
    }
    private UUID account(String email) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into accounts(id,email,password_hash,email_verified_at,session_version) values(?,?,?,CURRENT_TIMESTAMP,0)", id, email, "unused-test-hash");
        return id;
    }
    private EverbloomAuthentication auth(UUID id) { return new EverbloomAuthentication(id, "fighter@example.test"); }
    private FightCommand command(String id, String boss, String mode) { return new FightCommand(id, boss, mode, "balanced"); }
    /** Explicit fixture seeding, never a public XP endpoint. */
    private Snapshot level(UUID id, int target) { return level(id, target, false); }
    private Snapshot level(UUID id, int target, boolean trained) {
        Snapshot s = game.load(id);
        long xp = (long) (target - 1) * 1200 + (long) (target - 1) * (target - 2) * 100;
        var c = s.character();
        Snapshot fixture = new Snapshot(s.dayKey(), new GameModels.Character(true, c.id(), c.name(), c.title(), xp, c.attributes(), c.appearance()),
                trained ? s.skills().stream().map(skill -> new Skill(skill.skillId(), List.of("calisthenics", "running", "bjj", "programming", "meditation", "recovery").contains(skill.skillId()) ? Math.round(xp * 0.35 / 6) : 0)).toList() : s.skills(), s.quests(), s.boss(), s.activities(), s.unlockedAuras(), s.momentum(), s.bossProgress());
        jdbc.update("update game_states set snapshot_json = ? where account_id = ?", json.writeValueAsString(fixture), id);
        return game.load(id);
    }
    @Test void endpointRequiresSessionCsrfAndStrictServerOwnedInput() throws Exception {
        String path = "/api/game/bosses/mosswarden/fight", body = "{\"requestId\":\"one\",\"difficulty\":\"normal\",\"tactic\":\"balanced\"}";
        mvc.perform(post(path).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isUnauthorized());
        mvc.perform(post(path).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isForbidden());
        level(owner, 10);
        for (String extra : List.of("\"level\":40", "\"outcome\":\"victory\"", "\"accountId\":\"" + other + "\"", "\"xp\":999999", "\"reward\":\"celestial-wings\""))
            mvc.perform(post(path).with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content(body.substring(0, body.length() - 1) + "," + extra + "}"))
                    .andExpect(status().isBadRequest());
        mvc.perform(post(path).with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content(body.replace("normal", "nightmare"))).andExpect(status().isBadRequest());
        assertEquals(0, jdbc.queryForObject("select count(*) from game_boss_requests", Integer.class));
    }
    @Test void allFortyEncountersEnforceTheirLevelGateOnTheServer() throws Exception {
        for (String boss : List.of("mosswarden", "emberwyrm", "dusk-prowler", "frost-titan", "cloud-sovereign", "bloodmoon-regent", "astral-sovereign", "void-devourer", "primordial-dragon", "relic-sovereign")) for (String mode : List.of("normal", "hard", "epic", "ultimate")) {
            int minimum = BossRules.minimumLevel(boss, mode);
            level(owner, minimum - 1);
            mvc.perform(post("/api/game/bosses/" + boss + "/fight").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                            .content(json.writeValueAsString(Map.of("requestId", boss + mode, "difficulty", mode, "tactic", "balanced"))))
                    .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("BOSS_LEVEL_LOCKED"));
            level(owner, minimum, minimum >= 80);
            assertNotNull(game.fight(owner, command(boss + mode, boss, mode)).replay());
        }
        assertEquals(40, jdbc.queryForObject("select count(*) from game_boss_requests", Integer.class));
    }
    @Test void firstBossIsBeatableAtTenAndHigherLevelKeepsBossFixed() {
        Snapshot atTen = level(owner, 10);
        FightResult first = game.fight(owner, command("first", "mosswarden", "normal"));
        assertEquals("victory", first.replay().outcome());
        assertTrue(first.firstClear());
        assertEquals("moss-crown", first.reward().id());
        assertEquals(18000, first.snapshot().character().totalXp());
        assertEquals(atTen.activities(), first.snapshot().activities());
        assertEquals(atTen.boss(), first.snapshot().boss());
        assertEquals(List.of("mosswarden:normal"), first.snapshot().bossProgress().clearedEncounterIds());
        level(owner, 20);
        FightResult higher = game.fight(owner, command("higher", "mosswarden", "normal"));
        assertEquals(first.replay().boss(), higher.replay().boss());
        assertTrue(higher.replay().roundCount() < first.replay().roundCount());
        assertFalse(higher.firstClear()); assertNull(higher.reward());
    }
    @Test void repeatedRequestsKeepTheirOriginalReplayAndNeverAwardAgain() {
        level(owner, 10);
        FightResult first = game.fight(owner, command("repeat", "mosswarden", "normal"));
        level(owner, 20);
        FightResult retry = game.fight(owner, command("repeat", "mosswarden", "normal"));
        assertTrue(retry.duplicate()); assertEquals(first.replay(), retry.replay());
        assertEquals(57000, retry.snapshot().character().totalXp());
        assertEquals(1, retry.snapshot().bossProgress().unlockedCosmetics().size());
        assertThrows(ApiException.class, () -> game.fight(owner, command("repeat", "mosswarden", "hard")));
        assertThrows(ApiException.class, () -> game.fight(owner, new FightCommand("repeat", "mosswarden", "normal", "power")));
        level(other, 10);
        assertFalse(game.fight(other, command("repeat", "mosswarden", "normal")).duplicate());
        assertEquals(2, jdbc.queryForObject("select count(*) from game_boss_requests", Integer.class));
    }
    @Test void concurrentFightsAndRetriesOnlyGrantOneFirstClear() throws Exception {
        level(owner, 10);
        try (var executor = Executors.newFixedThreadPool(8)) {
            CountDownLatch gate = new CountDownLatch(1);
            List<Future<FightResult>> results = new ArrayList<>();
            for (int i = 0; i < 8; i++) {
                String id = i < 4 ? "same" : "other-" + i;
                results.add(executor.submit(() -> { gate.await(); return game.fight(owner, command(id, "mosswarden", "normal")); }));
            }
            gate.countDown();
            int firstClears = 0, duplicates = 0;
            for (Future<FightResult> result : results) {
                FightResult r = result.get(10, TimeUnit.SECONDS);
                if (r.firstClear() && !r.duplicate()) firstClears++;
                if (r.duplicate()) duplicates++;
            }
            assertEquals(1, firstClears); assertEquals(3, duplicates);
            assertEquals(List.of("moss-crown"), game.load(owner).bossProgress().unlockedCosmetics());
            assertEquals(18000, game.load(owner).character().totalXp());
        }
    }
    @Test void cosmeticOwnershipIsValidatedAndSurvivesProfileActivityNewWeekExport() throws Exception {
        level(owner, 40);
        var appearance = new LinkedHashMap<>(game.load(owner).character().appearance());
        appearance.put("cosmeticHair", "moss-crown");
        mvc.perform(put("/api/game/character").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("name", "Nori", "appearance", appearance))))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("COSMETIC_LOCKED"));
        game.fight(owner, command("normal", "mosswarden", "normal"));
        game.fight(owner, command("ultimate", "mosswarden", "ultimate"));
        appearance.put("aura", "guardian");
        mvc.perform(put("/api/game/character").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("name", "Nori", "appearance", appearance))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.snapshot.character.appearance.cosmeticHair").value("moss-crown"));
        game.record(owner, new Command("exercise", "meditation", 10));
        when(clock.instant()).thenReturn(Instant.parse("2026-10-05T10:00:00Z"));
        Snapshot saved = game.load(owner);
        assertEquals(List.of("moss-crown", "ancient-guardian"), saved.bossProgress().unlockedCosmetics());
        assertTrue(saved.unlockedAuras().contains("guardian"));
        assertEquals("guardian", saved.character().appearance().get("aura"));
        assertEquals(saved, game.export(owner).get("snapshot"));
        assertEquals(2, ((List<?>) game.export(owner).get("bossEncounters")).size());
        assertTrue(game.load(other).bossProgress().unlockedCosmetics().isEmpty());
        jdbc.update("delete from accounts where id = ?", owner);
        assertEquals(0, jdbc.queryForObject("select count(*) from game_boss_requests where account_id = ?", Integer.class, owner));
    }
    @Test void allBossesOfferGuaranteedDistinctRarityTiersWithoutChangingXp() {
        var preview = billing.membership(owner);
        assertEquals("preview", preview.mode());
        assertFalse(preview.active());
        assertTrue(preview.advancedBosses());
        assertNull(preview.purchaseConfig());
        Snapshot before = level(owner, 130, true);
        for (String boss : List.of("mosswarden", "emberwyrm", "dusk-prowler", "frost-titan", "cloud-sovereign", "bloodmoon-regent", "astral-sovereign", "void-devourer", "primordial-dragon", "relic-sovereign")) for (String mode : List.of("normal", "hard", "epic", "ultimate")) {
            FightResult result = game.fight(owner, command(boss + mode, boss, mode));
            assertEquals("victory", result.replay().outcome()); assertTrue(result.firstClear());
            assertEquals(switch (mode) { case "normal" -> "rare"; case "hard" -> "epic"; case "epic" -> "legendary"; default -> "mythic"; }, result.reward().rarity());
        }
        Snapshot after = game.load(owner);
        assertEquals(40, after.bossProgress().clearedEncounterIds().size());
        assertEquals(40, after.bossProgress().unlockedCosmetics().size());
        assertEquals(22, after.unlockedAuras().size());
        assertEquals(before.character().totalXp(), after.character().totalXp());
        assertEquals(before.skills(), after.skills()); assertEquals(before.activities(), after.activities());
    }
    @Test void frostAndCloudRewardsAreLockedThenActuallyEquippableAndExported() throws Exception {
        level(owner, 90);
        for (String earlier : List.of("mosswarden", "emberwyrm", "dusk-prowler"))
            game.fight(owner, command("discovery-" + earlier, earlier, "normal"));
        var appearance = new LinkedHashMap<>(game.load(owner).character().appearance());
        for (String boss : List.of("frost-titan", "cloud-sovereign")) for (String mode : List.of("normal", "hard", "epic", "ultimate")) {
            Cosmetic reward = BossLoot.reward(boss, mode);
            String slot = reward.slot().equals("aura") ? "aura" : reward.slot().equals("hair") ? "cosmeticHair" : "cosmeticOutfit";
            appearance.put(slot, reward.auraId() != null ? reward.auraId() : reward.id());
            String profile = json.writeValueAsString(Map.of("name", "Nori", "appearance", appearance));
            mvc.perform(put("/api/game/character").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content(profile))
                    .andExpect(status().isForbidden());
            FightResult fight = game.fight(owner, command(boss + mode, boss, mode));
            assertTrue(fight.firstClear()); assertEquals(reward, fight.reward());
            mvc.perform(put("/api/game/character").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content(profile))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.snapshot.character.appearance." + slot).value(appearance.get(slot)));
        }
        Snapshot saved = game.load(owner);
        assertEquals(11, saved.bossProgress().unlockedCosmetics().size());
        assertTrue(saved.unlockedAuras().containsAll(List.of("mystic", "energy", "chakra", "light")));
        assertEquals(saved, game.export(owner).get("snapshot"));
        assertEquals(11, ((List<?>) game.export(owner).get("bossEncounters")).size());
    }
    @Test void allTenEarnedOutfitVariantsCanBeEquippedForBothPresentationsWithoutChangingProgress() throws Exception {
        Snapshot before = level(owner, 130, true);
        for (String boss : List.of("mosswarden", "emberwyrm", "dusk-prowler", "frost-titan", "cloud-sovereign", "bloodmoon-regent", "astral-sovereign", "void-devourer", "primordial-dragon", "relic-sovereign")) {
            Cosmetic reward = BossLoot.reward(boss, "hard");
            assertEquals(reward, game.fight(owner, command("set-" + boss, boss, "hard")).reward());
            for (String presentation : List.of("male", "female")) {
                var appearance = new LinkedHashMap<>(before.character().appearance());
                appearance.put("presentation", presentation);
                appearance.put("illustration", presentation.equals("male") ? "emerald-knight" : "moonblade");
                appearance.put("hair", presentation.equals("male") ? "m-spiky" : "f-bob");
                appearance.put("cosmeticOutfit", reward.id());
                mvc.perform(put("/api/game/character").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                                .content(json.writeValueAsString(Map.of("name", "Nori", "appearance", appearance))))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.snapshot.character.appearance.cosmeticOutfit").value(reward.id()))
                        .andExpect(jsonPath("$.snapshot.character.appearance.presentation").value(presentation));
                assertEquals(reward.id(), game.load(owner).character().appearance().get("cosmeticOutfit"));
            }
        }
        Snapshot saved = game.load(owner);
        assertEquals(List.of("verdant-warden", "cinder-forged", "twilight-stalker", "glacier-guard", "cloud-regalia", "regent-regalia", "astral-regalia", "voidbound-regalia", "prismatic-scale", "sovereign-regalia"), saved.bossProgress().unlockedCosmetics());
        assertEquals(before.character().totalXp(), saved.character().totalXp());
        assertEquals(before.character().attributes(), saved.character().attributes());
        assertEquals(before.activities(), saved.activities());
        assertEquals(saved, game.export(owner).get("snapshot"));
        assertTrue(game.load(other).bossProgress().unlockedCosmetics().isEmpty());
    }
    @Test void earnedFamiliesSurvivePresentationSwitchAndRetriesWhileWrongPresentationModulesAreRejected() throws Exception {
        Snapshot initial = level(owner, 20);
        FightResult hair = game.fight(owner, command("family-hair", "mosswarden", "normal"));
        FightResult outfit = game.fight(owner, command("family-outfit", "mosswarden", "hard"));
        assertEquals("moss-crown", hair.reward().id());
        assertEquals("verdant-warden", outfit.reward().id());
        assertEquals(Map.of("male", "forest-scout", "female", "sky-ranger"), outfit.reward().modules());
        var families = List.of("moss-crown", "verdant-warden");
        for (String presentation : List.of("female", "male", "female")) {
            var appearance = new LinkedHashMap<>(initial.character().appearance());
            appearance.put("presentation", presentation);
            appearance.put("illustration", presentation.equals("female") ? "moonblade" : "emerald-knight");
            appearance.put("hair", presentation.equals("female") ? "f-bob" : "m-spiky");
            appearance.put("cosmeticHair", hair.reward().id());
            appearance.put("cosmeticOutfit", outfit.reward().id());
            mvc.perform(put("/api/game/character").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                            .content(json.writeValueAsString(Map.of("name", "Nori", "appearance", appearance))))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.snapshot.character.appearance.presentation").value(presentation))
                    .andExpect(jsonPath("$.snapshot.character.appearance.cosmeticOutfit").value("verdant-warden"));
            Snapshot saved = game.load(owner);
            assertEquals(families, saved.bossProgress().unlockedCosmetics());
            assertEquals(initial.character().totalXp(), saved.character().totalXp());
            assertEquals(initial.skills(), saved.skills());
            assertEquals(saved, game.export(owner).get("snapshot"));
            FightResult retry = game.fight(owner, command("family-outfit", "mosswarden", "hard"));
            assertTrue(retry.duplicate()); assertEquals(outfit.reward(), retry.reward());
            assertEquals(presentation, retry.snapshot().character().appearance().get("presentation"));
            assertEquals(families, retry.snapshot().bossProgress().unlockedCosmetics());
            // Opposite-presentation modules and caller-selected variants cannot override the owned family.
            for (String slot : List.of("illustration", "illustratedHair", "outfitSet", "cosmeticVariant", "moduleId")) {
                var forged = new LinkedHashMap<>(appearance);
                forged.put(slot, presentation.equals("female") ? "forest-scout" : "sky-ranger");
                mvc.perform(put("/api/game/character").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                                .content(json.writeValueAsString(Map.of("name", "Nori", "appearance", forged))))
                        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
            }
            var forgedId = new LinkedHashMap<>(appearance);
            forgedId.put("cosmeticOutfit", "verdant-warden:" + presentation);
            mvc.perform(put("/api/game/character").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                            .content(json.writeValueAsString(Map.of("name", "Nori", "appearance", forgedId))))
                    .andExpect(status().isBadRequest());
            assertEquals(saved, game.load(owner));
        }
        assertEquals(2, ((List<?>) game.export(owner).get("bossEncounters")).size());
        assertTrue(game.load(other).bossProgress().unlockedCosmetics().isEmpty());
    }

    @Test void storyDiscoveryCannotBeBypassedByLevelOrDirectRequestsAndHardWinsRevealTheNextBoss() throws Exception {
        level(owner, 100);
        mvc.perform(post("/api/game/bosses/cloud-sovereign/fight").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"requestId\":\"skip\",\"difficulty\":\"normal\",\"tactic\":\"balanced\"}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("BOSS_NOT_DISCOVERED"));
        assertEquals(0, jdbc.queryForObject("select count(*) from game_boss_requests", Integer.class));
        assertFalse(BossRules.discovered(game.load(owner), "emberwyrm"));
        assertTrue(game.fight(owner, command("hard-clear", "mosswarden", "hard")).firstClear());
        assertTrue(BossRules.discovered(game.load(owner), "emberwyrm"));
        assertFalse(BossRules.discovered(game.load(owner), "astral-sovereign"));
        assertEquals("victory", game.fight(owner, command("next", "emberwyrm", "normal")).replay().outcome());
        assertTrue(BossRules.discovered(game.load(owner), "dusk-prowler"));
        assertFalse(BossRules.discovered(game.load(owner), "astral-sovereign"));
        assertNotNull(game.fight(owner, command("earlier-mode", "mosswarden", "ultimate")).replay());
    }

    @Test void losingTheFinaleRecordsTheFightWithoutGrantingAnyClearOrCosmetic() {
        level(owner, 50);
        for (String earlier : List.of("mosswarden", "emberwyrm", "dusk-prowler", "frost-titan"))
            assertEquals("victory", game.fight(owner, command(earlier, earlier, "normal")).replay().outcome());
        Snapshot before = game.load(owner);
        FightResult defeat = game.fight(owner, command("finale", "cloud-sovereign", "normal"));
        assertEquals("defeat", defeat.replay().outcome());
        assertFalse(defeat.firstClear()); assertNull(defeat.reward());
        assertEquals(before.bossProgress(), defeat.snapshot().bossProgress());
        assertEquals(before.character().totalXp(), defeat.snapshot().character().totalXp());
        assertEquals(5, ((List<?>) game.export(owner).get("bossEncounters")).size());
    }

    @Test void sparseHistoricalClearsPreserveOwnershipWithoutSkippingTheStoryChain() {
        Snapshot s = level(owner, 100);
        Snapshot sparse = new Snapshot(s.dayKey(), s.character(), s.skills(), s.quests(), s.boss(), s.activities(), s.unlockedAuras(), s.momentum(),
                new BossProgress(List.of("cloud-sovereign:ultimate", "astral-sovereign:hard", "mosswarden:invented"), List.of("solar-corona")));
        assertTrue(BossRules.discovered(sparse, "mosswarden"));
        assertFalse(BossRules.discovered(sparse, "emberwyrm"));
        assertFalse(BossRules.discovered(sparse, "cloud-sovereign"));
        Snapshot opened = new Snapshot(s.dayKey(), s.character(), s.skills(), s.quests(), s.boss(), s.activities(), s.unlockedAuras(), s.momentum(),
                new BossProgress(List.of("mosswarden:epic", "emberwyrm:hard", "astral-sovereign:hard", "cloud-sovereign:ultimate"), sparse.bossProgress().unlockedCosmetics()));
        assertTrue(BossRules.discovered(opened, "dusk-prowler"));
        assertFalse(BossRules.discovered(opened, "frost-titan"));
        assertFalse(BossRules.discovered(opened, "cloud-sovereign"));
        assertEquals(List.of("solar-corona"), opened.bossProgress().unlockedCosmetics());
    }
    @Test void legacyLevelThirtyAstralClearAndRetryStayOwnedWhileNewFightsRespectTheNewChainAndLevel() {
        Snapshot initial = level(owner, 30);
        var oldClears = List.of("mosswarden:normal", "emberwyrm:normal", "astral-sovereign:normal", "frost-titan:normal", "cloud-sovereign:normal");
        var oldLoot = List.of("moss-crown", "ember-crown", "astral-crown", "frost-crown", "cloud-crown");
        Snapshot historical = new Snapshot(initial.dayKey(), initial.character(), initial.skills(), initial.quests(), initial.boss(),
                initial.activities(), initial.unlockedAuras(), initial.momentum(), new BossProgress(oldClears, oldLoot));
        jdbc.update("update game_states set snapshot_json = ? where account_id = ?", json.writeValueAsString(historical), owner);
        // Persisted replays are historical records, not inputs to today's resolver.
        Replay historicalReplay = new Replay("boss", "normal", "balanced",
                new Hero(initial.character().id(), initial.character().name(), BossRules.heroStats(initial)),
                new Enemy("astral-sovereign", "Der Sternensouverän", new Stats(30, 480, 62, 17)), new Initial(545, 480),
                List.of(new Turn(0, 1, "hero", "focused-strike", "Fokusschlag", 480, 0, true, 200, 0, "defeated", null)),
                "victory", 1, new NoXpReward(0, List.of()));
        Resolution saved = new Resolution(historicalReplay, true, BossLoot.reward("astral-sovereign", "normal"));
        jdbc.update("insert into game_boss_requests(account_id, request_id, boss_id, difficulty, tactic, result_json) values (?, ?, ?, ?, ?, ?)",
                owner, "legacy-astral", "astral-sovereign", "normal", "balanced", json.writeValueAsString(saved));
        assertEquals(historical, game.load(owner));
        assertFalse(BossRules.discovered(game.load(owner), "frost-titan"));
        var appearance = new LinkedHashMap<>(historical.character().appearance());
        appearance.put("cosmeticHair", "astral-crown");
        assertEquals("astral-crown", game.updateCharacter(owner, new Profile("Nori", appearance)).snapshot().character().appearance().get("cosmeticHair"));
        FightResult retry = game.fight(owner, command("legacy-astral", "astral-sovereign", "normal"));
        assertTrue(retry.duplicate()); assertEquals(historicalReplay, retry.replay());
        assertEquals(oldLoot, retry.snapshot().bossProgress().unlockedCosmetics());
        assertEquals("BOSS_NOT_DISCOVERED", assertThrows(ApiException.class,
                () -> game.fight(owner, command("new-astral", "astral-sovereign", "normal"))).code());
        assertEquals("dusk-crown", game.fight(owner, command("new-panther", "dusk-prowler", "normal")).reward().id());
        assertFalse(BossRules.discovered(game.load(owner), "astral-sovereign"));
        assertTrue(BossRules.discovered(game.load(owner), "bloodmoon-regent"));
        assertEquals("BOSS_LEVEL_LOCKED", assertThrows(ApiException.class,
                () -> game.fight(owner, command("new-regent", "bloodmoon-regent", "normal"))).code());
        level(owner, 60);
        assertEquals("bloodmoon-crown", game.fight(owner, command("new-regent", "bloodmoon-regent", "normal")).reward().id());
        assertTrue(BossRules.discovered(game.load(owner), "astral-sovereign"));
        assertEquals("BOSS_LEVEL_LOCKED", assertThrows(ApiException.class,
                () -> game.fight(owner, command("new-astral", "astral-sovereign", "normal"))).code());
        level(owner, 70);
        FightResult newBattle = game.fight(owner, command("new-astral", "astral-sovereign", "normal"));
        assertEquals("victory", newBattle.replay().outcome()); assertFalse(newBattle.firstClear()); assertNull(newBattle.reward());
        assertEquals(7, newBattle.snapshot().bossProgress().unlockedCosmetics().size());
        assertTrue(newBattle.snapshot().bossProgress().clearedEncounterIds().containsAll(oldClears));
        assertEquals(4, ((List<?>) game.export(owner).get("bossEncounters")).size());
    }

    @Test void rejectedFightDoesNotClearOrGrantLootAndExistingSnapshotsUpgradeSafely() {
        level(owner, 14);
        assertThrows(ApiException.class, () -> game.fight(owner, command("locked", "mosswarden", "hard")));
        assertTrue(game.load(owner).bossProgress().clearedEncounterIds().isEmpty());
        assertTrue(game.load(owner).bossProgress().unlockedCosmetics().isEmpty());
        assertEquals(0, jdbc.queryForObject("select count(*) from game_boss_requests", Integer.class));
        String old = json.writeValueAsString(game.load(other));
        var tree = (tools.jackson.databind.node.ObjectNode) json.readTree(old); tree.remove("bossProgress");
        jdbc.update("update game_states set snapshot_json = ? where account_id = ?", tree.toString(), other);
        assertTrue(game.load(other).bossProgress().unlockedCosmetics().isEmpty());
    }
}
