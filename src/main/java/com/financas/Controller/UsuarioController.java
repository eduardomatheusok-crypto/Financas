package com.financas.Controller;

import com.financas.Services.UsuarioService;
import com.financas.dto.LoginRequest;
import com.financas.dto.UsuarioRequest;
import com.financas.dto.UsuarioResponse;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> cadastrarUsuario(@RequestBody @Valid UsuarioRequest usuario) {
        return ResponseEntity.ok(usuarioService.cadastrarUsuario(usuario));
    }

    @PostMapping("/api/login")
    public ResponseEntity<UsuarioResponse> login(@RequestBody @Valid LoginRequest login) {
        return ResponseEntity.ok(usuarioService.buscarEmail(login.email(),login.senha()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }
}
