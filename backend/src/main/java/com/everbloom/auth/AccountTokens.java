package com.everbloom.auth;

import com.everbloom.common.api.ApiException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Raw 256-bit tokens exist only in request/mail memory. Database stores SHA-256 digests. */
@Component
public class AccountTokens {
    public static final String VERIFY = "verification";
    public static final String RESET = "password-reset";
    private final JdbcTemplate jdbc;
    private final AccountRepository accounts;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();
    public AccountTokens(JdbcTemplate jdbc, AccountRepository accounts, Clock clock) {
        this.jdbc = jdbc; this.accounts = accounts; this.clock = clock;
    }
    // Caller holds an account row lock in its transaction, serializing issue/consume/reset/delete.
    public String issue(UUID owner, String purpose, Duration ttl) {
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        jdbc.update("delete from auth_tokens where account_id = ? and purpose = ?", owner, purpose);
        jdbc.update("delete from auth_tokens where expires_at <= ?", now());
        jdbc.update("insert into auth_tokens (token_hash, account_id, purpose, expires_at) values (?, ?, ?, ?)",
                digest(raw), owner, purpose, now().plus(ttl));
        return raw;
    }
    public AccountRepository.AccountRow consume(String raw, String purpose) {
        if (raw == null || !raw.matches("[A-Za-z0-9_-]{43}")) throw invalid();
        String hash = digest(raw);
        var owners = jdbc.query("select account_id from auth_tokens where token_hash = ? and purpose = ? and expires_at > ?",
                (rs, n) -> rs.getObject(1, UUID.class), hash, purpose, now());
        if (owners.isEmpty()) throw invalid();
        var account = accounts.lock(owners.getFirst()).orElseThrow(AccountTokens::invalid);
        int consumed = jdbc.update("delete from auth_tokens where token_hash = ? and purpose = ? and expires_at > ?",
                hash, purpose, now());
        if (consumed != 1) throw invalid();
        return account;
    }
    public void revokeAll(UUID owner) { jdbc.update("delete from auth_tokens where account_id = ?", owner); }
    public OffsetDateTime now() { return OffsetDateTime.now(clock); }
    public static String digest(String input) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(input.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException impossible) { throw new IllegalStateException("SHA-256 unavailable"); }
    }
    private static ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOKEN", "Der Link ist ungültig oder abgelaufen. Fordere bitte einen neuen Link an.");
    }
}
