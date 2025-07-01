package com.game.global_quiz.dto;

import lombok.Data;

@Data
public class CreateRoomRequestDTO {
    private PlayerDTO hostPlayer;
    private RoomSettingsDTO roomSettings;
} 