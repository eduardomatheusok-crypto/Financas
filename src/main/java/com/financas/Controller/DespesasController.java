package com.financas.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.financas.Services.DespesasService;
import com.financas.dto.DespesaRequest;
import com.financas.dto.DespesaResponse;
import com.financas.dto.RelatorioCategoriaDTO;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/despesas")

public class DespesasController {

    // construtor referenciando o repository do service x
    // criar despesa x
    // listar despesa x
    // buscar po ID
    // editar despesa
    // deletar despesas

    private final DespesasService despesasService;

    public DespesasController(DespesasService despesasService) {
        this.despesasService = despesasService;
    }

    @PostMapping
    public ResponseEntity<DespesaResponse> cadastrarDespesa(@RequestBody @Valid DespesaRequest despesa) {
        return ResponseEntity.ok(despesasService.cadastrarDespesa(despesa));
    }

    @GetMapping
    public List<DespesaResponse> listarDespesa() {
        return despesasService.listarDespesa();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DespesaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(despesasService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DespesaResponse> editarDespesa(@RequestBody @Valid DespesaRequest novaDespesa, @PathVariable Long id) {
        return ResponseEntity.ok(despesasService.editarDespesa(novaDespesa, id));
    }

    @DeleteMapping("/{id}")
    public void deletarDespesa(@PathVariable Long id) {
        despesasService.deletarDespesa(id);
    }

    @GetMapping("/relatorio/categorias")
    public ResponseEntity<List<RelatorioCategoriaDTO>> relatorioPorCategoria() {
        return ResponseEntity.ok(despesasService.relatorioPorCategoria());
    }
} 
