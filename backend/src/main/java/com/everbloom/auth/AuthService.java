package com.everbloom.auth;

import com.everbloom.common.api.ApiException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AccountRepository accounts;
    private final PasswordEncoder passwords;
    private final AccountTokens tokens;
    private final AccountMail mail;
    private final List<AccountExportContributor> exports;
    private final List<AccountDeletionContributor> deletions;
    private final String dummyHash;
    public AuthService(AccountRepository accounts, PasswordEncoder passwords, AccountTokens tokens,
                       AccountMail mail, List<AccountExportContributor> exports, List<AccountDeletionContributor> deletions) {
        this.accounts = accounts; this.passwords = passwords; this.tokens = tokens; this.mail = mail; this.exports = exports;
        this.deletions = deletions;
        this.dummyHash = passwords.encode(UUID.randomUUID().toString());
    }
    @Transactional
    public void register(AuthDtos.Credentials credentials) {
        String email = normalize(credentials.email());
        // Hash even for existing addresses; never change their password or return their identity.
        accounts.createIfAbsent(email, passwords.encode(credentials.password()));
        var row = accounts.findByEmail(email).flatMap(a -> accounts.lock(a.id())).orElseThrow();
        if (!row.verified()) sendVerification(row);
    }
    @Transactional
    public void requestVerification(String email) {
        accounts.findByEmail(normalize(email)).flatMap(a -> accounts.lock(a.id()))
                .filter(a -> !a.verified()).ifPresent(this::sendVerification);
    }
    private void sendVerification(AccountRepository.AccountRow row) {
        mail.deliver(row.email(), AccountTokens.VERIFY, tokens.issue(row.id(), AccountTokens.VERIFY, Duration.ofHours(1)));
    }
    @Transactional
    public void confirmVerification(String token) {
        var row = tokens.consume(token, AccountTokens.VERIFY);
        accounts.verify(row.id(), tokens.now());
    }
    @Transactional
    public void requestPassword(String email) {
        accounts.findByEmail(normalize(email)).flatMap(a -> accounts.lock(a.id())).filter(AccountRepository.AccountRow::verified)
                .ifPresent(row -> mail.deliver(row.email(), AccountTokens.RESET,
                        tokens.issue(row.id(), AccountTokens.RESET, Duration.ofMinutes(15))));
    }
    @Transactional
    public void resetPassword(AuthDtos.PasswordReset request) {
        var row = tokens.consume(request.token(), AccountTokens.RESET);
        accounts.resetPassword(row.id(), passwords.encode(request.password()));
        tokens.revokeAll(row.id());
    }
    @Transactional
    public AccountRepository.AccountRow authenticate(AuthDtos.Credentials credentials) {
        var found = accounts.findByEmail(normalize(credentials.email()));
        boolean matches = matches(credentials.password(), found.map(AccountRepository.AccountRow::passwordHash).orElse(dummyHash));
        if (found.isEmpty() || !matches) throw invalidCredentials();
        var row = accounts.lock(found.get().id()).orElseThrow(AuthService::invalidCredentials);
        // Lock/compare again only if a concurrent reset changed the hash after the first read.
        if (!row.passwordHash().equals(found.get().passwordHash()) && !matches(credentials.password(), row.passwordHash())) throw invalidCredentials();
        if (!row.verified()) throw new ApiException(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED", "Bitte bestätige zuerst deine E-Mail-Adresse.");
        if (!row.passwordHash().startsWith("{argon2}")) accounts.upgradePassword(row.id(), passwords.encode(credentials.password()));
        return row;
    }
    private boolean matches(String raw, String encoded) {
        // Legacy BCrypt hashes cannot represent >72 UTF-8 bytes; do not truncate or throw 500.
        if ((encoded.startsWith("$2") || encoded.startsWith("{bcrypt}")) && raw.getBytes(StandardCharsets.UTF_8).length > 72) {
            passwords.matches(raw, dummyHash); return false;
        }
        return passwords.matches(raw, encoded);
    }
    public AuthDtos.Account account(AccountRepository.AccountRow row) {
        return new AuthDtos.Account(row.id().toString(), row.email(), row.verified());
    }
    public String normalize(String raw) { return raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT); }
    public AccountRepository.AccountRow require(UUID id) {
        return accounts.findById(id).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "SESSION_EXPIRED", "Deine Sitzung ist abgelaufen."));
    }
    @Transactional(readOnly = true)
    public Map<String, Object> export(UUID id) {
        var row = require(id);
        var result = new LinkedHashMap<String, Object>();
        result.put("account", Map.of("id", row.id().toString(), "email", row.email(), "verified", row.verified(), "createdAt", row.createdAt().toString()));
        var game = new LinkedHashMap<String, Object>();
        exports.forEach(contributor -> game.putAll(contributor.export(id)));
        result.put("game", game);
        result.put("exportedAt", tokens.now().toString());
        return result;
    }
    @Transactional
    public void delete(UUID id, String password) {
        var row = accounts.lock(id).orElseThrow(AuthService::invalidCredentials);
        if (!matches(password, row.passwordHash())) throw invalidCredentials();
        deletions.forEach(contributor -> contributor.beforeDelete(id));
        accounts.delete(id);
    }
    private static ApiException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "E-Mail oder Passwort ist nicht korrekt.");
    }
}
