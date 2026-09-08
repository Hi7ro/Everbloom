package com.everbloom.auth;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AccountRepository {
    private final JdbcTemplate jdbc;

    public AccountRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Optional<AccountRow> findByEmail(String email) {
        return jdbc.query("select id, email, password_hash from accounts where email = ?", rs ->
                rs.next() ? Optional.of(new AccountRow(UUID.fromString(rs.getString("id")), rs.getString("email"), rs.getString("password_hash"))) : Optional.empty(), email);
    }

    public Optional<AccountRow> findById(UUID id) {
        return jdbc.query("select id, email, password_hash from accounts where id = ?", rs ->
                rs.next() ? Optional.of(new AccountRow(UUID.fromString(rs.getString("id")), rs.getString("email"), rs.getString("password_hash"))) : Optional.empty(), id);
    }

    public AccountRow create(String email, String passwordHash) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into accounts (id, email, password_hash, created_at) values (?, ?, ?, ?)", id, email, passwordHash, OffsetDateTime.now());
        return new AccountRow(id, email, passwordHash);
    }

    public record AccountRow(UUID id, String email, String passwordHash) {}
}
