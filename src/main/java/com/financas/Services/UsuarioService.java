package com.financas.Services;

import com.financas.Entity.Usuario;
import com.financas.Repository.UsuarioRepository;
import com.financas.dto.UsuarioRequest;
import com.financas.dto.UsuarioResponse;
import com.financas.exception.CredenciaisInvalidasException;
import com.financas.exception.EmailJaCadastradoException;
import com.financas.exception.EntidadeNaoEncontradaException;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder encoder;

    public UsuarioService(UsuarioRepository usuarioRepository, BCryptPasswordEncoder encoder) {
        this.usuarioRepository = usuarioRepository;
        this.encoder = encoder;
    }

    public UsuarioResponse cadastrarUsuario(UsuarioRequest request) {
        if (usuarioRepository.findByEmail(request.email()) != null) {
            throw new EmailJaCadastradoException();
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(request.email());
        usuario.setSenha(encoder.encode(request.senha()));

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        return toResponse(usuarioSalvo);
    }

    public UsuarioResponse buscarEmail(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario == null || !encoder.matches(senha, usuario.getSenha())) {
            throw new CredenciaisInvalidasException();
        }

        return toResponse(usuario);
    }

    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Usuario não encontrado"));
        return toResponse(usuario);
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getEmail());
    }
}
