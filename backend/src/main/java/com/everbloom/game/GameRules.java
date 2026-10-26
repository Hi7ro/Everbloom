package com.everbloom.game;

import com.everbloom.common.api.ApiException;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import static com.everbloom.game.GameModels.*;

/** Pure progression rules. Membership is a server-verified modifier on earned character XP only. */
public final class GameRules {
    private GameRules() {}
    public record SkillRule(String id, int xpPerMinute, int dailyLimit) {}
    public static final List<SkillRule> SKILLS = List.of(
            new SkillRule("calisthenics", 4, 90), new SkillRule("running", 3, 60),
            new SkillRule("meditation", 3, 30), new SkillRule("programming", 2, 90),
            new SkillRule("weightlifting", 4, 90), new SkillRule("swimming", 3, 60),
            new SkillRule("boxing", 3, 60), new SkillRule("bjj", 3, 60),
            new SkillRule("breathwork", 2, 15), new SkillRule("recovery", 2, 30),
            new SkillRule("reading", 2, 60), new SkillRule("languages", 2, 60),
            new SkillRule("healthy-cooking", 2, 45), new SkillRule("music", 2, 60));
    public static final Set<String> STARTER_AURAS = Set.of("none", "sage");
    public static final Set<String> EARNED_AURAS = Set.of("rose", "void", "aurora", "starlight", "moss-spirit");
    public static final int MAX_ACTIVITIES = 10_000;

    public static Snapshot fresh(UUID owner, LocalDate today) {
        Map<String, Integer> attributes = new LinkedHashMap<>();
        for (String id : List.of("strength", "endurance", "focus", "knowledge", "mindfulness", "recovery"))
            attributes.put(id, 1);
        Map<String, String> appearance = new LinkedHashMap<>();
        appearance.put("presentation", "male"); appearance.put("artwork", "original");
        appearance.put("illustration", "emerald-knight"); appearance.put("body", "base");
        appearance.put("hair", "m-spiky"); appearance.put("outfit", "adventurer"); appearance.put("aura", "sage");
        appearance.put("skinColor", "#f6dec8"); appearance.put("hairColor", "#2d2627");
        appearance.put("outfitColor", "#718967");
        return new Snapshot(today.toString(),
                new GameModels.Character(false, owner.toString(), "Ari", "Wanderer des Morgenlichts", 0,
                        Map.copyOf(attributes), Map.copyOf(appearance)),
                SKILLS.stream().map(skill -> new Skill(skill.id(), 0)).toList(),
                List.of(new Quest("q-move", "Werde ein Stück stärker", "20 Minuten Calisthenics", "calisthenics", 20, 0, 50, false),
                        new Quest("q-mind", "Finde deine innere Ruhe", "10 Minuten Meditation", "meditation", 10, 0, 30, false),
                        new Quest("q-learn", "Baue an deiner Zukunft", "30 Minuten Programming", "programming", 30, 0, 40, false)),
                new Boss("mosswarden", "Der Mooswächter", weekLabel(today), 2400, 2400),
                List.of(), List.of(), new Momentum(0, null, rhythm(List.of(), today)));
    }

    public static Snapshot advance(Snapshot before, LocalDate today) {
        LocalDate previous = LocalDate.parse(before.dayKey());
        if (today.isBefore(previous)) throw new ApiException(HttpStatus.CONFLICT, "GAME_CLOCK",
                "Das Serverdatum liegt vor deinem letzten Spieltag. Bitte versuche es später erneut.");
        before = restoreEarlyAuraAccess(before);
        // All day-dependent fields were persisted with this snapshot. The common read path
        // needs no journal scan or replacement objects until the server day changes.
        if (today.equals(previous)) return before;
        boolean newWeek = !monday(previous).equals(monday(today));
        List<Quest> quests = before.quests().stream().map(q -> new Quest(q.id(), q.title(),
                q.description(), q.skillId(), q.targetMinutes(), 0, q.bonusXp(), false)).toList();
        Boss boss = before.boss();
        return new Snapshot(today.toString(), before.character(), before.skills(), quests,
                new Boss(boss.id(), boss.name(), weekLabel(today), boss.maxHp(), newWeek ? boss.maxHp() : boss.hp()),
                before.activities(), before.unlockedAuras(), new Momentum(before.momentum().value(),
                        before.momentum().lastRewardDay(), rhythm(before.activities(), today)), before.bossProgress());
    }

