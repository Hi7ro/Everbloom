package com.everbloom.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}
    public record Credentials(@NotBlank @Email @Size(max = 254) String email,
                              @NotBlank @Size(min = 15, max = 128) String password) {}
    public record EmailRequest(@NotBlank @Email @Size(max = 254) String email) {}
    public record TokenRequest(@NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{43}") String token) {}
    public record PasswordReset(@NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{43}") String token,
                                @NotBlank @Size(min = 15, max = 128) String password) {}
    public record DeleteRequest(@NotBlank @Size(min = 15, max = 128) String password) {}
    public record Account(String id, String email, boolean verified) {}
    public record Message(String message) {}
    public record Csrf(String token, String headerName) {}
}
