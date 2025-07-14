package com.game.global_quiz.config;

import com.game.global_quiz.model.Category;
import com.game.global_quiz.model.Question;
import com.game.global_quiz.repository.CategoryRepository;
import com.game.global_quiz.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import com.game.global_quiz.model.FallbackOption;

@Configuration
public class DataInitializer {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            // Création ou récupération des catégories
            Category geography = categoryRepository.findByNameEn("Geography").orElseGet(() -> {
                Category c = new Category();
                c.setNameEn("Geography");
                c.setNameFr("Géographie");
                c.setNameAr("الجغرافيا");
                return categoryRepository.save(c);
            });
            Category art = categoryRepository.findByNameEn("Art").orElseGet(() -> {
                Category c = new Category();
                c.setNameEn("Art");
                c.setNameFr("Art");
                c.setNameAr("الفن");
                return categoryRepository.save(c);
            });
            Category science = categoryRepository.findByNameEn("Science").orElseGet(() -> {
                Category c = new Category();
                c.setNameEn("Science");
                c.setNameFr("Science");
                c.setNameAr("العلوم");
                return categoryRepository.save(c);
            });
            Category literature = categoryRepository.findByNameEn("Literature").orElseGet(() -> {
                Category c = new Category();
                c.setNameEn("Literature");
                c.setNameFr("Littérature");
                c.setNameAr("الأدب");
                return categoryRepository.save(c);
            });
            Category sports = categoryRepository.findByNameEn("Sports").orElseGet(() -> {
                Category c = new Category();
                c.setNameEn("Sports");
                c.setNameFr("Sport");
                c.setNameAr("الرياضة");
                return categoryRepository.save(c);
            });

            // Création des questions multilingues (anglais par défaut)
            Question q1 = new Question();
            q1.setQuestionTextEn("What is the capital of France?");
            q1.setQuestionTextFr("Quelle est la capitale de la France ?");
            q1.setQuestionTextAr("ما هي عاصمة فرنسا؟");
            q1.setCorrectAnswerEn("Paris");
            q1.setCorrectAnswerFr("Paris");
            q1.setCorrectAnswerAr("باريس");
            q1.setCategory(geography);
            q1.setDifficulty(1);
            q1.setTrapAnswerEn("London");
            q1.setTrapAnswerFr("Londres");
            q1.setTrapAnswerAr("لندن");
            List<FallbackOption> q1Fallbacks = List.of(
                createFallback("Berlin", "Berlin", "برلين"),
                createFallback("Madrid", "Madrid", "مدريد"),
                createFallback("Rome", "Rome", "روما"),
                createFallback("Amsterdam", "Amsterdam", "أمستردام"),
                createFallback("Brussels", "Bruxelles", "بروكسل")
            );
            q1.setFallbackOptions(q1Fallbacks);

            Question q2 = new Question();
            q2.setQuestionTextEn("Who painted the Mona Lisa?");
            q2.setQuestionTextFr("Qui a peint la Joconde ?");
            q2.setQuestionTextAr("من رسم الموناليزا؟");
            q2.setCorrectAnswerEn("Leonardo da Vinci");
            q2.setCorrectAnswerFr("Léonard de Vinci");
            q2.setCorrectAnswerAr("ليوناردو دافنشي");
            q2.setCategory(art);
            q2.setDifficulty(1);
            q2.setTrapAnswerEn("Pablo Picasso");
            q2.setTrapAnswerFr("Pablo Picasso");
            q2.setTrapAnswerAr("بابلو بيكاسو");
            List<FallbackOption> q2Fallbacks = List.of(
                createFallback("Vincent van Gogh", "Vincent van Gogh", "فنسنت فان جوخ"),
                createFallback("Michelangelo", "Michel-Ange", "ميكيلانجيلو"),
                createFallback("Rembrandt", "Rembrandt", "رامبرانت"),
                createFallback("Claude Monet", "Claude Monet", "كلود مونيه"),
                createFallback("Edvard Munch", "Edvard Munch", "إدفارت مونش")
            );
            q2.setFallbackOptions(q2Fallbacks);

            Question q3 = new Question();
            q3.setQuestionTextEn("What is the chemical symbol for gold?");
            q3.setQuestionTextFr("Quel est le symbole chimique de l'or ?");
            q3.setQuestionTextAr("ما هو الرمز الكيميائي للذهب؟");
            q3.setCorrectAnswerEn("Au");
            q3.setCorrectAnswerFr("Au");
            q3.setCorrectAnswerAr("أو");
            q3.setCategory(science);
            q3.setDifficulty(2);
            q3.setTrapAnswerEn("Fe");
            q3.setTrapAnswerFr("Fe");
            q3.setTrapAnswerAr("حديد");
            List<FallbackOption> q3Fallbacks = List.of(
                createFallback("Ag", "Ag", "فضة"),
                createFallback("Cu", "Cu", "نحاس"),
                createFallback("Hg", "Hg", "زئبق"),
                createFallback("Pt", "Pt", "بلاتين"),
                createFallback("Zn", "Zn", "زنك")
            );
            q3.setFallbackOptions(q3Fallbacks);

