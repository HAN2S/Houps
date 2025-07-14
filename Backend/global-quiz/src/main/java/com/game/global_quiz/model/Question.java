package com.game.global_quiz.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import java.util.List;
import com.game.global_quiz.model.FallbackOption;

@Entity
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Question text is required")
    @Size(min = 10, max = 500, message = "Question text must be between 10 and 500 characters")
    @Column(name = "question_text_fr", unique = true)
    private String questionTextFr;

    @Column(name = "question_text_en")
    private String questionTextEn;

    @Column(name = "question_text_ar")
    private String questionTextAr;

    @NotBlank(message = "Correct answer is required")
    @Size(min = 1, max = 100, message = "Correct answer must be between 1 and 100 characters")
    @Column(name = "correct_answer_fr")
    private String correctAnswerFr;

    @Column(name = "correct_answer_en")
    private String correctAnswerEn;

    @Column(name = "correct_answer_ar")
    private String correctAnswerAr;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @NotNull(message = "Difficulty is required")
    @Min(value = 1, message = "Difficulty must be at least 1")
    @Max(value = 3, message = "Difficulty must be at most 3")
    private Integer difficulty;

    @Size(max = 255, message = "Image URL must be at most 255 characters")
    private String imageUrl;

    @Size(max = 100, message = "Trap answer must be at most 100 characters")
    @Column(name = "trap_answer_fr")
    private String trapAnswerFr;
    @Column(name = "trap_answer_en")
    private String trapAnswerEn;
    @Column(name = "trap_answer_ar")
    private String trapAnswerAr;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_fallback_options", joinColumns = @JoinColumn(name = "question_id"))
    private List<FallbackOption> fallbackOptions;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionTextFr() {
        return questionTextFr;
    }
    public void setQuestionTextFr(String questionTextFr) {
        this.questionTextFr = questionTextFr;
    }

    public String getQuestionTextEn() { return questionTextEn; }
    public void setQuestionTextEn(String questionTextEn) { this.questionTextEn = questionTextEn; }
    public String getQuestionTextAr() { return questionTextAr; }
    public void setQuestionTextAr(String questionTextAr) { this.questionTextAr = questionTextAr; }
    public String getCorrectAnswerFr() {
        return correctAnswerFr;
    }
    public void setCorrectAnswerFr(String correctAnswerFr) {
        this.correctAnswerFr = correctAnswerFr;
    }

    public String getCorrectAnswerEn() { return correctAnswerEn; }
    public void setCorrectAnswerEn(String correctAnswerEn) { this.correctAnswerEn = correctAnswerEn; }
    public String getCorrectAnswerAr() { return correctAnswerAr; }
    public void setCorrectAnswerAr(String correctAnswerAr) { this.correctAnswerAr = correctAnswerAr; }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
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

    public String getTrapAnswerFr() { return trapAnswerFr; }
    public void setTrapAnswerFr(String trapAnswerFr) { this.trapAnswerFr = trapAnswerFr; }
    public String getTrapAnswerEn() { return trapAnswerEn; }
    public void setTrapAnswerEn(String trapAnswerEn) { this.trapAnswerEn = trapAnswerEn; }
    public String getTrapAnswerAr() { return trapAnswerAr; }
    public void setTrapAnswerAr(String trapAnswerAr) { this.trapAnswerAr = trapAnswerAr; }

    public List<FallbackOption> getFallbackOptions() { return fallbackOptions; }
    public void setFallbackOptions(List<FallbackOption> fallbackOptions) { this.fallbackOptions = fallbackOptions; }
} 