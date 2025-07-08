package com.game.global_quiz.service;

import com.game.global_quiz.model.Question;
import com.game.global_quiz.repository.QuestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    private final QuestionRepository questionRepository;
    private static final Logger logger = LoggerFactory.getLogger(QuestionService.class);

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @Transactional(readOnly = true)
    public Question findById(Long id) {
        return questionRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Question getRandomQuestion(String category, int difficulty) {
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
    public List<Question> getRandomQuestions(String category, int difficulty, int count) {
        if (category != null && difficulty > 0) {
            return questionRepository.findRandomQuestionsByCategoryAndDifficulty(category, difficulty, count);
        } else if (category != null) {
            return questionRepository.findRandomQuestionsByCategory(category, count);
        } else if (difficulty > 0) {
            return questionRepository.findRandomQuestionsByDifficulty(difficulty, count);
        } else {
            // If no filters, get random questions from all categories
            return questionRepository.findRandomQuestionsByCategory("", count);
        }
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return questionRepository.findAllCategories();
    }

    @Transactional
    public Question saveQuestion(Question question) {
        if (questionRepository.existsByQuestionText(question.getQuestionText())) {
            throw new IllegalArgumentException("A question with this text already exists");
        }
        return questionRepository.save(question);
    }

    @Transactional(readOnly = true)
    public List<Question> getQuestionsByCategory(String category) {
        return questionRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public List<Question> getQuestionsByDifficulty(int difficulty) {
        return questionRepository.findByDifficulty(difficulty);
    }

    public List<String> prepareFinalOptions(Question question, Set<String> wrongAnswers, int numberOfPlayers) {
        logger.info("[prepareFinalOptions] correctAnswer: {}, wrongAnswers: {}, fallbackOptions: {}, trapAnswer: {}", question.getCorrectAnswer(), wrongAnswers, question.getFallbackOptions(), question.getTrapAnswer());
        List<String> finalOptions = new ArrayList<>();
        finalOptions.add(question.getCorrectAnswer());
        
        // Add unique wrong answers from players
        finalOptions.addAll(wrongAnswers);

        // Always include trap answer if present and not already included
        if (question.getTrapAnswer() != null && !question.getTrapAnswer().isEmpty() && !finalOptions.contains(question.getTrapAnswer())) {
            finalOptions.add(question.getTrapAnswer());
        }

        // If we need more options, add fallback options
        if (finalOptions.size() < numberOfPlayers + 2) {
            int neededOptions = (numberOfPlayers + 2) - finalOptions.size();
            List<String> availableFallbacks = new ArrayList<>(question.getFallbackOptions());
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

    public boolean isCorrectAnswer(Question question, String answer) {
        return question.getCorrectAnswer().equals(answer);
    }

    public int calculatePoints(Question question) {
        return question.getDifficulty();
    }

    @Transactional
    public Question updateQuestion(Long id, Question updatedQuestion) {
        Question existingQuestion = questionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));

        // Check if the new question text already exists for a different question
        if (!updatedQuestion.getQuestionText().equals(existingQuestion.getQuestionText()) &&
            questionRepository.existsByQuestionText(updatedQuestion.getQuestionText())) {
            throw new IllegalArgumentException("A question with this text already exists");
        }

        // Update the existing question with new values
        existingQuestion.setQuestionText(updatedQuestion.getQuestionText());
        existingQuestion.setCorrectAnswer(updatedQuestion.getCorrectAnswer());
        existingQuestion.setCategory(updatedQuestion.getCategory());
        existingQuestion.setDifficulty(updatedQuestion.getDifficulty());
        existingQuestion.setImageUrl(updatedQuestion.getImageUrl());
        existingQuestion.setFallbackOptions(updatedQuestion.getFallbackOptions());

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