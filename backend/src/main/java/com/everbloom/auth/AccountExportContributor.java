package com.everbloom.auth;

import java.util.Map;
import java.util.UUID;

/** Only owner-visible game data; credentials, sessions and recovery tokens must never be exported. */
public interface AccountExportContributor {
    Map<String, Object> export(UUID accountId);
}
