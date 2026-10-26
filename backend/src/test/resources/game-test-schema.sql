CREATE TABLE IF NOT EXISTS game_states (
    account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version = 1),
    snapshot_json TEXT NOT NULL,
    journey_json TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS game_activity_requests (
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    request_id VARCHAR(128) NOT NULL,
    skill_id VARCHAR(40) NOT NULL,
    minutes INTEGER NOT NULL CHECK (minutes BETWEEN 1 AND 180),
    PRIMARY KEY (account_id, request_id)
);
CREATE TABLE IF NOT EXISTS game_boss_requests (
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    request_id VARCHAR(128) NOT NULL,
    boss_id VARCHAR(40) NOT NULL,
    difficulty VARCHAR(12) NOT NULL,
    tactic VARCHAR(12) NOT NULL,
    result_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, request_id)
);