            Question q4 = new Question();
            q4.setQuestionTextEn("Which planet is known as the Red Planet?");
            q4.setQuestionTextFr("Quelle planète est connue comme la planète rouge ?");
            q4.setQuestionTextAr("أي كوكب يعرف بالكوكب الأحمر؟");
            q4.setCorrectAnswerEn("Mars");
            q4.setCorrectAnswerFr("Mars");
            q4.setCorrectAnswerAr("المريخ");
            q4.setCategory(science);
            q4.setDifficulty(1);
            q4.setTrapAnswerEn("Jupiter");
            q4.setTrapAnswerFr("Jupiter");
            q4.setTrapAnswerAr("المشتري");
            List<FallbackOption> q4Fallbacks = List.of(
                createFallback("Venus", "Vénus", "الزهرة"),
                createFallback("Saturn", "Saturne", "زحل"),
                createFallback("Neptune", "Neptune", "نبتون"),
                createFallback("Mercury", "Mercure", "عطارد"),
                createFallback("Uranus", "Uranus", "أورانوس")
            );
            q4.setFallbackOptions(q4Fallbacks);

            Question q5 = new Question();
            q5.setQuestionTextEn("Who wrote 'Romeo and Juliet'?");
            q5.setQuestionTextFr("Qui a écrit 'Roméo et Juliette' ?");
            q5.setQuestionTextAr("من كتب 'روميو وجولييت'؟");
            q5.setCorrectAnswerEn("William Shakespeare");
            q5.setCorrectAnswerFr("William Shakespeare");
            q5.setCorrectAnswerAr("ويليام شكسبير");
            q5.setCategory(literature);
            q5.setDifficulty(1);
            q5.setTrapAnswerEn("Mark Twain");
            q5.setTrapAnswerFr("Mark Twain");
            q5.setTrapAnswerAr("مارك توين");
            List<FallbackOption> q5Fallbacks = List.of(
                createFallback("Charles Dickens", "Charles Dickens", "تشارلز ديكنز"),
                createFallback("Jane Austen", "Jane Austen", "جين أوستن"),
                createFallback("Ernest Hemingway", "Ernest Hemingway", "إرنست همنغواي"),
                createFallback("F. Scott Fitzgerald", "F. Scott Fitzgerald", "ف. سكوت فيتزجيرالد"),
                createFallback("George Orwell", "George Orwell", "جورج أورويل")
            );
            q5.setFallbackOptions(q5Fallbacks);

            Question q6 = new Question();
            q6.setQuestionTextEn("Who won the 2022 FIFA World Cup?");
            q6.setQuestionTextFr("Qui a gagné la Coupe du Monde 2022 ?");
            q6.setQuestionTextAr("من فاز بكأس العالم 2022؟");
            q6.setCorrectAnswerEn("Argentina");
            q6.setCorrectAnswerFr("Argentine");
            q6.setCorrectAnswerAr("الأرجنتين");
            q6.setCategory(sports);
            q6.setDifficulty(1);
            q6.setTrapAnswerEn("France");
            q6.setTrapAnswerFr("France");
            q6.setTrapAnswerAr("فرنسا");
            List<FallbackOption> q6Fallbacks = List.of(
                createFallback("Tunisia", "Tunisie", "تونس"),
                createFallback("Brazil", "Brésil", "البرازيل"),
                createFallback("Germany", "Allemagne", "ألمانيا"),
                createFallback("Spain", "Espagne", "إسبانيا"),
                createFallback("Italy", "Italie", "إيطاليا")
            );
            q6.setFallbackOptions(q6Fallbacks);

            Question q7 = new Question();
            q7.setQuestionTextEn("How many teams from London are in the Premier League?");
            q7.setQuestionTextFr("Combien d'équipes de Londres sont en Premier League ?");
            q7.setQuestionTextAr("كم عدد الفرق من لندن في الدوري الإنجليزي الممتاز؟");
            q7.setCorrectAnswerEn("6");
            q7.setCorrectAnswerFr("6");
            q7.setCorrectAnswerAr("6");
            q7.setCategory(sports);
            q7.setDifficulty(2);
            q7.setTrapAnswerEn("4");
            q7.setTrapAnswerFr("4");
            q7.setTrapAnswerAr("4");
            List<FallbackOption> q7Fallbacks = List.of(
                createFallback("10", "10", "10"),
                createFallback("5", "5", "5"),
                createFallback("7", "7", "7"),
                createFallback("8", "8", "8"),
                createFallback("3", "3", "3")
            );
            q7.setFallbackOptions(q7Fallbacks);

            Question q8 = new Question();
            q8.setQuestionTextEn("In which country is Lapland located?");
            q8.setQuestionTextFr("Dans quel pays se trouve la Laponie ?");
            q8.setQuestionTextAr("في أي دولة تقع لابلاند؟");
            q8.setCorrectAnswerEn("Sweden");
            q8.setCorrectAnswerFr("Suède");
            q8.setCorrectAnswerAr("السويد");
            q8.setCategory(geography);
            q8.setDifficulty(2);
            q8.setTrapAnswerEn("Finland");
            q8.setTrapAnswerFr("Finlande");
            q8.setTrapAnswerAr("فنلندا");
            List<FallbackOption> q8Fallbacks = List.of(
                createFallback("Uruguay", "Uruguay", "أوروغواي"),
                createFallback("Norway", "Norvège", "النرويج"),
                createFallback("Russia", "Russie", "روسيا"),
                createFallback("Denmark", "Danemark", "الدنمارك"),
                createFallback("Iceland", "Islande", "آيسلندا")
            );
            q8.setFallbackOptions(q8Fallbacks);

            questionRepository.saveAll(Arrays.asList(q1, q2, q3, q4, q5, q6, q7, q8));
        };
    }

    // Créer une méthode utilitaire pour créer un FallbackOption
    private static FallbackOption createFallback(String en, String fr, String ar) {
        FallbackOption fo = new FallbackOption();
        fo.setFallbackEn(en);
        fo.setFallbackFr(fr);
        fo.setFallbackAr(ar);
        return fo;
    }
} 