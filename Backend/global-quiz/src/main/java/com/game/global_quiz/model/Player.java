package com.game.global_quiz.model;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Player {
    private String id;
    private String username;
    private String avatarUrl;
    private boolean isHost;
    private int score;
    private boolean isReady;
    private boolean hasAnswered = false;
    private String currentAnswer;
    private String wrongAnswerSubmitted;  // Track the wrong answer this player submitted

    public Player(String username) {
        this.id = java.util.UUID.randomUUID().toString();
        this.username = username;
        this.score = 0;
        this.isReady = false;
        this.currentAnswer = null;
        this.wrongAnswerSubmitted = null;
        this.isHost = false;
    }

    public void resetForNewQuestion() {
        this.hasAnswered = false;
        this.currentAnswer = null;
        this.wrongAnswerSubmitted = null;
    }

    public void addScore(int points) {
        this.score += points;
    }

    public boolean isHasAnswered() {
        return hasAnswered;
    }

    public void setHasAnswered(boolean hasAnswered) {
        this.hasAnswered = hasAnswered;
    }
} 