/* dragdrop.js */
/* global fetch */

/* ------------------------------------------------------------------ */
/* 1. Static data / language map                                      */
/* ------------------------------------------------------------------ */
const ISO_LANGS = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  ja: 'Japanese',
  zh: 'Chinese'
};

const SEED_WORDS = ['hello', 'goodbye', 'please', 'thank you'];

/* ------------------------------------------------------------------ */
/* 2. DOM references                                                  */
/* ------------------------------------------------------------------ */
const srcSelect = document.getElementById('source');
const tgtSelect = document.getElementById('target');
const wordsDiv  = document.getElementById('words');
const zonesDiv  = document.getElementById('zones');
const resetBtn  = document.getElementById('reset');
const msgDiv    = document.getElementById('message');

resetBtn.addEventListener('click', initGame);

/* ------------------------------------------------------------------ */
/* 3. Populate language dropdowns                                     */
/* ------------------------------------------------------------------ */
Object.entries(ISO_LANGS).forEach(([code, label]) => {
  for (const sel of [srcSelect, tgtSelect]) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = label;
    sel.appendChild(opt);
  }
});

// sensible defaults
srcSelect.value = 'en';
tgtSelect.value = 'es';

// re‑run whenever either select changes
srcSelect.addEventListener('change', initGame);
tgtSelect.addEventListener('change', initGame);

/* ------------------------------------------------------------------ */
/* 4. Game state                                                      */
/* ------------------------------------------------------------------ */
let pairs = []; // will hold { src, tgt } objects

/* ------------------------------------------------------------------ */
/* 5. Helpers                                                         */
/* ------------------------------------------------------------------ */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// fetch translations from your backend endpoint
async function translateMany(words, target) {
  return Promise.all(
    words.map(w =>
      fetch(`/api/translate?q=${encodeURIComponent(w)}&target=${target}`)
        .then(r => r.json())
        .then(j => j.translated)
    )
  );
}

// replacement for alert()
function showMessage(text, duration = 2000) {
  msgDiv.textContent = text;
  msgDiv.hidden = false;
  msgDiv.classList.add('show');

  setTimeout(() => {
    msgDiv.classList.remove('show');
    setTimeout(() => { msgDiv.hidden = true; }, 300);
  }, duration);
}

/* ------------------------------------------------------------------ */
/* 6. Core logic                                                      */
/* ------------------------------------------------------------------ */
async function initGame() {
  const from = srcSelect.value;
  const to   = tgtSelect.value;

  if (from === to) {
    showMessage('Please choose two different languages');
    return;
  }

  // Determine which direction we need to translate
  // 1) English → X
  // 2) X → English
  // 3) X → Y (neither is English)
  let sourceWords, targetWords;

  if (from === 'en') {
    sourceWords = SEED_WORDS;
    targetWords = await translateMany(SEED_WORDS, to);
  } else if (to === 'en') {
    sourceWords = await translateMany(SEED_WORDS, from);
    targetWords = SEED_WORDS;
  } else {
    // both are non-English
    sourceWords = await translateMany(SEED_WORDS, from);
    targetWords = await translateMany(SEED_WORDS, to);
  }

  // build our pairs array
  pairs = sourceWords.map((w, i) => ({
    src: w,
    tgt: targetWords[i]
  }));

  renderRound();
}

function renderRound() {
  // clear last round
  wordsDiv.innerHTML = '';
  zonesDiv.innerHTML = '';

  // render draggable source words (shuffled)
  shuffle([...pairs]).forEach((pair, idx) => {
    const w = document.createElement('div');
    w.className   = 'word';
    w.textContent = pair.src;
    w.draggable   = true;
    w.dataset.idx = idx;

    w.addEventListener('dragstart', e =>
      e.dataTransfer.setData('text/plain', idx)
    );

    wordsDiv.appendChild(w);
  });

  // render drop zones (shuffled targets)
  shuffle(pairs.map(p => p.tgt)).forEach(target => {
    const z = document.createElement('div');
    z.className   = 'zone';
    z.textContent = target;

    z.addEventListener('dragover', e => {
      e.preventDefault();
      z.classList.add('over');
    });
    z.addEventListener('dragleave', () => {
      z.classList.remove('over');
    });

    z.addEventListener('drop', e => {
      e.preventDefault();
      z.classList.remove('over');

      const srcIdx  = e.dataTransfer.getData('text/plain');
      const correct = pairs[srcIdx].tgt === target;

      z.classList.add(correct ? 'correct' : 'wrong');
      if (correct) {
        const dragged = document.querySelector(`.word[data-idx='${srcIdx}']`);
        dragged.style.opacity = 0.4;
        dragged.draggable     = false;
      } else {
        setTimeout(() => z.classList.remove('wrong'), 500);
      }
    });

    zonesDiv.appendChild(z);
  });
}

/* ------------------------------------------------------------------ */
/* 7. Kick‑off                                                        */
/* ------------------------------------------------------------------ */
initGame();