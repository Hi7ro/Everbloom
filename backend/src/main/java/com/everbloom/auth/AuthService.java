package com.everbloom.auth;

import com.everbloom.common.api.ApiException;
import java.util.Locale;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AccountRepository accounts;
    private final PasswordEncoder passwords;

    public AuthService(AccountRepository accounts, PasswordEncoder passwords) {
        this.accounts = accounts;
        this.passwords = passwords;
    }

    @Transactional
    public AuthDtos.Account register(AuthDtos.Credentials credentials) {
        String email = normalize(credentials.email());
        try {
            AccountRepository.AccountRow row = accounts.create(email, passwords.encode(credentials.password()));
            return account(row);
        } catch (DuplicateKeyException duplicate) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_IN_USE", "Für diese E-Mail-Adresse existiert bereits ein Konto.");
        }
    }

    public AccountRepository.AccountRow authenticate(AuthDtos.Credentials credentials) {
        String email = normalize(credentials.email());
        AccountRepository.AccountRow row = accounts.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "E-Mail oder Passwort ist nicht korrekt."));
        if (!passwords.matches(credentials.password(), row.passwordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "E-Mail oder Passwort ist nicht korrekt.");
        }
        return row;
    }

    public AuthDtos.Account account(AccountRepository.AccountRow row) {
        return new AuthDtos.Account(row.id().toString(), row.email());
    }

    public String normalize(String raw) {
        return raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
    }

    public AccountRepository.AccountRow require(UUID id) {
        return accounts.findById(id).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "SESSION_EXPIRED", "Deine Sitzung ist abgelaufen."));
    }
}
