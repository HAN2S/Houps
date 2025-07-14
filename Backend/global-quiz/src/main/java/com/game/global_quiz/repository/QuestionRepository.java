package com.game.global_quiz.repository;

import com.game.global_quiz.model.Category;
import com.game.global_quiz.model.Question;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    @EntityGraph(attributePaths = "fallbackOptions")
    Optional<Question> findById(Long id);
    
    // Find questions by category
    List<Question> findByCategory(Category category);
    
    // Find questions by difficulty level
    List<Question> findByDifficulty(int difficulty);
    
    // Find questions by category and difficulty
    List<Question> findByCategoryAndDifficulty(Category category, int difficulty);
    
    // Get random questions for a game
    @Query(value = "SELECT q FROM Question q WHERE (:category IS NULL OR q.category = :category) ORDER BY function('RAND')")
    List<Question> findRandomQuestionsByCategory(@Param("category") Category category, @Param("count") int count);
    
    // Get random questions by difficulty
    @Query(value = "SELECT q FROM Question q WHERE q.difficulty = :difficulty ORDER BY RAND() LIMIT :count")
    List<Question> findRandomQuestionsByDifficulty(@Param("difficulty") int difficulty, @Param("count") int count);
    
    // Get random questions by category and difficulty
    @Query(value = "SELECT q FROM Question q WHERE q.category = :category AND q.difficulty = :difficulty ORDER BY RAND() LIMIT :count")
    List<Question> findRandomQuestionsByCategoryAndDifficulty(@Param("category") Category category, @Param("difficulty") int difficulty, @Param("count") int count);
    
    boolean existsByQuestionTextEn(String questionTextEn);
    boolean existsByQuestionTextFr(String questionTextFr);
    boolean existsByQuestionTextAr(String questionTextAr);
    
    // Get all available categories
    @Query("SELECT DISTINCT q.category FROM Question q")
    List<Category> findAllCategories();
} 