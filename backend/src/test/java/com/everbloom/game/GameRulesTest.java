package com.everbloom.game;

import com.everbloom.common.api.ApiException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import static com.everbloom.game.GameModels.*;
import static org.junit.jupiter.api.Assertions.*;

class GameRulesTest {
    private final JsonMapper json = JsonMapper.builder().build();
    private Snapshot fresh() { return GameRules.fresh(UUID.randomUUID(), LocalDate.of(2026, 10, 4)); }

    @Test void verifiedMembershipAddsOnlyCharacterActivityXpAndRespectsCapsAndRetries() {
        var command = new Command("plus", "calisthenics", 60);
        var result = GameRules.record(fresh(), command, 10);
        assertEquals(314, result.snapshot().character().totalXp()); // 240 activity + 50 quest + 24 Plus
        assertEquals(new Reward(240, 50, 480, 60, false, 24), result.reward());
        assertEquals(240, result.snapshot().skills().getFirst().totalXp());
        assertEquals(24, result.snapshot().activities().getFirst().membershipXp());
        assertEquals(0, GameRules.record(result.snapshot(), command, 10).reward().membershipXp());
        var capped = GameRules.record(result.snapshot(), new Command("cap", "calisthenics", 90), 10);
        assertEquals(12, capped.reward().membershipXp()); // Only 30 rewarded minutes remain.
        assertEquals(0, GameRules.record(capped.snapshot(), new Command("no-xp", "calisthenics", 10), 10).reward().membershipXp());
    }

    @Test void membershipThresholdUnlocksAuraInTheSameTransaction() {
        var s = fresh(); var c = s.character();
        var before = new Snapshot(s.dayKey(), new GameModels.Character(false, c.id(), c.name(), c.title(), 56989,
                c.attributes(), c.appearance()), s.skills(), List.of(), s.boss(), s.activities(), s.unlockedAuras(), s.momentum());
        var after = GameRules.record(before, new Command("cross", "reading", 5), 10);
        assertEquals(57000, after.snapshot().character().totalXp());
        assertEquals(List.of("aurora"), after.snapshot().unlockedAuras());
        assertEquals(10, after.reward().activityXp()); assertEquals(1, after.reward().membershipXp());
    }

    @Test void earlyAuraColorsCrossAtFiveAndTenAndCannotBeEquippedBeforeOwnership() {
        Snapshot initial = fresh();
        for (var boundary : List.of(Map.entry("rose", 6000), Map.entry("void", 18000))) {
            var c = initial.character();
            Snapshot before = new Snapshot(initial.dayKey(), new GameModels.Character(false, c.id(), c.name(), c.title(), boundary.getValue() - 4,
                    c.attributes(), c.appearance()), initial.skills(), List.of(), initial.boss(), initial.activities(), List.of(), initial.momentum());
            var appearance = new java.util.LinkedHashMap<>(c.appearance()); appearance.put("aura", boundary.getKey());
            assertEquals("AURA_LOCKED", assertThrows(ApiException.class, () -> GameRules.profile(before, new Profile("Ari", appearance))).code());
            var command = new Command("early-" + boundary.getKey(), "calisthenics", 1);
            var earned = GameRules.record(before, command);
            assertEquals(boundary.getValue().longValue(), earned.snapshot().character().totalXp());
            assertEquals(List.of(boundary.getKey()), earned.snapshot().unlockedAuras());
            assertEquals(boundary.getKey(), GameRules.profile(earned.snapshot(), new Profile("Ari", appearance)).character().appearance().get("aura"));
            assertTrue(GameRules.record(earned.snapshot(), command).reward().duplicate());
            assertEquals(earned.snapshot(), GameRules.record(earned.snapshot(), command).snapshot());
        }
    }

    @Test void existingEarlyAuraAccessIsRestoredOnceWithoutXpOrActivityRewards() {
        Snapshot initial = fresh(); var c = initial.character();
        for (String aura : List.of("rose", "void")) {
            var appearance = new java.util.LinkedHashMap<>(c.appearance()); appearance.put("aura", aura);
            Snapshot legacy = new Snapshot(initial.dayKey(), new GameModels.Character(true, c.id(), c.name(), c.title(), 0, c.attributes(), appearance),
                    initial.skills(), initial.quests(), initial.boss(), initial.activities(), List.of(), initial.momentum());
            Snapshot restored = GameRules.advance(legacy, LocalDate.parse(legacy.dayKey()));
            assertEquals(List.of(aura), restored.unlockedAuras());
            assertEquals(legacy.character(), restored.character()); assertEquals(legacy.activities(), restored.activities());
            assertEquals(legacy.quests(), restored.quests()); assertEquals(legacy.bossProgress(), restored.bossProgress());
            assertSame(restored, GameRules.advance(restored, LocalDate.parse(legacy.dayKey())));
        }
        Snapshot veteran = new Snapshot(initial.dayKey(), new GameModels.Character(true, c.id(), c.name(), c.title(), 195000, c.attributes(), c.appearance()),
                initial.skills(), initial.quests(), initial.boss(), initial.activities(), List.of(), initial.momentum());
        Snapshot restored = GameRules.advance(veteran, LocalDate.parse(veteran.dayKey()));
        assertEquals(List.of("rose", "void"), restored.unlockedAuras());
        assertEquals(195000, restored.character().totalXp());
        assertFalse(restored.unlockedAuras().contains("starlight"));
        assertSame(restored, GameRules.advance(restored, LocalDate.parse(restored.dayKey())));
    }

