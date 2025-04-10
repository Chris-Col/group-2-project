// Sample word-pairs
const dictionary = {
    en: [
      { src: 'hello', tgt: 'hola' },
      { src: 'goodbye', tgt: 'adiós' },
      { src: 'please', tgt: 'por favor' },
      { src: 'thank you', tgt: 'gracias' }
    ],
    es: [
      { src: 'hola', tgt: 'hello' },
      { src: 'adiós', tgt: 'goodbye' },
      { src: 'por favor', tgt: 'please' },
      { src: 'gracias', tgt: 'thank you' }
    ]
  };
  
  let currentPairs = [];
  const languageSelect = document.getElementById('language');
  const wordsContainer = document.getElementById('words');
  const zonesContainer = document.getElementById('zones');
  
  function initGame() {
    const lang = languageSelect.value;
    currentPairs = shuffle(dictionary[lang].slice());
  
    wordsContainer.innerHTML = '';
    zonesContainer.innerHTML = '';
  
    currentPairs.forEach((pair, index) => {
      const wordEl = document.createElement('div');
      wordEl.className = 'word';
      wordEl.textContent = pair.src;
      wordEl.draggable = true;
      wordEl.dataset.index = index;
  
      wordEl.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', index);
      });
  
      wordsContainer.appendChild(wordEl);
    });
  
    const shuffledTargets = shuffle(currentPairs.map(p => p.tgt));
    shuffledTargets.forEach(target => {
      const zoneEl = document.createElement('div');
      zoneEl.className = 'zone';
      zoneEl.textContent = target;
  
      zoneEl.addEventListener('dragover', e => {
        e.preventDefault();
        zoneEl.classList.add('over');
      });
  
      zoneEl.addEventListener('dragleave', () => {
        zoneEl.classList.remove('over');
      });
  
      zoneEl.addEventListener('drop', e => {
        e.preventDefault();
        zoneEl.classList.remove('over');
        const srcIndex = e.dataTransfer.getData('text/plain');
        const pair = currentPairs[srcIndex];
  
        if (pair.tgt === target) {
          zoneEl.classList.add('correct');
          const wordEl = document.querySelector(`.word[data-index='${srcIndex}']`);
          wordEl.draggable = false;
          wordEl.style.opacity = 0.5;
        } else {
          zoneEl.classList.add('wrong');
          setTimeout(() => zoneEl.classList.remove('wrong'), 500);
        }
      });
  
      zonesContainer.appendChild(zoneEl);
    });
  }
  
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  languageSelect.addEventListener('change', initGame);
  initGame();