package com.game.global_quiz.controller;

import com.game.global_quiz.repository.CategoryRepository;
import com.game.global_quiz.repository.QuestionRepository;
import com.game.global_quiz.service.GameService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private GameService gameService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalQuestions", questionRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("activeSessions", gameService.getActiveSessionCount());
        return ResponseEntity.ok(stats);
    }
} 