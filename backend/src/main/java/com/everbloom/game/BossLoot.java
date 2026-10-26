package com.everbloom.game;

import com.everbloom.common.api.ApiException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import static com.everbloom.game.BossModels.*;
import static com.everbloom.game.GameModels.*;

/** Guaranteed first-clear keeps beta loot transparent; repeated fights cannot farm XP or items. */
public final class BossLoot {
    private BossLoot() {}
    public static final List<Cosmetic> COSMETICS = List.of(
            new Cosmetic("moss-crown", "Waldkrone", "Jadegrüner Waldschnitt, als Andenken an deinen ersten Sieg.", "mosswarden", "normal", "hair", "rare", null, Map.of("male", "forest-scout", "female", "starweaver"), "#6fae96"),
            new Cosmetic("verdant-warden", "Rüstung des Waldhüters", "Waldläufermantel und leichte Reisekleidung im Jadegrün des Mooswächters.", "mosswarden", "hard", "outfit", "epic", null, Map.of("male", "forest-scout", "female", "sky-ranger"), "#4c9c83"),
            new Cosmetic("eternal-blossom", "Ewige Blüte", "Blütenzweige und schwebende Kirschblätter umgeben dich.", "mosswarden", "epic", "aura", "legendary", "blossom", null, null),
            new Cosmetic("ancient-guardian", "Uralter Geistwächter", "Ein großer, leuchtender Schutzgeist erhebt sich hinter dir.", "mosswarden", "ultimate", "aura", "mythic", "guardian", null, null),
            new Cosmetic("ember-crown", "Glutkrone", "Flammenroter Schnitt mit der Farbe des erwachten Glutwyrms.", "emberwyrm", "normal", "hair", "rare", null, Map.of("male", "ember-striker", "female", "rose-runner"), "#ee8058"),
            new Cosmetic("cinder-forged", "Glutgeschmiedetes Set", "Dunkle Ritterrüstung mit kantigen Platten in der Kupferglut des Glutwyrms.", "emberwyrm", "hard", "outfit", "epic", null, Map.of("male", "abyss-walker", "female", "moonblade"), "#cd7158"),
            new Cosmetic("wyrmfire", "Wyrmfeuer", "Aufsteigende Flammen und warme Glutfunken rahmen deine Figur ein.", "emberwyrm", "epic", "aura", "legendary", "fire", null, null),
            new Cosmetic("infernal-wings", "Höllenschwingen", "Gezackte Schattenflügel umgeben dich mit dämonischer Energie.", "emberwyrm", "ultimate", "aura", "mythic", "demonic", null, null),
            new Cosmetic("dusk-crown", "Dämmerungskrone", "Ein wilder Schnitt im tiefen Runenviolett der Dämmerungsbestie.", "dusk-prowler", "normal", "hair", "rare", null, Map.of("male", "abyss-walker", "female", "void-sorceress"), "#8d78c7"),
            new Cosmetic("twilight-stalker", "Rüstung der Dämmerungsjagd", "Eine markante Schattenrüstung mit türkis schimmernden Platten und dunklen Stofflagen.", "dusk-prowler", "hard", "outfit", "epic", null, Map.of("male", "emerald-knight", "female", "void-sorceress"), "#538e98"),
            new Cosmetic("twilight-mantle", "Mantel der Dämmerung", "Violette Schleier und türkise Runen umkreisen deinen Charakter.", "dusk-prowler", "epic", "aura", "legendary", "twilight", null, null),
            new Cosmetic("eclipse-guardian", "Schattenwächter der Eklipse", "Ein dunkler Schutzgeist mit leuchtenden Runen wacht hinter deiner Figur.", "dusk-prowler", "ultimate", "aura", "mythic", "eclipse", null, null),
            new Cosmetic("frost-crown", "Frostkrone", "Ein eisblauer Schnitt mit dem Glanz uralter Gletscherkristalle.", "frost-titan", "normal", "hair", "rare", null, Map.of("male", "frost-scholar", "female", "sky-ranger"), "#79cce4"),
            new Cosmetic("glacier-guard", "Nordlicht-Expeditionsset", "Gemütliche Jacke, Hoodie und Reiseaccessoires im Gletscherblau des Frosttitans.", "frost-titan", "hard", "outfit", "epic", null, Map.of("male", "urban-ranger", "female", "rose-runner"), "#6fa9c7"),
            new Cosmetic("frozen-runes", "Frostrunen", "Schwebende magische Zeichen erinnern an die Runen des Frosttitans.", "frost-titan", "epic", "aura", "legendary", "mystic", null, null),
            new Cosmetic("glacial-current", "Ewiger Eisstrom", "Eisblaue Energieströme und scharfe Lichtfunken steigen um dich auf.", "frost-titan", "ultimate", "aura", "mythic", "energy", null, null),
            new Cosmetic("cloud-crown", "Wolkenkrone", "Ein goldener Schnitt im Licht der hohen Himmelswege.", "cloud-sovereign", "normal", "hair", "rare", null, Map.of("male", "forest-scout", "female", "dawn-priestess"), "#e7bd71"),
            new Cosmetic("cloud-regalia", "Gewand des Wolkenkönigs", "Himmlisches Kampfgewand mit beweglichen Stoffbahnen im Himmelsgold des Wolkenkönigs.", "cloud-sovereign", "hard", "outfit", "epic", null, Map.of("male", "ember-striker", "female", "dawn-priestess"), "#bd9551"),
            new Cosmetic("celestial-lotus", "Himmelslotus", "Leuchtende Blätter entfalten eine ruhige himmlische Lotus-Silhouette.", "cloud-sovereign", "epic", "aura", "legendary", "chakra", null, null),
            new Cosmetic("solar-corona", "Sonnenkrone", "Goldene Strahlen formen eine hohe Lichtkrone hinter deiner Figur.", "cloud-sovereign", "ultimate", "aura", "mythic", "light", null, null),
            new Cosmetic("bloodmoon-crown", "Rubinmondkrone", "Ein eleganter Schnitt im tiefen Rubinrot des Elfenhofes.", "bloodmoon-regent", "normal", "hair", "rare", null, Map.of("male", "urban-ranger", "female", "starweaver"), "#bd335b"),
            new Cosmetic("regent-regalia", "Ornat der Blutmondregentin", "Lange höfische Stofflagen und goldene Zierformen in leuchtendem Rubinrot.", "bloodmoon-regent", "hard", "outfit", "epic", null, Map.of("male", "frost-scholar", "female", "dawn-priestess"), "#b94262"),
            new Cosmetic("ruby-orbit", "Rubinmond-Orbit", "Ein rubinroter Mond und goldene Siegel kreisen um deinen Charakter.", "bloodmoon-regent", "epic", "aura", "legendary", "bloodmoon", null, null),
            new Cosmetic("crimson-corona", "Krone des Blutmondes", "Eine majestätische Krone aus rubinrotem Licht und goldenen Strahlen erhebt sich hinter dir.", "bloodmoon-regent", "ultimate", "aura", "mythic", "crimson-crown", null, null),
            new Cosmetic("astral-crown", "Sternenkrone", "Ein kühler Sternenschnitt in exklusivem Nebelblau.", "astral-sovereign", "normal", "hair", "rare", null, Map.of("male", "frost-scholar", "female", "sky-ranger"), "#8d9be8"),
            new Cosmetic("astral-regalia", "Gewand der Sternenwacht", "Langes Magiergewand mit fließenden Stofflagen im Sternenviolett des Sternensouveräns.", "astral-sovereign", "hard", "outfit", "epic", null, Map.of("male", "frost-scholar", "female", "starweaver"), "#8176c7"),
            new Cosmetic("star-trail", "Unendliche Sternenspuren", "Sternspuren und funkelnde Splitter schweben um deinen Charakter.", "astral-sovereign", "epic", "aura", "legendary", "stars", null, null),
            new Cosmetic("celestial-wings", "Himmelsschwingen", "Weite Lichtflügel und sanfte Sternfunken krönen deine Reise.", "astral-sovereign", "ultimate", "aura", "mythic", "angel", null, null),
            new Cosmetic("void-crown", "Krone der Leere", "Ein kantiger Schnitt im kühlen Violett der Singularität.", "void-devourer", "normal", "hair", "rare", null, Map.of("male", "abyss-walker", "female", "void-sorceress"), "#6d63ad"),
            new Cosmetic("voidbound-regalia", "Ornat der Leerenbindung", "Dunkle Panzerplatten und lange Schattenlagen im Silberschein der Leere.", "void-devourer", "hard", "outfit", "epic", null, Map.of("male", "abyss-walker", "female", "void-sorceress"), "#686194"),
            new Cosmetic("abyss-orbit", "Orbit des Abgrunds", "Verdichtete Leerenringe und kalte Sternensplitter kreisen um dich.", "void-devourer", "epic", "aura", "legendary", "void-orbit", null, null),
            new Cosmetic("world-devourer", "Geist des Weltenverschlingers", "Eine mächtige Leviathan-Silhouette erhebt sich aus der Sternennacht.", "void-devourer", "ultimate", "aura", "mythic", "leviathan", null, null),
            new Cosmetic("wyrm-crown", "Urwyrmkrone", "Ein dynamischer Schnitt im Platinblau der Prismenflügel.", "primordial-dragon", "normal", "hair", "rare", null, Map.of("male", "frost-scholar", "female", "sky-ranger"), "#79b5d1"),
            new Cosmetic("prismatic-scale", "Prismenschuppen-Ornat", "Helle Plattenrüstung mit platinblauen Schuppenformen und klarer Silhouette.", "primordial-dragon", "hard", "outfit", "epic", null, Map.of("male", "emerald-knight", "female", "moonblade"), "#98bdd2"),
            new Cosmetic("dragon-oath", "Eid des Urdrachen", "Prismatische Runen und Drachenlicht umkreisen deinen Charakter.", "primordial-dragon", "epic", "aura", "legendary", "dragon-oath", null, null),
            new Cosmetic("primordial-wings", "Schwingen des Urdrachen", "Kosmische Drachenschwingen aus Platinlicht rahmen deine Figur ein.", "primordial-dragon", "ultimate", "aura", "mythic", "primordial-wings", null, null),
            new Cosmetic("relic-crown", "Reliktkrone", "Ein königlicher Schnitt im warmen Gold des Sonnenreichs.", "relic-sovereign", "normal", "hair", "rare", null, Map.of("male", "forest-scout", "female", "dawn-priestess"), "#e1b657"),
            new Cosmetic("sovereign-regalia", "Ornat des Reliktkönigs", "Ein goldener Herrscherornat mit fließenden Stofflagen und höfischen Zierformen.", "relic-sovereign", "hard", "outfit", "epic", null, Map.of("male", "frost-scholar", "female", "dawn-priestess"), "#d5ad64"),
            new Cosmetic("relic-arsenal", "Arsenal der Relikte", "Schwebende Lichtwaffen ordnen sich hinter dir zu einem königlichen Arsenal.", "relic-sovereign", "epic", "aura", "legendary", "relic-arsenal", null, null),
            new Cosmetic("imperial-gate", "Tor des Sonnenreichs", "Ein goldenes Siegelportal und strahlende Reliktbahnen krönen deinen Weg.", "relic-sovereign", "ultimate", "aura", "mythic", "imperial-gate", null, null));
    public static final Set<String> AURAS = COSMETICS.stream().map(Cosmetic::auraId)
            .filter(java.util.Objects::nonNull).collect(java.util.stream.Collectors.toUnmodifiableSet());
    public static Cosmetic reward(String bossId, String difficulty) {
        return COSMETICS.stream().filter(item -> item.bossId().equals(bossId) && item.difficulty().equals(difficulty)).findFirst().orElseThrow();
    }
    public static Snapshot grant(Snapshot snapshot, Cosmetic cosmetic) {
        List<String> clears = new ArrayList<>(snapshot.bossProgress().clearedEncounterIds());
        List<String> cosmetics = new ArrayList<>(snapshot.bossProgress().unlockedCosmetics());
        List<String> auras = new ArrayList<>(snapshot.unlockedAuras());
        String encounter = cosmetic.bossId() + ":" + cosmetic.difficulty();
        if (!clears.contains(encounter)) clears.add(encounter);
        if (!cosmetics.contains(cosmetic.id())) cosmetics.add(cosmetic.id());
        if (cosmetic.auraId() != null && !auras.contains(cosmetic.auraId())) auras.add(cosmetic.auraId());
        return new Snapshot(snapshot.dayKey(), snapshot.character(), snapshot.skills(), snapshot.quests(), snapshot.boss(),
                snapshot.activities(), List.copyOf(auras), snapshot.momentum(), new BossProgress(List.copyOf(clears), List.copyOf(cosmetics)));
    }
    public static void validateCosmeticId(String id, String slot) {
        if (COSMETICS.stream().noneMatch(item -> item.id().equals(id) && item.slot().equals(slot)))
            throw GameRules.invalid("Dieses kosmetische Fundstück ist nicht verfügbar.");
    }
    public static void validateOwnership(Snapshot snapshot, Map<String, String> appearance) {
        for (String key : List.of("cosmeticHair", "cosmeticOutfit")) {
            String id = appearance.get(key);
            if (id == null) continue;
            validateCosmeticId(id, key.equals("cosmeticHair") ? "hair" : "outfit");
            if (!snapshot.bossProgress().unlockedCosmetics().contains(id))
                throw new ApiException(HttpStatus.FORBIDDEN, "COSMETIC_LOCKED", "Dieses Fundstück hast du noch nicht freigeschaltet.");
        }
    }
}
