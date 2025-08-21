package com.game.global_quiz.repository;

import com.game.global_quiz.model.Category;
import com.game.global_quiz.model.Question;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {
    
    @EntityGraph(attributePaths = "fallbackOptions")
    Optional<Question> findById(Long id);
    
    // Find questions by category
    List<Question> findByCategory(Category category);
    
    // Find questions by difficulty level
    List<Question> findByDifficulty(int difficulty);
    
    // Find questions by category and difficulty
    List<Question> findByCategoryAndDifficulty(Category category, int difficulty);
    
    // Get random questions for a game - use RANDOM() and Pageable (portable JPQL with function())
    @Query("SELECT q FROM Question q WHERE (:category IS NULL OR q.category = :category) ORDER BY function('RANDOM')")
    Page<Question> findRandomQuestionsByCategory(@Param("category") Category category, Pageable pageable);
    
    @Query("SELECT q FROM Question q WHERE q.difficulty = :difficulty ORDER BY function('RANDOM')")
    Page<Question> findRandomQuestionsByDifficulty(@Param("difficulty") int difficulty, Pageable pageable);
    
    @Query("SELECT q FROM Question q WHERE q.category = :category AND q.difficulty = :difficulty ORDER BY function('RANDOM')")
    Page<Question> findRandomQuestionsByCategoryAndDifficulty(@Param("category") Category category, @Param("difficulty") int difficulty, Pageable pageable);
    
    boolean existsByQuestionTextEn(String questionTextEn);
    boolean existsByQuestionTextFr(String questionTextFr);
    boolean existsByQuestionTextAr(String questionTextAr);
    
    // Get all available categories
    @Query("SELECT DISTINCT q.category FROM Question q")
    List<Category> findAllCategories();
} 