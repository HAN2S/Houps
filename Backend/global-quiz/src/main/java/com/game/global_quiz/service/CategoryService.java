package com.game.global_quiz.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.game.global_quiz.model.Category;
import com.game.global_quiz.repository.CategoryRepository;

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

    // Case-insensitive lookups for Excel import
    public Optional<Category> findByNameEnIgnoreCase(String nameEn) {
        return categoryRepository.findByNameEnIgnoreCase(nameEn);
    }
    
    public Optional<Category> findByNameFrIgnoreCase(String nameFr) {
        return categoryRepository.findByNameFrIgnoreCase(nameFr);
    }
    
    public Optional<Category> findByNameArIgnoreCase(String nameAr) {
        return categoryRepository.findByNameArIgnoreCase(nameAr);
    }

    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category save(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        category.setNameFr(categoryDetails.getNameFr());
        category.setNameEn(categoryDetails.getNameEn());
        category.setNameAr(categoryDetails.getNameAr());

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
} 