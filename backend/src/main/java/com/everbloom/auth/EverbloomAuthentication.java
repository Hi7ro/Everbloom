package com.everbloom.auth;

import java.util.List;
import java.util.UUID;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

public final class EverbloomAuthentication extends AbstractAuthenticationToken {
    private final UUID id;
    private final String email;

    public EverbloomAuthentication(UUID id, String email) {
        super(List.of());
        this.id = id;
        this.email = email;
        setAuthenticated(true);
    }

    @Override public Object getCredentials() { return ""; }
    @Override public Object getPrincipal() { return email; }
    @Override public String getName() { return id.toString(); }
    public String email() { return email; }
}
