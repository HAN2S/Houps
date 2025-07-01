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
    private List<String> chosenCategories = new ArrayList<>();
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
    private String selectedCategory;
    private Integer selectedDifficulty;

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
        SCORE_DISPLAY
    }

    public GameSession(int maxPlayers, int totalRounds, int timePerQuestion, List<String> chosenCategories) {
        this.sessionId = UUID.randomUUID().toString();
        this.players = new ArrayList<>();
        this.chosenCategories = chosenCategories != null ? new ArrayList<>(chosenCategories) : new ArrayList<>();
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
} 
