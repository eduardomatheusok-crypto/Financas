package com.financas.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    // id
    // usuario id
    // mensagem usuario e bot
    // data e hora

    // o que queremos? usuario digita, backend analisa e limita para melhor respostam, resposta
    // resposta != de algo relacionado a finanças finanças -> "Desculpe, não sou treinada para isso."
    // caso contrário gera resposta para a pergunta 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuarioId;


    @Lob
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String mensagemUsuario;

    @Lob
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String mensagemBot;

    private LocalDateTime datahora;


    
}
