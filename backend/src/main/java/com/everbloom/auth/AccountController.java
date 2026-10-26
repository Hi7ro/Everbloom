package com.everbloom.auth;

import com.everbloom.common.security.RateLimiter;
import com.everbloom.common.security.ClientAddresses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
public class AccountController {
    private final AuthService auth;
    private final RateLimiter limiter;
    private final ClientAddresses addresses;
    public AccountController(AuthService auth, RateLimiter limiter, ClientAddresses addresses) { this.auth = auth; this.limiter = limiter; this.addresses = addresses; }
    @GetMapping("/export")
    ResponseEntity<Map<String, Object>> export(Authentication authentication, HttpServletRequest request) {
        limiter.check("export-ip", addresses.client(request), 30, Duration.ofHours(1));
        limiter.check("export-account", authentication.getName(), 10, Duration.ofHours(1));
        return ResponseEntity.ok().header("Content-Disposition", "attachment; filename=\"everbloom-account.json\"")
                .body(auth.export(UUID.fromString(authentication.getName())));
    }
    @PostMapping("/delete")
    ResponseEntity<Void> delete(@Valid @RequestBody AuthDtos.DeleteRequest body, Authentication authentication,
                                HttpServletRequest request, HttpServletResponse response) {
        limiter.check("delete-ip", addresses.client(request), 20, Duration.ofMinutes(15));
        limiter.check("delete-account", authentication.getName(), 5, Duration.ofMinutes(15));
        auth.delete(UUID.fromString(authentication.getName()), body.password());
        AuthController.clearSession(request, response, authentication);
        return ResponseEntity.noContent().build();
    }
}
