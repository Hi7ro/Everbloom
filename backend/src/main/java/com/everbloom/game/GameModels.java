package com.everbloom.game;

import java.util.List;
import java.util.Map;

/** Wire records mirror the Angular domain; all rewards are calculated on the server. */
public final class GameModels {
    private GameModels() {}
    public record Character(boolean createdByPlayer, String id, String name, String title,
                            long totalXp, Map<String, Integer> attributes, Map<String, String> appearance) {}
    public record Skill(String skillId, long totalXp) {}
    public record Quest(String id, String title, String description, String skillId, int targetMinutes,
                        int progressMinutes, int bonusXp, boolean claimed) {}
    public record Boss(String id, String name, String weekLabel, int maxHp, int hp) {}
    public record Activity(String requestId, String skillId, int minutes, String dayKey,
                           int rewardedMinutes, int xp, Integer membershipXp) {
        public Activity { membershipXp = membershipXp == null ? 0 : membershipXp; }
        public Activity(String requestId, String skillId, int minutes, String dayKey, int rewardedMinutes, int xp) {
            this(requestId, skillId, minutes, dayKey, rewardedMinutes, xp, 0);
        }
    }
    public record RhythmDay(String label, String status) {}
    public record Momentum(int value, String lastRewardDay, List<RhythmDay> rhythm) {}
    public record Snapshot(String dayKey, Character character, List<Skill> skills, List<Quest> quests,
                           Boss boss, List<Activity> activities, List<String> unlockedAuras, Momentum momentum,
                           BossProgress bossProgress) {
        public Snapshot {
            if (bossProgress == null) bossProgress = new BossProgress(List.of(), List.of());
        }
        /** Existing stored snapshots and progression fixtures predate boss encounters. */
        public Snapshot(String dayKey, Character character, List<Skill> skills, List<Quest> quests,
                        Boss boss, List<Activity> activities, List<String> unlockedAuras, Momentum momentum) {
            this(dayKey, character, skills, quests, boss, activities, unlockedAuras, momentum, null);
        }
    }
    public record BossProgress(List<String> clearedEncounterIds, List<String> unlockedCosmetics) {}
    public record Command(String requestId, String skillId, int minutes) {}
    public record Reward(int activityXp, int questXp, int damage, int rewardedMinutes, boolean duplicate, Integer membershipXp) {
        public Reward { membershipXp = membershipXp == null ? 0 : membershipXp; }
        public Reward(int activityXp, int questXp, int damage, int rewardedMinutes, boolean duplicate) {
            this(activityXp, questXp, damage, rewardedMinutes, duplicate, 0);
        }
    }
    public record ActivityResult(Snapshot snapshot, Reward reward) {}
    public record Profile(String name, Map<String, String> appearance) {}
    public record ProfileResult(Snapshot snapshot, boolean persisted) {}
    public record Journey(List<String> interestIds, List<String> activeSkillIds, String primaryInterestId) {}
}
