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
                    "Berlin", "Madrid", "Rome", "Amsterdam", "Brussels"
                )));
                q1.setTrapAnswer("London");

                Question q2 = new Question();
                q2.setQuestionText("Who painted the Mona Lisa?");
                q2.setCorrectAnswer("Leonardo da Vinci");
                q2.setCategory("Art");
                q2.setDifficulty(1);
                q2.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "Vincent van Gogh", "Michelangelo", "Rembrandt", "Claude Monet", "Edvard Munch"
                )));
                q2.setTrapAnswer("Pablo Picasso");

                Question q3 = new Question();
                q3.setQuestionText("What is the chemical symbol for gold?");
                q3.setCorrectAnswer("Au");
                q3.setCategory("Science");
                q3.setDifficulty(2);
                q3.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "Ag", "Cu", "Hg", "Pt", "Zn"
                )));
                q3.setTrapAnswer("Fe");

                Question q4 = new Question();
                q4.setQuestionText("Which planet is known as the Red Planet?");
                q4.setCorrectAnswer("Mars");
                q4.setCategory("Science");
                q4.setDifficulty(1);
                q4.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "Venus", "Saturn", "Neptune", "Mercury", "Uranus"
                )));
                q4.setTrapAnswer("Jupiter");

                Question q5 = new Question();
                q5.setQuestionText("Who wrote 'Romeo and Juliet'?");
                q5.setCorrectAnswer("William Shakespeare");
                q5.setCategory("Literature");
                q5.setDifficulty(1);
                q5.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "Charles Dickens", "Jane Austen", "Ernest Hemingway", "F. Scott Fitzgerald", "George Orwell"
                )));
                q5.setTrapAnswer("Mark Twain");

                // New Question 1
                Question q6 = new Question();
                q6.setQuestionText("Who won the 2022 FIFA World Cup?");
                q6.setCorrectAnswer("Argentina");
                q6.setCategory("Sports");
                q6.setDifficulty(1);
                q6.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "Tunisia", "Brazil", "Germany", "Spain", "Italy"
                )));
                q6.setTrapAnswer("France");

                // New Question 2
                Question q7 = new Question();
                q7.setQuestionText("How many teams from London are in the Premier League?");
                q7.setCorrectAnswer("6");
                q7.setCategory("Sports");
                q7.setDifficulty(2);
                q7.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "10", "5", "7", "8", "3"
                )));
                q7.setTrapAnswer("4");

                // New Question 3
                Question q8 = new Question();
                q8.setQuestionText("In which country is Lapland located?");
                q8.setCorrectAnswer("Sweden");
                q8.setCategory("Geography");
                q8.setDifficulty(2);
                q8.setFallbackOptions(new HashSet<>(Arrays.asList(
                    "Urugway", "Norway", "Russia", "Denmark", "Iceland"
                )));
                q8.setTrapAnswer("Finland");

                // Save all questions
                questionRepository.saveAll(Arrays.asList(q1, q2, q3, q4, q5, q6, q7, q8));
            }
        };
    }
} 