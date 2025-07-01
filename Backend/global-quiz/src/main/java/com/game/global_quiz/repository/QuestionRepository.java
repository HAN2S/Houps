package com.game.global_quiz.repository;

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
    List<Question> findByCategory(String category);
    
    // Find questions by difficulty level
    List<Question> findByDifficulty(int difficulty);
    
    // Find questions by category and difficulty
    List<Question> findByCategoryAndDifficulty(String category, int difficulty);
    
    // Get random questions for a game
    @Query(value = "SELECT q FROM Question q WHERE q.category = :category ORDER BY RAND() LIMIT :count")
    List<Question> findRandomQuestionsByCategory(@Param("category") String category, @Param("count") int count);
    
    // Get random questions by difficulty
    @Query(value = "SELECT q FROM Question q WHERE q.difficulty = :difficulty ORDER BY RAND() LIMIT :count")
    List<Question> findRandomQuestionsByDifficulty(@Param("difficulty") int difficulty, @Param("count") int count);
    
    // Get random questions by category and difficulty
    @Query(value = "SELECT q FROM Question q WHERE q.category = :category AND q.difficulty = :difficulty ORDER BY RAND() LIMIT :count")
    List<Question> findRandomQuestionsByCategoryAndDifficulty(@Param("category") String category, @Param("difficulty") int difficulty, @Param("count") int count);
    
    // Check if a question exists with the same text
    boolean existsByQuestionText(String questionText);
    
    // Get all available categories
    @Query("SELECT DISTINCT q.category FROM Question q")
    List<String> findAllCategories();
} 