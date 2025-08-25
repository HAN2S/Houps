package com.game.global_quiz.it;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import com.game.global_quiz.controller.RoomWebSocketController;
import com.game.global_quiz.model.Category;
import com.game.global_quiz.model.FallbackOption;
import com.game.global_quiz.model.GameSession;
import com.game.global_quiz.model.Player;
import com.game.global_quiz.model.Question;
import com.game.global_quiz.service.GameService;
import com.game.global_quiz.service.PlayerService;
import com.game.global_quiz.service.QuestionService;

@SpringBootTest
class GameServiceIT {

    @Autowired
    private GameService gameService;

    @MockBean
    private RedisTemplate<String, GameSession> redisTemplate;

    @MockBean
    private ValueOperations<String, GameSession> valueOperations;

    @MockBean
    private QuestionService questionService;

    @MockBean
    private PlayerService playerService;

    @MockBean
    private RoomWebSocketController roomWebSocketController;

    private GameSession testSession;
    private Question mockQuestion;
    private static final String TEST_SESSION_ID = "test-session-123";
    private static final String REDIS_KEY = "game:" + TEST_SESSION_ID;

    @BeforeEach
    void setUp() {
        mockQuestion = new Question();
        mockQuestion.setId(1L);
        mockQuestion.setQuestionTextEn("What is the capital of France?");
        mockQuestion.setCorrectAnswerEn("Paris");
        Category mockCategory = new Category();
        mockCategory.setNameEn("Geography");
        mockQuestion.setCategory(mockCategory);
        mockQuestion.setDifficulty(1);
        List<FallbackOption> fallbackOptions = new ArrayList<>();
        FallbackOption fo1 = new FallbackOption(); fo1.setFallbackEn("London");
        FallbackOption fo2 = new FallbackOption(); fo2.setFallbackEn("Berlin");
        FallbackOption fo3 = new FallbackOption(); fo3.setFallbackEn("Madrid");
        fallbackOptions.add(fo1); fallbackOptions.add(fo2); fallbackOptions.add(fo3);
        mockQuestion.setFallbackOptions(fallbackOptions);

        testSession = new GameSession();
        testSession.setSessionId(TEST_SESSION_ID);
        testSession.setStatus(GameSession.GameStatus.WAITING_FOR_PLAYERS);
        testSession.setPlayers(new ArrayList<>());
        testSession.setTotalRounds(10);
        testSession.setTimePerQuestion(30);
        testSession.setMaxPlayers(4);
        testSession.setChosenCategoryIds(Arrays.asList(1L, 2L));

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
    void startGame_StartsWithoutFetchingQuestion_AndInitializesRoundAndPhase() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(REDIS_KEY)).thenReturn(testSession);

        gameService.startGame(TEST_SESSION_ID);

        assertEquals(GameSession.GameStatus.IN_PROGRESS, testSession.getStatus());
        assertNotNull(testSession.getStartTime());
        assertEquals(1, testSession.getCurrentRound());
        assertNull(testSession.getCurrentQuestionId());
        assertEquals(GameSession.QuestionPhase.CATEGORY_SELECTION, testSession.getCurrentPhase());

        verify(questionService, times(0)).getRandomQuestion(anyLong(), anyInt(), any(String.class));
        verify(valueOperations, times(1)).set(REDIS_KEY, testSession, Duration.ofHours(2));
    }
}


