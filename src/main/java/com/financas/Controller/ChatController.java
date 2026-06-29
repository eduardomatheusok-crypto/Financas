package com.financas.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financas.Entity.Usuario;
import com.financas.Repository.UsuarioRepository;
import com.financas.Services.ChatService;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;
    private final UsuarioRepository usuarioRepository;

    public ChatController(ChatService chatService, UsuarioRepository usuarioRepository) {
        this.chatService = chatService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/{usuarioId}")
    public ResponseEntity<String> enviarMensagem(
            @PathVariable Long usuarioId,
            @RequestBody Map<String, String> payload) {
        String mensagemUsuario = payload.get("mensagem");
        if (mensagemUsuario == null || mensagemUsuario.isBlank()) {
            return ResponseEntity.badRequest().body("Digite uma mensagem para o chatbot.");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) {
            return ResponseEntity.badRequest().body("Usuario nao encontrado. Faca login novamente antes de usar o chatbot.");
        }

        String respostaIA = chatService.processarMensagem(usuario, mensagemUsuario);
        return ResponseEntity.ok(respostaIA);
    }
}
