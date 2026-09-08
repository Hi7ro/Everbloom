package com.everbloom.common.api;

/** Stable, UI-safe error envelope shared by the Angular client and REST API. */
public record ApiError(String code, String message) {}
