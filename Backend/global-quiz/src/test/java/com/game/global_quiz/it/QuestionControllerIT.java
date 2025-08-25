package com.game.global_quiz.it;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.Collections;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import com.game.global_quiz.model.Category;
import com.game.global_quiz.model.Question;
import com.game.global_quiz.service.QuestionService;

import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
class QuestionControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuestionService questionService;

    @Test
    void getCategories_RespectsAcceptLanguage() throws Exception {
        Category c1 = new Category();
        c1.setId(1L); c1.setNameEn("Geography"); c1.setNameFr("Géographie"); c1.setNameAr("جغرافيا");
        when(questionService.getAllCategoriesFromService()).thenReturn(Arrays.asList(c1));

        mockMvc.perform(get("/api/questions/categories").header(HttpHeaders.ACCEPT_LANGUAGE, "fr"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].id", is(1)))
               .andExpect(jsonPath("$[0].name", is("Géographie")));
    }

    @Test
    void getQuestionById_NotFound_Returns404() throws Exception {
        when(questionService.findById(99L)).thenReturn(null);
        mockMvc.perform(get("/api/questions/99"))
               .andExpect(status().isNotFound());
    }

    @Test
    void getRandomQuestions_ReturnsArray() throws Exception {
        when(questionService.getRandomQuestions(null, 0, 1, null)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/questions/random").param("count", "1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(0)));
    }
}


