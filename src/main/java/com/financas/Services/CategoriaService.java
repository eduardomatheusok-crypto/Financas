package com.financas.Services;

import com.financas.Entity.Categoria;
import com.financas.Repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    // funções

    public Categoria cadastrarCategoria(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public List<Categoria> listarCategoria() {
        return categoriaRepository.findAll();
    }

    public Categoria buscarIdCategoria(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
    }

    public Categoria editarCategoria(Categoria novaCategoria, Long id) {
    Categoria categoria = buscarIdCategoria(id);
    categoria.setNome(novaCategoria.getNome());

    return categoriaRepository.save(categoria);
    }

    public void deletarCategoria(Long id) {
        categoriaRepository.deleteById(id);
    }


}
