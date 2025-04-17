
document.addEventListener('DOMContentLoaded', () => {
    const words = ['apple', 'house', 'car', 'love', 'music', 'dog', 'cat', 'red', 'blue', 'bathroom', 'hand', 'bike'];
    let currentWord = '';
    let translatedWord = '';
    let score = 0;
    const correctWords = new Set();

    const translatedWordEl = document.getElementById('translated-word');
    const userInput = document.getElementById('user-input');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackEl = document.getElementById('feedback');
    const scoreEl = document.getElementById('score');
    const startBtn = document.getElementById('start-btn');

    async function translateText(input, sourceLang, targetLang) {
        const apiKey = 'AIzaSyB7XbwEAL8hqWD0fCt9hgse_4_Xzhz34mI'; // test only
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        
        const data = {
            q: input,
            source: sourceLang,
            target: targetLang,
            format: 'text'
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            return result.data.translations[0].translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            translatedWordEl.textContent = '⚠️ Error translating word.';
            return '';
        }
    }

    async function newFlashcard() {
        feedbackEl.textContent = '';
        userInput.value = '';

        const remainingWords = words.filter(word => !correctWords.has(word));
        if (remainingWords.length === 0) {
            translatedWordEl.textContent = '🎉 You’ve mastered all the words!';
            submitBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        currentWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
        translatedWord = await translateText(currentWord, 'en', 'es');
        translatedWordEl.textContent = `Translate this word: ${translatedWord}`;
        submitBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        nextBtn.disabled = true;
    }

    startBtn.addEventListener('click', () => {
        score = 0;
        correctWords.clear();
        scoreEl.textContent = `Score: ${score}`;
        startBtn.disabled = true;
        newFlashcard();
    });

    submitBtn.addEventListener('click', () => {
        const answer = userInput.value.trim().toLowerCase();
        if (answer === currentWord.toLowerCase()) {
            feedbackEl.textContent = 'Correct!';
            score++;
            correctWords.add(currentWord);
        } else {
            feedbackEl.textContent = `Incorrect. The correct word was "${currentWord}".`;
        }
        scoreEl.textContent = `Score: ${score}`;
        submitBtn.disabled = true;
        userInput.disabled = true;
        nextBtn.disabled = false;
    });

    nextBtn.addEventListener('click', () => {
        newFlashcard();
    });
});
