package com.everbloom.game;

import com.everbloom.auth.EverbloomAuthentication;
import com.everbloom.common.api.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
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
import static com.everbloom.game.GameModels.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GameControllerTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired GameService game;
    @Autowired ObjectMapper json;
    @MockitoBean(name = "gameClock") Clock clock;
    private UUID owner;
    private UUID other;

    @BeforeEach void setup() {
        jdbc.update("delete from accounts");
        when(clock.instant()).thenReturn(Instant.parse("2026-10-04T10:00:00Z"));
        owner = account("player@example.test", true);
        other = account("other@example.test", true);
    }

    private UUID account(String email, boolean verified) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into accounts(id,email,password_hash,email_verified_at,session_version) values(?,?,?, ?,0)",
                id, email, "unused-test-hash", verified ? java.time.OffsetDateTime.now() : null);
        return id;
    }
    private EverbloomAuthentication auth(UUID id) { return new EverbloomAuthentication(id, "player@example.test"); }
    private String command(String id, int minutes) { return "{\"requestId\":\"" + id + "\",\"skillId\":\"calisthenics\",\"minutes\":" + minutes + "}"; }

    @Test void oldEquippedEarlyAurasAndLevelRightsPersistWithoutCreatingRewardsOrJournalEntries() {
        Snapshot initial = game.load(owner);
        var appearance = new java.util.LinkedHashMap<>(initial.character().appearance());
        appearance.put("aura", "void");
        Snapshot old = new Snapshot(initial.dayKey(), new GameModels.Character(true, initial.character().id(), "Legacy", initial.character().title(),
                6000, initial.character().attributes(), appearance), initial.skills(), initial.quests(), initial.boss(), initial.activities(),
                List.of(), initial.momentum(), initial.bossProgress());
        jdbc.update("update game_states set snapshot_json = ? where account_id = ?", json.writeValueAsString(old), owner);
        Snapshot upgraded = game.load(owner);
        assertEquals(List.of("rose", "void"), upgraded.unlockedAuras());
        assertEquals(old.character(), upgraded.character());
        assertEquals(old.skills(), upgraded.skills());
        assertEquals(old.quests(), upgraded.quests());
        assertEquals(old.bossProgress(), upgraded.bossProgress());
        assertEquals(old.activities(), upgraded.activities());
        assertEquals(upgraded, game.load(owner));
        assertEquals(upgraded, json.readValue(jdbc.queryForObject("select snapshot_json from game_states where account_id = ?", String.class, owner), Snapshot.class));
        assertEquals(upgraded, game.export(owner).get("snapshot"));
        assertEquals(0, jdbc.queryForObject("select count(*) from game_boss_requests where account_id = ?", Integer.class, owner));
        assertTrue(game.load(other).unlockedAuras().isEmpty());
    }

    @Test void defaultBillingPreviewKeepsBetaAccessWithoutClaimingPurchasedRights() throws Exception {
        mvc.perform(get("/api/billing/membership").with(authentication(auth(owner))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.mode").value("preview"))
                .andExpect(jsonPath("$.active").value(false)).andExpect(jsonPath("$.characterXpBonusPercent").value(0))
                .andExpect(jsonPath("$.advancedBosses").value(true)).andExpect(jsonPath("$.purchaseConfig").isEmpty());
        mvc.perform(post("/api/billing/refresh").with(authentication(auth(owner))).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.mode").value("preview"));
        assertEquals(0, jdbc.queryForObject("select count(*) from billing_memberships", Integer.class));
    }

    @Test void requiresAuthenticatedVerifiedSessionAndCsrf() throws Exception {
        mvc.perform(get("/api/game")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/game/activities").with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content(command("x", 20)))
                .andExpect(status().isForbidden());
        UUID unverified = account("unverified@example.test", false);
        mvc.perform(get("/api/game").with(authentication(auth(unverified)))).andExpect(status().isUnauthorized());
        assertEquals(0, jdbc.queryForObject("select count(*) from game_states", Integer.class));
    }

    @Test void initializesOwnGameOnceAndRejectsOwnerOrRewardInjection() throws Exception {
        mvc.perform(get("/api/game?accountId=" + other).with(authentication(auth(owner))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.character.id").value(owner.toString()))
                .andExpect(jsonPath("$.character.totalXp").value(0)).andExpect(jsonPath("$.boss.hp").value(2400))
                .andExpect(jsonPath("$.character.createdByPlayer").value(false));
        mvc.perform(post("/api/game/activities").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"requestId\":\"inject\",\"skillId\":\"running\",\"minutes\":10,\"accountId\":\"" + other + "\",\"xp\":999999}"))
                .andExpect(status().isBadRequest());
        game.load(owner);
        assertEquals(1, jdbc.queryForObject("select count(*) from game_states", Integer.class));
        assertEquals(0, game.load(other).character().totalXp());
    }

    @Test void capsRewardsAndRetainsIdempotencyAcrossReloadAndNewDay() throws Exception {
        mvc.perform(post("/api/game/activities").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content(command("first", 60)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.reward.activityXp").value(240))
                .andExpect(jsonPath("$.reward.questXp").value(50)).andExpect(jsonPath("$.snapshot.character.totalXp").value(290));
        ActivityResult capped = game.record(owner, new Command("capped", "calisthenics", 60));
        assertEquals(120, capped.reward().activityXp());
        assertEquals(0, capped.reward().questXp());
        assertEquals(410, game.load(owner).character().totalXp());
        when(clock.instant()).thenReturn(Instant.parse("2026-10-05T10:00:00Z"));
        ActivityResult retry = game.record(owner, new Command("first", "calisthenics", 60));
        assertTrue(retry.reward().duplicate());
        assertEquals(0, retry.reward().activityXp());
        assertEquals(410, retry.snapshot().character().totalXp());
        assertEquals(2400, retry.snapshot().boss().hp());
        mvc.perform(post("/api/game/activities").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content(command("first", 61)))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("REQUEST_CONFLICT"));
        assertEquals(2, game.load(owner).activities().size());
        assertEquals(0, game.load(other).character().totalXp());
        // Request IDs are scoped to their account; another player can use the same ID.
        assertFalse(game.record(other, new Command("first", "calisthenics", 60)).reward().duplicate());
        assertEquals(290, game.load(other).character().totalXp());
        assertEquals(410, game.load(owner).character().totalXp());
    }

    @Test void savesAppearanceAndJourneyWithoutAcceptingLockedAurasOrChangingProgress() throws Exception {
        Snapshot initial = game.load(owner);
        var appearance = new java.util.LinkedHashMap<>(initial.character().appearance());
        appearance.put("illustratedHair", "forest-scout");
        appearance.put("outfitSet", "abyss-walker");
        mvc.perform(put("/api/game/character").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("name", "Liora", "appearance", appearance))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.persisted").value(true))
                .andExpect(jsonPath("$.snapshot.character.name").value("Liora"));
        for (String aura : List.of("rose", "void", "starlight", "void-orbit", "leviathan", "dragon-oath", "primordial-wings", "relic-arsenal", "imperial-gate")) {
            appearance.put("aura", aura);
            mvc.perform(put("/api/game/character").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                            .content(json.writeValueAsString(Map.of("name", "Liora", "appearance", appearance))))
                    .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("AURA_LOCKED"));
        }
        mvc.perform(get("/api/game/journey").with(authentication(auth(owner))))
                .andExpect(status().isOk()).andExpect(content().string("null"));
        String journey = "{\"interestIds\":[\"mind\",\"knowledge\"],\"activeSkillIds\":[\"reading\",\"meditation\"],\"primaryInterestId\":\"mind\"}";
        mvc.perform(put("/api/game/journey").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content(journey))
                .andExpect(status().isOk()).andExpect(jsonPath("$.activeSkillIds[0]").value("reading"));
        assertEquals(List.of("reading", "meditation"), game.journey(owner).activeSkillIds());
        assertNull(game.journey(other));
        assertEquals("Liora", game.load(owner).character().name());
        assertEquals(0, game.load(owner).character().totalXp());
    }

    @Test void concurrentRetriesAwardExactlyOnceAndConcurrentInputsRespectCaps() throws Exception {
        try (var executor = Executors.newFixedThreadPool(8)) {
            CountDownLatch start = new CountDownLatch(1);
            List<Future<ActivityResult>> results = new ArrayList<>();
            for (int i = 0; i < 8; i++) results.add(executor.submit(() -> { start.await(); return game.record(owner, new Command("same", "calisthenics", 60)); }));
            start.countDown();
            int accepted = 0;
            for (Future<ActivityResult> result : results) if (!result.get(10, TimeUnit.SECONDS).reward().duplicate()) accepted++;
            assertEquals(1, accepted);
            assertEquals(290, game.load(owner).character().totalXp());
            List<Future<ActivityResult>> distinct = new ArrayList<>();
            for (int i = 0; i < 8; i++) {
                String id = "parallel-" + i;
                distinct.add(executor.submit(() -> game.record(owner, new Command(id, "calisthenics", 60))));
            }
            int xp = 0;
            for (Future<ActivityResult> result : distinct) xp += result.get(10, TimeUnit.SECONDS).reward().activityXp();
            assertEquals(120, xp);
            assertEquals(410, game.load(owner).character().totalXp());
            assertEquals(9, game.load(owner).activities().size());
        }
    }

    @Test void bossDropSurvivesNewWeekAndCanBeEquippedAndExported() {
        for (String skill : List.of("calisthenics", "weightlifting", "running", "swimming", "boxing"))
            game.record(owner, new Command(skill, skill, 90));
        Snapshot won = game.load(owner);
        assertEquals(0, won.boss().hp());
        assertEquals(List.of("moss-spirit"), won.unlockedAuras());
        var appearance = new java.util.LinkedHashMap<>(won.character().appearance());
        appearance.put("aura", "moss-spirit");
        game.updateCharacter(owner, new Profile("Liora", appearance));
        when(clock.instant()).thenReturn(Instant.parse("2026-10-05T10:00:00Z"));
        Snapshot nextWeek = game.load(owner);
        assertEquals(2400, nextWeek.boss().hp());
        assertEquals("moss-spirit", nextWeek.character().appearance().get("aura"));
        assertEquals(nextWeek, game.export(owner).get("snapshot"));
        assertEquals(List.of("moss-spirit"), nextWeek.unlockedAuras());
        jdbc.update("delete from accounts where id = ?", owner);
        assertEquals(0, jdbc.queryForObject("select count(*) from game_states where account_id = ?", Integer.class, owner));
        assertEquals(0, jdbc.queryForObject("select count(*) from game_activity_requests where account_id = ?", Integer.class, owner));
    }

    @Test void viennaMidnightIsAuthoritativeAndClockRollbackCannotAddProgress() {
        when(clock.instant()).thenReturn(Instant.parse("2026-10-04T21:59:00Z"));
        assertEquals("2026-10-04", game.load(owner).dayKey());
        when(clock.instant()).thenReturn(Instant.parse("2026-10-04T22:01:00Z"));
        assertEquals("2026-10-05", game.record(owner, new Command("after-midnight", "meditation", 10)).snapshot().dayKey());
        when(clock.instant()).thenReturn(Instant.parse("2026-10-04T20:00:00Z"));
        assertThrows(ApiException.class, () -> game.record(owner, new Command("rollback", "meditation", 10)));
        assertEquals(1, jdbc.queryForObject("select count(*) from game_activity_requests where account_id = ?", Integer.class, owner));
    }

    @Test void firstOnboardingPersonalizesGoalsAndReloadKeepsTheSameBoard() throws Exception {
        Snapshot before = game.load(owner);
        Journey journey = new Journey(List.of("physical", "knowledge", "creative"), List.of("swimming", "reading", "music"), "physical");
        mvc.perform(put("/api/game/journey").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(journey)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.activeSkillIds[0]").value("swimming"));
        Snapshot planned = game.load(owner);
        assertEquals(List.of("swimming", "reading", "music"), planned.quests().stream().map(Quest::skillId).toList());
        assertEquals(List.of(15, 15, 10), planned.quests().stream().map(Quest::targetMinutes).toList());
        assertEquals(before.character(), planned.character());
        assertEquals(before.boss(), planned.boss());
        assertEquals(planned, game.load(owner));
        game.saveJourney(owner, journey);
        assertEquals(planned, game.load(owner));
        assertEquals(List.of(50, 30, 40), game.load(other).quests().stream().map(Quest::bonusXp).toList());
    }

    @Test void startedAndCompletedQuestsCannotBeRerolledForExtraXp() {
        Journey swimming = new Journey(List.of("physical"), List.of("swimming"), "physical");
        Journey reading = new Journey(List.of("knowledge"), List.of("reading"), "knowledge");
        game.saveJourney(owner, swimming);
        ActivityResult partial = game.record(owner, new Command("swim-part", "swimming", 5));
        assertEquals(0, partial.reward().questXp());
        game.saveJourney(owner, reading);
        assertEquals(partial.snapshot().quests(), game.load(owner).quests());
        assertEquals(reading, game.journey(owner));
        ActivityResult finished = game.record(owner, new Command("swim-finish", "swimming", 10));
        assertEquals(40, finished.reward().questXp());
        game.saveJourney(owner, swimming);
        game.saveJourney(owner, reading);
        assertEquals(finished.snapshot().quests(), game.load(owner).quests());
        ActivityResult read = game.record(owner, new Command("read-after-switch", "reading", 15));
        assertEquals(0, read.reward().questXp());
        assertEquals(115, read.snapshot().character().totalXp());
        assertTrue(read.snapshot().quests().getFirst().claimed());
    }

    @Test void levelUpKeepsTodaysBonusStableAndTheNextDayUsesTheNewLevel() throws Exception {
        Snapshot fresh = game.load(owner);
        GameModels.Character character = fresh.character();
        Snapshot almostLevelTen = new Snapshot(fresh.dayKey(),
                new GameModels.Character(character.createdByPlayer(), character.id(), character.name(), character.title(),
                        17995, character.attributes(), character.appearance()),
                fresh.skills(), fresh.quests(), fresh.boss(), fresh.activities(), fresh.unlockedAuras(), fresh.momentum(), fresh.bossProgress());
        jdbc.update("update game_states set snapshot_json = ? where account_id = ?", json.writeValueAsString(almostLevelTen), owner);
        Journey focus = new Journey(List.of("knowledge", "creative"), List.of("reading", "music"), "knowledge");
        game.saveJourney(owner, focus);
        List<Quest> initialBoard = game.load(owner).quests();
        assertEquals(List.of(55, 55), initialBoard.stream().map(Quest::bonusXp).toList());

        ActivityResult levelUp = game.record(owner, new Command("reading-level-up", "reading", 15));
        assertEquals(30, levelUp.reward().activityXp());
        assertEquals(55, levelUp.reward().questXp());
        assertEquals(60, levelUp.reward().damage());
        assertEquals(18080, levelUp.snapshot().character().totalXp());
        assertEquals(10, BossRules.level(levelUp.snapshot().character().totalXp()));
        game.saveJourney(owner, focus);
        assertEquals(levelUp.snapshot().quests(), game.load(owner).quests());
        ActivityResult music = game.record(owner, new Command("music-same-day", "music", 10));
        assertEquals(55, music.reward().questXp());
        assertEquals(List.of(55, 55), music.snapshot().quests().stream().map(Quest::bonusXp).toList());
        assertEquals(30, music.snapshot().skills().stream().filter(skill -> skill.skillId().equals("reading")).findFirst().orElseThrow().totalXp());
        assertEquals(20, music.snapshot().skills().stream().filter(skill -> skill.skillId().equals("music")).findFirst().orElseThrow().totalXp());
        assertEquals(0, game.record(owner, new Command("reading-level-up", "reading", 15)).reward().questXp());

        when(clock.instant()).thenReturn(Instant.parse("2026-10-05T10:00:00Z"));
        Snapshot tomorrow = game.load(owner);
        assertEquals(List.of(60, 60), tomorrow.quests().stream().map(Quest::bonusXp).toList());
        assertTrue(tomorrow.quests().stream().allMatch(quest -> !quest.claimed() && quest.progressMinutes() == 0));
        assertEquals(music.snapshot().character().totalXp(), tomorrow.character().totalXp());
        assertEquals(tomorrow.quests(), game.load(owner).quests());
        mvc.perform(get("/api/game").with(authentication(auth(owner))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.quests[0].bonusXp").value(60));
        ActivityResult nextReading = game.record(owner, new Command("reading-next-day", "reading", 15));
        assertEquals(30, nextReading.reward().activityXp());
        assertEquals(60, nextReading.reward().questXp());
        assertEquals(60, nextReading.reward().damage());
    }

    @Test void legacyBoardWithAnUnrelatedActivityIsFrozenUntilTheNextDay() {
        ActivityResult first = game.record(owner, new Command("not-a-legacy-quest", "music", 10));
        assertTrue(first.snapshot().quests().stream().allMatch(quest -> quest.progressMinutes() == 0 && !quest.claimed()));
        game.saveJourney(owner, new Journey(List.of("physical"), List.of("swimming"), "physical"));
        assertEquals(first.snapshot().quests(), game.load(owner).quests());
        when(clock.instant()).thenReturn(Instant.parse("2026-10-05T10:00:00Z"));
        Snapshot tomorrow = game.load(owner);
        assertEquals(List.of("swimming"), tomorrow.quests().stream().map(Quest::skillId).toList());
        assertEquals("daily:2026-10-05:swimming", tomorrow.quests().getFirst().id());
        assertEquals(20, tomorrow.character().totalXp());
        assertEquals(first.snapshot().activities(), tomorrow.activities());
    }

    @Test void nextDayUsesSavedFocusAndOldRequestRetriesCannotCompleteItsQuests() {
        game.saveJourney(owner, new Journey(List.of("physical"), List.of("swimming"), "physical"));
        game.record(owner, new Command("swim-yesterday", "swimming", 15));
        game.saveJourney(owner, new Journey(List.of("knowledge"), List.of("reading", "languages"), "knowledge"));
        game.record(owner, new Command("read-yesterday", "reading", 15));
        when(clock.instant()).thenReturn(Instant.parse("2026-10-04T22:01:00Z"));
        ActivityResult retry = game.record(owner, new Command("read-yesterday", "reading", 15));
        assertTrue(retry.reward().duplicate());
        assertEquals(0, retry.reward().questXp());
        assertEquals(0, retry.reward().activityXp());
        assertEquals("2026-10-05", retry.snapshot().dayKey());
        assertEquals(List.of("reading", "languages"), retry.snapshot().quests().stream().map(Quest::skillId).toList());
        assertTrue(retry.snapshot().quests().stream().allMatch(quest -> quest.progressMinutes() == 0 && !quest.claimed()));
        assertEquals(115, retry.snapshot().character().totalXp());
        ActivityResult fresh = game.record(owner, new Command("read-today", "reading", 15));
        assertEquals(30, fresh.reward().activityXp());
        assertEquals(40, fresh.reward().questXp());
        assertEquals(185, fresh.snapshot().character().totalXp());
    }

    @Test void questRewardsAndTargetsCannotBeInjectedThroughPreferences() throws Exception {
        String preferences = "{\"interestIds\":[\"physical\"],\"activeSkillIds\":[\"swimming\"],\"primaryInterestId\":\"physical\",\"bonusXp\":99999,\"targetMinutes\":1}";
        mvc.perform(put("/api/game/journey").with(csrf()).with(authentication(auth(owner))).contentType(MediaType.APPLICATION_JSON).content(preferences))
                .andExpect(status().isBadRequest());
        assertNull(game.journey(owner));
        assertEquals(0, game.load(owner).character().totalXp());
    }

    @Test void simultaneousFocusChangeAndActivityUseOneSerializedBoard() throws Exception {
        game.saveJourney(owner, new Journey(List.of("physical"), List.of("swimming"), "physical"));
        Journey reading = new Journey(List.of("knowledge"), List.of("reading"), "knowledge");
        try (var executor = Executors.newFixedThreadPool(2)) {
            CountDownLatch start = new CountDownLatch(1);
            Future<ActivityResult> activity = executor.submit(() -> {
                start.await();
                return game.record(owner, new Command("simultaneous", "swimming", 15));
            });
            Future<Journey> preferences = executor.submit(() -> {
                start.await();
                return game.saveJourney(owner, reading);
            });
            start.countDown();
            ActivityResult result = activity.get(10, TimeUnit.SECONDS);
            assertEquals(reading, preferences.get(10, TimeUnit.SECONDS));
            Snapshot snapshot = game.load(owner);
            assertTrue(result.reward().questXp() == 0 || result.reward().questXp() == 40);
            assertEquals(result.snapshot().quests(), snapshot.quests());
            assertEquals(45 + result.reward().questXp(), snapshot.character().totalXp());
            assertEquals(result.reward().questXp() == 40 ? "swimming" : "reading", snapshot.quests().getFirst().skillId());
            game.saveJourney(owner, new Journey(List.of("creative"), List.of("music"), "creative"));
            assertEquals(snapshot.quests(), game.load(owner).quests());
            assertEquals(0, game.record(owner, new Command("no-reroll-bonus", "music", 10)).reward().questXp());
        }
    }
}
