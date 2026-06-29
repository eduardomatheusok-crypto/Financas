package com.financas.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.financas.Entity.ChatMessage;
import com.financas.Entity.Usuario;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    public List<ChatMessage> findByUsuarioId(Usuario usuarioId);
}
