package com.game.global_quiz.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class RedisConnectionTest implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(RedisConnectionTest.class);
    private final RedisConnectionFactory redisConnectionFactory;

    public RedisConnectionTest(RedisConnectionFactory redisConnectionFactory) {
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @Override
    public void run(String... args) {
        try {
            logger.info("Testing Redis connection...");
            redisConnectionFactory.getConnection().ping();
            logger.info("Redis connection successful!");
        } catch (Exception e) {
            logger.error("Failed to connect to Redis: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to connect to Redis", e);
        }
    }
} 