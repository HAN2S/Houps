package com.game.global_quiz.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.game.global_quiz.model.Category;
import com.game.global_quiz.model.FallbackOption;
import com.game.global_quiz.model.Question;
import com.game.global_quiz.repository.QuestionRepository;

import jakarta.persistence.criteria.Predicate;

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
        List<Question> questions = questionRepository
            .findRandomQuestionsByCategoryAndDifficulty(category, difficulty, PageRequest.of(0, 10))
            .getContent();
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
            return questionRepository
                .findRandomQuestionsByCategoryAndDifficulty(category, difficulty, PageRequest.of(0, count))
                .getContent();
        } else if (category != null) {
            return questionRepository
                .findRandomQuestionsByCategory(category, PageRequest.of(0, count))
                .getContent();
        } else if (difficulty > 0) {
            return questionRepository
                .findRandomQuestionsByDifficulty(difficulty, PageRequest.of(0, count))
                .getContent();
        } else {
            // If no filters, get random questions from all categories
            return questionRepository
                .findRandomQuestionsByCategory(null, PageRequest.of(0, count))
                .getContent();
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
    public Page<Question> getAllQuestions(Long id, Long categoryId, Integer difficulty, String questionTextEn, Pageable pageable) {
        Specification<Question> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (id != null) {
                predicates.add(cb.equal(root.get("id"), id));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (difficulty != null) {
                predicates.add(cb.equal(root.get("difficulty"), difficulty));
            }
            if (questionTextEn != null && !questionTextEn.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("questionTextEn")), "%" + questionTextEn.toLowerCase() + "%"));
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

    public Map<String, Object> importQuestionsFromExcel(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int rowNum = 0;
            for (Row row : sheet) {
                if (rowNum++ == 0) continue; // Skip header
                try {
                    String questionTextFr = getCellString(row, 0);
                    String questionTextEn = getCellString(row, 1);
                    String questionTextAr = getCellString(row, 2);
                    String correctAnswerFr = getCellString(row, 3);
                    String correctAnswerEn = getCellString(row, 4);
                    String correctAnswerAr = getCellString(row, 5);
                    String categoryName = getCellString(row, 6);
                    int difficulty = (int) row.getCell(7).getNumericCellValue();
                    String imageUrl = getCellString(row, 8);
                    String trapAnswerFr = getCellString(row, 9);
                    String trapAnswerEn = getCellString(row, 10);
                    String trapAnswerAr = getCellString(row, 11);
                    String fallbackFr = getCellString(row, 12);
                    String fallbackEn = getCellString(row, 13);
                    String fallbackAr = getCellString(row, 14);

                    Category category = categoryService.findByNameFrIgnoreCase(categoryName)
                        .orElseGet(() -> categoryService.findByNameEnIgnoreCase(categoryName)
                        .orElseGet(() -> categoryService.findByNameArIgnoreCase(categoryName).orElse(null)));
                    if (category == null) {
                        errors.add("Row " + rowNum + ": Category not found: " + categoryName);
                        continue;
                    }

                    Question question = new Question();
                    question.setQuestionTextFr(questionTextFr);
                    question.setQuestionTextEn(questionTextEn);
                    question.setQuestionTextAr(questionTextAr);
                    question.setCorrectAnswerFr(correctAnswerFr);
                    question.setCorrectAnswerEn(correctAnswerEn);
                    question.setCorrectAnswerAr(correctAnswerAr);
                    question.setCategory(category);
                    question.setDifficulty(difficulty);
                    question.setImageUrl(imageUrl);
                    question.setTrapAnswerFr(trapAnswerFr);
                    question.setTrapAnswerEn(trapAnswerEn);
                    question.setTrapAnswerAr(trapAnswerAr);

                    List<FallbackOption> fallbackOptions = new ArrayList<>();
                    if (fallbackFr != null && !fallbackFr.isEmpty()) {
                        for (String f : fallbackFr.split(";")) {
                            FallbackOption fo = new FallbackOption();
                            fo.setFallbackFr(f.trim());
                            fallbackOptions.add(fo);
                        }
                    }
                    if (fallbackEn != null && !fallbackEn.isEmpty()) {
                        String[] enArr = fallbackEn.split(";");
                        for (int i = 0; i < enArr.length && i < fallbackOptions.size(); i++) {
                            fallbackOptions.get(i).setFallbackEn(enArr[i].trim());
                        }
                    }
                    if (fallbackAr != null && !fallbackAr.isEmpty()) {
                        String[] arArr = fallbackAr.split(";");
                        for (int i = 0; i < arArr.length && i < fallbackOptions.size(); i++) {
                            fallbackOptions.get(i).setFallbackAr(arArr[i].trim());
                        }
                    }
                    question.setFallbackOptions(fallbackOptions);

                    try {
                        saveQuestion(question);
                        successCount++;
                    } catch (Exception e) {
                        errors.add("Row " + rowNum + ": " + e.getMessage());
                    }
                } catch (Exception e) {
                    errors.add("Row " + rowNum + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            errors.add("Failed to process file: " + e.getMessage());
        }
        Map<String, Object> result = new HashMap<>();
        result.put("imported", successCount);
        result.put("errors", errors);
        return result;
    }

    private String getCellString(Row row, int colIdx) {
        Cell cell = row.getCell(colIdx);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC) return String.valueOf(cell.getNumericCellValue());
        if (cell.getCellType() == CellType.BOOLEAN) return String.valueOf(cell.getBooleanCellValue());
        return null;
    }
} 