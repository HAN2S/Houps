package com.game.global_quiz.dto;

import java.util.List;

public class QuestionDTO {
    private Long id;
    private String questionTextFr;
    private String questionTextEn;
    private String questionTextAr;
    private String correctAnswerFr;
    private String correctAnswerEn;
    private String correctAnswerAr;
    private String category;
    private Integer difficulty;
    private String imageUrl;
    private String trapAnswerFr;
    private String trapAnswerEn;
    private String trapAnswerAr;
    private List<FallbackOptionDTO> fallbackOptions;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionTextFr() { return questionTextFr; }
    public void setQuestionTextFr(String questionTextFr) { this.questionTextFr = questionTextFr; }
    public String getQuestionTextEn() { return questionTextEn; }
    public void setQuestionTextEn(String questionTextEn) { this.questionTextEn = questionTextEn; }
    public String getQuestionTextAr() { return questionTextAr; }
    public void setQuestionTextAr(String questionTextAr) { this.questionTextAr = questionTextAr; }
    public String getCorrectAnswerFr() { return correctAnswerFr; }
    public void setCorrectAnswerFr(String correctAnswerFr) { this.correctAnswerFr = correctAnswerFr; }
    public String getCorrectAnswerEn() { return correctAnswerEn; }
    public void setCorrectAnswerEn(String correctAnswerEn) { this.correctAnswerEn = correctAnswerEn; }
    public String getCorrectAnswerAr() { return correctAnswerAr; }
    public void setCorrectAnswerAr(String correctAnswerAr) { this.correctAnswerAr = correctAnswerAr; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getDifficulty() { return difficulty; }
    public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getTrapAnswerFr() { return trapAnswerFr; }
    public void setTrapAnswerFr(String trapAnswerFr) { this.trapAnswerFr = trapAnswerFr; }
    public String getTrapAnswerEn() { return trapAnswerEn; }
    public void setTrapAnswerEn(String trapAnswerEn) { this.trapAnswerEn = trapAnswerEn; }
    public String getTrapAnswerAr() { return trapAnswerAr; }
    public void setTrapAnswerAr(String trapAnswerAr) { this.trapAnswerAr = trapAnswerAr; }
    public List<FallbackOptionDTO> getFallbackOptions() { return fallbackOptions; }
    public void setFallbackOptions(List<FallbackOptionDTO> fallbackOptions) { this.fallbackOptions = fallbackOptions; }
} 