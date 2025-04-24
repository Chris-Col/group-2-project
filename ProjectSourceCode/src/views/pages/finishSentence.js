function getTargetLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || 'es';
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
    const sentenceMap = {
        'I have a ___': ['dog', 'book'],
        'This is my ___': ['book', 'car'],
        'He eats a ___': ['bread', 'egg'],
        'She drives a ___': ['car'],
        'They read the ___': ['book'],
        'We sit on the ___': ['chair'],
        'You hear the ___': ['music'],
        'The ___ is red': ['apple', 'rose'],
        'I see an ___ on the table': ['apple', 'chair'],
        'The ___ sleeps all day': ['cat', 'dog']
    };

    const MAX_SCORE = 10;
    let score = 0;
    let currentWord = '';
    let completed = new Set();

    const langCode = getTargetLanguage();
    const langLabel = getLanguageLabel(langCode);

    const translatedWordEl = document.getElementById('translated-word');
    const choicesContainer = document.getElementById('choices');
    const feedbackEl = document.getElementById('feedback');
    const scoreEl = document.getElementById('score');
    const langDisplay = document.getElementById('current-language');
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');

    if (langDisplay) {
        langDisplay.textContent = `Translating to: ${langLabel}`;
    }

    async function translateText(text, sourceLang, targetLang) {
        const apiKey = 'AIzaSyB7XbwEAL8hqWD0fCt9hgse_4_Xzhz34mI';
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        const data = {
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        return result.data.translations[0].translatedText;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async function newSentence() {
        feedbackEl.textContent = '';
        choicesContainer.innerHTML = '';

        if (score >= MAX_SCORE) {
            translatedWordEl.innerHTML = `🎉 You’ve completed ${MAX_SCORE} sentences! Great job!`;
            nextBtn.disabled = true;
            startBtn.disabled = false;
            return;
        }

        const entries = Object.entries(sentenceMap).filter(([_, words]) => {
            return words.some(word => !completed.has(word));
        });

        if (entries.length === 0) {
            translatedWordEl.innerHTML = `🎉 You’ve completed all sentences! Final score: ${score}`;
            nextBtn.disabled = true;
            return;
        }

        const [sentenceTemplate, possibleWords] = entries[Math.floor(Math.random() * entries.length)];
        currentWord = possibleWords.find(word => !completed.has(word));

        const fullSentence = sentenceTemplate.replace('___', currentWord);
        const translatedSentence = await translateText(fullSentence, 'en', langCode);
        const translatedCorrect = await translateText(currentWord, 'en', langCode);
        const blanked = translatedSentence.replace(translatedCorrect, '<span class="blank">_____</span>');

        translatedWordEl.innerHTML = blanked;

        const allWords = Object.values(sentenceMap).flat();
        const options = new Set([currentWord]);
        while (options.size < 4) {
            const rand = allWords[Math.floor(Math.random() * allWords.length)];
            options.add(rand);
        }

        const optionArray = shuffleArray([...options]);
        const translatedOptions = await Promise.all(
            optionArray.map(opt => translateText(opt, 'en', langCode))
        );

        translatedOptions.forEach((translatedOption, index) => {
            const btn = document.createElement('button');
            btn.textContent = translatedOption;
            btn.onclick = () => checkAnswer(optionArray[index], currentWord);
            choicesContainer.appendChild(btn);
        });

        nextBtn.disabled = true;
    }

    function checkAnswer(choice, correct) {
        const buttons = choicesContainer.querySelectorAll('button');
        buttons.forEach(b => b.disabled = true);

        if (choice === correct) {
            feedbackEl.textContent = '✅ Correct!';
            score++;
            completed.add(currentWord);
            postScore();
            if (score >= MAX_SCORE) {
                translatedWordEl.innerHTML = `🎉 You’ve completed ${MAX_SCORE} sentences! Great job!`;
                nextBtn.disabled = true;
                startBtn.disabled = false;
            } else {
                nextBtn.disabled = false;
            }
        } else {
            translateText(correct, 'en', langCode).then(translatedCorrect => {
                feedbackEl.textContent = `❌ Incorrect. Correct answer: ${translatedCorrect}`;
                nextBtn.disabled = false;
            });
        }

        scoreEl.textContent = `Score: ${score}`;
    }

    function postScore() {
        fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game: 'finish_sentence', points: 1 })
        });
    }

    startBtn?.addEventListener('click', () => {
        score = 0;
        completed.clear();
        scoreEl.textContent = 'Score: 0';
        startBtn.disabled = true;
        newSentence();
    });

    nextBtn?.addEventListener('click', () => newSentence());

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !nextBtn.disabled) {
            nextBtn.click();
        }
    });
});
