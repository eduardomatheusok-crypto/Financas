package com.financas.Services;

import com.financas.Entity.Categoria;
import com.financas.Entity.Despesa;
import com.financas.Entity.Usuario;
import com.financas.Repository.CategoriaRepository;
import com.financas.Repository.DespesasRepository;
import com.financas.Repository.UsuarioRepository;
import com.financas.dto.DespesaRequest;
import com.financas.dto.DespesaResponse;
import com.financas.dto.RelatorioCategoriaDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DespesasService {

    private final DespesasRepository despesasRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public DespesasService(
            DespesasRepository despesasRepository,
            CategoriaRepository categoriaRepository,
            UsuarioRepository usuarioRepository) {
        this.despesasRepository = despesasRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public DespesaResponse cadastrarDespesa(DespesaRequest request) {
        Categoria categoria = buscarCategoria(request.categoriaId());
        Usuario usuario = buscarUsuario(request.usuarioId());

        Despesa despesa = new Despesa();
        despesa.setNome(request.nome());
        despesa.setValor(request.valor());
        despesa.setData(request.data());
        despesa.setCategoria(categoria);
        despesa.setUsuario(usuario);

        return toResponse(despesasRepository.save(despesa));
    }

    public List<DespesaResponse> listarDespesa() {
        return despesasRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DespesaResponse buscarPorId(Long id) {
        return toResponse(buscarDespesa(id));
    }

    public void deletarDespesa(Long id) {
        despesasRepository.deleteById(id);
    }

    public DespesaResponse editarDespesa(DespesaRequest request, Long id) {
        Despesa despesa = buscarDespesa(id);
        Categoria categoria = buscarCategoria(request.categoriaId());
        Usuario usuario = buscarUsuario(request.usuarioId());

        despesa.setNome(request.nome());
        despesa.setValor(request.valor());
        despesa.setData(request.data());
        despesa.setCategoria(categoria);
        despesa.setUsuario(usuario);

        return toResponse(despesasRepository.save(despesa));
    }

    public List<RelatorioCategoriaDTO> relatorioPorCategoria() {
        return despesasRepository.relatorioPorCategoria();
    }

    private Despesa buscarDespesa(Long id) {
        return despesasRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Despesa nao encontrada"));
    }

    private Categoria buscarCategoria(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria nao encontrada"));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
    }

    private DespesaResponse toResponse(Despesa despesa) {
        return new DespesaResponse(
                despesa.getId(),
                despesa.getNome(),
                despesa.getValor(),
                despesa.getData(),
                despesa.getCategoria().getNome(),
                despesa.getUsuario().getEmail());
    }
}
