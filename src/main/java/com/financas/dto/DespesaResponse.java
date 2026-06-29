package com.financas.dto;

import java.time.LocalDate;

public record DespesaResponse(
        Long id,
        String nome,
        double valor,
        LocalDate data,
        String categoria,
        String usuarioEmail) {
}
