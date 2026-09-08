package com.everbloom.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record Credentials(
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 15, max = 128) String password) {}

    public record Account(String id, String email) {}
    public record Csrf(String token, String headerName) {}
}