    public static ActivityResult record(Snapshot before, Command command) {
        return record(before, command, 0);
    }

    public static ActivityResult record(Snapshot before, Command command, int membershipPercent) {
        if (membershipPercent != 0 && membershipPercent != 10) throw new IllegalArgumentException("Unsupported membership bonus");
        SkillRule skill = SKILLS.stream().filter(item -> item.id().equals(command.skillId())).findFirst()
                .orElseThrow(() -> invalid("Bitte einen verfügbaren Skill auswählen."));
        if (command.requestId() == null || command.requestId().isBlank() || command.requestId().length() > 128
                || command.requestId().codePoints().anyMatch(code -> code < 32 || code == 127)) throw invalid("Ungültige Eintrags-ID.");
        if (command.minutes() < 1 || command.minutes() > 180) throw invalid("Bitte ganze Minuten zwischen 1 und 180 eintragen.");
        Activity existing = before.activities().stream().filter(item -> item.requestId().equals(command.requestId())).findFirst().orElse(null);
        if (existing != null) {
            if (!existing.skillId().equals(command.skillId()) || existing.minutes() != command.minutes()) throw conflict();
            return duplicate(before);
        }
        if (before.activities().size() >= MAX_ACTIVITIES) throw new ApiException(HttpStatus.CONFLICT, "ACTIVITY_LIMIT",
                "Dein Aktivitätsjournal ist voll. Dein bisheriger Fortschritt bleibt erhalten.");
        int used = before.activities().stream().filter(item -> item.dayKey().equals(before.dayKey())
                        && item.skillId().equals(command.skillId())).mapToInt(Activity::rewardedMinutes).sum();
        int rewardedMinutes = Math.min(command.minutes(), Math.max(0, skill.dailyLimit() - used));
        int activityXp = rewardedMinutes * skill.xpPerMinute();
        int membershipXp = activityXp * membershipPercent / 100;
        int questXp = 0;
        List<Quest> quests = new ArrayList<>();
        for (Quest quest : before.quests()) {
            if (!quest.skillId().equals(skill.id()) || quest.claimed()) { quests.add(quest); continue; }
            int progress = Math.min(quest.targetMinutes(), quest.progressMinutes() + rewardedMinutes);
            boolean claimed = progress >= quest.targetMinutes();
            if (claimed) questXp += quest.bonusXp();
            quests.add(new Quest(quest.id(), quest.title(), quest.description(), quest.skillId(), quest.targetMinutes(), progress, quest.bonusXp(), claimed));
        }
        int damage = Math.min(before.boss().hp(), activityXp * 2);
        GameModels.Character character = before.character();
        long totalXp = character.totalXp() + activityXp + questXp + membershipXp;
        List<String> auras = new ArrayList<>(before.unlockedAuras());
        if (activityXp > 0) {
            grantCrossing(auras, "rose", 6000, character.totalXp(), totalXp);
            grantCrossing(auras, "void", 18000, character.totalXp(), totalXp);
            grantCrossing(auras, "aurora", 57000, character.totalXp(), totalXp);
            grantCrossing(auras, "starlight", 195000, character.totalXp(), totalXp);
            if (before.boss().id().equals("mosswarden") && before.boss().hp() > 0 && damage == before.boss().hp()
                    && !auras.contains("moss-spirit")) auras.add("moss-spirit");
        }
        List<Activity> activities = new ArrayList<>(before.activities().size() + 1);
        activities.add(new Activity(command.requestId(), command.skillId(), command.minutes(), before.dayKey(), rewardedMinutes, activityXp, membershipXp));
        activities.addAll(before.activities());
        boolean momentum = activityXp > 0 && !before.dayKey().equals(before.momentum().lastRewardDay());
        Snapshot snapshot = new Snapshot(before.dayKey(), new GameModels.Character(character.createdByPlayer(), character.id(),
                character.name(), character.title(), totalXp, character.attributes(), character.appearance()),
                before.skills().stream().map(item -> item.skillId().equals(skill.id()) ? new Skill(item.skillId(), item.totalXp() + activityXp) : item).toList(),
                List.copyOf(quests), new Boss(before.boss().id(), before.boss().name(), before.boss().weekLabel(), before.boss().maxHp(), before.boss().hp() - damage),
                List.copyOf(activities), List.copyOf(auras), new Momentum(Math.min(100, before.momentum().value() + (momentum ? 5 : 0)),
                        activityXp > 0 ? before.dayKey() : before.momentum().lastRewardDay(), rhythm(activities, LocalDate.parse(before.dayKey()))), before.bossProgress());
        return new ActivityResult(snapshot, new Reward(activityXp, questXp, damage, rewardedMinutes, false, membershipXp));
    }

