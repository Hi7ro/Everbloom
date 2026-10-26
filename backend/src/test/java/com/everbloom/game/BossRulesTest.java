package com.everbloom.game;

import org.junit.jupiter.api.Test;
import java.util.List;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import static com.everbloom.game.BossModels.*;
import static com.everbloom.game.GameModels.*;
import static org.junit.jupiter.api.Assertions.*;

class BossRulesTest {
    private final JsonMapper json = JsonMapper.builder().build();
    @Test void onlyTheFirstFiveNormalEncountersAreFreeRegardlessOfPlayerLevel() {
        assertEquals(50, BossRules.FREE_BOSS_MAX_LEVEL);
        List<String> free = List.of("mosswarden", "emberwyrm", "dusk-prowler", "frost-titan", "cloud-sovereign");
        assertEquals(free, BossRules.BOSSES.stream().filter(boss -> !BossRules.requiresPlus(boss.id(), "normal")).map(BossRules.Definition::id).toList());
        for (var boss : BossRules.BOSSES)
            for (String mode : List.of("normal", "hard", "epic", "ultimate"))
                assertEquals(!mode.equals("normal") || !free.contains(boss.id()), BossRules.requiresPlus(boss.id(), mode), boss.id() + ":" + mode);
        assertEquals(55, BossRules.bossStats("cloud-sovereign", "normal").level());
        assertFalse(BossRules.requiresPlus("cloud-sovereign", "normal"));
        assertTrue(BossRules.requiresPlus("bloodmoon-regent", "normal"));
        assertThrows(com.everbloom.common.api.ApiException.class, () -> BossRules.requiresPlus("invented", "normal"));
        assertThrows(com.everbloom.common.api.ApiException.class, () -> BossRules.requiresPlus("mosswarden", "invented"));
    }
    @Test void matchesAllFortyTypescriptEncountersWithThreeTacticsExactly() throws Exception {
        try (var source = getClass().getResourceAsStream("/boss-parity-fixtures.json")) {
            assertNotNull(source);
            JsonNode fixtures = json.readTree(source);
            assertEquals(372, fixtures.size());
            for (JsonNode fixture : fixtures) {
                Snapshot snapshot = json.treeToValue(fixture.get("snapshot"), Snapshot.class);
                JsonNode options = fixture.get("options");
                FightCommand command = new FightCommand("parity", options.get("bossId").asText(), options.get("difficulty").asText(), options.get("tactic").asText());
                JsonNode actual = json.valueToTree(BossRules.fight(snapshot, command));
                assertEquals(fixture.get("expected"), actual, fixture.get("name").asText());
            }
        }
    }
    @Test void cosmeticWireContractsMatchTheClientCatalogExactly() throws Exception {
        try (var source = getClass().getResourceAsStream("/boss-cosmetic-fixtures.json")) {
            assertNotNull(source);
            assertEquals(json.readTree(source), json.valueToTree(BossLoot.COSMETICS));
        }
    }
    @Test void everyEquipmentFamilySuppliesTwoDistinctValidPresentationModulesWithoutSplittingItsOwnershipId() {
        Snapshot fresh = GameRules.fresh(java.util.UUID.randomUUID(), java.time.LocalDate.of(2026, 10, 5));
        var styles = BossLoot.COSMETICS.stream().filter(item -> !item.slot().equals("aura")).toList();
        assertEquals(20, styles.size());
        for (Cosmetic family : styles) {
            assertEquals(java.util.Set.of("male", "female"), family.modules().keySet());
            assertNotEquals(family.modules().get("male"), family.modules().get("female"));
            for (String presentation : List.of("male", "female")) {
                var appearance = new java.util.LinkedHashMap<>(fresh.character().appearance());
                appearance.put("presentation", presentation);
                appearance.put("hair", presentation.equals("male") ? "m-spiky" : "f-bob");
                appearance.put("illustration", family.modules().get(presentation));
                appearance.put(family.slot().equals("hair") ? "cosmeticHair" : "cosmeticOutfit", family.id());
                Profile valid = GameValidation.profile(json.valueToTree(java.util.Map.of("name", "Nori", "appearance", appearance)));
                assertEquals(family.id(), valid.appearance().get(family.slot().equals("hair") ? "cosmeticHair" : "cosmeticOutfit"));
            }
        }
        assertTrue(BossLoot.COSMETICS.stream().filter(item -> item.slot().equals("aura")).allMatch(item -> item.modules() == null));
    }

