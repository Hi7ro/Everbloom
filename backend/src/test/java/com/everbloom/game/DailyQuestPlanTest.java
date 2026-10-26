package com.everbloom.game;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static com.everbloom.game.GameModels.*;
import static org.junit.jupiter.api.Assertions.*;

class DailyQuestPlanTest {
    private final LocalDate day = LocalDate.of(2026, 10, 4);

    @Test void chosenSkillsReceiveTheirOwnGoalsAndNoUnselectedActivities() {
        List<Quest> quests = DailyQuestPlan.create(day, List.of("swimming", "reading", "music"), 0);
        assertEquals(List.of("swimming", "reading", "music"), quests.stream().map(Quest::skillId).toList());
        assertEquals(List.of(15, 15, 10), quests.stream().map(Quest::targetMinutes).toList());
        assertEquals(List.of(40, 40, 40), quests.stream().map(Quest::bonusXp).toList());
        assertEquals("daily:2026-10-04:swimming", quests.getFirst().id());
        assertTrue(quests.stream().allMatch(quest -> quest.progressMinutes() == 0 && !quest.claimed()));
    }

    @Test void sixSkillsRotateByCivilDayWithoutDuplicateGoalsOrAdditionalBonus() {
        List<String> skills = List.of("calisthenics", "running", "meditation", "programming", "swimming", "music");
        assertEquals(List.of("calisthenics", "running", "meditation"),
                DailyQuestPlan.create(day, skills, 0).stream().map(Quest::skillId).toList());
        assertEquals(List.of("running", "meditation", "programming"),
                DailyQuestPlan.create(day.plusDays(1), skills, 0).stream().map(Quest::skillId).toList());
        assertEquals(List.of("music", "calisthenics", "running"),
                DailyQuestPlan.create(day.plusDays(5), skills, 0).stream().map(Quest::skillId).toList());
        for (int index = 0; index < 14; index++) {
            List<Quest> quests = DailyQuestPlan.create(day.plusDays(index), skills, 0);
            assertEquals(3, quests.stream().map(Quest::skillId).distinct().count());
            assertEquals(120, quests.stream().mapToInt(Quest::bonusXp).sum());
            assertEquals(quests, DailyQuestPlan.create(day.plusDays(index), skills, 0));
        }
    }

    @Test void smallerFocusDoesNotInventMoreSkillsOrDuplicateRewards() {
        assertEquals(List.of("recovery"), DailyQuestPlan.create(day, List.of("recovery"), 0).stream().map(Quest::skillId).toList());
        List<Quest> two = DailyQuestPlan.create(day, List.of("breathwork", "languages"), 0);
        assertEquals(List.of("breathwork", "languages"), two.stream().map(Quest::skillId).toList());
        assertEquals(80, two.stream().mapToInt(Quest::bonusXp).sum());
        assertEquals(two, DailyQuestPlan.create(day, List.of("breathwork", "languages", "breathwork"), 0));
    }

    @Test void everySupportedSkillHasABoundedGoalAndTheSameStartingBonus() {
        Map<String, Integer> minutes = Map.ofEntries(
                Map.entry("calisthenics", 20), Map.entry("running", 15), Map.entry("meditation", 10),
                Map.entry("programming", 30), Map.entry("weightlifting", 20), Map.entry("swimming", 15),
                Map.entry("boxing", 15), Map.entry("bjj", 15), Map.entry("breathwork", 5),
                Map.entry("recovery", 10), Map.entry("reading", 15), Map.entry("languages", 10),
                Map.entry("healthy-cooking", 20), Map.entry("music", 10));
        for (GameRules.SkillRule skill : GameRules.SKILLS) {
            Quest quest = DailyQuestPlan.create(day, List.of(skill.id()), 0).getFirst();
            assertEquals(minutes.get(skill.id()), quest.targetMinutes());
            assertTrue(quest.targetMinutes() <= skill.dailyLimit());
            assertEquals(40, quest.bonusXp());
            assertFalse(quest.title().isBlank());
        }
    }

    @ParameterizedTest
    @CsvSource({"0, 40", "6000, 40", "8000, 45", "18000, 60", "57000, 100", "195000, 180", "294000, 220", "1089000, 420", "25000000, 2000", "100000000, 4000"})
    void questBonusGrowsWithTheCharacterWithoutIncreasingActivityTargets(long totalXp, int expectedBonus) {
        List<Quest> quests = DailyQuestPlan.create(day, List.of("swimming", "reading", "music"), totalXp);
        assertEquals(List.of(expectedBonus, expectedBonus, expectedBonus), quests.stream().map(Quest::bonusXp).toList());
        assertEquals(List.of(15, 15, 10), quests.stream().map(Quest::targetMinutes).toList());
        assertEquals(expectedBonus * 3, quests.stream().mapToInt(Quest::bonusXp).sum());
    }

