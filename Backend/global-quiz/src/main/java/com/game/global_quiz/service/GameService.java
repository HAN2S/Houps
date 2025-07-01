package com.game.global_quiz.service;

import com.game.global_quiz.model.GameSession;
import com.game.global_quiz.model.Player;
import com.game.global_quiz.model.Question;
import com.game.global_quiz.repository.QuestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.game.global_quiz.controller.RoomWebSocketController;

@Service
public class GameService {
    private static final Logger logger = LoggerFactory.getLogger(GameService.class);
    private final RedisTemplate<String, GameSession> redisTemplate;
    private final QuestionService questionService;
    private final PlayerService playerService;
    private final RoomWebSocketController roomWebSocketController;

    public GameService(RedisTemplate<String, GameSession> redisTemplate, 
                      QuestionService questionService, 
                      PlayerService playerService,
                      RoomWebSocketController roomWebSocketController) {
        this.redisTemplate = redisTemplate;
        this.questionService = questionService;
        this.playerService = playerService;
        this.roomWebSocketController = roomWebSocketController;
    }

    public GameSession createGameSession(
            String playerId,
            String username,
            String avatarUrl,
            int maxPlayers,
            int totalRounds,
            int timePerQuestion,
            List<String> chosenCategories) {
        // Create host player
        Player host = new Player();
        host.setId(playerId);
        host.setUsername(username);
        host.setAvatarUrl(avatarUrl);
        host.setHost(true);
        host.setReady(false);

        // Get all categories from database
        List<String> allCategories = questionService.getAllCategories();
        
        // Create session with all categories
        GameSession session = new GameSession(maxPlayers, totalRounds, timePerQuestion, allCategories);
        session.getPlayers().add(host);
        session.setCurrentPhase(GameSession.QuestionPhase.LOBBY);
        
        // Save to Redis
        saveSession(session);
        // Broadcast initial room state
        roomWebSocketController.broadcastRoomUpdate(session.getSessionId(), session);
        return session;
    }

    public void addPlayerToSession(
            String sessionId,
            String playerId,
            String username,
            String avatarUrl) {
        GameSession session = getSession(sessionId);
        if (session != null && session.getPlayers().size() < session.getMaxPlayers() 
            && session.getStatus() == GameSession.GameStatus.WAITING_FOR_PLAYERS) {
            
            Player player = new Player();
            player.setId(playerId);
            player.setUsername(username);
            player.setAvatarUrl(avatarUrl);
            player.setHost(false);
            player.setReady(false);
            
            session.getPlayers().add(player);
            saveSession(session);
            // Broadcast updated room state
            roomWebSocketController.broadcastRoomUpdate(sessionId, session);
        }
    }

    public void removePlayerFromSession(String sessionId, String playerId) {
        GameSession session = getSession(sessionId);
        if (session != null) {
            session.getPlayers().removeIf(player -> player.getId().equals(playerId));
            saveSession(session);
            roomWebSocketController.broadcastRoomUpdate(sessionId, session);
        }
    }

    public GameSession getSession(String sessionId) {
        return redisTemplate.opsForValue().get("game:" + sessionId);
    }

    public void saveSession(GameSession session) {
        redisTemplate.opsForValue().set(
            "game:" + session.getSessionId(),
            session,
            Duration.ofHours(2)
        );
        // Broadcast updated room state
        roomWebSocketController.broadcastRoomUpdate(session.getSessionId(), session);
    }

