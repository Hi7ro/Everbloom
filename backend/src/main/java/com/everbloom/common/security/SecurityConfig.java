package com.everbloom.common.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
    /** Login is handled by AuthService; an empty provider prevents Boot's generated demo password. */
    @Bean UserDetailsService unusedFormUserDetails() {
        return username -> { throw new UsernameNotFoundException("Form login is disabled"); };
    }
    @Bean SecurityContextRepository securityContextRepository() { return new HttpSessionSecurityContextRepository(); }

    @Bean
    SecurityFilterChain security(HttpSecurity http, SecurityContextRepository repository) throws Exception {
        http
            .securityContext(context -> context.securityContextRepository(repository))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                    .sessionFixation(fixation -> fixation.changeSessionId()))
            .csrf(csrf -> csrf.csrfTokenRepository(new HttpSessionCsrfTokenRepository()))
            .exceptionHandling(errors -> errors
                    .authenticationEntryPoint(jsonEntryPoint())
                    .accessDeniedHandler(jsonDeniedHandler()))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/csrf", "/api/auth/register", "/api/auth/login").permitAll()
                    .requestMatchers("/api/auth/**", "/api/game/**").authenticated()
                    .anyRequest().denyAll())
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable);
        return http.build();
    }

    private AuthenticationEntryPoint jsonEntryPoint() {
        return (request, response, ignored) -> {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"code\":\"UNAUTHENTICATED\",\"message\":\"Bitte melde dich an.\"}");
        };
    }

    private AccessDeniedHandler jsonDeniedHandler() {
        return (request, response, ignored) -> {
            response.setStatus(403);
            response.setContentType("application/json");
            response.getWriter().write("{\"code\":\"FORBIDDEN\",\"message\":\"Diese Aktion ist nicht erlaubt.\"}");
        };
    }
}
