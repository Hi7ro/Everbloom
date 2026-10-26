package com.everbloom.game;

import com.everbloom.common.api.ApiException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import static com.everbloom.game.BossModels.*;
import static com.everbloom.game.GameModels.*;

/** Deterministic PvE: only persisted XP/skills contribute, never client stats or cosmetic rarity. */
public final class BossRules {
    private BossRules() {}
    public static final int FREE_BOSS_MAX_LEVEL = 50;
    public record Definition(String id, String name, int baseLevel) {}
    public static final List<Definition> BOSSES = List.of(
            new Definition("mosswarden", "Der Mooswächter", 10),
            new Definition("emberwyrm", "Der Glutwyrm", 20),
            new Definition("dusk-prowler", "Die Dämmerungsbestie", 30),
            new Definition("frost-titan", "Der Frosttitan", 40),
            new Definition("cloud-sovereign", "Der Wolkenkönig", 50),
            new Definition("bloodmoon-regent", "Die Blutmondregentin", 60),
            new Definition("astral-sovereign", "Der Sternensouverän", 70),
            new Definition("void-devourer", "Nharok, der Weltenverschlinger", 80),
            new Definition("primordial-dragon", "Vaelthar, der Urdrache", 90),
            new Definition("relic-sovereign", "Aureon, König der Relikte", 100));
    public static final Set<String> DIFFICULTIES = Set.of("normal", "hard", "epic", "ultimate");
    public static final Set<String> TACTICS = Set.of("balanced", "power", "guard");
    private static final Set<String> GUARD_ABILITIES = Set.of("bark-guard", "star-seal", "frost-guard", "dusk-guard", "bloodmoon-seal", "gravity-well", "royal-aegis");
    private static final Set<String> CHARGE_ABILITIES = Set.of("ember-charge", "frost-charge", "solar-charge", "prism-charge", "imperial-charge");
    private static final Set<String> CHARGED_ATTACKS = Set.of("ember-breath", "starburst", "frost-crush", "solar-strike", "dusk-frenzy", "lunar-eclipse", "event-horizon", "cosmic-breath", "imperial-rain");
    private static final List<String> ATTRIBUTES = List.of("strength", "endurance", "focus", "knowledge", "mindfulness", "recovery");
    private static final Map<String, String> SKILL_ATTRIBUTES = Map.ofEntries(
            Map.entry("calisthenics", "strength"), Map.entry("weightlifting", "strength"), Map.entry("boxing", "strength"),
            Map.entry("running", "endurance"), Map.entry("swimming", "endurance"),
            Map.entry("bjj", "focus"), Map.entry("music", "focus"),
            Map.entry("programming", "knowledge"), Map.entry("reading", "knowledge"), Map.entry("languages", "knowledge"),
            Map.entry("meditation", "mindfulness"), Map.entry("breathwork", "mindfulness"),
            Map.entry("recovery", "recovery"), Map.entry("healthy-cooking", "recovery"));

    public static Definition definition(String id) {
        return BOSSES.stream().filter(boss -> boss.id().equals(id)).findFirst()
                .orElseThrow(() -> GameRules.invalid("Dieser Boss ist nicht verfügbar."));
    }
    public static boolean requiresPlus(String id, String difficulty) {
        Definition boss = definition(id);
        if (!DIFFICULTIES.contains(difficulty)) throw GameRules.invalid("Dieser Schwierigkeitsgrad ist nicht verfügbar.");
        return boss.baseLevel() > FREE_BOSS_MAX_LEVEL || !difficulty.equals("normal");
    }
    public static int minimumLevel(String id, String difficulty) {
        return definition(id).baseLevel() + switch (difficulty) {
            case "normal" -> 0; case "hard" -> 5; case "epic" -> 15; case "ultimate" -> 30;
            default -> throw GameRules.invalid("Dieser Schwierigkeitsgrad ist nicht verfügbar.");
        };
    }
    public static Stats bossStats(String id, String difficulty) {
        int level = definition(id).baseLevel() + switch (difficulty) {
            case "normal" -> 0; case "hard" -> 10; case "epic" -> 20; case "ultimate" -> 30;
            default -> throw GameRules.invalid("Dieser Schwierigkeitsgrad ist nicht verfügbar.");
        } + (id.equals("cloud-sovereign") ? 5 : 0);
        return id.equals("cloud-sovereign")
                ? new Stats(level, 180 + 22 * level, (int) Math.floor(20 + 2.1 * level), (int) Math.floor(5 + .55 * level))
                : id.equals("relic-sovereign")
                    ? new Stats(level, 400 + 28 * level, (int) Math.floor(34 + 2.7 * level), (int) Math.floor(10 + .7 * level))
                : id.equals("primordial-dragon")
                    ? new Stats(level, 300 + 26 * level, (int) Math.floor(30 + 2.5 * level), (int) Math.floor(8 + .65 * level))
                : id.equals("void-devourer")
                    ? new Stats(level, 260 + 24 * level, (int) Math.floor(26 + 2.3 * level), (int) Math.floor(6 + .6 * level))
                : id.equals("bloodmoon-regent")
                    ? new Stats(level, 200 + 20 * level, (int) Math.floor(16 + 1.9 * level), (int) Math.floor(5 + .5 * level))
                : id.equals("astral-sovereign")
                    ? new Stats(level, 160 + 18 * level, (int) Math.floor(18 + 1.9 * level), (int) Math.floor(4 + .5 * level))
                    : new Stats(level, 120 + 12 * level, (int) Math.floor(14 + 1.6 * level), (int) Math.floor(2 + .5 * level));
    }
    public static boolean discovered(Snapshot snapshot, String bossId) {
        for (Definition boss : BOSSES) {
            if (boss.id().equals(bossId)) return true;
            if (DIFFICULTIES.stream().noneMatch(mode -> snapshot.bossProgress().clearedEncounterIds().contains(boss.id() + ":" + mode))) return false;
        }
        return false;
    }

