package com.financas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioRequest(
        @Email @NotBlank String email,
        @NotBlank String senha) {
}
