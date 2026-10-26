package com.everbloom.auth;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.env.MockEnvironment;

class AccountMailConfigurationTest {
    private final List<AccountMail> created = new ArrayList<>();
    @AfterEach void stop() { created.forEach(AccountMail::stop); }
    @Test void productionCannotStartWithoutSmtpConfiguration() {
        assertThatThrownBy(() -> mail(new MockEnvironment(), "smtp", "https://example.com", false).validateConfiguration()).isInstanceOf(IllegalStateException.class);
    }
    @Test void productionRequiresHttpsAndSecureCookies() {
        assertThatThrownBy(() -> mail(production(), "smtp", "http://example.com", true).validateConfiguration()).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> mail(production().withProperty("server.servlet.session.cookie.secure", "false"), "smtp", "https://example.com", true).validateConfiguration()).isInstanceOf(IllegalStateException.class);
    }
    @Test void productionNeverEnablesOutbox() {
        assertThatThrownBy(() -> mail(production(), "outbox", "http://127.0.0.1:4201", true).validateConfiguration()).isInstanceOf(IllegalStateException.class);
    }
    @Test void developmentCannotBindBeyondLoopbackOrSendOutboxLinksOffDevice() {
        var environment = new MockEnvironment(); environment.setActiveProfiles("dev");
        environment.withProperty("server.address", "0.0.0.0");
        assertThatThrownBy(() -> mail(environment, "outbox", "http://127.0.0.1:4201", false).validateConfiguration()).isInstanceOf(IllegalStateException.class);
        environment.withProperty("server.address", "127.0.0.1");
        assertThatThrownBy(() -> mail(environment, "outbox", "https://example.com", false).validateConfiguration()).isInstanceOf(IllegalStateException.class);
    }
    @Test void configuredSmtpAndLocalDevelopmentPassTheirRespectiveGuards() {
        assertThatCode(() -> mail(production(), "smtp", "https://example.com", true).validateConfiguration()).doesNotThrowAnyException();
        var local = new MockEnvironment(); local.setActiveProfiles("test");
        assertThatCode(() -> mail(local, "outbox", "http://127.0.0.1:4201", false).validateConfiguration()).doesNotThrowAnyException();
    }
    private MockEnvironment production() {
        return new MockEnvironment().withProperty("spring.mail.host", "smtp.example.com").withProperty("spring.mail.username", "test-user")
                .withProperty("spring.mail.password", "test-only-not-a-secret");
    }
    private AccountMail mail(MockEnvironment environment, String mode, String base, boolean sender) {
        var beans = new StaticListableBeanFactory();
        if (sender) beans.addBean("mail", mock(JavaMailSender.class));
        var mail = new AccountMail(beans.getBeanProvider(JavaMailSender.class), environment, Clock.systemUTC(), mode, base, "test@example.com");
        created.add(mail); return mail;
    }
}