    public GameSession togglePlayerReadyState(String sessionId, String playerId) {
        GameSession session = getSession(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }

        Player player = session.getPlayers().stream()
                .filter(p -> p.getId().equals(playerId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Player not found: " + playerId));

        player.setReady(!player.isReady());
        saveSession(session);
        roomWebSocketController.broadcastRoomUpdate(sessionId, session);
        return session;
    }

    public void startGame(String sessionId) {
        logger.info("Attempting to start game for session: {}", sessionId);
        GameSession session = getSession(sessionId);
        if (session == null) {
            logger.error("Failed to start game - Session not found: {}", sessionId);
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }

        // Log current state before making changes
        logger.info("Current session state - Players: {}, Status: {}", 
                   session.getPlayers().size(), session.getStatus());
        logger.info("Players ready status: {}", session.getPlayers().stream()
                   .map(p -> p.getUsername() + ":" + p.isReady() + ":" + p.isHost())
                   .collect(Collectors.joining(", ")));

        // Automatically mark the host as ready if they're not already
        Player host = session.getPlayers().stream()
                           .filter(Player::isHost)
                           .findFirst()
                           .orElse(null);
        
        if (host != null && !host.isReady()) {
            logger.info("Automatically marking host {} as ready", host.getUsername());
            host.setReady(true);
            saveSession(session);
            roomWebSocketController.broadcastRoomUpdate(sessionId, session);
        }

        if (!canStartGame(session)) {
            logger.warn("Cannot start game - Conditions not met for session: {}", sessionId);
            throw new IllegalStateException("Cannot start game: " + getStartGameErrorMessage(session));
        }

        int playerCount = session.getPlayers().size();
        logger.info("Starting game for session {} with {} players", sessionId, playerCount);

        if (playerCount > session.getMaxPlayers()) {
            logger.warn("Cannot start game - Too many players (maximum {} allowed) in session: {}", session.getMaxPlayers(), sessionId);
            throw new IllegalStateException("Too many players to start the game (maximum " + session.getMaxPlayers() + " allowed)");
        }

        session.setStatus(GameSession.GameStatus.IN_PROGRESS);
        session.setStartTime(LocalDateTime.now());
        session.setCurrentRound(1);
        // Don't select a question yet - wait for category and difficulty selection
        session.setCurrentQuestionId(null);
        session.setCurrentPhase(GameSession.QuestionPhase.CATEGORY_SELECTION);
        session.setSelectedCategory(null);
        session.setSelectedDifficulty(null);
        saveSession(session);
        roomWebSocketController.broadcastRoomUpdate(sessionId, session);
        logger.info("Game started successfully for session: {}", sessionId);
    }

    public void submitWrongAnswer(String sessionId, String playerId, String answer) {
        logger.info("Attempting to submit wrong answer - Session: {}, Player: {}, Answer: {}", sessionId, playerId, answer);
        
        GameSession session = getSession(sessionId);
        if (session == null) {
            logger.error("Failed to submit wrong answer - Session not found: {}", sessionId);
            return;
        }
        
        if (session.getCurrentPhase() != GameSession.QuestionPhase.COLLECTING_WRONG_ANSWERS) {
            logger.error("Failed to submit wrong answer - Wrong phase. Current phase: {}", session.getCurrentPhase());
            return;
        }

        Player player = playerService.findPlayerById(session.getPlayers(), playerId);
        if (player == null) {
            logger.error("Failed to submit wrong answer - Player not found: {}", playerId);
            return;
        }

        logger.info("Submitting wrong answer for player: {}", player.getUsername());
        playerService.submitWrongAnswer(player, answer);
        player.setHasAnswered(true); // Mark as answered
        saveSession(session);
        checkAllWrongAnswersSubmitted(session);
        logger.info("Wrong answer submitted and session saved successfully");
    }

    private void checkAllWrongAnswersSubmitted(GameSession session) {
        boolean allSubmitted = session.getPlayers().stream().allMatch(Player::isHasAnswered);
        if (allSubmitted) {
            session.setCurrentPhase(GameSession.QuestionPhase.MCQ_ANSWERING);
            // Reset hasAnswered for MCQ phase
            session.getPlayers().forEach(p -> p.setHasAnswered(false));
            saveSession(session);
            roomWebSocketController.broadcastRoomUpdate(session.getSessionId(), session);
        }
    }

    public void submitMCQAnswer(String sessionId, String playerId, String answer) {
        GameSession session = getSession(sessionId);
        if (session == null) {
            logger.error("Failed to submit MCQ answer - Session not found: {}", sessionId);
            return;
        }
        if (session.getCurrentPhase() != GameSession.QuestionPhase.MCQ_ANSWERING) {
            logger.error("Failed to submit MCQ answer - Wrong phase. Current phase: {}", session.getCurrentPhase());
            return;
        }
        Player player = playerService.findPlayerById(session.getPlayers(), playerId);
        if (player == null) {
            logger.error("Failed to submit MCQ answer - Player not found: {}", playerId);
            return;
        }
        player.setCurrentAnswer(answer);
        player.setHasAnswered(true);
        saveSession(session);
        checkAllMCQAnswersSubmittedOrTimeout(session);
    }

    private void checkAllMCQAnswersSubmittedOrTimeout(GameSession session) {
        boolean allAnswered = session.getPlayers().stream().allMatch(Player::isHasAnswered);
        if (allAnswered /* or timer expired */) {
            session.setCurrentPhase(GameSession.QuestionPhase.SCORE_DISPLAY);
            // Reset hasAnswered for next round
            session.getPlayers().forEach(p -> p.setHasAnswered(false));
            saveSession(session);
            roomWebSocketController.broadcastRoomUpdate(session.getSessionId(), session);
        }
    }

    public void moveToNextQuestion(String sessionId) {
        logger.info("Attempting to move to next question for session: {}", sessionId);
        GameSession session = getSession(sessionId);
        if (session == null) {
            logger.error("Failed to move to next question - Session not found: {}", sessionId);
            return;
        }

        if (session.getCurrentRound() == session.getTotalRounds()) {
            logger.info("Ending game for session {} as all rounds are complete.", sessionId);
            endGame(session);
            return;
        }

        updateScores(session);
        session.setCurrentRound(session.getCurrentRound() + 1);
        
        // Reset category and difficulty selection for the new round
        session.setSelectedCategory(null);
        session.setSelectedDifficulty(null);
        session.setCurrentQuestionId(null);
        session.setCurrentPhase(GameSession.QuestionPhase.COLLECTING_WRONG_ANSWERS);
        session.setFinalOptions(new ArrayList<>());
        
        logger.info("Moving to next question in round {} for session {}.", session.getCurrentRound(), sessionId);
        saveSession(session);
        roomWebSocketController.broadcastRoomUpdate(sessionId, session);
    }

    private boolean canStartGame(GameSession session) {
        return session.getPlayers().size() >= 2 && 
               session.getPlayers().stream().allMatch(Player::isReady) && 
               session.getStatus() == GameSession.GameStatus.WAITING_FOR_PLAYERS;
    }

    private String getStartGameErrorMessage(GameSession session) {
        if (session.getPlayers().size() < 2) {
            return "Not enough players to start the game (minimum 2 required)";
        }
        if (!session.getPlayers().stream().allMatch(Player::isReady)) {
            return "All players must be ready to start the game";
        }
        if (session.getStatus() != GameSession.GameStatus.WAITING_FOR_PLAYERS) {
            return "Game can only be started from WAITING state";
        }
        return "Unknown error";
    }

    private void selectNewQuestion(GameSession session) {
        if (session.getChosenCategories().isEmpty()) {
            throw new IllegalStateException("No categories chosen for the game session.");
        }
        String randomCategory = session.getChosenCategories().get(new Random().nextInt(session.getChosenCategories().size()));
        int randomDifficulty = new Random().nextInt(2) + 1;
        
        Question newQuestion = questionService.getRandomQuestion(randomCategory, randomDifficulty);
        if (newQuestion == null) {
            throw new IllegalStateException("Could not find a question for the given categories and difficulty: "+randomCategory);
        }
        session.setCurrentQuestionId(newQuestion.getId());
        session.setCurrentPhase(GameSession.QuestionPhase.COLLECTING_WRONG_ANSWERS);
        session.setFinalOptions(new ArrayList<>());
        resetPlayerStates(session);
    }

    private void resetPlayerStates(GameSession session) {
        session.getPlayers().forEach(playerService::resetPlayerState);
    }

    private Set<String> collectWrongAnswers(GameSession session) {
        Question currentQuestion = getLoadedCurrentQuestion(session);
        if (currentQuestion == null) return Collections.emptySet();
        return session.getPlayers().stream()
                .filter(Player::isHasAnswered)
                .map(Player::getWrongAnswerSubmitted)
                .filter(answer -> answer != null && !questionService.isCorrectAnswer(currentQuestion, answer))
                .collect(Collectors.toSet());
    }

    private void updateScores(GameSession session) {
        Question currentQuestion = getLoadedCurrentQuestion(session);
        if (currentQuestion == null) {
            logger.warn("Cannot update scores: Current question not loaded for session {}", session.getSessionId());
            return;
        }

        // Map to store original wrong answers and the players who submitted them
        Map<String, Set<Player>> originalWrongAnswerSubmitters = new HashMap<>();
        session.getPlayers().forEach(player -> {
            if (player.isHasAnswered() && player.getWrongAnswerSubmitted() != null) {
                originalWrongAnswerSubmitters.computeIfAbsent(player.getWrongAnswerSubmitted(), k -> new HashSet<>()).add(player);
            }
        });

        session.getPlayers().forEach(player -> {
            // Rule 1: Correct answer scoring
            if (player.isHasAnswered() && questionService.isCorrectAnswer(currentQuestion, player.getCurrentAnswer())) {
                int points = currentQuestion.getDifficulty();
                player.addScore(points);
                logger.info("Player {} answered correctly and gained {} points. New score: {}", player.getUsername(), points, player.getScore());
            } 
            // Rule 2: Bonus points for chosen wrong answers
            else if (player.isHasAnswered() && player.getCurrentAnswer() != null) {
                Set<Player> submitters = originalWrongAnswerSubmitters.get(player.getCurrentAnswer());
                if (submitters != null) {
                    submitters.forEach(originalSubmitter -> {
                        if (!originalSubmitter.getId().equals(player.getId())) {
                            originalSubmitter.addScore(1);
                            logger.info("Player {} chose wrong answer '{}' originally submitted by {}. {} gained 1 bonus point. New score: {}", 
                                    player.getUsername(), player.getCurrentAnswer(), originalSubmitter.getUsername(), originalSubmitter.getUsername(), originalSubmitter.getScore());
                        }
                    });
                }
            }
        });
        saveSession(session);
    }

    private Question getLoadedCurrentQuestion(GameSession session) {
        if (session.getCurrentQuestionId() == null) {
            return null;
        }
        return questionService.findById(session.getCurrentQuestionId());
    }

    public void endGame(GameSession session) {
        resetPlayerStates(session);
        session.setFinalOptions(null);
        session.setCurrentQuestionId(null);
        session.setStatus(GameSession.GameStatus.FINISHED);
        session.setEndTime(LocalDateTime.now());
        saveSession(session);
    }

    public List<Player> getLeaderboard(String sessionId) {
        GameSession session = getSession(sessionId);
        if (session != null) {
            return session.getPlayers().stream()
                    .sorted(Comparator.comparingInt(Player::getScore).reversed())
                    .collect(Collectors.toList());
        }
        return Collections.emptyList();
    }

    public Player findPlayerById(String sessionId, String playerId) {
        GameSession session = getSession(sessionId);
        if (session != null) {
            return session.getPlayers().stream()
                    .filter(p -> p.getId().equals(playerId))
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }

    public GameSession selectCategory(String sessionId, String playerId, String category) {
        logger.info("Selecting category {} for session {} by player {}", category, sessionId, playerId);
        
        GameSession session = getSession(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }

        // Verify it's the correct player's turn
        int currentPlayerIndex = (session.getCurrentRound() - 1) % session.getPlayers().size();
        Player currentPlayer = session.getPlayers().get(currentPlayerIndex);
        
        if (!currentPlayer.getId().equals(playerId)) {
            throw new IllegalArgumentException("Not your turn to select category");
        }

        // Verify the category is in the chosen categories
        if (!session.getChosenCategories().contains(category)) {
            throw new IllegalArgumentException("Category not available: " + category);
        }

        // Store the selected category
        session.setSelectedCategory(category);
        session.setCurrentPhase(GameSession.QuestionPhase.DIFFICULTY_SELECTION);
        saveSession(session);
        roomWebSocketController.broadcastRoomUpdate(sessionId, session);
        
        logger.info("Category {} selected successfully for session {}", category, sessionId);
        return session;
    }

    public GameSession selectDifficulty(String sessionId, String playerId, int difficulty) {
        logger.info("Selecting difficulty {} for session {} by player {}", difficulty, sessionId, playerId);
        
        GameSession session = getSession(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }

        // Verify it's the correct player's turn
        int currentPlayerIndex = (session.getCurrentRound() - 1) % session.getPlayers().size();
        Player currentPlayer = session.getPlayers().get(currentPlayerIndex);
        
        if (!currentPlayer.getId().equals(playerId)) {
            throw new IllegalArgumentException("Not your turn to select difficulty");
        }

        // Verify difficulty is valid
        if (difficulty < 1 || difficulty > 3) {
            throw new IllegalArgumentException("Invalid difficulty level: " + difficulty);
        }

        // Store the selected difficulty and get a question
        session.setSelectedDifficulty(difficulty);
        
        // Get a question for the selected category and difficulty
        Question question = questionService.getRandomQuestion(session.getSelectedCategory(), difficulty);
        if (question == null) {
            throw new IllegalStateException("No question found for category " + session.getSelectedCategory() + " and difficulty " + difficulty);
        }
        
        session.setCurrentQuestionId(question.getId());
        session.setCurrentPhase(GameSession.QuestionPhase.COLLECTING_WRONG_ANSWERS);
        session.setFinalOptions(new ArrayList<>());
        resetPlayerStates(session);
        
        saveSession(session);
        roomWebSocketController.broadcastRoomUpdate(sessionId, session);
        
        logger.info("Difficulty {} selected and question loaded for session {}", difficulty, sessionId);
        return session;
    }

    public void nextRoundOrFinish(String sessionId) {
        GameSession session = getSession(sessionId);
        if (session == null) return;
        if (session.getCurrentRound() < session.getTotalRounds()) {
            session.setCurrentRound(session.getCurrentRound() + 1);
            session.setCurrentPhase(GameSession.QuestionPhase.CATEGORY_SELECTION);
            session.setSelectedCategory(null);
            session.setSelectedDifficulty(null);
            session.setCurrentQuestionId(null);
            session.setFinalOptions(new ArrayList<>());
            // Reset per-round state for all players
            session.getPlayers().forEach(p -> {
                p.setHasAnswered(false);
                p.setCurrentAnswer(null);
                p.setWrongAnswerSubmitted(null);
            });
        } else {
            session.setStatus(GameSession.GameStatus.FINISHED);
        }
        saveSession(session);
        roomWebSocketController.broadcastRoomUpdate(sessionId, session);
    }
} 