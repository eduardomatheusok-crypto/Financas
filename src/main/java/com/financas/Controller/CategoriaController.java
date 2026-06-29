package com.financas.Controller;

import com.financas.Entity.Categoria;
import com.financas.Services.CategoriaService;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    // post - criar dados
    // put - atualizar dados
    // get - pegar

    @PostMapping
    public Categoria criarCategoria(@RequestBody Categoria categoria) {
        return categoriaService.cadastrarCategoria(categoria);
    }

    @GetMapping
    public List<Categoria> listarCategoria() {
        return categoriaService.listarCategoria();
    }

    // aqui precisa de ID porque cada categoria vai ser relacionada a um ID
    @GetMapping("/{id}")
    public Categoria buscarIdCategoria(@PathVariable Long id) {
        return categoriaService.buscarIdCategoria(id);
    }

    @PutMapping("/{id}")
    public Categoria editarCategoria(@RequestBody Categoria categoria, @PathVariable Long id) {
        return categoriaService.editarCategoria(categoria, id);
    }

    @DeleteMapping("/{id}")
    public void deletarCategoria(@PathVariable Long id) {
        categoriaService.deletarCategoria(id);
    }
}
