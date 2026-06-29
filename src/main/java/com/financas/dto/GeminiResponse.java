package com.financas.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GeminiResponse {
    
    private List<Candidate> candidates;

    @Getter
    @Setter
    public static class Candidate {
        private Content content;
    }

    @Getter
    @Setter
    public static class Content {
        private List<Part> parts;
    }

    @Getter
    @Setter
    public static class Part {
        private String text;
    }

}
