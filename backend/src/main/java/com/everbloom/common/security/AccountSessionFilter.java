package com.everbloom.common.security;

import com.everbloom.auth.AccountRepository;
import com.everbloom.auth.EverbloomAuthentication;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/** Rejects deleted accounts and pre-reset contexts even if an in-flight request saved an old session. */
public final class AccountSessionFilter extends OncePerRequestFilter {
    public static final String EXPECTED_ACCOUNT_HEADER = "X-Everbloom-Account";
    private final AccountRepository accounts;
    public AccountSessionFilter(AccountRepository accounts) { this.accounts = accounts; }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof EverbloomAuthentication account) {
            var current = accounts.findById(UUID.fromString(account.getName()));
            if (current.isEmpty() || !current.get().verified() || current.get().sessionVersion() != account.sessionVersion()) {
                SecurityContextHolder.clearContext();
                if (request.getSession(false) != null) request.getSession(false).invalidate();
            } else if (ownedPath(request.getRequestURI().substring(request.getContextPath().length())) && request.getHeader(EXPECTED_ACCOUNT_HEADER) != null &&
                    !account.getName().equals(request.getHeader(EXPECTED_ACCOUNT_HEADER))) {
                // A cookie may have changed in another tab. This is an expected-owner assertion,
                // never an authentication source; legacy API clients may omit it.
                // Keep the real session intact: the stale tab must not log the other account out.
                response.setStatus(409);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"code\":\"ACCOUNT_CHANGED\",\"message\":\"Das Konto wurde in einem anderen Fenster gewechselt. Bitte melde dich erneut an.\"}");
                return;
            }
        }
        chain.doFilter(request, response);
    }
    private static boolean ownedPath(String path) {
        return path.equals("/api/game") || path.startsWith("/api/game/") ||
                path.startsWith("/api/account/") || path.equals("/api/auth/logout") ||
                path.equals("/api/billing/membership") || path.equals("/api/billing/refresh");
    }
}
