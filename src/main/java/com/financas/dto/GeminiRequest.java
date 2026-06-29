package com.financas.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GeminiRequest { // representar os dados em json

    private List<Content> contents;
    
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Content{
        private List<Part> parts;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Part{
        private String text;
    }
}
