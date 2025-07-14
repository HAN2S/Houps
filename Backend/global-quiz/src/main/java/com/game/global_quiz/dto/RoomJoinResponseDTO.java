package com.game.global_quiz.dto;

import com.game.global_quiz.model.GameSession;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.game.global_quiz.service.CategoryService;
import com.game.global_quiz.model.Category;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomJoinResponseDTO {
    private GameSession session;
    private String playerId;
    private List<Long> chosenCategoryIds;
    private List<String> chosenCategoriesInLang;

    public RoomJoinResponseDTO(GameSession session, String playerId, CategoryService categoryService) {
        this.session = session;
        this.playerId = playerId;
        this.chosenCategoryIds = session.getChosenCategoryIds();
        this.chosenCategoriesInLang = session.getChosenCategoryIds().stream().map(catId -> {
            Category cat = categoryService.findById(catId).orElse(null);
            if (cat == null) return String.valueOf(catId);
            String lang = session.getLanguage();
            if ("ar".equalsIgnoreCase(lang)) return cat.getNameAr();
            if ("en".equalsIgnoreCase(lang)) return cat.getNameEn();
            return cat.getNameFr();
        }).collect(Collectors.toList());
    }
} 