package com.game.global_quiz.dto;

import com.game.global_quiz.model.GameSession;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomJoinResponseDTO {
    private GameSession session;
    private String playerId;
} 