package com.example.vocabgame;

public class WordPair {
    private String englishWord;
    private String translatedWord;

    public WordPair(String englishWord, String translatedWord) {
        this.englishWord = englishWord;
        this.translatedWord = translatedWord;
    }

    public String getEnglishWord() {
        return englishWord;
    }

    public String getTranslatedWord() {
        return translatedWord;
    }
}