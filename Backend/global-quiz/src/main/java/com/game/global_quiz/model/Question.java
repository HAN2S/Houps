package com.game.global_quiz.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import java.util.Set;

@Entity
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Question text is required")
    @Size(min = 10, max = 500, message = "Question text must be between 10 and 500 characters")
    @Column(unique = true)
    private String questionText;

    @NotBlank(message = "Correct answer is required")
    @Size(min = 1, max = 100, message = "Correct answer must be between 1 and 100 characters")
    private String correctAnswer;

    @NotBlank(message = "Category is required")
    @Size(min = 2, max = 50, message = "Category must be between 2 and 50 characters")
    private String category;

    @NotNull(message = "Difficulty is required")
    @Min(value = 1, message = "Difficulty must be at least 1")
    @Max(value = 3, message = "Difficulty must be at most 3")
    private Integer difficulty;

    @Size(max = 255, message = "Image URL must be at most 255 characters")
    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @Size(min = 3, max = 10, message = "Must provide between 3 and 10 fallback options")
    private Set<String> fallbackOptions;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Integer difficulty) {
        this.difficulty = difficulty;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Set<String> getFallbackOptions() {
        return fallbackOptions;
    }

    public void setFallbackOptions(Set<String> fallbackOptions) {
        this.fallbackOptions = fallbackOptions;
    }
} 