    @Test void aPartialLevelUsesItsCurrentLevelAndAnExactBoundaryStartsTheNextRewardTier() {
        assertEquals(55, DailyQuestPlan.create(day, List.of("reading"), 17999).getFirst().bonusXp());
        assertEquals(60, DailyQuestPlan.create(day, List.of("reading"), 18000).getFirst().bonusXp());
        assertEquals(60, DailyQuestPlan.create(day, List.of("reading"), 20999).getFirst().bonusXp());
        assertEquals(65, DailyQuestPlan.create(day, List.of("reading"), 21000).getFirst().bonusXp());
    }

    @Test void extremeTotalsRemainPositiveWithoutOverflowOrLinearLevelWalking() {
        List<Quest> quests = DailyQuestPlan.create(day, List.of("swimming", "reading", "music"), Long.MAX_VALUE);
        assertEquals(List.of(715827880, 715827880, 715827880), quests.stream().map(Quest::bonusXp).toList());
        assertEquals(2147483640, quests.stream().mapToInt(Quest::bonusXp).sum());
        assertEquals(40, DailyQuestPlan.create(day, List.of("reading"), Long.MIN_VALUE).getFirst().bonusXp());
    }

    @Test void anyActivityOrQuestProgressLocksTheCurrentBoardIncludingUnrewardedEntries() {
        Snapshot fresh = GameRules.fresh(UUID.randomUUID(), day);
        assertTrue(DailyQuestPlan.canReplaceToday(fresh));
        Snapshot zeroXp = new Snapshot(fresh.dayKey(), fresh.character(), fresh.skills(), fresh.quests(), fresh.boss(),
                List.of(new Activity("unrewarded", "running", 1, fresh.dayKey(), 0, 0)), fresh.unlockedAuras(), fresh.momentum());
        assertFalse(DailyQuestPlan.canReplaceToday(zeroXp));
        for (Quest quest : List.of(
                new Quest("partial", "Title", "Description", "swimming", 15, 1, 40, false),
                new Quest("claimed", "Title", "Description", "swimming", 15, 0, 40, true))) {
            Snapshot progress = new Snapshot(fresh.dayKey(), fresh.character(), fresh.skills(), List.of(quest), fresh.boss(),
                    List.of(), fresh.unlockedAuras(), fresh.momentum());
            assertFalse(DailyQuestPlan.canReplaceToday(progress));
        }
        Snapshot yesterday = new Snapshot(fresh.dayKey(), fresh.character(), fresh.skills(), fresh.quests(), fresh.boss(),
                List.of(new Activity("old", "running", 15, day.minusDays(1).toString(), 15, 45)), fresh.unlockedAuras(), fresh.momentum());
        assertTrue(DailyQuestPlan.canReplaceToday(yesterday));
    }

    @Test void applyingAPlanPreservesProgressAndLegacyDefaultsRemainIntact() {
        Snapshot fresh = GameRules.fresh(UUID.randomUUID(), day);
        assertEquals(List.of(50, 30, 40), fresh.quests().stream().map(Quest::bonusXp).toList());
        Snapshot planned = DailyQuestPlan.apply(fresh, new Journey(List.of("physical"), List.of("swimming"), "physical"));
        assertEquals(fresh.character(), planned.character());
        assertEquals(fresh.skills(), planned.skills());
        assertEquals(fresh.activities(), planned.activities());
        assertEquals(fresh.boss(), planned.boss());
        assertEquals(fresh.bossProgress(), planned.bossProgress());
        assertEquals(fresh.momentum(), planned.momentum());
        assertEquals(fresh.unlockedAuras(), planned.unlockedAuras());
        ActivityResult result = GameRules.record(planned, new Command("swim", "swimming", 15));
        assertEquals(45, result.reward().activityXp());
        assertEquals(40, result.reward().questXp());
        assertEquals(85, result.snapshot().character().totalXp());
        assertEquals(45, result.snapshot().skills().stream().filter(skill -> skill.skillId().equals("swimming")).findFirst().orElseThrow().totalXp());
        assertEquals(90, result.reward().damage());
    }
}
