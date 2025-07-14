package com.game.global_quiz.repository;

import com.game.global_quiz.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameEn(String nameEn);
    Optional<Category> findByNameFr(String nameFr);
    Optional<Category> findByNameAr(String nameAr);
} 