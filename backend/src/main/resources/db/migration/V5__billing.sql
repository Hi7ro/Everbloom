CREATE TABLE billing_memberships (
    account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL,
    verified_at BIGINT NOT NULL,
    expires_at BIGINT,
    will_renew BOOLEAN,
    store VARCHAR(20),
    management_url VARCHAR(200)
);
CREATE TABLE billing_webhook_events (
    event_id VARCHAR(200) PRIMARY KEY,
    received_at BIGINT NOT NULL
);
CREATE INDEX billing_webhook_received ON billing_webhook_events(received_at);
-- Deliberately no account FK: only the provider erasure request survives local account deletion.
CREATE TABLE billing_deletion_jobs (
    account_id UUID PRIMARY KEY,
    requested_at BIGINT NOT NULL,
    next_attempt_at BIGINT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX billing_deletion_due ON billing_deletion_jobs(next_attempt_at);