    @Test void minimumLevelsMatchThePlayerFacingUnlockContract() {
        assertEquals(10, BossRules.minimumLevel("mosswarden", "normal"));
        assertEquals(15, BossRules.minimumLevel("mosswarden", "hard"));
        assertEquals(25, BossRules.minimumLevel("mosswarden", "epic"));
        assertEquals(40, BossRules.minimumLevel("mosswarden", "ultimate"));
        assertEquals(50, BossRules.minimumLevel("emberwyrm", "ultimate"));
        assertEquals(60, BossRules.minimumLevel("dusk-prowler", "ultimate"));
        assertEquals(60, BossRules.minimumLevel("bloodmoon-regent", "normal"));
        assertEquals(65, BossRules.minimumLevel("bloodmoon-regent", "hard"));
        assertEquals(75, BossRules.minimumLevel("bloodmoon-regent", "epic"));
        assertEquals(90, BossRules.minimumLevel("bloodmoon-regent", "ultimate"));
        assertEquals(70, BossRules.minimumLevel("astral-sovereign", "normal"));
        assertEquals(75, BossRules.minimumLevel("astral-sovereign", "hard"));
        assertEquals(85, BossRules.minimumLevel("astral-sovereign", "epic"));
        assertEquals(100, BossRules.minimumLevel("astral-sovereign", "ultimate"));
        assertEquals(70, BossRules.minimumLevel("frost-titan", "ultimate"));
        assertEquals(80, BossRules.minimumLevel("cloud-sovereign", "ultimate"));
        assertEquals(110, BossRules.minimumLevel("void-devourer", "ultimate"));
        assertEquals(120, BossRules.minimumLevel("primordial-dragon", "ultimate"));
        assertEquals(130, BossRules.minimumLevel("relic-sovereign", "ultimate"));
    }
    @Test void tenEpicVariantsUseSixPaintedSilhouettesPerPresentationWithStableOwnershipIds() {
        var outfits = BossLoot.COSMETICS.stream().filter(item -> item.slot().equals("outfit")).toList();
        assertEquals(List.of("verdant-warden", "cinder-forged", "twilight-stalker", "glacier-guard", "cloud-regalia", "regent-regalia", "astral-regalia", "voidbound-regalia", "prismatic-scale", "sovereign-regalia"),
                outfits.stream().map(Cosmetic::id).toList());
        assertEquals(List.of("forest-scout", "abyss-walker", "emerald-knight", "urban-ranger", "ember-striker", "frost-scholar", "frost-scholar", "abyss-walker", "emerald-knight", "frost-scholar"),
                outfits.stream().map(item -> item.modules().get("male")).toList());
        assertEquals(List.of("sky-ranger", "moonblade", "void-sorceress", "rose-runner", "dawn-priestess", "dawn-priestess", "starweaver", "void-sorceress", "moonblade", "dawn-priestess"),
                outfits.stream().map(item -> item.modules().get("female")).toList());
        assertEquals(10L, outfits.stream().map(Cosmetic::tint).distinct().count());
        for (String presentation : List.of("male", "female"))
            assertEquals(6L, outfits.stream().map(item -> item.modules().get(presentation)).distinct().count());
        assertTrue(outfits.stream().allMatch(item -> item.difficulty().equals("hard") && item.rarity().equals("epic")));
        assertEquals("Nordlicht-Expeditionsset", BossLoot.reward("frost-titan", "hard").name());
    }
}
