package com.game.global_quiz.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GameSession implements Serializable {
    private static final long serialVersionUID = 1L;
    private String sessionId;
    private List<Player> players = new ArrayList<>();
    private List<Long> chosenCategoryIds = new ArrayList<>();
    private Long currentQuestionId;
    private GameStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int maxPlayers;
    private int currentRound;
    private int totalRounds;
    private int timePerQuestion;
    private QuestionPhase currentPhase;
    private List<String> finalOptions = new ArrayList<>();
    private Long selectedCategory;
    private Integer selectedDifficulty;
    private String language = "en";

    public enum GameStatus {
        WAITING_FOR_PLAYERS,
        IN_PROGRESS,
        FINISHED
    }

    public enum QuestionPhase {
        LOBBY,
        CATEGORY_SELECTION,
        DIFFICULTY_SELECTION,
        COLLECTING_WRONG_ANSWERS,
        MCQ_ANSWERING,
        ANSWERS_REVEAL,
        SCORE_DISPLAY
    }

    public GameSession(int maxPlayers, int totalRounds, int timePerQuestion, List<Long> chosenCategoryIds) {
        this.sessionId = UUID.randomUUID().toString();
        this.players = new ArrayList<>();
        this.chosenCategoryIds = chosenCategoryIds != null ? new ArrayList<>(chosenCategoryIds) : new ArrayList<>();
        this.currentQuestionId = null;
        this.status = GameStatus.WAITING_FOR_PLAYERS;
        this.currentRound = 1;
        this.startTime = LocalDateTime.now();
        this.maxPlayers = maxPlayers;
        this.totalRounds = totalRounds;
        this.timePerQuestion = timePerQuestion;
        this.currentPhase = QuestionPhase.LOBBY;
        this.selectedCategory = null;
        this.selectedDifficulty = null;
    }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public List<Long> getChosenCategoryIds() {
        return chosenCategoryIds;
    }
    public void setChosenCategoryIds(List<Long> chosenCategoryIds) {
        this.chosenCategoryIds = chosenCategoryIds;
    }
    public Long getSelectedCategory() {
        return selectedCategory;
    }
    public void setSelectedCategory(Long selectedCategory) {
        this.selectedCategory = selectedCategory;
    }
} 
