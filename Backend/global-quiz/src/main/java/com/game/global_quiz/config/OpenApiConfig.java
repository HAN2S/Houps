package com.game.global_quiz.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI quizGameOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Global Quiz Game API")
                        .description("API for managing quiz game sessions, players, and questions")
                        .version("1.0")
                        .contact(new Contact()
                                .name("Global Quiz Team")
                                .email("contact@globalquiz.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8081")
                                .description("Local development server")
                ))
                .tags(List.of(
                        new Tag()
                                .name("Room Management")
                                .description("APIs for managing game rooms and player sessions"),
                        new Tag()
                                .name("Game Management")
                                .description("APIs for managing active game sessions and gameplay")
                ));
    }
} 