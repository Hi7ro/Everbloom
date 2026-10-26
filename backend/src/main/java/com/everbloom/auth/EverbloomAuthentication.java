package com.everbloom.auth;

import java.io.Serial;
import java.util.List;
import java.util.UUID;
import org.springframework.security.authentication.AbstractAuthenticationToken;

public final class EverbloomAuthentication extends AbstractAuthenticationToken {
    @Serial private static final long serialVersionUID = 1L;
    private final UUID id;
    private final String email;
    private final long sessionVersion;
    public EverbloomAuthentication(UUID id, String email) { this(id, email, 0); }
    public EverbloomAuthentication(UUID id, String email, long sessionVersion) {
        super(List.of());
        this.id = id; this.email = email; this.sessionVersion = sessionVersion;
        setAuthenticated(true);
    }
    @Override public Object getCredentials() { return ""; }
    @Override public Object getPrincipal() { return id.toString(); }
    @Override public String getName() { return id.toString(); }
    public String email() { return email; }
    public long sessionVersion() { return sessionVersion; }
}
