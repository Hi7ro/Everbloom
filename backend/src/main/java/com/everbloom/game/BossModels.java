package com.everbloom.game;

import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonInclude;
import static com.everbloom.game.GameModels.Snapshot;

public final class BossModels {
    private BossModels() {}
    public record FightCommand(String requestId, String bossId, String difficulty, String tactic) {}
    public record Stats(int level, int maxHp, int attack, int defense) {}
    public record HeroStats(int level, int maxHp, int attack, int defense, int criticalEvery,
                            Map<String, Integer> attributes) {}
    public record Hero(String id, String name, HeroStats stats) {}
    public record Enemy(String id, String name, Stats stats) {}
    public record Initial(int heroHp, int bossHp) {}
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Turn(int index, int round, String actor, String action, String label, int damage,
                       int healing, boolean critical, int heroHp, int bossHp, String bossPhase, String abilityId) {}
    public record NoXpReward(int xp, List<String> loot) {}
    public record Replay(String mode, String difficulty, String tactic, Hero hero, Enemy boss, Initial initial,
                         List<Turn> turns, String outcome, int roundCount, NoXpReward rewards) {}
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Cosmetic(String id, String name, String description, String bossId, String difficulty,
                           String slot, String rarity, String auraId, Map<String, String> modules, String tint) {}
    public record Resolution(Replay replay, boolean firstClear, Cosmetic reward) {}
    public record FightResult(Snapshot snapshot, Replay replay, boolean firstClear, Cosmetic reward, boolean duplicate) {}
}
