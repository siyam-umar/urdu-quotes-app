/* ========== Motivation Hub — app.js ========== */
/* Features:
   - categories (urdu, islamic, english, funny)
   - splash screen
   - dark mode persist
   - sound toggle
   - share (navigator.share or copy fallback)
   - slide/fade animation on quote change
*/

const QUOTES = {
  urdu: [
    {text:"کامیابی اُنہیں ملتی ہے جو محنت سے ڈرتے نہیں۔", author:""},
    {text:"حوصلہ کبھی نہ چھوڑو، کل بہتر ہو سکتا ہے۔", author:""},
    {text:"ہر دن ایک نیا آغاز ہے۔", author:""},
    {text:"چھوٹے قدم بھی منزل تک لے جاتے ہیں۔", author:""}
  ],
  islamic: [
    {text:"اللہ کے ساتھ صبر کا اجر بڑا ہے۔", author:"اللہ پر بھروسہ رکھو"},
    {text:"ہر چیز کا بہترین فیصلہ اللہ کے ہاتھ میں ہے۔", author:""},
    {text:"شکر ادا کرو، دل کو سکون ملتا ہے۔", author:""}
  ],
  english: [
    {text:"Believe you can and you're halfway there.", author:"Theodore Roosevelt"},
    {text:"Dream big and dare to fail.", author:"Norman Vaughan"},
    {text:"Small steps every day.", author:""}
  ],
  funny: [
    {text:"زندگی مختصر ہے — پہلے ڈیزرٹ کھاؤ!", author:""},
    {text:"میں ورزش کا بڑا عاشق ہوں — سیڑھیاں چل کر بیڈ تک جاتا ہوں۔", author:""}
  ]
};

/* UI Elements */
const splash = document.getElementById('splash');
const darkToggle = document.getElementById('darkToggle');
const tabs = document.querySelectorAll('.tab');
const quoteArea = document.getElementById('quoteArea');
const authorEl = document.getElementById('author');
const newBtn = document.getElementById('newBtn');
const shareBtn = document.getElementById('shareBtn');
const copyBtn = document.getElementById('copyBtn');
const soundToggle = document.getElementById('soundToggle');

let currentCat = localStorage.getItem('mh_cat') || 'urdu';
let soundOn = (localStorage.getItem('mh_sound') || '1') === '1';
let darkOn = (localStorage.getItem('mh_dark') || '0') === '1';

/* initial setup */
function init(){
  // set dark
  if(darkOn) document.body.classList.add('dark'), darkToggle.innerText='☀️';
  else document.body.classList.remove('dark'), darkToggle.innerText='🌙';

  // sound icon
  soundToggle.innerText = soundOn ? '🔊' : '🔈';

  // set active tab
  tabs.forEach(t=>{
    if(t.dataset.cat === currentCat) t.classList.add('active');
    else t.classList.remove('active');

    t.addEventListener('click', ()=> {
      if(t.dataset.cat === currentCat) return;
      selectCategory(t.dataset.cat);
    });
  });

  // splash dismiss after a short delay
  setTimeout(()=> {
    splash.classList.add('hidden');
    splash.style.display = 'none';
  }, 900);

  // bind actions
  newBtn.addEventListener('click', showRandomQuote);
  shareBtn.addEventListener('click', shareQuote);
  copyBtn.addEventListener('click', copyQuote);
  darkToggle.addEventListener('click', toggleDark);
  soundToggle.addEventListener('click', toggleSound);

  // show first quote
  showRandomQuote(true);
}

/* category select */
function selectCategory(cat){
  currentCat = cat;
  localStorage.setItem('mh_cat', cat);
  tabs.forEach(t=> t.classList.toggle('active', t.dataset.cat === cat));
  showRandomQuote();
}

/* get random quote object */
function randQuote(){
  const arr = QUOTES[currentCat] || QUOTES.urdu;
  const idx = Math.floor(Math.random()*arr.length);
  return arr[idx];
}

/* animate and set quote */
function showRandomQuote(first=false){
  const q = randQuote();
  // animate out
  quoteArea.classList.add('animate-out');

  // play sound
  if(soundOn) playBeep();

  setTimeout(()=>{
    quoteArea.classList.remove('animate-out');
    quoteArea.classList.add('animate-in');
    quoteArea.innerText = q.text;
    authorEl.innerText = q.author || '';
  }, 220);

  setTimeout(()=> quoteArea.classList.remove('animate-in'), 600);
}

/* share with fallback */
async function shareQuote(){
  const text = quoteArea.innerText + (authorEl.innerText ? (" — " + authorEl.innerText) : "");
  try {
    if(navigator.share){
      await navigator.share({title: 'Motivational Quote', text});
    } else {
      await navigator.clipboard.writeText(text);
      alert('Quote copied to clipboard — now paste to share!');
    }
  } catch(e){
    console.warn('share failed', e);
    alert('Sharing not supported or canceled.');
  }
}

/* copy */
async function copyQuote(){
  const text = quoteArea.innerText + (authorEl.innerText ? (" — " + authorEl.innerText) : "");
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.innerText = 'Copied!';
    setTimeout(()=> copyBtn.innerText = 'Copy', 1200);
  } catch(e){
    alert('Unable to copy. You can long-press the quote to copy on mobile.');
  }
}

/* dark toggle */
function toggleDark(){
  darkOn = !darkOn;
  document.body.classList.toggle('dark', darkOn);
  darkToggle.innerText = darkOn ? '☀️' : '🌙';
  localStorage.setItem('mh_dark', darkOn ? '1':'0');
}

/* sound toggle and beep */
function toggleSound(){
  soundOn = !soundOn;
  soundToggle.innerText = soundOn ? '🔊' : '🔈';
  localStorage.setItem('mh_sound', soundOn ? '1':'0');
}

/* simple beep using WebAudio */
function playBeep(){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 520;
    g.gain.value = 0.07;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    setTimeout(()=> { o.stop(); ctx.close(); }, 120);
  } catch(e){
    // ignore if not allowed
  }
}

/* init app */
init();
