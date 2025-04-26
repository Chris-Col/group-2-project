function getTargetLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || 'es'; // Default to Spanish if no ?lang=xx
}

function getLanguageLabel(code) {
    const map = {
        es: 'Spanish 🇪🇸',
        fr: 'French 🇫🇷',
        de: 'German 🇩🇪',
        ja: 'Japanese 🇯🇵',
        it: 'Italian 🇮🇹',
    };
    return map[code] || `Language: ${code}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const vocab = {
        animals: ['cat', 'dog', 'horse', 'cow', 'lion', 'tiger', 'monkey', 'bear', 'bird'],
        colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white'],
        food: ['apple', 'banana', 'bread', 'cheese', 'egg', 'rice', 'meat', 'fish'],
        household: ['table', 'chair', 'bed', 'window', 'door', 'lamp', 'mirror', 'sofa'],
        verbs: ['run', 'walk', 'eat', 'drink', 'sleep', 'read', 'write', 'jump', 'swim'],
        numbers: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
    };

    const langCode = getTargetLanguage();
    const langLabel = getLanguageLabel(langCode);
    const langDisplay = document.getElementById('current-language');
    if (langDisplay) {
        langDisplay.textContent = `Translating from ${langLabel}`;
    }

    const MAX_SCORE = 10;
    const words = Object.values(vocab).flat();
    let currentWord = '';
    let translatedWord = '';
    let score = 0;
    let completedWords = new Set();
    let gameOver = false;

    const translatedWordEl = document.getElementById('translated-word');
    const choicesContainer = document.getElementById('choices');
    const feedbackEl = document.getElementById('feedback');
    const scoreEl = document.getElementById('score');
    const startBtn = document.getElementById('start-btn');
    const timerEl = document.getElementById('timer');

    let countdownInterval;
    let gameTimeout;

    async function translateText(input, sourceLang, targetLang) {
        const apiKey = 'AIzaSyB7XbwEAL8hqWD0fCt9hgse_4_Xzhz34mI'; // Google Cloud API key
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

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            return result.data.translations[0].translatedText;
        } catch (error) {
            console.error('Error during translation:', error);
        }
    }

    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    function startTimer(duration = 30) {
        let timeLeft = duration;
        timerEl.textContent = `Time Left: ${timeLeft}s`;

        countdownInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `Time Left: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        gameTimeout = setTimeout(() => {
            endGame();
        }, duration * 1000);
    }

    function endGame() {
        gameOver = true;
        translatedWordEl.textContent = "⏰ Time's up!";
        feedbackEl.textContent = `Final Score: ${score}`;
        choicesContainer.innerHTML = '';
        startBtn.disabled = false;
    }

    async function newQuestion() {
        if (gameOver) return;

        feedbackEl.textContent = '';
        choicesContainer.innerHTML = '';

        const availableWords = words.filter(word => !completedWords.has(word));

        if (availableWords.length === 0) {
            translatedWordEl.textContent = "🎉 You've completed all the words!";
            return;
        }

        currentWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        const targetLang = getTargetLanguage();
        translatedWord = await translateText(currentWord, 'en', targetLang);

        translatedWordEl.style.fontSize = '32px'; 
        translatedWordEl.style.fontWeight = 'bolds'; 
        translatedWordEl.textContent = `${translatedWord}`;

        const choices = new Set([currentWord]);
        while (choices.size < 4) {
            const randomWord = words[Math.floor(Math.random() * words.length)];
            choices.add(randomWord);
        }

        shuffleArray([...choices]).forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.addEventListener('click', () => checkAnswer(choice));
            choicesContainer.appendChild(button);
        });
    }

    function checkAnswer(selected) {
        const buttons = choicesContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);

        if (selected === currentWord) {
            feedbackEl.textContent = '✅ Correct!';
            score++;
            completedWords.add(currentWord);
        } else {
            feedbackEl.textContent = `❌ Incorrect. The correct answer was "${currentWord}".`;
        }

        scoreEl.textContent = `Score: ${score}`;

        if (score >= MAX_SCORE) {
            clearInterval(countdownInterval);
            clearTimeout(gameTimeout);
            feedbackEl.textContent = `🎉 You’ve mastered ${MAX_SCORE} words! Great job!`;
            gameOver = true;
            startBtn.disabled = false;
            return;
        }

        setTimeout(() => {
            newQuestion();
        }, 1000); // Show next question after 1 second
    }

    startBtn.addEventListener('click', () => {
        score = 0;
        completedWords.clear();
        scoreEl.textContent = `Score: ${score}`;
        startBtn.disabled = true;
        gameOver = false;
        clearInterval(countdownInterval);
        clearTimeout(gameTimeout);
        startTimer(30); // 30-second timer
        newQuestion();
    });
});
