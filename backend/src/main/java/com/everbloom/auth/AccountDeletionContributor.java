package com.everbloom.auth;

import java.util.UUID;

/** Persist external erasure work in the account deletion transaction; never delay local removal. */
public interface AccountDeletionContributor {
    void beforeDelete(UUID accountId);
}
