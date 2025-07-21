package com.game.global_quiz.service;

import com.game.global_quiz.model.Question;
import com.game.global_quiz.repository.QuestionRepository;
import com.game.global_quiz.model.Category;
import com.game.global_quiz.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;
import java.util.stream.Collectors;
import com.game.global_quiz.model.FallbackOption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

@Service
public class QuestionService {
    private final QuestionRepository questionRepository;
    private static final Logger logger = LoggerFactory.getLogger(QuestionService.class);

    @Autowired
    private CategoryService categoryService;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @Transactional(readOnly = true)
    public Question findById(Long id) {
        return questionRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Question getRandomQuestion(Long categoryId, int difficulty, String lang) {
        Category category = categoryService.findById(categoryId).orElse(null);
        if (category == null) return null;
        // Assuming findRandomQuestionsByCategoryAndDifficulty returns a list, even if only one is expected.
        // We'll then pick one randomly from that list.
        List<Question> questions = questionRepository.findRandomQuestionsByCategoryAndDifficulty(category, difficulty, 10); // Fetch a few to pick randomly
        if (questions.isEmpty()) {
            return null;
        }
        Random rand = new Random();
        return questions.get(rand.nextInt(questions.size()));
    }

    @Transactional(readOnly = true)
    public List<Question> getRandomQuestions(String categoryName, int difficulty, int count, String lang) {
        Category category = ("ar".equalsIgnoreCase(lang)) ? categoryService.findByNameAr(categoryName).orElse(null)
            : ("en".equalsIgnoreCase(lang) || lang == null) ? categoryService.findByNameEn(categoryName).orElse(null)
            : categoryService.findByNameFr(categoryName).orElse(null);
        if (category != null && difficulty > 0) {
            return questionRepository.findRandomQuestionsByCategoryAndDifficulty(category, difficulty, count);
        } else if (category != null) {
            return questionRepository.findRandomQuestionsByCategory(category, count);
        } else if (difficulty > 0) {
            return questionRepository.findRandomQuestionsByDifficulty(difficulty, count);
        } else {
            // If no filters, get random questions from all categories
            return questionRepository.findRandomQuestionsByCategory(null, count);
        }
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories(String lang) {
        return categoryService.getAllCategories().stream().map(cat ->
            ("ar".equalsIgnoreCase(lang)) ? cat.getNameAr() :
            ("en".equalsIgnoreCase(lang)) ? cat.getNameEn() :
            cat.getNameFr()
        ).toList();
    }

    public List<Category> getAllCategoriesFromService() {
        return categoryService.getAllCategories();
    }

    @Transactional(readOnly = true)
    public Page<Question> getAllQuestions(Long categoryId, Integer difficulty, Pageable pageable) {
        Specification<Question> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (difficulty != null) {
                predicates.add(cb.equal(root.get("difficulty"), difficulty));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return questionRepository.findAll(spec, pageable);
    }

    @Transactional
    public Question saveQuestion(Question question) {
        if (questionRepository.existsByQuestionTextFr(question.getQuestionTextFr())) {
            throw new IllegalArgumentException("A question with this text already exists");
        }
        return questionRepository.save(question);
    }

    @Transactional(readOnly = true)
    public List<Question> getQuestionsByCategory(String categoryName, String lang) {
        Category category = ("ar".equalsIgnoreCase(lang)) ? categoryService.findByNameAr(categoryName).orElse(null)
            : ("en".equalsIgnoreCase(lang) || lang == null) ? categoryService.findByNameEn(categoryName).orElse(null)
            : categoryService.findByNameFr(categoryName).orElse(null);
        if (category == null) return List.of();
        return questionRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public List<Question> getQuestionsByDifficulty(int difficulty) {
        return questionRepository.findByDifficulty(difficulty);
    }

    public List<String> prepareFinalOptions(Question question, Set<String> wrongAnswers, int numberOfPlayers, String lang) {
        String correctAnswer = ("ar".equalsIgnoreCase(lang)) ? question.getCorrectAnswerAr() :
                              ("en".equalsIgnoreCase(lang)) ? question.getCorrectAnswerEn() :
                              question.getCorrectAnswerFr();
        String trapAnswer = ("ar".equalsIgnoreCase(lang)) ? question.getTrapAnswerAr() :
                            ("en".equalsIgnoreCase(lang)) ? question.getTrapAnswerEn() :
                            question.getTrapAnswerFr();
        List<String> fallbackOptions = new ArrayList<>();
        if (question.getFallbackOptions() != null) {
            for (FallbackOption fo : question.getFallbackOptions()) {
                String val = ("ar".equalsIgnoreCase(lang)) ? fo.getFallbackAr() :
                             ("en".equalsIgnoreCase(lang)) ? fo.getFallbackEn() :
                             fo.getFallbackFr();
                if (val != null && !val.isEmpty()) fallbackOptions.add(val);
            }
        }
        logger.info("[prepareFinalOptions] correctAnswer: {}, wrongAnswers: {}, fallbackOptions: {}, trapAnswer: {}", correctAnswer, wrongAnswers, fallbackOptions, trapAnswer);
        List<String> finalOptions = new ArrayList<>();
        finalOptions.add(correctAnswer);
        finalOptions.addAll(wrongAnswers);
        if (trapAnswer != null && !trapAnswer.isEmpty() && !finalOptions.contains(trapAnswer)) {
            finalOptions.add(trapAnswer);
        }
        if (finalOptions.size() < numberOfPlayers + 2) {
            int neededOptions = (numberOfPlayers + 2) - finalOptions.size();
            List<String> availableFallbacks = new ArrayList<>(fallbackOptions != null ? fallbackOptions : Set.of());
            Collections.shuffle(availableFallbacks);
            for (int i = 0; i < neededOptions && i < availableFallbacks.size(); i++) {
                String fallback = availableFallbacks.get(i);
                if (!finalOptions.contains(fallback)) {
                    finalOptions.add(fallback);
                }
            }
        }
        logger.info("[prepareFinalOptions] finalOptions: {}", finalOptions);
        Collections.shuffle(finalOptions);
        return finalOptions;
    }

    public boolean isCorrectAnswer(Question question, String answer, String lang) {
        String correctAnswer = ("ar".equalsIgnoreCase(lang)) ? question.getCorrectAnswerAr() :
                              ("en".equalsIgnoreCase(lang)) ? question.getCorrectAnswerEn() :
                              question.getCorrectAnswerFr();
        return correctAnswer.equals(answer);
    }

    public int calculatePoints(Question question) {
        return question.getDifficulty();
    }

    @Transactional
    public Question updateQuestion(Long id, Question updatedQuestion) {
        Question existingQuestion = questionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));

        // Check if the new question text already exists for a different question (on FR by défaut)
        if (!updatedQuestion.getQuestionTextFr().equals(existingQuestion.getQuestionTextFr()) &&
            questionRepository.existsByQuestionTextFr(updatedQuestion.getQuestionTextFr())) {
            throw new IllegalArgumentException("A question with this text already exists");
        }

        // Update the existing question with new values
        existingQuestion.setQuestionTextFr(updatedQuestion.getQuestionTextFr());
        existingQuestion.setQuestionTextEn(updatedQuestion.getQuestionTextEn());
        existingQuestion.setQuestionTextAr(updatedQuestion.getQuestionTextAr());
        existingQuestion.setCorrectAnswerFr(updatedQuestion.getCorrectAnswerFr());
        existingQuestion.setCorrectAnswerEn(updatedQuestion.getCorrectAnswerEn());
        existingQuestion.setCorrectAnswerAr(updatedQuestion.getCorrectAnswerAr());
        existingQuestion.setCategory(updatedQuestion.getCategory());
        existingQuestion.setDifficulty(updatedQuestion.getDifficulty());
        existingQuestion.setImageUrl(updatedQuestion.getImageUrl());
        existingQuestion.setFallbackOptions(updatedQuestion.getFallbackOptions());
        existingQuestion.setTrapAnswerFr(updatedQuestion.getTrapAnswerFr());
        existingQuestion.setTrapAnswerEn(updatedQuestion.getTrapAnswerEn());
        existingQuestion.setTrapAnswerAr(updatedQuestion.getTrapAnswerAr());

        return questionRepository.save(existingQuestion);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new IllegalArgumentException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }
} 