    public static Snapshot profile(Snapshot state, Profile profile) {
        BossLoot.validateOwnership(state, profile.appearance());
        String aura = profile.appearance().get("aura");
        if (aura == null || (!STARTER_AURAS.contains(aura) && !EARNED_AURAS.contains(aura) && !BossLoot.AURAS.contains(aura)))
            throw invalid("Diese Aura ist nicht verfügbar.");
        if (!STARTER_AURAS.contains(aura) && !state.unlockedAuras().contains(aura))
            throw new ApiException(HttpStatus.FORBIDDEN, "AURA_LOCKED", "Diese Aura hast du noch nicht freigeschaltet.");
        GameModels.Character c = state.character();
        return new Snapshot(state.dayKey(), new GameModels.Character(true, c.id(), profile.name(), c.title(), c.totalXp(),
                c.attributes(), profile.appearance()), state.skills(), state.quests(), state.boss(), state.activities(), state.unlockedAuras(), state.momentum(), state.bossProgress());
    }

    /** Narrow compatibility migration: these two auras used to be freely equippable. */
    private static Snapshot restoreEarlyAuraAccess(Snapshot before) {
        String equipped = before.character().appearance().get("aura");
        boolean rose = !before.unlockedAuras().contains("rose") && (before.character().totalXp() >= 6000 || "rose".equals(equipped));
        boolean shadow = !before.unlockedAuras().contains("void") && (before.character().totalXp() >= 18000 || "void".equals(equipped));
        if (!rose && !shadow) return before;
        List<String> auras = new ArrayList<>(before.unlockedAuras());
        if (rose) auras.add("rose");
        if (shadow) auras.add("void");
        return new Snapshot(before.dayKey(), before.character(), before.skills(), before.quests(), before.boss(),
                before.activities(), List.copyOf(auras), before.momentum(), before.bossProgress());
    }

    public static ActivityResult duplicate(Snapshot snapshot) { return new ActivityResult(snapshot, new Reward(0, 0, 0, 0, true)); }
    public static ApiException conflict() { return new ApiException(HttpStatus.CONFLICT, "REQUEST_CONFLICT", "Diese Eintrags-ID wurde bereits für eine andere Aktivität verwendet."); }
    static ApiException invalid(String message) { return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message); }
    private static void grantCrossing(List<String> auras, String id, long threshold, long before, long after) {
        if (before < threshold && after >= threshold && !auras.contains(id)) auras.add(id);
    }
    private static LocalDate monday(LocalDate day) { return day.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)); }
    public static String weekLabel(LocalDate day) {
        LocalDate start = monday(day), end = start.plusDays(6);
        String first = String.format(Locale.ROOT, "%02d", start.getDayOfMonth());
        String last = String.format(Locale.ROOT, "%02d", end.getDayOfMonth());
        String fromMonth = start.getMonth().getDisplayName(TextStyle.FULL, Locale.GERMAN);
        String toMonth = end.getMonth().getDisplayName(TextStyle.FULL, Locale.GERMAN);
        if (start.getYear() != end.getYear()) return first + ". " + fromMonth + " " + start.getYear() + " – " + last + ". " + toMonth + " " + end.getYear();
        if (start.getMonth() != end.getMonth()) return first + ". " + fromMonth + " – " + last + ". " + toMonth;
        return first + ". – " + last + ". " + fromMonth;
    }
    private static List<RhythmDay> rhythm(List<Activity> activities, LocalDate today) {
        Set<String> days = new LinkedHashSet<>();
        activities.stream().filter(activity -> activity.xp() > 0).forEach(activity -> days.add(activity.dayKey()));
        List<RhythmDay> result = new ArrayList<>();
        String[] labels = {"Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"};
        LocalDate monday = monday(today);
        for (int index = 0; index < 7; index++) {
            LocalDate day = monday.plusDays(index);
            result.add(new RhythmDay(labels[index], day.equals(today) ? "today" : day.isAfter(today) ? "upcoming" : days.contains(day.toString()) ? "done" : "rest"));
        }
        return List.copyOf(result);
    }
}
