package com.everbloom.auth;

import com.everbloom.common.api.ApiException;
import com.everbloom.common.security.RateLimiter;
import java.time.Duration;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final RateLimiter limiter;

    public AuthController(AuthService auth, RateLimiter limiter) {
        this.auth = auth;
        this.limiter = limiter;
    }

    @GetMapping("/csrf")
    AuthDtos.Csrf csrf(CsrfToken token) { return new AuthDtos.Csrf(token.getToken(), token.getHeaderName()); }

    @PostMapping("/register")
    ResponseEntity<AuthDtos.Account> register(@Valid @RequestBody AuthDtos.Credentials credentials) {
        limiter.check("register", auth.normalize(credentials.email()), 5, Duration.ofMinutes(15));
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.register(credentials));
    }

    @PostMapping("/login")
    AuthDtos.Account login(@Valid @RequestBody AuthDtos.Credentials credentials, HttpServletRequest request) {
        limiter.check("login", auth.normalize(credentials.email()), 15, Duration.ofMinutes(15));
        AccountRepository.AccountRow row = auth.authenticate(credentials);
        if (request.getSession(false) != null) request.changeSessionId();
        Authentication authentication = new EverbloomAuthentication(row.id(), row.email());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        return auth.account(row);
    }

    @GetMapping("/me")
    AuthDtos.Account me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Bitte melde dich an.");
        return auth.account(auth.require(UUID.fromString(authentication.getName())));
    }

    @PostMapping("/logout")
    ResponseEntity<Void> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.noContent().build();
    }
}
