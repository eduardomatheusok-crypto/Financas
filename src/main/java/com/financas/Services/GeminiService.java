package com.financas.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.financas.dto.GeminiRequest;
import com.financas.dto.GeminiResponse;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String enviarMensagem(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return "A chave da API do Gemini nao foi configurada. Defina a variavel GEMINI_API_KEY.";
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiModel
                + ":generateContent?key="
                + geminiApiKey;

        GeminiRequest.Part part = new GeminiRequest.Part(prompt);
        GeminiRequest.Content content = new GeminiRequest.Content(List.of(part));
        GeminiRequest request = new GeminiRequest(List.of(content));

        try {
            GeminiResponse response = restTemplate.postForObject(url, request, GeminiResponse.class);

            if (response != null
                    && response.getCandidates() != null
                    && !response.getCandidates().isEmpty()
                    && response.getCandidates().get(0).getContent() != null
                    && response.getCandidates().get(0).getContent().getParts() != null
                    && !response.getCandidates().get(0).getContent().getParts().isEmpty()) {
                return response.getCandidates().get(0)
                        .getContent()
                        .getParts()
                        .get(0)
                        .getText();
            }

            return "Desculpe, a resposta da IA veio vazia.";
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().isSameCodeAs(HttpStatusCode.valueOf(404))) {
                return "Nao encontrei o modelo de IA configurado. Verifique a propriedade gemini.model.";
            }
            return "Erro ao se comunicar com a IA. Status: " + e.getStatusCode().value();
        } catch (Exception e) {
            return "Erro ao se comunicar com a IA. Tente novamente em alguns instantes.";
        }
    }
}
