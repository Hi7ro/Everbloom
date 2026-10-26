package com.everbloom.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {
    private static final String PASSWORD = "a-strong-password-123";
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired AccountMail mail;
    @Autowired AuthService auth;
    @Autowired com.everbloom.common.security.RateLimiter limiter;

    @BeforeEach void clear() {
        jdbc.update("delete from spring_session"); jdbc.update("delete from accounts"); jdbc.update("delete from auth_rate_limits");
    }
    @Test void csrfEndpointReturnsMaskedTokenAndBoundedHttpOnlyCookie() throws Exception {
        var result = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty()).andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"))
                .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("no-store"))).andReturn();
        var cookie = result.getResponse().getCookie("EVERBLOOM_SESSION");
        assertThat(cookie).isNotNull(); assertThat(cookie.isHttpOnly()).isTrue(); assertThat(cookie.getMaxAge()).isEqualTo(1800);
        assertThat(result.getResponse().getHeader("Set-Cookie")).contains("SameSite=Lax");
    }
    @Test void registrationIsGenericAndDoesNotAuthenticateOrVerify() throws Exception {
        var browser = browser();
        var first = postJson("/api/auth/register", credentials("new@example.com", PASSWORD), browser)
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.id").doesNotExist()).andReturn();
        var duplicate = postJson("/api/auth/register", credentials("NEW@example.com", "another-strong-password"), browser)
                .andExpect(status().isAccepted()).andReturn();
        assertThat(duplicate.getResponse().getContentAsString()).isEqualTo(first.getResponse().getContentAsString());
        mvc.perform(get("/api/auth/me").cookie(browser.cookie())).andExpect(status().isUnauthorized());
        postJson("/api/auth/login", credentials("new@example.com", PASSWORD), browser)
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("EMAIL_NOT_VERIFIED"));
        assertThat(jdbc.queryForObject("select count(*) from accounts", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select password_hash from accounts", String.class)).startsWith("{argon2}$argon2id$").doesNotContain(PASSWORD);
    }
    @Test void verificationIsSingleUseAndStoresOnlyDigest() throws Exception {
        auth.register(new AuthDtos.Credentials("verify@example.com", PASSWORD));
        String token = token("verify@example.com", AccountTokens.VERIFY);
        assertThat(jdbc.queryForObject("select token_hash from auth_tokens", String.class)).isEqualTo(AccountTokens.digest(token)).doesNotContain(token);
        var browser = browser();
        postJson("/api/auth/verification/confirm", "{\"token\":\"" + token + "\"}", browser).andExpect(status().isNoContent());
        postJson("/api/auth/verification/confirm", "{\"token\":\"" + token + "\"}", browser).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_TOKEN"));
        assertThat(jdbc.queryForObject("select email_verified_at from accounts", OffsetDateTime.class)).isNotNull();
    }
    @Test void renewedAndExpiredVerificationTokensAreRejected() throws Exception {
        auth.register(new AuthDtos.Credentials("renew@example.com", PASSWORD));
        String old = token("renew@example.com", AccountTokens.VERIFY);
        auth.requestVerification("renew@example.com");
        var browser = browser();
        postJson("/api/auth/verification/confirm", "{\"token\":\"" + old + "\"}", browser).andExpect(status().isBadRequest());
        String fresh = token("renew@example.com", AccountTokens.VERIFY);
        jdbc.update("update auth_tokens set expires_at = ?", OffsetDateTime.now().minusMinutes(1));
        postJson("/api/auth/verification/confirm", "{\"token\":\"" + fresh + "\"}", browser).andExpect(status().isBadRequest());
    }
    @Test void loginPersistsJdbcSessionRotatesCookieAndCsrfAndLogoutInvalidatesIt() throws Exception {
        verified("login@example.com"); var anonymous = browser();
        var response = postJson("/api/auth/login", credentials("login@example.com", PASSWORD), anonymous)
                .andExpect(status().isOk()).andExpect(jsonPath("$.verified").value(true)).andReturn();
        Cookie cookie = response.getResponse().getCookie("EVERBLOOM_SESSION");
        assertThat(cookie.getValue()).isNotEqualTo(anonymous.cookie().getValue());
        assertThat(jdbc.queryForObject("select principal_name from spring_session where session_id = ?", String.class, cookie.getValue()))
                .isEqualTo(jdbc.queryForObject("select cast(id as varchar) from accounts", String.class));
        mvc.perform(get("/api/auth/me").cookie(cookie)).andExpect(status().isOk()).andExpect(jsonPath("$.email").value("login@example.com"));
        mvc.perform(post("/api/auth/logout").cookie(cookie).header("X-CSRF-TOKEN", anonymous.token())).andExpect(status().isForbidden());
        var loggedIn = browser(cookie);
        postJson("/api/auth/logout", "{}", loggedIn).andExpect(status().isNoContent());
        mvc.perform(get("/api/auth/me").cookie(cookie)).andExpect(status().isUnauthorized());
    }
    @Test void passwordResetRevokesBothSessionsAndIsOneTime() throws Exception {
        verified("reset@example.com"); Cookie first = login("reset@example.com", PASSWORD); Cookie second = login("reset@example.com", PASSWORD);
        auth.requestPassword("reset@example.com"); String token = token("reset@example.com", AccountTokens.RESET);
        var browser = browser();
        String body = "{\"token\":\"" + token + "\",\"password\":\"a-new-safe-password-456\"}";
        postJson("/api/auth/password/reset", body, browser).andExpect(status().isNoContent());
        mvc.perform(get("/api/auth/me").cookie(first)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").cookie(second)).andExpect(status().isUnauthorized());
        postJson("/api/auth/password/reset", body, browser()).andExpect(status().isBadRequest());
        postJson("/api/auth/login", credentials("reset@example.com", PASSWORD), browser()).andExpect(status().isUnauthorized());
        login("reset@example.com", "a-new-safe-password-456");
        assertThat(jdbc.queryForObject("select session_version from accounts", Long.class)).isEqualTo(1);
    }
    @Test void resetDoesNotVerifyUnverifiedAccountsOrAcceptVerificationToken() throws Exception {
        auth.register(new AuthDtos.Credentials("unverified@example.com", PASSWORD));
        String verification = token("unverified@example.com", AccountTokens.VERIFY);
        auth.requestPassword("unverified@example.com");
        assertThat(mail.outbox().stream().filter(m -> m.recipient().equals("unverified@example.com") && m.purpose().equals(AccountTokens.RESET))).isEmpty();
        postJson("/api/auth/password/reset", "{\"token\":\"" + verification + "\",\"password\":\"a-new-safe-password-456\"}", browser()).andExpect(status().isBadRequest());
    }
    @Test void expiredResetTokenCannotChangePassword() throws Exception {
        verified("expired@example.com"); auth.requestPassword("expired@example.com"); String token = token("expired@example.com", AccountTokens.RESET);
        jdbc.update("update auth_tokens set expires_at = ?", OffsetDateTime.now().minusSeconds(1));
        postJson("/api/auth/password/reset", "{\"token\":\"" + token + "\",\"password\":\"a-new-safe-password-456\"}", browser()).andExpect(status().isBadRequest());
        login("expired@example.com", PASSWORD);
    }
    @Test void recoveryRequestsNeverDiscloseAccountExistence() throws Exception {
        verified("known@example.com");
        for (String endpoint : new String[]{"/api/auth/password/request", "/api/auth/verification/request"}) {
            var known = postJson(endpoint, "{\"email\":\"known@example.com\"}", browser()).andExpect(status().isAccepted()).andReturn();
            var unknown = postJson(endpoint, "{\"email\":\"unknown@example.com\"}", browser()).andExpect(status().isAccepted()).andReturn();
            assertThat(known.getResponse().getContentAsString()).isEqualTo(unknown.getResponse().getContentAsString());
        }
    }
    @Test void unicodePasswordBeyondBcryptByteLimitIsFullyDistinguished() throws Exception {
        String prefix = "ä".repeat(40);
        auth.register(new AuthDtos.Credentials("unicode@example.com", prefix + "-original"));
        auth.confirmVerification(token("unicode@example.com", AccountTokens.VERIFY));
        login("unicode@example.com", prefix + "-original");
        postJson("/api/auth/login", credentials("unicode@example.com", prefix + "-changed"), browser()).andExpect(status().isUnauthorized());
    }
    @Test void csrfRequiredForEveryAnonymousWriteAndMalformedBodiesReturn400() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(credentials("csrf@example.com", PASSWORD))).andExpect(status().isForbidden());
        postJson("/api/auth/register", "{invalid", browser()).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        postJson("/api/auth/register", "{\"email\":\"valid@example.com\",\"password\":\"short\"}", browser()).andExpect(status().isBadRequest());
        postJson("/api/auth/register", credentials("valid@example.com", "x".repeat(129)), browser()).andExpect(status().isBadRequest());
        postJson("/api/auth/verification/confirm", "{\"token\":\"wrong\"}", browser()).andExpect(status().isBadRequest());
    }
    @Test void anonymousCannotAccessGameOrAccountData() throws Exception {
        for (String path : new String[]{"/api/game", "/api/game/snapshot", "/api/account/export", "/api/auth/me"})
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/account/delete").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"a-strong-password-123\"}"))
                .andExpect(status().isUnauthorized());
    }
    @Test void exportContainsOnlyOwnersAccountAndNoSecrets() throws Exception {
        verified("owner@example.com"); verified("other@example.com"); Cookie cookie = login("owner@example.com", PASSWORD);
        mvc.perform(get("/api/game").cookie(cookie)).andExpect(status().isOk());
        var result = mvc.perform(get("/api/account/export").cookie(cookie)).andExpect(status().isOk())
                .andExpect(jsonPath("$.account.email").value("owner@example.com")).andExpect(jsonPath("$.game.snapshot.character").exists()).andReturn();
        assertThat(result.getResponse().getContentAsString()).doesNotContain("other@example.com", "password", "token", "session", "argon2");
    }
    @Test void staleTabCannotReadWriteDeleteOrLogOutTheOtherAccountsSharedCookie() throws Exception {
        verified("tab-a@example.com"); verified("tab-b@example.com");
        String expectedA = jdbc.queryForObject("select cast(id as varchar) from accounts where email = ?", String.class, "tab-a@example.com");
        String actualB = jdbc.queryForObject("select cast(id as varchar) from accounts where email = ?", String.class, "tab-b@example.com");
        Cookie cookieB = login("tab-b@example.com", PASSWORD);
        String ownerHeader = com.everbloom.common.security.AccountSessionFilter.EXPECTED_ACCOUNT_HEADER;
        for (String path : new String[]{"/api/game", "/api/game/journey", "/api/account/export"})
            mvc.perform(get(path).cookie(cookieB).header(ownerHeader, expectedA))
                    .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ACCOUNT_CHANGED"));
        // No CSRF token: the identity mismatch is rejected before CSRF or any controller side effect.
        for (String path : new String[]{"/api/game/activities", "/api/game/bosses/mosswarden/fight", "/api/account/delete", "/api/auth/logout"})
            mvc.perform(post(path).cookie(cookieB).header(ownerHeader, expectedA)
                    .contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"" + PASSWORD + "\"}"))
                    .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ACCOUNT_CHANGED"));
        for (String path : new String[]{"/api/game/character", "/api/game/journey"})
            mvc.perform(put(path).cookie(cookieB).header(ownerHeader, expectedA)
                    .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ACCOUNT_CHANGED"));
        assertThat(jdbc.queryForObject("select count(*) from accounts", Integer.class)).isEqualTo(2);
        assertThat(jdbc.queryForObject("select count(*) from game_states", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("select count(*) from game_activity_requests", Integer.class)).isZero();
        mvc.perform(get("/api/auth/me").cookie(cookieB)).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(actualB));
        mvc.perform(get("/api/game").cookie(cookieB).header(ownerHeader, actualB))
                .andExpect(status().isOk()).andExpect(jsonPath("$.character.id").value(actualB));
        // The assertion header alone does not authenticate a client.
        mvc.perform(get("/api/game").header(ownerHeader, actualB)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/account/export").cookie(cookieB).header(ownerHeader, ""))
                .andExpect(status().isConflict());
    }
    @Test void deletionRequiresPasswordAndCascadesTokensAndAllSessions() throws Exception {
        verified("delete@example.com"); Cookie first = login("delete@example.com", PASSWORD); Cookie second = login("delete@example.com", PASSWORD);
        mvc.perform(get("/api/game").cookie(first)).andExpect(status().isOk());
        UUID owner = jdbc.queryForObject("select id from accounts", UUID.class);
        jdbc.update("insert into game_activity_requests (account_id, request_id, skill_id, minutes) values (?, ?, ?, ?)", owner, "delete-cascade", "reading", 10);
        auth.requestPassword("delete@example.com");
        postJson("/api/account/delete", "{\"password\":\"wrong-password-123\"}", browser(first)).andExpect(status().isUnauthorized());
        assertThat(jdbc.queryForObject("select count(*) from accounts", Integer.class)).isEqualTo(1);
        postJson("/api/account/delete", "{\"password\":\"" + PASSWORD + "\"}", browser(first)).andExpect(status().isNoContent());
        assertThat(jdbc.queryForObject("select count(*) from accounts", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("select count(*) from auth_tokens", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("select count(*) from game_states", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("select count(*) from game_activity_requests", Integer.class)).isZero();
        mvc.perform(get("/api/auth/me").cookie(second)).andExpect(status().isUnauthorized());
    }
    @Test void staleAuthenticationVersionIsRejectedEvenIfSessionWasResaved() throws Exception {
        verified("stale@example.com");
        UUID id = jdbc.queryForObject("select id from accounts", UUID.class);
        jdbc.update("update accounts set session_version = 1 where id = ?", id);
        mvc.perform(get("/api/auth/me").with(authentication(new EverbloomAuthentication(id, "stale@example.com", 0)))).andExpect(status().isUnauthorized());
    }
    @Test void accountLimitsApplyAcrossDifferentIpsAndIpLimitsAcrossDifferentAccounts() throws Exception {
        block("login-account", "limited@example.com", 1000);
        mvc.perform(post("/api/auth/login").with(csrf()).with(request -> {request.setRemoteAddr("10.0.0.2");return request;})
                .contentType(MediaType.APPLICATION_JSON).content(credentials("LIMITED@example.com", PASSWORD))).andExpect(status().isTooManyRequests());
        block("auth-ip", "10.0.0.3", 1000);
        mvc.perform(post("/api/auth/register").with(csrf()).with(request -> {request.setRemoteAddr("10.0.0.3");return request;})
                .header("X-Forwarded-For", "127.0.0.1").contentType(MediaType.APPLICATION_JSON).content(credentials("different@example.com", PASSWORD)))
                .andExpect(status().isTooManyRequests());
        assertThat(jdbc.queryForList("select bucket_key from auth_rate_limits", String.class)).allMatch(key -> key.matches("[a-f0-9]{64}"));
    }
    @Test void localMailOutboxRejectsRemoteHostsForwardedSpoofAndCrossOriginBrowsers() throws Exception {
        mvc.perform(get("/api/dev/mail/outbox")).andExpect(status().isOk());
        mvc.perform(get("/api/dev/mail/outbox").with(r -> {r.setRemoteAddr("10.0.0.4");return r;}).header("X-Forwarded-For", "127.0.0.1")).andExpect(status().isNotFound());
        mvc.perform(get("/api/dev/mail/outbox").with(r -> {r.setServerName("attacker.invalid");return r;})).andExpect(status().isNotFound());
        mvc.perform(get("/api/dev/mail/outbox").header("Sec-Fetch-Site", "cross-site")).andExpect(status().isNotFound());
    }
    @Test void requestBodyLimitRejectsOversizedAndChunkedAccountJson() throws Exception {
        var browser = browser();
        String body = credentials("large@example.com", "a".repeat(17000));
        postJson("/api/auth/register", body, browser).andExpect(status().isPayloadTooLarge());
        mvc.perform(post("/api/auth/register").cookie(browser.cookie()).header("X-CSRF-TOKEN", browser.token())
                .contentType(MediaType.APPLICATION_JSON).content(body).with(request -> {
                    request.removeHeader("Content-Length"); request.addHeader("Transfer-Encoding", "chunked"); return request;
                })).andExpect(status().isPayloadTooLarge());
        assertThat(jdbc.queryForObject("select count(*) from accounts", Integer.class)).isZero();
    }
    @Test void sessionExpiryIsEnforcedByDatabaseEvenWithUnexpiredClientCookie() throws Exception {
        verified("session-expiry@example.com"); Cookie cookie = login("session-expiry@example.com", PASSWORD);
        jdbc.update("update spring_session set last_access_time = ?, expiry_time = ? where session_id = ?",
                System.currentTimeMillis() - 3600000, System.currentTimeMillis() - 1800000, cookie.getValue());
        mvc.perform(get("/api/auth/me").cookie(cookie)).andExpect(status().isUnauthorized());
    }
    @Test void concurrentTokenConsumersCanOnlyVerifyOnce() throws Exception {
        auth.register(new AuthDtos.Credentials("concurrent@example.com", PASSWORD)); String token = token("concurrent@example.com", AccountTokens.VERIFY);
        Callable<Boolean> consume = () -> {
            try { auth.confirmVerification(token); return true; }
            catch (com.everbloom.common.api.ApiException invalid) { assertThat(invalid.code()).isEqualTo("INVALID_TOKEN"); return false; }
        };
        try (var executor = Executors.newFixedThreadPool(2)) {
            var results = executor.invokeAll(java.util.List.of(consume, consume));
            assertThat(java.util.List.of(results.get(0).get(), results.get(1).get())).containsExactlyInAnyOrder(true, false);
        }
    }
    @Test void invalidLoginMessagesMatchForExistingAndUnknownAccounts() throws Exception {
        verified("credentials@example.com");
        var known = postJson("/api/auth/login", credentials("credentials@example.com", "incorrect-password-789"), browser()).andExpect(status().isUnauthorized()).andReturn();
        var unknown = postJson("/api/auth/login", credentials("absent@example.com", "incorrect-password-789"), browser()).andExpect(status().isUnauthorized()).andReturn();
        assertThat(known.getResponse().getContentAsString()).isEqualTo(unknown.getResponse().getContentAsString());
    }
    @Test void legacyBcryptLoginUpgradesHashAndLongUnicodeDoesNotCause500() throws Exception {
        String hash = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(4).encode(PASSWORD);
        jdbc.update("insert into accounts (id,email,password_hash,created_at,email_verified_at) values (?, ?, ?, ?, ?)",
                UUID.randomUUID(), "legacy@example.com", hash, OffsetDateTime.now(), OffsetDateTime.now());
        postJson("/api/auth/login", credentials("legacy@example.com", "ä".repeat(40)), browser()).andExpect(status().isUnauthorized());
        login("legacy@example.com", PASSWORD);
        assertThat(jdbc.queryForObject("select password_hash from accounts", String.class)).startsWith("{argon2}");
    }
    @Test void sharedRateCounterCannotBeBypassedByConcurrentRequests() throws Exception {
        Callable<Boolean> attempt = () -> {
            try { limiter.check("parallel", "same-account", 3, java.time.Duration.ofMinutes(1)); return true; }
            catch (com.everbloom.common.api.ApiException limited) { assertThat(limited.code()).isEqualTo("RATE_LIMITED"); return false; }
        };
        try (var executor = Executors.newFixedThreadPool(6)) {
            var results = executor.invokeAll(java.util.Collections.nCopies(12, attempt));
            int accepted = 0;
            for (var result : results) if (result.get()) accepted++;
            assertThat(accepted).isEqualTo(3);
        }
        assertThat(jdbc.queryForObject("select attempts from auth_rate_limits where bucket_key = ?", Integer.class,
                AccountTokens.digest("parallel:same-account"))).isEqualTo(3);
    }
    @Test void expiredRateWindowAllowsNewRequestsAndHealthContainsNoPrivateData() throws Exception {
        jdbc.update("insert into auth_rate_limits (bucket_key, attempts, expires_at) values (?, ?, ?)", AccountTokens.digest("expired:account"), 10, System.currentTimeMillis() - 1);
        limiter.check("expired", "account", 2, java.time.Duration.ofMinutes(1));
        assertThat(jdbc.queryForObject("select attempts from auth_rate_limits", Integer.class)).isEqualTo(1);
        mvc.perform(get("/api/health")).andExpect(status().isOk()).andExpect(content().json("{\"status\":\"UP\"}"));
    }
    private void verified(String email) {
        auth.register(new AuthDtos.Credentials(email, PASSWORD)); auth.confirmVerification(token(email, AccountTokens.VERIFY));
    }
    private Cookie login(String email, String password) throws Exception {
        return postJson("/api/auth/login", credentials(email, password), browser()).andExpect(status().isOk()).andReturn().getResponse().getCookie("EVERBLOOM_SESSION");
    }
    private String token(String email, String purpose) {
        return mail.outbox().stream().filter(m -> m.recipient().equals(email) && m.purpose().equals(purpose)).reduce((a,b) -> b).orElseThrow().link().split("#token=")[1];
    }
    private Browser browser(Cookie... cookies) throws Exception {
        var request = get("/api/auth/csrf");
        if (cookies.length > 0) request.cookie(cookies);
        MvcResult result = mvc.perform(request).andExpect(status().isOk()).andReturn();
        Cookie cookie = result.getResponse().getCookie("EVERBLOOM_SESSION");
        if (cookie == null) cookie = cookies[0];
        return new Browser(cookie, JsonPath.read(result.getResponse().getContentAsString(), "$.token"));
    }
    private org.springframework.test.web.servlet.ResultActions postJson(String path, String json, Browser browser) throws Exception {
        return mvc.perform(post(path).cookie(browser.cookie()).header("X-CSRF-TOKEN", browser.token()).contentType(MediaType.APPLICATION_JSON).content(json));
    }
    private static String credentials(String email, String password) { return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"; }
    private void block(String bucket, String key, int attempts) {
        jdbc.update("insert into auth_rate_limits (bucket_key, attempts, expires_at) values (?, ?, ?)", AccountTokens.digest(bucket + ":" + key), attempts, System.currentTimeMillis() + 900000);
    }
    private record Browser(Cookie cookie, String token) {}
}
