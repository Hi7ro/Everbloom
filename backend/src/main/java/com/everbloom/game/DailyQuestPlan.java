package com.everbloom.game;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import static com.everbloom.game.GameModels.*;

/** Server-owned daily goals. Preference changes cannot replace a board once play has begun. */
public final class DailyQuestPlan {
    private DailyQuestPlan() {}
    private static final int MAX_QUESTS = 3;
    private static final int MAX_BONUS_XP = (Integer.MAX_VALUE / MAX_QUESTS / 5) * 5;
    private record Goal(String name, String title, int minutes) {}
    private static final Map<String, Goal> GOALS = Map.ofEntries(
            Map.entry("calisthenics", new Goal("Calisthenics", "Werde ein Stück stärker", 20)),
            Map.entry("running", new Goal("Running", "Finde deinen Laufrhythmus", 15)),
            Map.entry("meditation", new Goal("Meditation", "Finde deine innere Ruhe", 10)),
            Map.entry("programming", new Goal("Programming", "Baue an deiner Zukunft", 30)),
            Map.entry("weightlifting", new Goal("Weightlifting", "Wachse mit jedem Satz", 20)),
            Map.entry("swimming", new Goal("Swimming", "Gleite in deinen Rhythmus", 15)),
            Map.entry("boxing", new Goal("Boxing", "Feile an deiner Technik", 15)),
            Map.entry("bjj", new Goal("BJJ", "Verbinde Ruhe und Technik", 15)),
            Map.entry("breathwork", new Goal("Breathwork", "Nimm dir einen Atemzug Zeit", 5)),
            Map.entry("recovery", new Goal("Recovery", "Sammle neue Kraft", 10)),
            Map.entry("reading", new Goal("Reading", "Öffne eine neue Gedankenwelt", 15)),
            Map.entry("languages", new Goal("Languages", "Lerne neue Worte kennen", 10)),
            Map.entry("healthy-cooking", new Goal("Healthy Cooking", "Koche dir etwas Gutes", 20)),
            Map.entry("music", new Goal("Instrument", "Lass deine Musik wachsen", 10)));

    /** Epoch-day rotation is stable across devices, restarts and repeated preference saves. */
    public static List<Quest> create(LocalDate day, List<String> activeSkillIds, long characterXp) {
        List<String> skills = activeSkillIds.stream().filter(GOALS::containsKey).distinct().toList();
        if (skills.isEmpty()) throw GameRules.invalid("Bitte wähle mindestens einen verfügbaren Skill.");
        int offset = skills.size() > MAX_QUESTS ? (int) Math.floorMod(day.toEpochDay(), skills.size()) : 0;
        int bonusXp = bonusXp(characterXp);
        List<Quest> quests = new ArrayList<>();
        for (int index = 0; index < Math.min(MAX_QUESTS, skills.size()); index++) {
            String skill = skills.get((offset + index) % skills.size());
            Goal goal = GOALS.get(skill);
            quests.add(new Quest("daily:" + day + ":" + skill, goal.title(), goal.minutes() + " Minuten " + goal.name(),
                    skill, goal.minutes(), 0, bonusXp, false));
        }
        return List.copyOf(quests);
    }

    /** Capture once per board: a quest grants about 2% of a level, rounded to five XP. */
    static int bonusXp(long characterXp) {
        // Completing n levels costs 100 * n * (n + 11) XP. Divide first to avoid overflow.
        long hundreds = Math.max(0, characterXp) / 100;
        long completedLevels = (long) ((Math.sqrt(121d + 4d * hundreds) - 11) / 2);
        // Correct floating-point rounding at exact thresholds, even for very large totals.
        while (completedLevels * (completedLevels + 11) > hundreds) completedLevels--;
        while ((completedLevels + 1) * (completedLevels + 12) <= hundreds) completedLevels++;
        long levelSpan = 1200L + completedLevels * 200L;
        // The complete board must fit the integer reward contract, even for malformed extreme totals.
        return (int) Math.min(MAX_BONUS_XP, Math.max(40L, ((levelSpan + 125) / 250) * 5L));
    }

    public static boolean canReplaceToday(Snapshot snapshot) {
        return snapshot.activities().stream().noneMatch(activity -> activity.dayKey().equals(snapshot.dayKey()))
                && snapshot.quests().stream().allMatch(quest -> quest.progressMinutes() == 0 && !quest.claimed());
    }

    public static Snapshot apply(Snapshot snapshot, Journey journey) {
        return new Snapshot(snapshot.dayKey(), snapshot.character(), snapshot.skills(),
                create(LocalDate.parse(snapshot.dayKey()), journey.activeSkillIds(), snapshot.character().totalXp()), snapshot.boss(), snapshot.activities(),
                snapshot.unlockedAuras(), snapshot.momentum(), snapshot.bossProgress());
    }
}
