package com.game.global_quiz.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.game.global_quiz.dto.CreateRoomRequestDTO;
import com.game.global_quiz.dto.PlayerDTO;
import com.game.global_quiz.dto.RoomJoinResponseDTO;
import com.game.global_quiz.dto.RoomSettingsDTO;
import com.game.global_quiz.model.GameSession;
import com.game.global_quiz.service.CategoryService;
import com.game.global_quiz.service.GameService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Room Management", description = "APIs for managing game rooms and player sessions")
public class RoomController {
    private static final Logger logger = LoggerFactory.getLogger(RoomController.class);
    private final GameService gameService;
    private final RoomWebSocketController roomWebSocketController;
    private final CategoryService categoryService;

    public RoomController(GameService gameService, RoomWebSocketController roomWebSocketController, CategoryService categoryService) {
        this.gameService = gameService;
        this.roomWebSocketController = roomWebSocketController;
        this.categoryService = categoryService;
    }

    @Operation(
        summary = "Create a new game room",
        description = "Creates a new game room with the host player"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Room created successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Invalid request (e.g., missing required fields)"
    )
    @ApiResponse(
        responseCode = "500",
        description = "Internal server error"
    )
    @PostMapping
    public ResponseEntity<?> createRoom(
        @Parameter(description = "Host player details and room settings", required = true)
        @RequestBody CreateRoomRequestDTO request
    ) {
        try {
            logger.info("Received request to create room with: {}", request);

            if (request == null || request.getHostPlayer() == null) {
                logger.warn("Host player details are missing from create room request");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Host player details are required");
                return ResponseEntity.badRequest().body(error);
            }

            PlayerDTO hostPlayer = request.getHostPlayer();
            RoomSettingsDTO roomSettings = request.getRoomSettings();

            if (hostPlayer.getUsername() == null || hostPlayer.getUsername().trim().isEmpty()) {
                logger.warn("Username is missing or empty for host player");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Username is required");
                return ResponseEntity.badRequest().body(error);
            }

            // Default values if roomSettings are not provided
            int maxPlayers = roomSettings != null ? roomSettings.getMaxPlayers() : 4;
            int totalRounds = roomSettings != null ? roomSettings.getTotalRounds() : 10;
            int timePerQuestion = roomSettings != null ? roomSettings.getTimePerQuestion() : 30;
            // Get chosen categories, default to empty list if not provided
            java.util.List<Long> chosenCategoryIds = roomSettings != null && roomSettings.getCategories() != null 
                                                     ? roomSettings.getCategories() : new java.util.ArrayList<>();

            // Generate unique ID for player
            String playerId = UUID.randomUUID().toString();
            logger.info("Generated player ID: {}", playerId);
            
            // Create game session with host and room settings
            GameSession session = gameService.createGameSession(
                playerId,
                hostPlayer.getUsername(),
                hostPlayer.getAvatarUrl(),
                maxPlayers,
                totalRounds,
                timePerQuestion,
                chosenCategoryIds, // Pass chosen categories
                request.getLanguage() // Pass language
            );
            
            logger.info("Successfully created game session with ID: {}", session.getSessionId());
            RoomJoinResponseDTO response = new RoomJoinResponseDTO(session, playerId, categoryService);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument while creating room: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while creating room", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred while creating the room: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Get room details",
        description = "Retrieves the current state of a game room"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Room details retrieved successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(responseCode = "404", description = "Room not found")
    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getRoomDetails(
        @Parameter(description = "Session ID of the room", required = true)
        @PathVariable String sessionId
    ) {
        try {
            logger.info("Received request to get room details for session ID: {}", sessionId);
            GameSession session = gameService.getSession(sessionId);
            if (session == null) {
                logger.warn("Room not found for session ID: {}", sessionId);
                return ResponseEntity.notFound().build();
            }
            logger.info("Successfully retrieved room details for session ID: {}", sessionId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            logger.error("Unexpected error while getting room details", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred while retrieving room details: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Join a game room",
        description = "Adds a new player to an existing game room"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Player joined successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Invalid request (e.g., missing player details, invalid session ID)"
    )
    @ApiResponse(
        responseCode = "404",
        description = "Room not found"
    )
    @ApiResponse(
        responseCode = "409",
        description = "Cannot join room (e.g., room full, game already started)"
    )
    @ApiResponse(
        responseCode = "500",
        description = "Internal server error"
    )
    @PostMapping("/{sessionId}/join")
    public ResponseEntity<?> joinRoom(
        @Parameter(description = "Session ID of the room", required = true)
        @PathVariable String sessionId,
        @Parameter(description = "Player details", required = true)
        @RequestBody PlayerDTO player
    ) {
        try {
            logger.info("Received request to join room {} with player: {}", sessionId, player);

            if (player == null) {
                logger.warn("Player details are missing for session ID: {}", sessionId);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Player details are required");
                return ResponseEntity.badRequest().body(error);
            }

            if (player.getUsername() == null || player.getUsername().trim().isEmpty()) {
                logger.warn("Username is missing or empty for session ID: {}", sessionId);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Username is required");
                return ResponseEntity.badRequest().body(error);
            }

            // Generate unique ID for player
            String playerId = UUID.randomUUID().toString();
            logger.info("Generated player ID {} for session ID: {}", playerId, sessionId);
            Optional<GameSession> updatedSession = Optional.of(gameService.getSession(sessionId));

            if(!updatedSession.isPresent()){
                logger.warn("Session is not found or empty for session ID: {}", sessionId);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Session Not Found");
                return ResponseEntity.notFound().build();
            }
            // Add player to session
            gameService.addPlayerToSession(
                sessionId,
                playerId,
                player.getUsername(),
                player.getAvatarUrl()
            );
            
            

            logger.info("Successfully joined player {} to session ID e: {}", playerId, updatedSession);
            RoomJoinResponseDTO response = new RoomJoinResponseDTO(updatedSession.get(), playerId, categoryService);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument while joining room {}: {}", sessionId, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IllegalStateException e) {
            logger.error("Illegal state while joining room {}: {}", sessionId, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(409).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while joining room {}", sessionId, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred while joining the room: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Update room settings",
        description = "Updates the configuration of a game room"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Settings updated successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(responseCode = "404", description = "Room not found")
    @PutMapping("/{sessionId}/settings")
    public ResponseEntity<?> updateRoomSettings(
        @Parameter(description = "Session ID of the room", required = true)
        @PathVariable String sessionId,
        @Parameter(description = "New room settings", required = true)
        @RequestBody RoomSettingsDTO settings
    ) {
        try {
            logger.info("Received request to update settings for room {}: {}", sessionId, settings);
            GameSession session = gameService.getSession(sessionId);
            if (session == null) {
                logger.warn("Room not found for update settings, session ID: {}", sessionId);
                return ResponseEntity.notFound().build();
            }
            
            // Update settings
            session.setMaxPlayers(settings.getMaxPlayers());
            session.setTotalRounds(settings.getTotalRounds());
            session.setTimePerQuestion(settings.getTimePerQuestion());
            session.setChosenCategoryIds(settings.getCategories());
            if (settings.getLanguage() != null) {
                session.setLanguage(settings.getLanguage());
            }
            logger.info("Updated categories for session {}: {}", sessionId, settings.getCategories());

            gameService.saveSession(session);
            
            // Broadcast the updated session to all players
            roomWebSocketController.broadcastRoomUpdate(sessionId, session);
            
            logger.info("Successfully updated settings for session ID: {}", sessionId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            logger.error("Unexpected error while updating room settings for session ID {}", sessionId, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred while updating room settings: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Toggle player ready state",
        description = "Toggles the ready state of a player in the game room"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Ready state toggled successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(responseCode = "404", description = "Room or player not found")
    @PutMapping("/{sessionId}/players/{playerId}/ready")
    public ResponseEntity<?> togglePlayerReadyState(
        @Parameter(description = "Session ID of the room", required = true)
        @PathVariable String sessionId,
        @Parameter(description = "Player ID", required = true)
        @PathVariable String playerId
    ) {
        try {
            logger.info("Received request to toggle ready state for player {} in session {}", playerId, sessionId);
            GameSession session = gameService.togglePlayerReadyState(sessionId, playerId);
            return ResponseEntity.ok(session);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument while toggling player ready state: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while toggling player ready state", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
} 