package com.game.global_quiz.controller;

import com.game.global_quiz.model.GameSession;
import com.game.global_quiz.model.Player;
import com.game.global_quiz.service.GameService;
import com.game.global_quiz.service.PlayerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/game")
@Tag(name = "Game Management", description = "APIs for managing game sessions and gameplay")
public class GameController {
    private final GameService gameService;
    private final PlayerService playerService;

    public GameController(GameService gameService, PlayerService playerService) {
        this.gameService = gameService;
        this.playerService = playerService;
    }

    @Operation(
        summary = "Start a game session",
        description = "Initiates a new game session with the specified settings"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Game started successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Invalid request (e.g., null session ID)"
    )
    @ApiResponse(
        responseCode = "404",
        description = "Game session not found"
    )
    @ApiResponse(
        responseCode = "409",
        description = "Game cannot be started (e.g., already in progress, not enough players)"
    )
    @PostMapping("/{sessionId}/start")
    public ResponseEntity<?> startGame(
        @Parameter(description = "Session ID of the game", required = true)
        @PathVariable String sessionId
    ) {
        try {
            GameSession session = gameService.getSession(sessionId);
            if (session == null) {
                return ResponseEntity.notFound().build();
            }
            
            gameService.startGame(sessionId);
            return ResponseEntity.ok(session);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(409).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred while starting the game");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Get current game state",
        description = "Retrieves the current state of an active game session"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Game state retrieved successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(responseCode = "404", description = "Game session not found")
    @GetMapping("/{sessionId}/state")
    public ResponseEntity<GameSession> getGameState(
        @Parameter(description = "Session ID of the game", required = true)
        @PathVariable String sessionId
    ) {
        GameSession session = gameService.getSession(sessionId);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.notFound().build();
    }

    @Operation(
        summary = "Submit player answer",
        description = "Processes a player's answer for the current question"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Answer processed successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(responseCode = "404", description = "Game session not found")
    @PostMapping("/{sessionId}/answer")
    public ResponseEntity<GameSession> submitAnswer(
        @Parameter(description = "Session ID of the game", required = true)
        @PathVariable String sessionId,
        @Parameter(description = "Player ID", required = true)
        @RequestParam String playerId,
        @Parameter(description = "Player's answer", required = true)
        @RequestParam String answer
    ) {
        GameSession session = gameService.getSession(sessionId);
        if (session != null) {
            if (session.getCurrentPhase() == GameSession.QuestionPhase.COLLECTING_WRONG_ANSWERS) {
                gameService.submitWrongAnswer(sessionId, playerId, answer);
            } else if (session.getCurrentPhase() == GameSession.QuestionPhase.MCQ_ANSWERING) {
                gameService.submitMCQAnswer(sessionId, playerId, answer);
            }
            return ResponseEntity.ok(session);
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(
        summary = "End game session",
        description = "Terminates the current game session and calculates final scores"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Game ended successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(responseCode = "404", description = "Game session not found")
    @PostMapping("/{sessionId}/end")
    public ResponseEntity<GameSession> endGame(
        @Parameter(description = "Session ID of the game", required = true)
        @PathVariable String sessionId
    ) {
        GameSession session = gameService.getSession(sessionId);
        if (session != null) {
            gameService.endGame(session);
            return ResponseEntity.ok(session);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/session/{sessionId}/player/{playerId}")
    public ResponseEntity<Void> leaveGame(
            @PathVariable String sessionId,
            @PathVariable String playerId) {
        gameService.removePlayerFromSession(sessionId, playerId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/session/{sessionId}/answer/wrong")
    public ResponseEntity<Void> submitWrongAnswer(
            @PathVariable String sessionId,
            @RequestParam String playerId,
            @RequestParam String answer) {
        gameService.submitWrongAnswer(sessionId, playerId, answer);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/session/{sessionId}/answer/mcq")
    public ResponseEntity<Void> submitMCQAnswer(
            @PathVariable String sessionId,
            @RequestParam String playerId,
            @RequestParam String answer) {
        gameService.submitMCQAnswer(sessionId, playerId, answer);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/session/{sessionId}/next")
    public ResponseEntity<Void> moveToNextQuestion(@PathVariable String sessionId) {
        gameService.nextRoundOrFinish(sessionId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/session/{sessionId}/leaderboard")
    public ResponseEntity<List<Player>> getLeaderboard(@PathVariable String sessionId) {
        List<Player> leaderboard = gameService.getLeaderboard(sessionId);
        return ResponseEntity.ok(leaderboard);
    }

    @Operation(
        summary = "Select category for current round",
        description = "Allows the current player to select a category for the round"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Category selected successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(responseCode = "404", description = "Game session not found")
    @PostMapping("/{sessionId}/select-category")
    public ResponseEntity<?> selectCategory(
        @Parameter(description = "Session ID of the game", required = true)
        @PathVariable String sessionId,
        @Parameter(description = "Category selection request", required = true)
        @RequestBody Map<String, Object> request
    ) {
        try {
            Object categoryObj = request.get("category");
            Long categoryId = null;
            if (categoryObj instanceof Number) {
                categoryId = ((Number) categoryObj).longValue();
            } else if (categoryObj instanceof String) {
                categoryId = Long.valueOf((String) categoryObj);
            }
            String playerId = (String) request.get("playerId");

            if (categoryId == null || playerId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Category and playerId are required");
                return ResponseEntity.badRequest().body(error);
            }

            GameSession session = gameService.selectCategory(sessionId, playerId, categoryId);
            return ResponseEntity.ok(session);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred while selecting category");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @Operation(
        summary = "Select difficulty for current round",
        description = "Allows the current player to select difficulty for the round"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Difficulty selected successfully",
        content = @Content(schema = @Schema(implementation = GameSession.class))
    )
    @ApiResponse(responseCode = "404", description = "Game session not found")
    @PostMapping("/{sessionId}/select-difficulty")
    public ResponseEntity<?> selectDifficulty(
        @Parameter(description = "Session ID of the game", required = true)
        @PathVariable String sessionId,
        @Parameter(description = "Difficulty selection request", required = true)
        @RequestBody Map<String, Object> request
    ) {
        try {
            Integer difficulty = (Integer) request.get("difficulty");
            Object categoryObj = request.get("category");
            Long categoryId = null;
            if (categoryObj instanceof Number) {
                categoryId = ((Number) categoryObj).longValue();
            } else if (categoryObj instanceof String) {
                categoryId = Long.valueOf((String) categoryObj);
            }
            String playerId = (String) request.get("playerId");

            if (difficulty == null || categoryId == null || playerId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Difficulty, category, and playerId are required");
                return ResponseEntity.badRequest().body(error);
            }

            GameSession session = gameService.selectDifficulty(sessionId, playerId, difficulty, categoryId);
            return ResponseEntity.ok(session);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred while selecting difficulty");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/session/{sessionId}/wrong-answer-timeout")
    public ResponseEntity<Void> wrongAnswerTimeout(@PathVariable String sessionId) {
        GameSession session = gameService.getSession(sessionId);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        gameService.handleWrongAnswerTimeout(session);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/session/{sessionId}/mcq-answer-timeout")
    public ResponseEntity<Void> mcqAnswerTimeout(@PathVariable String sessionId) {
        GameSession session = gameService.getSession(sessionId);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        gameService.handleMCQAnswerTimeout(session);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/session/{sessionId}/reveal-to-score")
    public ResponseEntity<Void> revealToScore(@PathVariable String sessionId) {
        GameSession session = gameService.getSession(sessionId);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        gameService.moveToScoreDisplay(session);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/session/{sessionId}/reset")
    public ResponseEntity<Void> resetGame(@PathVariable String sessionId) {
        GameSession session = gameService.getSession(sessionId);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        gameService.resetGame(session);
        return ResponseEntity.ok().build();
    }
} 