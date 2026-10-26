package com.everbloom.game;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import tools.jackson.databind.JsonNode;
import static com.everbloom.game.GameModels.*;

/** Reject unknown fields and invalid types before constructing commands. */
public final class GameValidation {
    private GameValidation() {}
    private static final Set<String> MALE = Set.of("emerald-knight", "urban-ranger", "frost-scholar", "ember-striker", "forest-scout", "abyss-walker");
    private static final Set<String> FEMALE = Set.of("moonblade", "starweaver", "dawn-priestess", "rose-runner", "void-sorceress", "sky-ranger");
    private static final Set<String> MALE_HAIR = Set.of("m-spiky", "m-undercut", "m-curtains", "m-messy", "m-swept", "m-topknot");
    private static final Set<String> FEMALE_HAIR = Set.of("f-bob", "f-long", "f-ponytail", "f-twin-tails", "f-braid", "f-pixie");
    private static final Set<String> INTERESTS = Set.of("physical", "combat", "mind", "knowledge", "creative", "career", "life");
    private static final Set<String> SKILLS = GameRules.SKILLS.stream().map(GameRules.SkillRule::id).collect(java.util.stream.Collectors.toUnmodifiableSet());
    private static final Set<String> REQUIRED_APPEARANCE = Set.of("presentation", "body", "hair", "outfit", "aura", "skinColor", "hairColor", "outfitColor");
    private static final Set<String> OPTIONAL_APPEARANCE = Set.of("artwork", "illustration", "illustratedHair", "outfitSet", "eyeColor", "skinTone", "hairTint", "cosmeticHair", "cosmeticOutfit");
    private static final Set<String> SKIN = Set.of("#f6dec8", "#e8c3a2", "#c48e69", "#996442", "#68442f", "#422b23");
    private static final Map<String, Set<String>> PALETTES = Map.of(
            "eyeColor", Set.of("#5f9e6e", "#5e92c7", "#9c78c2", "#c6963e", "#74533e", "#87959b"),
            "skinTone", SKIN,
            "hairTint", Set.of("#2d2627", "#5c4934", "#b9653f", "#d9b875", "#d5dbe0", "#9478bc"),
            "skinColor", SKIN,
            "hairColor", Set.of("#2d2627", "#5c4934", "#b99a67", "#b9a9cc", "#dfbfc3", "#d4dfd5"),
            "outfitColor", Set.of("#718967", "#e0b7c5", "#aab7cd", "#9279b0", "#4f5065", "#292f35"));

    public static BossModels.FightCommand fight(String bossId, JsonNode value) {
        exact(value, Set.of("requestId", "difficulty", "tactic"));
        String id = text(value, "requestId");
        if (id.isBlank() || id.length() > 128 || id.codePoints().anyMatch(code -> code < 32 || code == 127))
            throw GameRules.invalid("Ungültige Kampf-ID.");
        BossRules.definition(bossId);
        String difficulty = text(value, "difficulty"), tactic = text(value, "tactic");
        if (!BossRules.DIFFICULTIES.contains(difficulty) || !BossRules.TACTICS.contains(tactic))
            throw GameRules.invalid("Bitte einen verfügbaren Kampfmodus und eine Taktik wählen.");
        return new BossModels.FightCommand(id, bossId, difficulty, tactic);
    }

    public static Command activity(JsonNode value) {
        exact(value, Set.of("requestId", "skillId", "minutes"));
        String id = text(value, "requestId");
        if (id.isBlank() || id.length() > 128 || id.codePoints().anyMatch(code -> code < 32 || code == 127))
            throw GameRules.invalid("Ungültige Eintrags-ID.");
        String skill = text(value, "skillId");
        if (!SKILLS.contains(skill)) throw GameRules.invalid("Bitte einen verfügbaren Skill auswählen.");
        JsonNode minutes = value.get("minutes");
        if (!minutes.isIntegralNumber() || !minutes.canConvertToInt() || minutes.intValue() < 1 || minutes.intValue() > 180)
            throw GameRules.invalid("Bitte ganze Minuten zwischen 1 und 180 eintragen.");
        return new Command(id, skill, minutes.intValue());
    }

