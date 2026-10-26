package com.everbloom.common.security;

import com.everbloom.auth.AccountRepository;
import java.time.Clock;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.CompositeSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfAuthenticationStrategy;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
public class SecurityConfig {
    @Bean @org.springframework.context.annotation.Primary Clock clock() { return Clock.systemUTC(); }
    @Bean PasswordEncoder passwordEncoder() {
        var legacy = new BCryptPasswordEncoder(12);
        var encoder = new DelegatingPasswordEncoder("argon2", Map.of("argon2", new Argon2PasswordEncoder(16, 32, 1, 19456, 2), "bcrypt", legacy));
        encoder.setDefaultPasswordEncoderForMatches(legacy);
        return encoder;
    }
    @Bean UserDetailsService unusedFormUserDetails() {
        return username -> { throw new UsernameNotFoundException("Form login is disabled"); };
    }
    @Bean SecurityContextRepository securityContextRepository() { return new HttpSessionSecurityContextRepository(); }
    @Bean CsrfTokenRepository csrfTokenRepository() { return new HttpSessionCsrfTokenRepository(); }
    @Bean SessionAuthenticationStrategy sessionAuthenticationStrategy(CsrfTokenRepository csrf) {
        return new CompositeSessionAuthenticationStrategy(List.of(new ChangeSessionIdAuthenticationStrategy(), new CsrfAuthenticationStrategy(csrf)));
    }
    @Bean DefaultCookieSerializer cookieSerializer(@Value("${server.servlet.session.cookie.secure:true}") boolean secure) {
        var cookie = new DefaultCookieSerializer();
        cookie.setCookieName("EVERBLOOM_SESSION"); cookie.setCookiePath("/"); cookie.setUseHttpOnlyCookie(true);
        cookie.setUseSecureCookie(secure); cookie.setSameSite("Lax"); cookie.setUseBase64Encoding(false);
        cookie.setCookieMaxAge(1800); // Android's native cookie bridge discards cookies without an explicit expiry.
        return cookie;
    }
    @Bean SecurityFilterChain security(HttpSecurity http, SecurityContextRepository repository,
                                     CsrfTokenRepository csrf, AccountRepository accounts) throws Exception {
        http.securityContext(context -> context.securityContextRepository(repository))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .csrf(config -> config.csrfTokenRepository(csrf).ignoringRequestMatchers(request ->
                    "POST".equals(request.getMethod()) && "/api/billing/revenuecat/webhook".equals(request.getRequestURI().substring(request.getContextPath().length()))))
            .requestCache(AbstractHttpConfigurer::disable)
            .headers(headers -> headers.contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'"))
                    .referrerPolicy(referrer -> referrer.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER)))
            .exceptionHandling(errors -> errors.authenticationEntryPoint((request, response, ignored) -> {
                response.setStatus(401); response.setContentType("application/json");
                response.getWriter().write("{\"code\":\"UNAUTHENTICATED\",\"message\":\"Bitte melde dich an.\"}");
            }).accessDeniedHandler((request, response, ignored) -> {
                response.setStatus(403); response.setContentType("application/json");
                response.getWriter().write("{\"code\":\"FORBIDDEN\",\"message\":\"Diese Aktion ist nicht erlaubt.\"}");
            }))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/billing/revenuecat/webhook").permitAll()
                .requestMatchers("/api/health", "/api/auth/csrf", "/api/auth/register", "/api/auth/login", "/api/auth/verification/**", "/api/auth/password/**", "/api/dev/mail/outbox").permitAll()
                .requestMatchers("/api/auth/**", "/api/account/**", "/api/game", "/api/game/**", "/api/billing/membership", "/api/billing/refresh").authenticated()
                .anyRequest().denyAll())
            .addFilterBefore(new AccountSessionFilter(accounts), org.springframework.security.web.csrf.CsrfFilter.class)
            .addFilterBefore(new AuthBodyLimitFilter(), org.springframework.security.web.csrf.CsrfFilter.class)
            .formLogin(AbstractHttpConfigurer::disable).httpBasic(AbstractHttpConfigurer::disable).logout(AbstractHttpConfigurer::disable);
        return http.build();
    }
}
