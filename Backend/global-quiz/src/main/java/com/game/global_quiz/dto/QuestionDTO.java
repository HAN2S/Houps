package com.game.global_quiz.dto;

import java.util.Set;

public class QuestionDTO {
    private Long id;
    private String questionText;
    private String correctAnswer;
    private String category;
    private Integer difficulty;
    private String imageUrl;
    private Set<String> fallbackOptions;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getDifficulty() { return difficulty; }
    public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Set<String> getFallbackOptions() { return fallbackOptions; }
    public void setFallbackOptions(Set<String> fallbackOptions) { this.fallbackOptions = fallbackOptions; }
} 