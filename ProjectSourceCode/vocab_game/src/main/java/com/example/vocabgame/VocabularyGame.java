package com.example.vocabgame;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class VocabularyGame {

    private static List<WordPair> wordPairs = new ArrayList<>();

    public static void main(String[] args) {
        System.out.println("Vocabulary Matching Game Starting...");
        loadWordPairs();
        playGame();
    }
    //will read a csv file in the future to replace this
    private static void loadWordPairs() {
        wordPairs.add(new WordPair("cat", "gato"));
        wordPairs.add(new WordPair("dog", "perro"));
        wordPairs.add(new WordPair("house", "casa"));
        wordPairs.add(new WordPair("car", "coche"));
    }

    private static void playGame() {
        Scanner scanner = new Scanner(System.in);
        for (WordPair wp : wordPairs) {
            System.out.println("Translate this word to Spanish: " + wp.getEnglishWord());
            System.out.print("Your answer: ");
            String userAnswer = scanner.nextLine();

            if (userAnswer.equalsIgnoreCase(wp.getTranslatedWord())) {
                System.out.println("Correct!");
            } else {
                System.out.println("Incorrect. The correct word is: " + wp.getTranslatedWord());
            }
            System.out.println("--------------------------------");
        }

        scanner.close();
        System.out.println("Game Over! Thanks for playing.");
    }
}