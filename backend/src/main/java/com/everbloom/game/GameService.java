package com.everbloom.game;

import com.everbloom.auth.AccountExportContributor;
import com.everbloom.billing.BillingService;
import com.everbloom.common.api.ApiException;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import static com.everbloom.game.GameModels.*;
import static com.everbloom.game.BossModels.*;

/** Account-row locks serialize initialization, profile edits and reward transactions. */
@Service
public class GameService implements AccountExportContributor {
    public static final ZoneId GAME_ZONE = ZoneId.of("Europe/Vienna");
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    private final Clock clock;
    private final BillingService billing;

    public GameService(JdbcTemplate jdbc, ObjectMapper json, @Qualifier("gameClock") Clock clock, BillingService billing) {
        this.jdbc = jdbc; this.json = json; this.clock = clock;
        this.billing = billing;
    }

    @Transactional
    public Snapshot load(UUID owner) {
        lockAccount(owner);
        return current(owner);
    }

    @Transactional
    public ProfileResult updateCharacter(UUID owner, Profile profile) {
        lockAccount(owner);
        Snapshot snapshot = GameRules.profile(current(owner), profile);
        save(owner, snapshot);
        return new ProfileResult(snapshot, true);
    }

    @Transactional
    public ActivityResult record(UUID owner, Command command) {
        lockAccount(owner);
        Snapshot before = current(owner);
        Command previous = jdbc.query("select request_id, skill_id, minutes from game_activity_requests where account_id = ? and request_id = ?",
                rs -> rs.next() ? new Command(rs.getString(1), rs.getString(2), rs.getInt(3)) : null, owner, command.requestId());
        if (previous != null) {
            if (!previous.equals(command)) throw GameRules.conflict();
            return GameRules.duplicate(before);
        }
        ActivityResult result = GameRules.record(before, command, billing.membership(owner).characterXpBonusPercent());
        jdbc.update("insert into game_activity_requests(account_id, request_id, skill_id, minutes) values (?, ?, ?, ?)",
                owner, command.requestId(), command.skillId(), command.minutes());
        save(owner, result.snapshot());
        return result;
    }

    @Transactional
    public FightResult fight(UUID owner, FightCommand command) {
        lockAccount(owner);
        Snapshot before = current(owner);
        var previous = jdbc.query("select boss_id, difficulty, tactic, result_json from game_boss_requests where account_id = ? and request_id = ?",
                rs -> {
                    if (!rs.next()) return null;
                    if (!rs.getString(1).equals(command.bossId()) || !rs.getString(2).equals(command.difficulty()) || !rs.getString(3).equals(command.tactic()))
                        throw new ApiException(HttpStatus.CONFLICT, "REQUEST_CONFLICT", "Diese Kampf-ID gehört bereits zu einem anderen Kampf.");
                    return json.readValue(rs.getString(4), Resolution.class);
                }, owner, command.requestId());
        if (previous != null) return new FightResult(before, previous.replay(), previous.firstClear(), previous.reward(), true);
        if (jdbc.queryForObject("select count(*) from game_boss_requests where account_id = ?", Integer.class, owner) >= 5000)
            throw new ApiException(HttpStatus.CONFLICT, "BATTLE_HISTORY_LIMIT", "Dein Kampfjournal ist voll. Deine bisherigen Siege bleiben erhalten.");
        if (!before.character().createdByPlayer()) throw new ApiException(HttpStatus.CONFLICT, "CHARACTER_REQUIRED", "Erstelle zuerst deinen Charakter.");
        if (!BossRules.discovered(before, command.bossId()))
            throw new ApiException(HttpStatus.FORBIDDEN, "BOSS_NOT_DISCOVERED", "Diese Begegnung wartet noch im Verborgenen. Besiege zuerst deinen aktuellen Boss.");
        if (BossRules.requiresPlus(command.bossId(), command.difficulty()) && !billing.membership(owner).advancedBosses())
            throw new ApiException(HttpStatus.FORBIDDEN, "PLUS_REQUIRED", "Für diese Begegnung brauchst du Herovera Plus. Die ersten fünf Bosse bis Level 50 bleiben auf Normal kostenlos spielbar.");
        Replay replay = BossRules.fight(before, command);
        boolean firstClear = replay.outcome().equals("victory") && !before.bossProgress().clearedEncounterIds().contains(command.bossId() + ":" + command.difficulty());
        Cosmetic reward = firstClear ? BossLoot.reward(command.bossId(), command.difficulty()) : null;
        Snapshot after = firstClear ? BossLoot.grant(before, reward) : before;
        Resolution resolution = new Resolution(replay, firstClear, reward);
        jdbc.update("insert into game_boss_requests(account_id, request_id, boss_id, difficulty, tactic, result_json) values (?, ?, ?, ?, ?, ?)",
                owner, command.requestId(), command.bossId(), command.difficulty(), command.tactic(), json.writeValueAsString(resolution));
        save(owner, after);
        return new FightResult(after, replay, firstClear, reward, false);
    }

