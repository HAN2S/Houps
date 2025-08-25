package com.game.global_quiz.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import com.game.global_quiz.controller.RoomWebSocketController;
import com.game.global_quiz.model.Category;
import com.game.global_quiz.model.FallbackOption;
import com.game.global_quiz.model.GameSession;
import com.game.global_quiz.model.Player;
import com.game.global_quiz.model.Question;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private RedisTemplate<String, GameSession> redisTemplate;

    @Mock
    private ValueOperations<String, GameSession> valueOperations;

    @Mock
    private QuestionService questionService;

    @Mock
    private PlayerService playerService;

    @Mock
    private RoomWebSocketController roomWebSocketController;


    @InjectMocks
    private GameService gameService;

    private GameSession testSession;
    private Question mockQuestion;
    private static final String TEST_SESSION_ID = "test-session-123";
    private static final String REDIS_KEY = "game:" + TEST_SESSION_ID;

    @BeforeEach
    void setUp() {
        // Setup mock question
        mockQuestion = new Question();
        mockQuestion.setId(1L);
        mockQuestion.setQuestionTextEn("What is the capital of France?");
        mockQuestion.setCorrectAnswerEn("Paris");
        Category mockCategory = new Category();
        mockCategory.setNameEn("Geography");
        mockQuestion.setCategory(mockCategory);
        mockQuestion.setDifficulty(1);
        List<FallbackOption> fallbackOptions = new ArrayList<>();
        FallbackOption fo1 = new FallbackOption(); fo1.setFallbackEn("London"); fo1.setFallbackFr("Londres"); fo1.setFallbackAr("لندن");
        FallbackOption fo2 = new FallbackOption(); fo2.setFallbackEn("Berlin"); fo2.setFallbackFr("Berlin"); fo2.setFallbackAr("برلين");
        FallbackOption fo3 = new FallbackOption(); fo3.setFallbackEn("Madrid"); fo3.setFallbackFr("Madrid"); fo3.setFallbackAr("مدريد");
        fallbackOptions.add(fo1); fallbackOptions.add(fo2); fallbackOptions.add(fo3);
        mockQuestion.setFallbackOptions(fallbackOptions);

        // Setup test session
        testSession = new GameSession();
        testSession.setSessionId(TEST_SESSION_ID);
        testSession.setStatus(GameSession.GameStatus.WAITING_FOR_PLAYERS);
        testSession.setPlayers(new ArrayList<>());
        testSession.setTotalRounds(10);
        testSession.setTimePerQuestion(30);
        testSession.setMaxPlayers(4);
        testSession.setChosenCategoryIds(Arrays.asList(1L, 2L));

        // Add minimum required players and mark them as ready
        List<Player> players = new ArrayList<>();
        Player player1 = new Player();
        player1.setId("player1");
        player1.setUsername("Player 1");
        player1.setReady(true);
        players.add(player1);
        Player player2 = new Player();
        player2.setId("player2");
        player2.setUsername("Player 2");
        player2.setReady(true);
        players.add(player2);
        testSession.setPlayers(players);
    }

    @Test
    void startGame_WithValidSession_ShouldStartGame() {
        // Arrange
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(REDIS_KEY)).thenReturn(testSession);
        // No player state reset or question fetch is expected at start

        // Act
        gameService.startGame(TEST_SESSION_ID);

        // Assert
        assertEquals(GameSession.GameStatus.IN_PROGRESS, testSession.getStatus());
        assertNotNull(testSession.getStartTime());
        assertEquals(1, testSession.getCurrentRound());
        assertEquals(GameSession.QuestionPhase.CATEGORY_SELECTION, testSession.getCurrentPhase());
        assertNull(testSession.getCurrentQuestionId());
        verify(questionService, times(0)).getRandomQuestion(anyLong(), anyInt(), any(String.class));
        verify(valueOperations).set(eq(REDIS_KEY), eq(testSession), eq(Duration.ofHours(2)));
    }

    @Test
    void startGame_WithNullSession_ShouldThrowException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> gameService.startGame(null));
    }

    @Test
    void startGame_WithNonExistentSession_ShouldThrowException() {
        // Arrange
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(REDIS_KEY)).thenReturn(null);

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> gameService.startGame(TEST_SESSION_ID));
    }

    @Test
    void startGame_WithGameAlreadyInProgress_ShouldThrowException() {
        // Arrange
        testSession.setStatus(GameSession.GameStatus.IN_PROGRESS);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(REDIS_KEY)).thenReturn(testSession);

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> gameService.startGame(TEST_SESSION_ID));
    }

    @Test
    void startGame_WithGameAlreadyFinished_ShouldThrowException() {
        // Arrange
        testSession.setStatus(GameSession.GameStatus.FINISHED);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(REDIS_KEY)).thenReturn(testSession);

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> gameService.startGame(TEST_SESSION_ID));
    }

    @Test
    void startGame_WithInsufficientPlayers_ShouldThrowException() {
        // Arrange
        testSession.setPlayers(new ArrayList<>()); // Empty players list
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(REDIS_KEY)).thenReturn(testSession);

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> gameService.startGame(TEST_SESSION_ID));
    }

    @Test
    void startGame_WithTooManyPlayers_ShouldThrowException() {
        // Arrange
        ArrayList<Player> tooManyPlayers = new ArrayList<>();
        for (int i = 0; i < testSession.getMaxPlayers() + 1; i++) {
            Player player = new Player();
            player.setId("player" + i);
            player.setUsername("Player " + i);
            player.setReady(true);
            tooManyPlayers.add(player);
        }
        testSession.setPlayers(tooManyPlayers);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(REDIS_KEY)).thenReturn(testSession);

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> gameService.startGame(TEST_SESSION_ID));
    }

    @Test
    void startGame_WithValidSession_ShouldNotFetchQuestions() {
        // Arrange
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(REDIS_KEY)).thenReturn(testSession);
        // No stubbing for playerService or questionService needed; startGame should not fetch a question

        // Act
        gameService.startGame(TEST_SESSION_ID);

        // Assert
        verify(questionService, times(0)).getRandomQuestion(anyLong(), anyInt(), any(String.class));
        assertNull(testSession.getCurrentQuestionId());
    }
} 