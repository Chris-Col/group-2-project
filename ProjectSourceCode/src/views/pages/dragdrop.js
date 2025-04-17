/* dragdrop.js – round‑based vocabulary game with
   difficulty levels + live scoreboard */

/* global fetch */
document.addEventListener('DOMContentLoaded', () => {

  /*--------------------------------------------------*/
  /* 0.  Static resources                             */
  /*--------------------------------------------------*/
  const ISO_LANGS = {
    en:'English', es:'Spanish', fr:'French',
    de:'German',  it:'Italian', ja:'Japanese', zh:'Chinese'
  };

  const WORD_BANK = {
    easy  : ['hello','goodbye','please','thank you','yes','no','friend','family'],
    medium: ['important','beautiful','difficult','mountain','language','journey'],
    hard  : ['philosophy','architecture','enthusiasm','responsibility','magnificent']
  };

  /*--------------------------------------------------*/
  /* 1.  DOM handles                                  */
  /*--------------------------------------------------*/
  const srcSel      = document.getElementById('source');
  const tgtSel      = document.getElementById('target');
  const diffSel     = document.getElementById('difficulty');
  const customIn    = document.getElementById('custom');

  const wordsDiv    = document.getElementById('words');
  const zonesDiv    = document.getElementById('zones');
  const toastBox    = document.getElementById('message');

  /* scoreboard spans */
  const solvedSpan   = document.getElementById('solved');
  const totalSpan    = document.getElementById('total');
  const attemptsSpan = document.getElementById('attempts');
  const accuracySpan = document.getElementById('accuracy');

  document.getElementById('reset').addEventListener('click',   newRound);
  [srcSel, tgtSel, diffSel].forEach(sel => sel.addEventListener('change', newRound));

  /*--------------------------------------------------*/
  /* 2.  Utilities                                   */
  /*--------------------------------------------------*/
  const shuffle = a => { for (let i=a.length;i--;) {
      const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]];
    } return a; };

  const toast = (txt, ms=2400) => {
    toastBox.textContent = txt;
    toastBox.hidden = false; toastBox.classList.add('show');
    setTimeout(()=>{ toastBox.classList.remove('show');
                     setTimeout(()=>toastBox.hidden=true, 320); }, ms);
  };

  async function translateMany(wordsEn, target){
    if (target === 'en') return [...wordsEn];

    const out = [];
    for (const w of wordsEn){
      try{
        const r  = await fetch(`/api/translate?q=${encodeURIComponent(w)}&target=${target}`);
        const js = await r.json();
        out.push(js.translated || '');
      }catch{ out.push(''); }
    }
    return out;
  }

  /*--------------------------------------------------*/
  /* 3.  State                                       */
  /*--------------------------------------------------*/
  let PAIRS   = [];     // list of {src, tgt}
  let solved  = 0;      // correct matches this round
  let attempts= 0;      // total drops this round

  /*--------------------------------------------------*/
  /* 4.  Populate selects once                        */
  /*--------------------------------------------------*/
  (()=>{
    Object.entries(ISO_LANGS).forEach(([code,label])=>{
      [srcSel, tgtSel].forEach(sel=>{
        sel.insertAdjacentHTML('beforeend', `<option value="${code}">${label}</option>`);
      });
    });
    tgtSel.value = 'en';        // default
  })();

  /*--------------------------------------------------*/
  /* 5.  Launch first round                           */
  /*--------------------------------------------------*/
  newRound();

  /*--------------------------------------------------*/
  /* 6.  Round bootstrap                              */
  /*--------------------------------------------------*/
  async function newRound(){
    if (srcSel.value === tgtSel.value){
      toast('Choose two different languages 🙂'); return;
    }

    const custom = customIn.value
        .split(',').map(s=>s.trim()).filter(Boolean).slice(0,12);

    const seed   = custom.length ? custom : WORD_BANK[ diffSel.value || 'easy' ];

    const [fromArr,toArr] = await Promise.all([
      translateMany(seed, srcSel.value),
      translateMany(seed, tgtSel.value)
    ]);

    if (fromArr.some(w=>!w) || toArr.some(w=>!w)){
      toast('Translation failed – try again'); return;
    }

    PAIRS    = seed.map((_,i)=>({src:fromArr[i], tgt:toArr[i]}));
    solved   = 0;
    attempts = 0;
    renderBoard();
    updateScoreboard();         // push zeroes & totals
  }

  /*--------------------------------------------------*/
  /* 7.  Render board                                 */
  /*--------------------------------------------------*/
  function renderBoard(){
    wordsDiv.innerHTML = zonesDiv.innerHTML = '';

    /* draggable words (source language) */
    shuffle(PAIRS.map((_,i)=>i)).forEach(idx=>{
      wordsDiv.insertAdjacentHTML('beforeend',
        `<div class="word" draggable="true" data-idx="${idx}">${PAIRS[idx].src}</div>`);
    });

    wordsDiv.querySelectorAll('.word').forEach(card=>{
      card.addEventListener('dragstart', e=>{
        e.dataTransfer.setData('text/plain', card.dataset.idx);
      });
    });

    /* drop zones (target language) */
    shuffle(PAIRS.map(p=>p.tgt)).forEach(txt=>{
      const z=document.createElement('div');
      z.className='zone'; z.textContent=txt;

      z.addEventListener('dragover', e=>{e.preventDefault(); z.classList.add('over');});
      z.addEventListener('dragleave', ()=> z.classList.remove('over'));

      z.addEventListener('drop', e=>{
        e.preventDefault(); z.classList.remove('over');
        const idx = +e.dataTransfer.getData('text/plain');
        const ok  = PAIRS[idx].tgt === txt;

        z.classList.add(ok?'correct':'wrong');
        attempts++;

        if (ok){
          solved++;
          const w=document.querySelector(`.word[data-idx='${idx}']`);
          w.style.opacity=.35; w.draggable=false;

          /* allow the green flash, then remove zone */
          setTimeout(()=> z.remove(), 550);

          if (solved === PAIRS.length){ toast('✨ Round cleared! ✨'); }
        }else{
          setTimeout(()=> z.classList.remove('wrong'), 650);
        }

        updateScoreboard();
      });

      zonesDiv.appendChild(z);
    });

    /* total pairs into scoreboard */
    totalSpan.textContent = PAIRS.length;
  }

  /*--------------------------------------------------*/
  /* 8.  Scoreboard helper                            */
  /*--------------------------------------------------*/
  function updateScoreboard(){
    solvedSpan.textContent   = solved;
    attemptsSpan.textContent = attempts;
    const acc = attempts ? Math.round((solved/attempts)*100) : 0;
    accuracySpan.textContent = acc;
  }

}); // DOMContentLoaded