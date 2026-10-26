package com.everbloom.auth;

import com.everbloom.common.security.RateLimiter;
import com.everbloom.common.security.ClientAddresses;
import java.time.Duration;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.CookieClearingLogoutHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final AuthDtos.Message GENERIC = new AuthDtos.Message("Falls die Adresse für diese Anfrage infrage kommt, erhältst du eine E-Mail mit den nächsten Schritten.");
    private final AuthService auth;
    private final RateLimiter limiter;
    private final ClientAddresses addresses;
    private final SecurityContextRepository contexts;
    private final SessionAuthenticationStrategy sessions;
    private final int loginLimit, registerLimit, requestLimit, ipLimit;
    private final Duration window;
    public AuthController(AuthService auth, RateLimiter limiter, ClientAddresses addresses, SecurityContextRepository contexts, SessionAuthenticationStrategy sessions,
                          @Value("${app.auth.login-limit:10}") int loginLimit,
                          @Value("${app.auth.register-limit:3}") int registerLimit,
                          @Value("${app.auth.request-limit:3}") int requestLimit,
                          @Value("${app.auth.ip-limit:60}") int ipLimit,
                          @Value("${app.auth.window-seconds:900}") int windowSeconds) {
        this.auth = auth; this.limiter = limiter; this.addresses = addresses; this.contexts = contexts; this.sessions = sessions;
        this.loginLimit = loginLimit; this.registerLimit = registerLimit; this.requestLimit = requestLimit;
        this.ipLimit = ipLimit; this.window = Duration.ofSeconds(windowSeconds);
    }
    @GetMapping("/csrf")
    AuthDtos.Csrf csrf(CsrfToken token, HttpServletRequest request) {
        limiter.check("csrf-ip", addresses.client(request), ipLimit * 4, window);
        return new AuthDtos.Csrf(token.getToken(), token.getHeaderName());
    }
    @PostMapping("/register")
    ResponseEntity<AuthDtos.Message> register(@Valid @RequestBody AuthDtos.Credentials credentials, HttpServletRequest request) {
        limited("register", credentials.email(), registerLimit, request);
        auth.register(credentials); return ResponseEntity.accepted().body(GENERIC);
    }
    @PostMapping("/login")
    AuthDtos.Account login(@Valid @RequestBody AuthDtos.Credentials credentials, HttpServletRequest request, HttpServletResponse response) {
        limited("login", credentials.email(), loginLimit, request);
        var row = auth.authenticate(credentials);
        Authentication authentication = new EverbloomAuthentication(row.id(), row.email(), row.sessionVersion());
        sessions.onAuthentication(authentication, request, response);
        var context = SecurityContextHolder.createEmptyContext(); context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context); contexts.saveContext(context, request, response);
        return auth.account(row);
    }
    @GetMapping("/me")
    AuthDtos.Account me(Authentication authentication) { return auth.account(auth.require(UUID.fromString(authentication.getName()))); }
    @PostMapping("/logout")
    ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        clearSession(request, response, authentication); return ResponseEntity.noContent().build();
    }
    @PostMapping("/verification/request")
    ResponseEntity<AuthDtos.Message> requestVerification(@Valid @RequestBody AuthDtos.EmailRequest body, HttpServletRequest request) {
        limited("verification", body.email(), requestLimit, request);
        auth.requestVerification(body.email()); return ResponseEntity.accepted().body(GENERIC);
    }
    @PostMapping("/verification/confirm")
    ResponseEntity<Void> confirmVerification(@Valid @RequestBody AuthDtos.TokenRequest body, HttpServletRequest request) {
        limiter.check("confirm-ip", addresses.client(request), ipLimit, window);
        auth.confirmVerification(body.token()); return ResponseEntity.noContent().build();
    }
    @PostMapping("/password/request")
    ResponseEntity<AuthDtos.Message> requestPassword(@Valid @RequestBody AuthDtos.EmailRequest body, HttpServletRequest request) {
        limited("password-request", body.email(), requestLimit, request);
        auth.requestPassword(body.email()); return ResponseEntity.accepted().body(GENERIC);
    }
    @PostMapping("/password/reset")
    ResponseEntity<Void> resetPassword(@Valid @RequestBody AuthDtos.PasswordReset body, HttpServletRequest request,
                                      HttpServletResponse response, Authentication authentication) {
        limiter.check("reset-ip", addresses.client(request), ipLimit, window);
        auth.resetPassword(body); clearSession(request, response, authentication);
        return ResponseEntity.noContent().build();
    }
    private void limited(String action, String email, int limit, HttpServletRequest request) {
        limiter.check("auth-ip", addresses.client(request), ipLimit, window);
        limiter.check(action + "-account", auth.normalize(email), limit, window);
    }
    static void clearSession(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        new CookieClearingLogoutHandler("EVERBLOOM_SESSION").logout(request, response, authentication);
    }
}
