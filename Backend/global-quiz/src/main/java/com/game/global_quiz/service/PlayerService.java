package com.game.global_quiz.service;

import com.game.global_quiz.model.Player;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlayerService {
    private static final Logger logger = LoggerFactory.getLogger(PlayerService.class);
    
    public void resetPlayerState(Player player) {
        logger.debug("Resetting player state for player: {}", player.getUsername());
        player.setHasAnswered(false);
        player.setCurrentAnswer(null);
        player.setWrongAnswerSubmitted(null);
    }

    public void resetPlayerAnswerState(Player player) {
        logger.debug("Resetting only answer state for player: {} - Keeping wrong answer: {}", 
            player.getUsername(), player.getWrongAnswerSubmitted());
        player.setHasAnswered(false);
    }

    public void submitWrongAnswer(Player player, String answer) {
        logger.info("Setting wrong answer for player: {} - Answer: {}", player.getUsername(), answer);
        player.setHasAnswered(true);
        player.setWrongAnswerSubmitted(answer);
        logger.debug("Player state after wrong answer - hasAnswered: {}, wrongAnswer: {}", 
            player.isHasAnswered(), player.getWrongAnswerSubmitted());
    }

    public void submitFinalAnswer(Player player, String answer) {
        logger.info("Setting final answer for player: {} - Answer: {}", player.getUsername(), answer);
        player.setCurrentAnswer(answer);
        player.setHasAnswered(true);
        logger.debug("Player state after final answer - hasAnswered: {}, currentAnswer: {}", 
            player.isHasAnswered(), player.getCurrentAnswer());
    }

    public void addScore(Player player, int points) {
        logger.info("Adding {} points to player: {} (current score: {})", 
            points, player.getUsername(), player.getScore());
        player.addScore(points);
        logger.debug("New score for player {}: {}", player.getUsername(), player.getScore());
    }

    public void addBonusPoint(Player player) {
        logger.info("Adding bonus point to player: {} (current score: {})", 
            player.getUsername(), player.getScore());
        player.addScore(1);
        logger.debug("New score after bonus for player {}: {}", player.getUsername(), player.getScore());
    }

    public List<Player> getLeaderboard(List<Player> players) {
        logger.debug("Generating leaderboard for {} players", players.size());
        return players.stream()
                .sorted((p1, p2) -> Integer.compare(p2.getScore(), p1.getScore()))
                .collect(Collectors.toList());
    }

    public Player findPlayerById(List<Player> players, String playerId) {
        logger.debug("Finding player with ID: {}", playerId);
        Player player = players.stream()
                .filter(p -> p.getId().equals(playerId))
                .findFirst()
                .orElse(null);
        if (player == null) {
            logger.warn("Player not found with ID: {}", playerId);
        } else {
            logger.debug("Found player: {}", player.getUsername());
        }
        return player;
    }

    public List<Player> findPlayersByWrongAnswer(List<Player> players, String wrongAnswer) {
        logger.debug("Finding players who submitted wrong answer: {}", wrongAnswer);
        List<Player> matchingPlayers = players.stream()
                .filter(player -> wrongAnswer.equals(player.getWrongAnswerSubmitted()))
                .collect(Collectors.toList());
        logger.debug("Found {} players with matching wrong answer", matchingPlayers.size());
        return matchingPlayers;
    }
} 