    @Test
    void matchesTransactionsProducedByTheActualTypescriptRules() throws Exception {
        try (var source = getClass().getResourceAsStream("/game-parity-fixtures.json")) {
            assertNotNull(source);
            JsonNode fixtures = json.readTree(source);
            assertTrue(fixtures.size() >= 7);
            for (JsonNode fixture : fixtures) {
                Snapshot before = json.treeToValue(fixture.get("before"), Snapshot.class);
                Command command = json.treeToValue(fixture.get("command"), Command.class);
                ActivityResult actual = GameRules.record(before, command);
                assertEquals(json.treeToValue(fixture.get("snapshot"), Snapshot.class), actual.snapshot(), fixture.get("name").asText());
                assertEquals(json.treeToValue(fixture.get("reward"), Reward.class), actual.reward(), fixture.get("name").asText());
            }
        }
    }

    @Test
    void freshAccountsNeverInheritDemoXpStatsOrRewards() {
        Snapshot state = fresh();
        assertEquals(0, state.character().totalXp());
        assertTrue(state.skills().stream().allMatch(skill -> skill.totalXp() == 0));
        assertEquals(14, state.skills().size());
        assertTrue(state.character().attributes().values().stream().allMatch(value -> value == 1));
        assertEquals(2400, state.boss().hp());
        assertEquals(0, state.momentum().value());
        assertNull(state.momentum().lastRewardDay());
        assertFalse(state.character().createdByPlayer());
        assertTrue(state.unlockedAuras().isEmpty());
    }

    @Test
    void crossesTheLevelTwentyAuraThresholdUsingQuestBonusOnlyOnce() {
        Snapshot fresh = fresh();
        var c = fresh.character();
        Snapshot before = new Snapshot(fresh.dayKey(), new GameModels.Character(false, c.id(), c.name(), c.title(), 56946,
                c.attributes(), c.appearance()), fresh.skills(),
                List.of(new Quest("q-move", "Quest", "Quest", "calisthenics", 20, 19, 50, false)), fresh.boss(),
                fresh.activities(), fresh.unlockedAuras(), fresh.momentum());
        Snapshot after = GameRules.record(before, new Command("level", "calisthenics", 1)).snapshot();
        assertEquals(57000, after.character().totalXp());
        assertEquals(List.of("aurora"), after.unlockedAuras());
        assertEquals(List.of("aurora"), GameRules.record(after, new Command("later", "calisthenics", 1)).snapshot().unlockedAuras());
    }

    @Test
    void advancePreservesHistoryAndRewardsButResetsDailyQuestsAndMondayBoss() {
        Snapshot state = GameRules.record(fresh(), new Command("sunday", "calisthenics", 60)).snapshot();
        assertSame(state, GameRules.advance(state, LocalDate.of(2026, 10, 4)),
                "Loading the same server day must preserve the existing board and journal without rebuilding them");
        Snapshot monday = GameRules.advance(state, LocalDate.of(2026, 10, 5));
        assertEquals(290, monday.character().totalXp());
        assertEquals(state.activities(), monday.activities());
        assertEquals(2400, monday.boss().hp());
        assertTrue(monday.quests().stream().noneMatch(Quest::claimed));
        assertEquals(0, monday.quests().getFirst().progressMinutes());
        assertEquals(5, monday.momentum().value());
        assertEquals("05. – 11. Oktober", monday.boss().weekLabel());
        assertThrows(ApiException.class, () -> GameRules.advance(monday, LocalDate.of(2026, 10, 4)));
    }

    @Test
    void formatsWeeksAcrossMonthsAndYearsLikeTheClient() {
        assertEquals("28. September – 04. Oktober", GameRules.weekLabel(LocalDate.of(2026, 10, 4)));
        assertEquals("28. Dezember 2026 – 03. Januar 2027", GameRules.weekLabel(LocalDate.of(2027, 1, 1)));
    }

    @Test
    void validatesStrictTypesOwnershipFieldsAndAppearanceModules() {
        assertThrows(ApiException.class, () -> GameValidation.activity(json.readTree("{\"requestId\":\"x\",\"skillId\":\"running\",\"minutes\":1.5}")));
        assertThrows(ApiException.class, () -> GameValidation.activity(json.readTree("{\"requestId\":\"x\",\"skillId\":\"running\",\"minutes\":10,\"accountId\":\"other\"}")));
        var profile = json.createObjectNode().put("name", "  Líora  ");
        var appearance = json.valueToTree(fresh().character().appearance());
        profile.set("appearance", appearance);
        assertEquals("Líora", GameValidation.profile(profile).name());
        ((tools.jackson.databind.node.ObjectNode) appearance).put("illustratedHair", "moonblade");
        assertThrows(ApiException.class, () -> GameValidation.profile(profile));
        ((tools.jackson.databind.node.ObjectNode) appearance).put("illustratedHair", "forest-scout");
        ((tools.jackson.databind.node.ObjectNode) appearance).put("eyeColor", "#ffffff");
        assertThrows(ApiException.class, () -> GameValidation.profile(profile));
    }
}
