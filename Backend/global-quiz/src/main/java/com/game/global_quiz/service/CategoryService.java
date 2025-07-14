package com.game.global_quiz.service;

import com.game.global_quiz.model.Category;
import com.game.global_quiz.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    
    public Optional<Category> findByNameEn(String nameEn) {
        return categoryRepository.findByNameEn(nameEn);
    }
    public Optional<Category> findByNameFr(String nameFr) {
        return categoryRepository.findByNameFr(nameFr);
    }
    public Optional<Category> findByNameAr(String nameAr) {
        return categoryRepository.findByNameAr(nameAr);
    }

    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category save(Category category) {
        return categoryRepository.save(category);
    }
} 