package com.financas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityFilterChainConfig {

    private final SecurityFilter securityFilter;

    // Injetamos o SecurityFilter que criamos
    public SecurityFilterChainConfig(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // Define a política de sessão como STATELESS (sem estado/cookies no backend)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Permite acesso público a arquivos estáticos do front-end
                        .requestMatchers("/", "/index.html", "/login.html", "/cadastro.html", "/style.css", "/app.js")
                        .permitAll()
                        // Permite rotas públicas de cadastro/login
                        .requestMatchers("/auth/login", "/auth/register", "/api/usuarios/login",
                                "/api/usuarios/cadastrar")
                        .permitAll()
                        // Exige autenticação JWT para todo o resto
                        .anyRequest().authenticated())
                // Adiciona o nosso filtro personalizado de JWT antes do filtro padrão do Spring
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
