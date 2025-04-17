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

const srcSelect   = document.getElementById('source');
const tgtSelect   = document.getElementById('target');
const wordsDiv    = document.getElementById('words');
const zonesDiv    = document.getElementById('zones');
document.getElementById('reset').addEventListener('click', initGame);

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
tgtSelect.value = 'en';                 // default “to English”
srcSelect.addEventListener('change', initGame);
tgtSelect.addEventListener('change', initGame);

/* ------------------------------------------------------------------ */
/* 4. Game state                                                      */
/* ------------------------------------------------------------------ */

let pairs = []; // [{ src: 'hola', tgt: 'hello' }, …]

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

async function translateMany(words, target) {
  return Promise.all(
    words.map(w =>
      fetch(`/api/translate?q=${encodeURIComponent(w)}&target=${target}`)
        .then(r => r.json())
        .then(j => j.translated)
    )
  );
}

/* ------------------------------------------------------------------ */
/* 6. Core logic                                                      */
/* ------------------------------------------------------------------ */
const msgDiv = document.getElementById('message');

// replace alert() with this:
function showMessage(text, duration = 2000) {
  msgDiv.textContent = text;
  msgDiv.hidden = false;
  msgDiv.classList.add('show');

  setTimeout(() => {
    msgDiv.classList.remove('show');
    setTimeout(() => msgDiv.hidden = true, 300);
  }, duration);
}

async function initGame() {
  const from = srcSelect.value;
  const to   = tgtSelect.value;

  if (from === to) {
    showMessage('Please choose a native and preferred target language');
    return;
  }

  // Translate seed into the *target* language
  const translated = await translateMany(SEED_WORDS, to);

  // Build pair list depending on direction
  pairs = SEED_WORDS.map((w, i) =>
    from === 'en'
      ? { src: w,           tgt: translated[i] } // English → X
      : { src: translated[i], tgt: w }           // X → English
  );

  renderRound();
}

function renderRound() {
  wordsDiv.innerHTML = zonesDiv.innerHTML = '';

  /* ----- draggable source words ----- */
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

  /* ----- drop zones (targets) ----- */
  shuffle(pairs.map(p => p.tgt)).forEach(target => {
    const z = document.createElement('div');
    z.className   = 'zone';
    z.textContent = target;

    z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('over'); });
    z.addEventListener('dragleave',     () => z.classList.remove('over'));

    z.addEventListener('drop', e => {
      e.preventDefault();
      z.classList.remove('over');

      const srcIdx = e.dataTransfer.getData('text/plain');
      const correct = pairs[srcIdx].tgt === target;

      z.classList.add(correct ? 'correct' : 'wrong');
      if (correct) {
        const dragged = document.querySelector(`.word[data-idx='${srcIdx}']`);
        dragged.style.opacity = 0.4;
        dragged.draggable = false;
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