    public static Profile profile(JsonNode value) {
        exact(value, Set.of("name", "appearance"));
        String name = Normalizer.normalize(text(value, "name"), Normalizer.Form.NFC).strip().replaceAll(" +", " ");
        int length = name.codePointCount(0, name.length());
        if (length < 2 || length > 24 || !name.matches("[\\p{L}\\p{N}][\\p{L}\\p{M}\\p{N} '\u2019-]*"))
            throw GameRules.invalid("Dein Name braucht 2–24 Zeichen: Buchstaben, Zahlen, Leerzeichen, Bindestrich oder Apostroph.");
        JsonNode source = value.get("appearance");
        if (source == null || !source.isObject() || !source.propertyNames().containsAll(REQUIRED_APPEARANCE)
                || source.propertyNames().stream().anyMatch(key -> !REQUIRED_APPEARANCE.contains(key) && !OPTIONAL_APPEARANCE.contains(key)))
            throw GameRules.invalid("Bitte Name und Aussehen vollständig angeben.");
        String presentation = text(source, "presentation");
        if (!Set.of("male", "female").contains(presentation)) throw GameRules.invalid("Bitte eine verfügbare Charakterdarstellung wählen.");
        Map<String, String> appearance = new LinkedHashMap<>();
        for (String key : source.propertyNames()) appearance.put(key, text(source, key));
        if (appearance.containsKey("artwork") && !Set.of("original", "custom").contains(appearance.get("artwork")))
            throw GameRules.invalid("Bitte einen verfügbaren Look wählen.");
        appearance.put("artwork", "original");
        Set<String> modules = presentation.equals("male") ? MALE : FEMALE;
        for (String slot : List.of("illustration", "illustratedHair", "outfitSet"))
            if (appearance.containsKey(slot) && !modules.contains(appearance.get(slot)))
                throw GameRules.invalid("Bitte eine verfügbare Illustration, Frisur oder ein Outfitset für deine Charakterdarstellung wählen.");
        if (!Set.of("base", "compact", "broad").contains(appearance.get("body"))
                || !(presentation.equals("male") ? MALE_HAIR : FEMALE_HAIR).contains(appearance.get("hair"))
                || !Set.of("cozy", "adventurer", "elegant", "dark", "abyssal", "wanderer").contains(appearance.get("outfit")))
            throw GameRules.invalid("Diese Charakteroption ist nicht verfügbar.");
        String aura = appearance.get("aura");
        if (!GameRules.STARTER_AURAS.contains(aura) && !GameRules.EARNED_AURAS.contains(aura) && !BossLoot.AURAS.contains(aura))
            throw GameRules.invalid("Diese Aura ist nicht verfügbar.");
        for (String slot : List.of("cosmeticHair", "cosmeticOutfit"))
            if (appearance.containsKey(slot)) BossLoot.validateCosmeticId(appearance.get(slot), slot.equals("cosmeticHair") ? "hair" : "outfit");
        for (Map.Entry<String, Set<String>> palette : PALETTES.entrySet()) {
            String color = appearance.get(palette.getKey());
            if (color == null) continue;
            color = color.toLowerCase(Locale.ROOT);
            if (!palette.getValue().contains(color)) throw GameRules.invalid("Bitte eine Farbe aus der verfügbaren Palette wählen.");
            appearance.put(palette.getKey(), color);
        }
        return new Profile(name, Map.copyOf(appearance));
    }

    public static Journey journey(JsonNode value) {
        exact(value, Set.of("interestIds", "activeSkillIds", "primaryInterestId"));
        List<String> interests = selection(value.get("interestIds"), INTERESTS, 7);
        List<String> skills = selection(value.get("activeSkillIds"), SKILLS, 6);
        String primary = text(value, "primaryInterestId");
        if (!interests.contains(primary)) throw GameRules.invalid("Dein Schwerpunkt muss zu deinen gewählten Interessen gehören.");
        return new Journey(interests, skills, primary);
    }

    private static List<String> selection(JsonNode value, Set<String> allowed, int maximum) {
        if (value == null || !value.isArray() || value.isEmpty() || value.size() > maximum)
            throw GameRules.invalid("Bitte prüfe die Anzahl deiner gewählten Interessen und Skills.");
        List<String> result = new ArrayList<>();
        for (JsonNode item : value) {
            if (!item.isTextual() || !allowed.contains(item.asText()) || result.contains(item.asText()))
                throw GameRules.invalid("Deine Auswahl enthält einen ungültigen oder doppelten Eintrag.");
            result.add(item.asText());
        }
        return List.copyOf(result);
    }
    private static void exact(JsonNode value, Set<String> keys) {
        if (value == null || !value.isObject() || !new LinkedHashSet<>(value.propertyNames()).equals(keys))
            throw GameRules.invalid("Bitte nur die vorgesehenen Angaben senden.");
    }
    private static String text(JsonNode value, String key) {
        JsonNode item = value.get(key);
        if (item == null || !item.isTextual()) throw GameRules.invalid("Bitte prüfe deine Angaben.");
        return item.asText();
    }
}
