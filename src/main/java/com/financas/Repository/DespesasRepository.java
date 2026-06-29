package com.financas.Repository;

import com.financas.Entity.Despesa;
import com.financas.Entity.Usuario;
import com.financas.dto.RelatorioCategoriaDTO;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DespesasRepository extends JpaRepository<Despesa, Long> {

    List<Despesa> findByUsuarioAndDataBetweenOrderByDataDesc(Usuario usuario, LocalDate inicio, LocalDate fim);

    @Query("""
            SELECT new com.financas.dto.RelatorioCategoriaDTO(c.nome, SUM(d.valor))
            FROM Despesa d
            JOIN d.categoria c
            GROUP BY c.nome
            """)
    List<RelatorioCategoriaDTO> relatorioPorCategoria();
}
