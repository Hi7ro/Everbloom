-- Boss clear and its cosmetic unlock are committed with the account's game snapshot.
-- The original replay survives lost responses; retries never roll or award again.
CREATE TABLE game_boss_requests (
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    request_id VARCHAR(128) NOT NULL,
    boss_id VARCHAR(40) NOT NULL,
    difficulty VARCHAR(12) NOT NULL,
    tactic VARCHAR(12) NOT NULL,
    result_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, request_id)
);
