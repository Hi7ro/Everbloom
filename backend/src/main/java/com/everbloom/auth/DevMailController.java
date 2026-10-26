package com.everbloom.auth;

import com.everbloom.common.api.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile({"dev", "test"})
public class DevMailController {
    private final AccountMail mail;
    public DevMailController(AccountMail mail) { this.mail = mail; }
    @GetMapping("/api/dev/mail/outbox")
    List<AccountMail.Delivery> outbox(HttpServletRequest request) {
        // Do not trust Forwarded/X-Forwarded-For. Reject browser cross-origin requests too.
        if (!List.of("127.0.0.1", "localhost", "::1", "[::1]").contains(request.getServerName())
                || !List.of("127.0.0.1", "::1", "0:0:0:0:0:0:0:1").contains(request.getRemoteAddr())
                || (request.getHeader("Sec-Fetch-Site") != null && !List.of("same-origin", "none").contains(request.getHeader("Sec-Fetch-Site"))))
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Nicht gefunden.");
        return mail.outbox();
    }
}
