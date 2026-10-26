package com.everbloom.auth;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
public class AccountMail {
    private static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(AccountMail.class);
    private final ObjectProvider<JavaMailSender> senders;
    private final Environment environment;
    private final Clock clock;
    private final String mode, publicBaseUrl, from;
    private final ArrayDeque<Delivery> outbox = new ArrayDeque<>();
    private final AtomicLong failedDeliveries = new AtomicLong();
    private final ThreadPoolExecutor deliveryExecutor = new ThreadPoolExecutor(1, 2, 30, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(100), runnable -> { var thread = new Thread(runnable, "account-mail"); thread.setDaemon(true); return thread; });
    public AccountMail(ObjectProvider<JavaMailSender> senders, Environment environment, Clock clock,
                       @Value("${app.mail.mode:smtp}") String mode,
                       @Value("${app.auth.public-base-url:}") String publicBaseUrl,
                       @Value("${app.mail.from:}") String from) {
        this.senders = senders; this.environment = environment; this.clock = clock;
        this.mode = mode; this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", ""); this.from = from;
    }
    @PostConstruct
    void validateConfiguration() {
        boolean local = environment.acceptsProfiles(Profiles.of("dev", "test"));
        if (local && !List.of("127.0.0.1", "::1").contains(environment.getProperty("server.address", "127.0.0.1")))
            throw new IllegalStateException("The development profile must bind to a loopback address.");
        URI base;
        try { base = URI.create(publicBaseUrl); } catch (IllegalArgumentException invalid) { throw new IllegalStateException("Configure a valid public account-link URL."); }
        if (base.getHost() == null || base.getRawUserInfo() != null || base.getRawQuery() != null || base.getRawFragment() != null)
            throw new IllegalStateException("Configure a valid public account-link URL.");
        if ("outbox".equals(mode)) {
            if (!local || !List.of("127.0.0.1", "localhost", "::1", "[::1]").contains(base.getHost()))
                throw new IllegalStateException("Mail outbox is restricted to local development.");
        } else if ("smtp".equals(mode)) {
            if (!"https".equals(base.getScheme()) || senders.getIfAvailable() == null || from.isBlank()
                    || environment.getProperty("spring.mail.host", "").isBlank()
                    || environment.getProperty("spring.mail.username", "").isBlank()
                    || environment.getProperty("spring.mail.password", "").isBlank())
                throw new IllegalStateException("Production requires HTTPS account links and configured SMTP sender/host.");
            if (!environment.getProperty("server.servlet.session.cookie.secure", Boolean.class, true))
                throw new IllegalStateException("Production session cookies must be Secure.");
        } else throw new IllegalStateException("Unknown mail delivery mode.");
    }
    public void deliver(String recipient, String purpose, String token) {
        String path = AccountTokens.VERIFY.equals(purpose) ? "/auth/verify" : "/auth/reset";
        String subject = AccountTokens.VERIFY.equals(purpose) ? "Herovera: E-Mail bestätigen" : "Herovera: Passwort zurücksetzen";
        String link = publicBaseUrl + path + "#token=" + token;
        String body = "Öffne diesen Link, um fortzufahren:\n" + link + "\n\nDer Link ist einmalig und zeitlich begrenzt. Falls du diese Anfrage nicht gestellt hast, ignoriere diese Nachricht.";
        if ("outbox".equals(mode)) {
            synchronized (outbox) {
                prune();
                if (outbox.size() >= 100) outbox.removeFirst();
                outbox.addLast(new Delivery(UUID.randomUUID().toString(), recipient, subject, purpose, link, clock.instant()));
            }
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from); message.setTo(recipient); message.setSubject(subject); message.setText(body);
        Runnable dispatch = () -> {
            try { deliveryExecutor.execute(() -> {
                try { senders.getObject().send(message); }
                catch (org.springframework.mail.MailException unavailable) { deliveryFailed(); }
            }); } catch (java.util.concurrent.RejectedExecutionException full) { deliveryFailed(); }
        };
        // Network latency/failure must not reveal whether an account exists. Send only committed links.
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { dispatch.run(); }
            });
        } else dispatch.run();
    }
    public List<Delivery> outbox() {
        synchronized (outbox) { prune(); return List.copyOf(outbox); }
    }
    public long failedDeliveryCount() { return failedDeliveries.get(); }
    private void deliveryFailed() {
        failedDeliveries.incrementAndGet();
        LOG.warn("Account mail delivery unavailable; inspect SMTP provider health and retry requests.");
    }
    @PreDestroy void stop() { deliveryExecutor.shutdownNow(); }
    private void prune() { outbox.removeIf(mail -> mail.createdAt().plusSeconds(3600).isBefore(clock.instant())); }
    public record Delivery(String id, String recipient, String subject, String purpose, String link, Instant createdAt) {}
}
