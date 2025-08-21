package com.game.global_quiz.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.game.global_quiz.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameEn(String nameEn);
    Optional<Category> findByNameFr(String nameFr);
    Optional<Category> findByNameAr(String nameAr);
    
    // Case-insensitive lookups for Excel import
    @Query("SELECT c FROM Category c WHERE LOWER(c.nameEn) = LOWER(:nameEn)")
    Optional<Category> findByNameEnIgnoreCase(@Param("nameEn") String nameEn);
    
    @Query("SELECT c FROM Category c WHERE LOWER(c.nameFr) = LOWER(:nameFr)")
    Optional<Category> findByNameFrIgnoreCase(@Param("nameFr") String nameFr);
    
    @Query("SELECT c FROM Category c WHERE LOWER(c.nameAr) = LOWER(:nameAr)")
    Optional<Category> findByNameArIgnoreCase(@Param("nameAr") String nameAr);
} 