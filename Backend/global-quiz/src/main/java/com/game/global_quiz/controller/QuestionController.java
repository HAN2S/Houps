package com.game.global_quiz.controller;

import com.game.global_quiz.model.Question;
import com.game.global_quiz.service.QuestionService;
import com.game.global_quiz.dto.QuestionDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.HttpHeaders;
import java.util.ArrayList;
import com.game.global_quiz.dto.FallbackOptionDTO;
import com.game.global_quiz.model.FallbackOption;
import com.game.global_quiz.model.Category;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Question>> getQuestionsByCategory(@PathVariable String category, @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang) {
        return ResponseEntity.ok(questionService.getQuestionsByCategory(category, lang));
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<Question>> getQuestionsByDifficulty(@PathVariable int difficulty) {
        return ResponseEntity.ok(questionService.getQuestionsByDifficulty(difficulty));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getAllCategories(@RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang) {
        List<Category> categories = questionService.getAllCategoriesFromService();
        List<Map<String, Object>> result = categories.stream().map(cat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", cat.getId());
            if ("fr".equalsIgnoreCase(lang)) map.put("name", cat.getNameFr());
            else if ("ar".equalsIgnoreCase(lang)) map.put("name", cat.getNameAr());
            else map.put("name", cat.getNameEn());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        Question created = questionService.saveQuestion(question);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(
            @PathVariable Long id,
            @RequestBody Question question) {
        Question updated = questionService.updateQuestion(id, question);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/random")
    public ResponseEntity<List<Question>> getRandomQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer difficulty,
            @RequestParam int count,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang) {
        List<Question> questions = questionService.getRandomQuestions(
            category, 
            difficulty != null ? difficulty : 0, 
            count,
            lang
        );
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Long id, @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String lang) {
        Question question = questionService.findById(id);
        if (question == null) {
            return ResponseEntity.notFound().build();
        }
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setQuestionTextFr(question.getQuestionTextFr());
        dto.setQuestionTextEn(question.getQuestionTextEn());
        dto.setQuestionTextAr(question.getQuestionTextAr());
        dto.setCorrectAnswerFr(question.getCorrectAnswerFr());
        dto.setCorrectAnswerEn(question.getCorrectAnswerEn());
        dto.setCorrectAnswerAr(question.getCorrectAnswerAr());
        if (question.getCategory() != null) {
            dto.setCategory(
                ("ar".equalsIgnoreCase(lang)) ? question.getCategory().getNameAr() :
                ("en".equalsIgnoreCase(lang)) ? question.getCategory().getNameEn() :
                question.getCategory().getNameFr()
            );
        }
        dto.setDifficulty(question.getDifficulty());
        dto.setImageUrl(question.getImageUrl());
        dto.setTrapAnswerFr(question.getTrapAnswerFr());
        dto.setTrapAnswerEn(question.getTrapAnswerEn());
        dto.setTrapAnswerAr(question.getTrapAnswerAr());
        if (question.getFallbackOptions() != null) {
            List<FallbackOptionDTO> fallbackDTOs = new ArrayList<>();
            for (FallbackOption fo : question.getFallbackOptions()) {
                FallbackOptionDTO dtoOpt = new FallbackOptionDTO();
                dtoOpt.setFallbackFr(fo.getFallbackFr());
                dtoOpt.setFallbackEn(fo.getFallbackEn());
                dtoOpt.setFallbackAr(fo.getFallbackAr());
                fallbackDTOs.add(dtoOpt);
            }
            dto.setFallbackOptions(fallbackDTOs);
        }
        return ResponseEntity.ok(dto);
    }
} 