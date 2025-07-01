package com.game.global_quiz.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class RoomWebSocketController {
    private static final Logger logger = LoggerFactory.getLogger(RoomWebSocketController.class);
    private final SimpMessagingTemplate messagingTemplate;

    public RoomWebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastRoomUpdate(String roomCode, Object roomState) {
        try {
            String destination = "/topic/room/" + roomCode;
            logger.info("Broadcasting room update to destination: {}", destination);
            messagingTemplate.convertAndSend(destination, roomState);
            logger.info("Successfully broadcasted room update for room: {}", roomCode);
        } catch (Exception e) {
            logger.error("Error broadcasting room update for room {}: {}", roomCode, e.getMessage(), e);
        }
    }
} 