    public static int level(long totalXp) {
        long remaining = Math.min(10_000_000, Math.max(0, totalXp));
        int level = 1, required = 1200;
        while (remaining >= required) { remaining -= required; level++; required = 1200 + (level - 1) * 200; }
        return level;
    }
    public static HeroStats heroStats(Snapshot snapshot) {
        Map<String, Integer> attributes = new LinkedHashMap<>();
        for (String attribute : ATTRIBUTES) {
            long earned = 0;
            for (var definition : SKILL_ATTRIBUTES.entrySet()) {
                if (!definition.getValue().equals(attribute)) continue;
                long xp = snapshot.skills().stream().filter(skill -> skill.skillId().equals(definition.getKey()))
                        .mapToLong(Skill::totalXp).findFirst().orElse(0);
                earned += Math.min(10_000_000, Math.max(0, xp));
            }
            int base = bounded(snapshot.character().attributes().getOrDefault(attribute, 0), 0, 1000);
            attributes.put(attribute, Math.min(1000, base + (int) (earned / 1000)));
        }
        int level = level(snapshot.character().totalXp());
        int strength = attributes.get("strength"), endurance = attributes.get("endurance"), focus = attributes.get("focus"),
                knowledge = attributes.get("knowledge"), mindfulness = attributes.get("mindfulness"), recovery = attributes.get("recovery");
        return new HeroStats(level, bounded(120 + level * 14 + endurance * 3 + recovery * 2, 1, 100_000),
                bounded(12 + level * 3 + strength * .7 + knowledge * .7 + focus * .3, 1, 10_000),
                bounded(3 + level * .8 + endurance * .25 + mindfulness * .25 + recovery * .25, 0, 10_000),
                bounded(5 - Math.floor((focus + mindfulness) / 50.0), 3, 5), Map.copyOf(attributes));
    }
    public static Replay fight(Snapshot snapshot, FightCommand command) {
        Definition definition = definition(command.bossId());
        if (!TACTICS.contains(command.tactic())) throw GameRules.invalid("Diese Kampftaktik ist nicht verfügbar.");
        HeroStats original = heroStats(snapshot);
        int minimum = minimumLevel(command.bossId(), command.difficulty());
        if (original.level() < minimum) throw new ApiException(HttpStatus.FORBIDDEN, "BOSS_LEVEL_LOCKED", "Dieser Kampf ist ab Level " + minimum + " verfügbar.");
        double attackMultiplier = command.tactic().equals("power") ? 1.2 : command.tactic().equals("guard") ? .85 : 1;
        double defenseMultiplier = command.tactic().equals("power") ? .75 : command.tactic().equals("guard") ? 1.25 : 1;
        HeroStats hero = new HeroStats(original.level(), original.maxHp(), bounded(original.attack() * attackMultiplier, 1, 10_000),
                bounded(original.defense() * defenseMultiplier, 0, 10_000), original.criticalEvery(), original.attributes());
        Stats boss = bossStats(command.bossId(), command.difficulty());
        int heroHp = hero.maxHp(), bossHp = boss.maxHp();
        List<Turn> turns = new ArrayList<>();
        int guardedHits = 0;
        double guardFactor = 1;
        String chargedAbility = null;
        double chargedPhaseMultiplier = 1;
        for (int round = 1; round <= 20 && heroHp > 0 && bossHp > 0; round++) {
            boolean renewing = command.tactic().equals("guard") && round % 3 == 0 && heroHp < hero.maxHp() * .6;
            int healing = renewing ? Math.min(hero.maxHp() - heroHp, Math.max(1, (int) Math.floor(hero.maxHp() * .12
                    + hero.attributes().get("recovery") * .5 + hero.attributes().get("mindfulness") * .25))) : 0;
            heroHp += healing;
            boolean critical = !renewing && round % hero.criticalEvery() == 0;
            boolean guarded = guardedHits > 0 && !renewing;
            int rawDamage = Math.max(1, (int) Math.floor(hero.attack() * (critical ? 1.5 : 1)) - boss.defense());
            int damage = renewing ? 0 : Math.min(bossHp, guarded ? Math.max(1, (int) Math.floor(rawDamage * guardFactor)) : rawDamage);
            if (guarded) guardedHits--;
            bossHp -= damage;
            String phase = phase(bossHp, boss.maxHp());
            turns.add(new Turn(turns.size(), round, "hero", renewing ? "renewal" : critical ? "focused-strike" : "strike",
                    (renewing ? "Neue Kraft" : critical ? "Fokusschlag" : "Entschlossener Hieb") + (guarded ? " · " + guardLabel(command.bossId()) + " dämpft den Treffer" : ""),
                    damage, healing, critical, heroHp, bossHp, phase, guarded ? "guarded-strike" : null));
            if (bossHp == 0) break;
            double pressure = command.bossId().equals("relic-sovereign") ? 1 + Math.min(.28, Math.max(0, round - 5) * .04) : 1;
            double phaseMultiplier = (phase.equals("last-stand") ? 1.4 : phase.equals("resistance") ? 1.15 : 1) * pressure;
            boolean heavy = round % 3 == 0;
            String ability = bossAbility(command.bossId(), phase, round, chargedAbility);
            int incoming;
            if ("relic-volley".equals(ability) || "primal-claw".equals(ability) || "wing-tempest".equals(ability)) {
                int count = ability.equals("primal-claw") ? 2 : 3;
                double multiplier = ability.equals("primal-claw") ? .7 : ability.equals("wing-tempest") ? .52 : .55;
                incoming = count * Math.max(1, (int) Math.floor(boss.attack() * phaseMultiplier * multiplier) - hero.defense());
            } else if ("imperial-rain".equals(ability)) {
                incoming = 3 * Math.max(1, (int) Math.floor(boss.attack() * chargedPhaseMultiplier * .8) - hero.defense());
                chargedAbility = null;
            } else if ("sovereign-blade".equals(ability)) {
                incoming = Math.max(1, (int) Math.floor(boss.attack() * phaseMultiplier * 1.1) - hero.defense());
            } else if ("staff-combo".equals(ability)) {
                incoming = 2 * Math.max(1, (int) Math.floor(boss.attack() * phaseMultiplier * .58) - hero.defense());
            } else if ("cloud-step".equals(ability)) {
                incoming = Math.max(1, (int) Math.floor(boss.attack() * phaseMultiplier * .55) - hero.defense());
                guardedHits = 1; guardFactor = .65;
            } else if ("dusk-leap".equals(ability)) {
                incoming = Math.max(1, (int) Math.floor(boss.attack() * phaseMultiplier * 1.1) - hero.defense());
            } else if ("dusk-frenzy".equals(ability)) {
                incoming = 2 * Math.max(1, (int) Math.floor(boss.attack() * chargedPhaseMultiplier * .72) - hero.defense());
                chargedAbility = null;
            } else if (GUARD_ABILITIES.contains(ability)) {
                incoming = 0;
                guardedHits = ability.equals("frost-guard") || ability.equals("gravity-well") ? 2 : 1;
                guardFactor = ability.equals("gravity-well") ? .75 : ability.equals("royal-aegis") ? .55 : ability.equals("dusk-guard") ? .6 : ability.equals("bark-guard") ? .7 : ability.equals("star-seal") ? .55 : .65;
                if (ability.equals("gravity-well")) { chargedAbility = "event-horizon"; chargedPhaseMultiplier = phaseMultiplier; }
                if (ability.equals("bloodmoon-seal")) { chargedAbility = "lunar-eclipse"; chargedPhaseMultiplier = phaseMultiplier; }
                if (ability.equals("dusk-guard")) { chargedAbility = "dusk-frenzy"; chargedPhaseMultiplier = phaseMultiplier; }
                if (ability.equals("star-seal")) { chargedAbility = "starburst"; chargedPhaseMultiplier = phaseMultiplier; }
            } else if (CHARGE_ABILITIES.contains(ability)) {
                incoming = 0;
                chargedPhaseMultiplier = phaseMultiplier;
                chargedAbility = ability.equals("prism-charge") ? "cosmic-breath" : ability.equals("imperial-charge") ? "imperial-rain" : ability.equals("ember-charge") ? "ember-breath" : ability.equals("frost-charge") ? "frost-crush" : "solar-strike";
            } else if (CHARGED_ATTACKS.contains(ability)) {
                double multiplier = ability.equals("event-horizon") ? 1.8 : ability.equals("cosmic-breath") ? 1.85 : ability.equals("lunar-eclipse") ? 1.75 : ability.equals("ember-breath") ? 1.85 : ability.equals("starburst") ? 2 : ability.equals("frost-crush") ? 2.05 : 2.1;
                double announcedPhase = ability.equals("solar-strike") ? phaseMultiplier : chargedPhaseMultiplier;
                incoming = Math.max(1, (int) Math.floor(boss.attack() * announcedPhase * multiplier) - hero.defense());
                chargedAbility = null;
            } else {
                incoming = Math.max(1, (int) Math.floor(boss.attack() * phaseMultiplier) - hero.defense());
            }
            int reply = Math.min(heroHp, incoming);
            heroHp -= reply;
            int bossHealing = ability.equals("lunar-eclipse")
                    ? Math.min(boss.maxHp() - bossHp, Math.min((int) Math.floor(boss.maxHp() * .02), (int) Math.floor(reply * .2))) : 0;
            bossHp += bossHealing;
            String action = phase.equals("last-stand") ? "thorn-burst" : heavy ? "stone-crash" : "root-strike";
            turns.add(new Turn(turns.size(), round, "boss", action, abilityLabel(ability),
                    reply, bossHealing, CHARGED_ATTACKS.contains(ability), heroHp, bossHp, phase(bossHp, boss.maxHp()), ability));
        }
        String outcome = bossHp == 0 && heroHp > 0 ? "victory" : heroHp == 0 && bossHp > 0 ? "defeat" : "draw";
        return new Replay("boss", command.difficulty(), command.tactic(), new Hero(snapshot.character().id(), snapshot.character().name(), hero),
                new Enemy(definition.id(), definition.name(), boss), new Initial(hero.maxHp(), boss.maxHp()), List.copyOf(turns), outcome,
                turns.isEmpty() ? 0 : turns.getLast().round(), new NoXpReward(0, List.of()));
    }
    private static String cloudAbility(String phase, int round) {
        List<String> cycle = phase.equals("last-stand") ? List.of("cloud-step", "solar-charge", "solar-strike")
                : phase.equals("resistance") ? List.of("staff-combo", "cloud-step", "solar-charge", "solar-strike")
                : List.of("staff-combo", "cloud-step", "staff-combo", "solar-charge", "solar-strike");
        String ability = cycle.get((round - 1) % cycle.size());
        return ability.equals("solar-strike") ? "solar-charge" : ability;
    }
    private static String abilityLabel(String ability) {
        return switch (ability) {
            case "root-strike" -> "Wurzelhieb";
            case "bark-guard" -> "Lebende Rinde · Schutz für den nächsten Angriff";
            case "ember-claw" -> "Klauenhieb";
            case "ember-charge" -> "Glut sammeln · Feueratem folgt";
            case "ember-breath" -> "Entfesselter Feueratem";
            case "dusk-bite" -> "Säbelbiss";
            case "dusk-leap" -> "Schattensprung";
            case "dusk-guard" -> "Runenschild · Schutz und Schattenraserei folgt";
            case "dusk-frenzy" -> "Schattenraserei · zwei Treffer";
            case "void-rend" -> "Leerenriss";
            case "gravity-well" -> "Gravitationssog · Schutz und Ereignishorizont folgt";
            case "event-horizon" -> "Kollaps des Ereignishorizonts";
            case "primal-claw" -> "Urklauen · zwei Treffer";
            case "prism-charge" -> "Prismenaufladung · kosmischer Atem folgt";
            case "cosmic-breath" -> "Kosmischer Atem";
            case "wing-tempest" -> "Prismenflügelsturm · drei Treffer";
            case "relic-volley" -> "Reliktsalve · drei Treffer";
            case "royal-aegis" -> "Königsaegis · Schutz für den nächsten Angriff";
            case "sovereign-blade" -> "Klinge des Sonnenreichs";
            case "imperial-charge" -> "Arsenalaufladung · Reliktregen folgt";
            case "imperial-rain" -> "Goldener Reliktregen · drei Treffer";
            case "ruby-blade" -> "Rubinklinge";
            case "bloodmoon-seal" -> "Blutmondsiegel · Schutz und Mondfinsternis folgt";
            case "lunar-eclipse" -> "Mondfinsternis · begrenzte Lebenskraft";
            case "astral-strike" -> "Astralklinge";
            case "star-seal" -> "Sternensiegel · Schild und Sternenbruch folgt";
            case "starburst" -> "Brechende Sternenkonstellation";
            case "frost-strike" -> "Eishieb";
            case "frost-guard" -> "Gletscherpanzer · Schutz für zwei Angriffe";
            case "frost-charge" -> "Gletscherkraft sammeln · Eisbrecher folgt";
            case "frost-crush" -> "Gewaltiger Eisbrecher";
            case "staff-combo" -> "Goldene Stabkombo · zwei Treffer";
            case "cloud-step" -> "Wolkenschritt · Schild für den nächsten Angriff";
            case "solar-charge" -> "Sonnenkraft sammeln · Sonnenschlag folgt";
            default -> "Himmlischer Sonnenschlag";
        };
    }
    private static String guardLabel(String bossId) {
        return switch (bossId) {
            case "mosswarden" -> "Rindenschild";
            case "dusk-prowler" -> "Runenschild";
            case "bloodmoon-regent" -> "Blutmondbarriere";
            case "void-devourer" -> "Gravitationsfeld";
            case "relic-sovereign" -> "Königsaegis";
            case "astral-sovereign" -> "Sternensiegel";
            case "frost-titan" -> "Gletscherpanzer";
            default -> "Wolkenschild";
        };
    }
    private static String bossAbility(String bossId, String phase, int round, String charged) {
        if (charged != null) return charged;
        if (bossId.equals("cloud-sovereign")) return cloudAbility(phase, round);
        if (bossId.equals("mosswarden")) return round % 3 == 0 ? "bark-guard" : "root-strike";
        if (bossId.equals("emberwyrm")) {
            int interval = phase.equals("awakening") ? 4 : 3;
            return round % interval == (phase.equals("last-stand") ? 1 : 2) ? "ember-charge" : "ember-claw";
        }
        if (bossId.equals("dusk-prowler")) {
            int beat = (round - 1) % 5;
            return beat == 2 ? "dusk-guard" : beat == 1 ? "dusk-leap" : "dusk-bite";
        }
        if (bossId.equals("void-devourer")) return round % (phase.equals("last-stand") ? 3 : 5) == 2 ? "gravity-well" : "void-rend";
        if (bossId.equals("primordial-dragon")) {
            int beat = (round - 1) % (phase.equals("last-stand") ? 4 : 6);
            return beat == 1 || beat == 2 ? "prism-charge" : beat == 3 || beat == 5 ? "wing-tempest" : "primal-claw";
        }
        if (bossId.equals("relic-sovereign")) {
            int beat = (round - 1) % 6;
            return beat == 1 ? "royal-aegis" : beat == 2 ? "sovereign-blade" : beat == 3 || beat == 4 ? "imperial-charge" : "relic-volley";
        }
        if (bossId.equals("bloodmoon-regent")) return round % 4 == 2 ? "bloodmoon-seal" : "ruby-blade";
        if (bossId.equals("astral-sovereign")) {
            int interval = phase.equals("awakening") ? 5 : phase.equals("resistance") ? 4 : 3;
            return round % interval == (phase.equals("last-stand") ? 1 : 2) ? "star-seal" : "astral-strike";
        }
        List<String> cycle = List.of("frost-strike", "frost-guard", "frost-strike", "frost-charge", "frost-crush", "frost-strike");
        String ability = cycle.get((round - 1) % cycle.size());
        return ability.equals("frost-crush") ? "frost-charge" : ability;
    }
    private static String phase(int hp, int maximum) { return hp == 0 ? "defeated" : (double) hp / maximum > .6 ? "awakening" : (double) hp / maximum > .25 ? "resistance" : "last-stand"; }
    private static int bounded(double value, int minimum, int maximum) { return Math.min(maximum, Math.max(minimum, (int) Math.floor(value))); }
}
