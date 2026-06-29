package com.financas.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DespesaRequest(
        @NotBlank String nome,
        @Positive double valor,
        @NotNull LocalDate data,
        @NotNull Long categoriaId,
        @NotNull Long usuarioId) {
}
