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
          langDisplay.textContent = `Translating to: ${langLabel}`;
      }
      
      const words = Object.values(vocab).flat(); // combines all categories into one array
    let currentWord = '';
    let translatedWord = '';
    let score = 0;
    let completedWords = new Set();


    const translatedWordEl = document.getElementById('translated-word');
    const choicesContainer = document.getElementById('choices');
    const feedbackEl = document.getElementById('feedback');
    const scoreEl = document.getElementById('score');
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    

    async function translateText(input, sourceLang, targetLang) {
        const apiKey = 'AIzaSyB7XbwEAL8hqWD0fCt9hgse_4_Xzhz34mI'; //Google Cloud API key
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            const translatedText = result.data.translations[0].translatedText;
            console.log('Translated text:', translatedText);
            return translatedText;
        } catch (error) {
            console.error('Error during translation:', error);
        }
    }

    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    async function newQuestion() {
        feedbackEl.textContent = '';
        choicesContainer.innerHTML = '';
    
        // Filter out completed words
        const availableWords = words.filter(word => !completedWords.has(word));
    
        // Check if there are words left
        if (availableWords.length === 0) {
            translatedWordEl.textContent = "🎉 You've completed all the words!";
            nextBtn.disabled = true;
            return;
        }
    
        // Pick a random word from the remaining ones
        currentWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        const targetLang = getTargetLanguage();
        translatedWord = await translateText(currentWord, 'en', targetLang);

        translatedWordEl.textContent = `What is the English word for: "${translatedWord}"?`;
    
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
    
        nextBtn.disabled = true;
    }
    
    function checkAnswer(selected) {
        const buttons = choicesContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    
        if (selected === currentWord) {
            feedbackEl.textContent = '✅ Correct!';
            score++;
            completedWords.add(currentWord); // ✅ Track completed word
        } else {
            feedbackEl.textContent = `❌ Incorrect. The correct answer was "${currentWord}".`;
        }
    
        scoreEl.textContent = `Score: ${score}`;
        nextBtn.disabled = false;
    }
    

    startBtn.addEventListener('click', () => {
        score = 0;
        scoreEl.textContent = `Score: ${score}`;
        startBtn.disabled = true;
        newQuestion();
    });

    nextBtn.addEventListener('click', () => {
        newQuestion();
    });
});
