package com.everbloom.auth;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class AccountRepository {
    private static final String COLUMNS = "id, email, password_hash, created_at, email_verified_at, session_version";
    private static final RowMapper<AccountRow> MAPPER = (rs, n) -> new AccountRow(
            rs.getObject("id", UUID.class), rs.getString("email"), rs.getString("password_hash"),
            rs.getObject("created_at", OffsetDateTime.class), rs.getObject("email_verified_at", OffsetDateTime.class),
            rs.getLong("session_version"));
    private final JdbcTemplate jdbc;
    public AccountRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public Optional<AccountRow> findByEmail(String email) {
        return jdbc.query("select " + COLUMNS + " from accounts where email = ?", MAPPER, email).stream().findFirst();
    }
    public Optional<AccountRow> findById(UUID id) {
        return jdbc.query("select " + COLUMNS + " from accounts where id = ?", MAPPER, id).stream().findFirst();
    }
    public Optional<AccountRow> lock(UUID id) {
        return jdbc.query("select " + COLUMNS + " from accounts where id = ? for update", MAPPER, id).stream().findFirst();
    }
    public void createIfAbsent(String email, String passwordHash) {
        jdbc.update("insert into accounts (id, email, password_hash, created_at) values (?, ?, ?, ?) on conflict do nothing",
                UUID.randomUUID(), email, passwordHash, OffsetDateTime.now());
    }
    public void verify(UUID id, OffsetDateTime now) {
        jdbc.update("update accounts set email_verified_at = coalesce(email_verified_at, ?) where id = ?", now, id);
    }
    public void resetPassword(UUID id, String hash) {
        jdbc.update("update accounts set password_hash = ?, session_version = session_version + 1 where id = ?", hash, id);
        revokeSessions(id);
    }
    public void upgradePassword(UUID id, String hash) { jdbc.update("update accounts set password_hash = ? where id = ?", hash, id); }
    public void revokeSessions(UUID id) { jdbc.update("delete from spring_session where principal_name = ?", id.toString()); }
    public void delete(UUID id) { revokeSessions(id); jdbc.update("delete from accounts where id = ?", id); }
    public record AccountRow(UUID id, String email, String passwordHash, OffsetDateTime createdAt,
                             OffsetDateTime verifiedAt, long sessionVersion) {
        public boolean verified() { return verifiedAt != null; }
    }
}
