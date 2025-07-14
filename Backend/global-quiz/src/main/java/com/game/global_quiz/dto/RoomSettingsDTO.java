package com.game.global_quiz.dto;

import lombok.Data;
import java.util.List;

@Data
public class RoomSettingsDTO {
    private List<Long> categories;
    private int maxPlayers;
    private int totalRounds;
    private int timePerQuestion;
    private String language;
} 