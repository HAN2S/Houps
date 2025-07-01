package com.game.global_quiz.config;

import com.game.global_quiz.model.Question;
import com.game.global_quiz.repository.QuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.HashSet;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(QuestionRepository questionRepository) {
        return args -> {
            // Only add questions if the database is empty
            if (questionRepository.count() == 0) {
                // General Knowledge Questions
                Question q1 = new Question();
                q1.setQuestionText("What is the capital of France?");
                q1.setCorrectAnswer("Paris");
                q1.setCategory("Geography");
                q1.setDifficulty(1);
                q1.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "London", "Berlin", "Madrid", "Rome", "Amsterdam"
                )));

                Question q2 = new Question();
                q2.setQuestionText("Who painted the Mona Lisa?");
                q2.setCorrectAnswer("Leonardo da Vinci");
                q2.setCategory("Art");
                q2.setDifficulty(1);
                q2.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "Vincent van Gogh", "Pablo Picasso", "Michelangelo", "Rembrandt", "Claude Monet"
                )));

                Question q3 = new Question();
                q3.setQuestionText("What is the chemical symbol for gold?");
                q3.setCorrectAnswer("Au");
                q3.setCategory("Science");
                q3.setDifficulty(2);
                q3.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "Ag", "Fe", "Cu", "Hg", "Pt"
                )));

                Question q4 = new Question();
                q4.setQuestionText("Which planet is known as the Red Planet?");
                q4.setCorrectAnswer("Mars");
                q4.setCategory("Science");
                q4.setDifficulty(1);
                q4.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "Venus", "Jupiter", "Saturn", "Neptune", "Mercury"
                )));

                Question q5 = new Question();
                q5.setQuestionText("Who wrote 'Romeo and Juliet'?");
                q5.setCorrectAnswer("William Shakespeare");
                q5.setCategory("Literature");
                q5.setDifficulty(1);
                q5.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "Charles Dickens", "Jane Austen", "Mark Twain", "Ernest Hemingway", "F. Scott Fitzgerald"
                )));

                // Save all questions
                questionRepository.saveAll(Arrays.asList(q1, q2, q3, q4, q5));
            }
        };
    }
} 