    @Transactional
    public Journey journey(UUID owner) {
        lockAccount(owner);
        current(owner);
        return readJourney(owner);
    }

    @Transactional
    public Journey saveJourney(UUID owner, Journey journey) {
        lockAccount(owner);
        Snapshot snapshot = current(owner);
        if (DailyQuestPlan.canReplaceToday(snapshot)) save(owner, DailyQuestPlan.apply(snapshot, journey));
        jdbc.update("update game_states set journey_json = ?, updated_at = CURRENT_TIMESTAMP where account_id = ?", json.writeValueAsString(journey), owner);
        return journey;
    }

    /** Export does not initialize a game or award anything. The account service owns its transaction. */
    @Override
    public Map<String, Object> export(UUID owner) {
        return jdbc.query("select snapshot_json, journey_json from game_states where account_id = ?", rs -> {
            Map<String, Object> data = new LinkedHashMap<>();
            if (rs.next()) {
                data.put("snapshot", json.readValue(rs.getString(1), Snapshot.class));
                data.put("journey", rs.getString(2) == null ? null : json.readValue(rs.getString(2), Journey.class));
            } else {
                data.put("snapshot", null);
                data.put("journey", null);
            }
            data.put("bossEncounters", jdbc.query("select request_id, boss_id, difficulty, tactic, result_json, created_at from game_boss_requests where account_id = ? order by created_at", (encounters, index) -> Map.of(
                    "requestId", encounters.getString(1), "bossId", encounters.getString(2), "difficulty", encounters.getString(3), "tactic", encounters.getString(4),
                    "result", json.readValue(encounters.getString(5), Resolution.class), "createdAt", encounters.getString(6)), owner));
            return data;
        }, owner);
    }

    private void lockAccount(UUID owner) {
        boolean exists = jdbc.query("select id from accounts where id = ? and email_verified_at is not null for update", rs -> { return rs.next(); }, owner);
        if (!exists) throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Bitte melde dich mit einem bestätigten Konto an.");
    }

    private Snapshot current(UUID owner) {
        Snapshot previous = read(owner);
        LocalDate today = LocalDate.ofInstant(clock.instant(), GAME_ZONE);
        if (previous == null) {
            Snapshot fresh = GameRules.fresh(owner, today);
            jdbc.update("insert into game_states(account_id, snapshot_json) values (?, ?)", owner, json.writeValueAsString(fresh));
            return fresh;
        }
        Snapshot advanced = GameRules.advance(previous, today);
        if (!previous.dayKey().equals(advanced.dayKey())) {
            Journey journey = readJourney(owner);
            if (journey != null) advanced = DailyQuestPlan.apply(advanced, journey);
        }
        if (!advanced.equals(previous)) save(owner, advanced);
        return advanced;
    }

    private Snapshot read(UUID owner) {
        return jdbc.query("select snapshot_json from game_states where account_id = ?", rs -> rs.next()
                ? json.readValue(rs.getString(1), Snapshot.class) : null, owner);
    }

    private Journey readJourney(UUID owner) {
        return jdbc.query("select journey_json from game_states where account_id = ?", rs -> {
            if (!rs.next() || rs.getString(1) == null) return null;
            return json.readValue(rs.getString(1), Journey.class);
        }, owner);
    }

    private void save(UUID owner, Snapshot snapshot) {
        jdbc.update("update game_states set snapshot_json = ?, updated_at = CURRENT_TIMESTAMP where account_id = ?", json.writeValueAsString(snapshot), owner);
    }
}
