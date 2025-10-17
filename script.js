// local icons (auto-generated from files in ./icons/)
let ICONS = [
  { url: "icons/egor-lyubimyi.jpg", title: "Егор (любимый)", attribute: "инноватор" },
  { url: "icons/egor.jpg", title: "Егор", attribute: "инженер" },
  { url: "icons/egor2.jpg", title: "Егор2", attribute: "дизайнер" },
  { url: "icons/egor3.jpg", title: "Егор3", attribute: "стратег" },
  { url: "icons/egor4.jpg", title: "Егор4", attribute: "аналитик" },
  // если добавите новые файлы сюда, укажите attribute: one of [инноватор, инженер, дизайнер, стратег, хакер, аналитик]
];

// filter out non-image files (like ds-store)
ICONS = ICONS.filter(i => /\.(svg|png|jpe?g|gif)$/i.test(i.url));

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const CENTER = Math.floor(TOTAL_CELLS / 2);

const bingoEl = document.getElementById("bingo");
const newGameBtn = document.getElementById("newGameBtn");
const selectionCounterEl = document.getElementById('selectionCounter');

let cells = []; // {el, marked, index}
let hasWon = false;

function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildGrid(){
  bingoEl.innerHTML = "";
  cells = [];
  hasWon = false;

  // pick icons: try to build a pool of 24 icons. If the user provided fewer,
  // repeat and shuffle the available icons so the grid can still be filled.
  let pool = shuffle(ICONS).slice();
  if (pool.length === 0) {
    console.warn("ICONS пустой — добавьте хотя бы одну иконку в массив ICONS или в папку icons/");
    // provide a minimal fallback (will show the star repeatedly)
    pool = [{ url: "icons/star.svg", title: "Свободное место" }];
  }
  // repeat available icons until we have at least 24 entries
  while (pool.length < 24) {
    pool = pool.concat(shuffle(ICONS));
  }
  pool = shuffle(pool).slice(0, 24);

  // create 25 cells
  for (let i = 0, p = 0; i < TOTAL_CELLS; i++){
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;

    // overlay for mark + check badge
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    const check = document.createElement("div");
    check.className = "check";
    check.innerText = "✓";
    overlay.appendChild(check);
    cell.appendChild(overlay);

    if (i === CENTER){
      // free space
      cell.classList.add("free", "marked");
      const img = document.createElement("img");
      img.src = "icons/minervasoft-logo-390.png";
      img.alt = "Minervasoft";
      img.title = "Minervasoft";
      cell.appendChild(img);
    } else {
      const icon = pool[p++];
      const img = document.createElement("img");
      img.src = icon.url;
      img.alt = icon.title;
      img.title = icon.title;
      cell.appendChild(img);
    }

    // click handler (center is already marked but still shouldn't toggle)
    cell.addEventListener("click", () => toggleCell(i));
    bingoEl.appendChild(cell);
    cells.push({ el: cell, marked: cell.classList.contains("marked"), index: i });
  }
  updateSelectionCounter();
}

function toggleCell(index){
  if (hasWon) return; // prevent toggling after win until new game
  if (index === CENTER) return; // center is fixed free space

  const cellObj = cells[index];
  const el = cellObj.el;
  // if currently unmarked and already 5 selected, prevent further selection
  const currentlySelected = cells.filter(c => c.marked && c.index !== CENTER).length;
  if (!cellObj.marked && currentlySelected >= 5) {
    // brief pulse feedback
    el.style.transform = 'scale(0.98)';
    setTimeout(()=> el.style.transform = '', 120);
    return;
  }

  cellObj.marked = !cellObj.marked;
  el.classList.toggle("marked", cellObj.marked);
  // if we've reached exactly 5 selections, auto-show result
  const afterSelected = cells.filter(c => c.marked && c.index !== CENTER).length;
  updateSelectionCounter();
  if (afterSelected === 5) {
    setTimeout(()=> showResultModal(false), 220);
  }
  checkWin();
}

function updateSelectionCounter(){
  if (!selectionCounterEl) return;
  const count = cells.filter(c => c.marked && c.index !== CENTER).length;
  selectionCounterEl.innerText = `Выбрано ${count}/5`;
}

function getMarkedMatrix(){
  // returns 5x5 boolean matrix
  const matrix = [];
  for (let r = 0; r < GRID_SIZE; r++){
    const row = [];
    for (let c = 0; c < GRID_SIZE; c++){
      const idx = r * GRID_SIZE + c;
      row.push(cells[idx].marked || false);
    }
    matrix.push(row);
  }
  return matrix;
}

function clearWinHighlights(){
  cells.forEach(c => c.el.classList.remove("win"));
}

function checkWin(){
  const m = getMarkedMatrix();
  clearWinHighlights();

  // check rows
  for (let r = 0; r < GRID_SIZE; r++){
    if (m[r].every(Boolean)){
      highlightRow(r);
      triggerWin();
      return;
    }
  }

  // check cols
  for (let c = 0; c < GRID_SIZE; c++){
    let ok = true;
    for (let r = 0; r < GRID_SIZE; r++){
      if (!m[r][c]) { ok = false; break; }
    }
    if (ok){
      highlightCol(c);
      triggerWin();
      return;
    }
  }

  // main diagonal
  let ok = true;
  for (let i = 0; i < GRID_SIZE; i++){
    if (!m[i][i]) { ok = false; break; }
  }
  if (ok){
    highlightMainDiag();
    triggerWin();
    return;
  }

  // anti-diagonal
  ok = true;
  for (let i = 0; i < GRID_SIZE; i++){
    if (!m[i][GRID_SIZE - 1 - i]) { ok = false; break; }
  }
  if (ok){
    highlightAntiDiag();
    triggerWin();
    return;
  }
}

function highlightRow(r){
  for (let c = 0; c < GRID_SIZE; c++){
    const idx = r * GRID_SIZE + c;
    cells[idx].el.classList.add("win");
  }
}
function highlightCol(c){
  for (let r = 0; r < GRID_SIZE; r++){
    const idx = r * GRID_SIZE + c;
    cells[idx].el.classList.add("win");
  }
}
function highlightMainDiag(){
  for (let i = 0; i < GRID_SIZE; i++){
    const idx = i * GRID_SIZE + i;
    cells[idx].el.classList.add("win");
  }
}
function highlightAntiDiag(){
  for (let i = 0; i < GRID_SIZE; i++){
    const idx = i * GRID_SIZE + (GRID_SIZE - 1 - i);
    cells[idx].el.classList.add("win");
  }
}

function triggerWin(){
  if (hasWon) return;
  hasWon = true;
  setTimeout(()=> {
    // show modal result on win
    showResultModal(true);
  }, 120);
}

// initialise
newGameBtn.addEventListener("click", buildGrid);

// modal elements
const resultModal = document.getElementById('resultModal');
const showResultBtn = document.getElementById('showResultBtn');
const closeResultBtn = document.getElementById('closeResultBtn');
const closeBtn = document.getElementById('closeBtn');
const modalNewGameBtn = document.getElementById('modalNewGameBtn');
const shareResultBtn = document.getElementById('shareResultBtn');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');
const resultImage = document.getElementById('resultImage');

function getSelectedIcons(){
  // return array of {url, attribute} of marked cells (excluding center)
  return cells.filter((c, idx) => c.marked && idx !== CENTER).map(c => {
    const img = c.el.querySelector('img');
    if (!img) return null;
    const src = img.src || img.getAttribute('src');
    // try to find attribute from ICONS by matching filename
    const match = ICONS.find(i => src.endsWith(i.url));
    return { url: src, attribute: match ? match.attribute : null };
  }).filter(Boolean);
}

function hashStrings(arr){
  // simple deterministic hash from array of strings
  const s = arr.join('|');
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++){
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

const RESULT_TEMPLATES = [
  { attribute: 'инноватор', title: 'Инноватор', text: 'Вы генерируете новые идеи и видите нестандартные решения.', img: 'icons/egor-lyubimyi.jpg' },
  { attribute: 'инженер', title: 'Инженер', text: 'Вы любите надёжные архитектуры и практичные решения.', img: 'icons/egor.jpg' },
  { attribute: 'дизайнер', title: 'Дизайнер', text: 'Ваш фокус — UX, визуальная часть и опыт пользователя.', img: 'icons/egor2.jpg' },
  { attribute: 'стратег', title: 'Стратег', text: 'Вы мыслите в терминах ценности и долгосрочных целей.', img: 'icons/egor3.jpg' },
  { attribute: 'хакер', title: 'Хакер', text: 'Любите прототипы, быстрое тестирование идей и пайплайны.', img: 'icons/egor4.jpg' },
  { attribute: 'аналитик', title: 'Аналитик', text: 'Вам важны данные, метрики и точные метрики успеха.', img: 'icons/star.svg' }
];

function computeResult(){
  const sel = getSelectedIcons();
  // if no selection, base on ICONS pool
  const pool = sel.length ? sel : ICONS.map(i => ({ url: i.url, attribute: i.attribute }));

  // count attributes
  const counts = {};
  pool.forEach(item => {
    const a = item.attribute || 'unknown';
    counts[a] = (counts[a] || 0) + 1;
  });

  // proportions
  const total = pool.length || 1;
  const proportions = Object.keys(counts).map(a => ({ attribute: a, count: counts[a], pct: counts[a] / total }));
  proportions.sort((x,y) => y.count - x.count);

  // top attribute(s)
  const top = proportions.filter(p => p.count === proportions[0].count).map(p => p.attribute);

  // Build result: if single top -> use template for that attribute, else mixed
  if (top.length === 1) {
    const attr = top[0];
    const tmpl = RESULT_TEMPLATES.find(t => t.attribute === attr) || RESULT_TEMPLATES[0];
    return {
      title: tmpl.title,
      text: `${tmpl.text} Пропорция: ${Math.round(proportions[0].pct * 100)}% ${attr}.`,
      img: tmpl.img
    };
  } else {
    // mixed result
    const names = top.join(' & ');
    return {
      title: `Смесь: ${names}`,
      text: `У вас смешанный профиль: ${top.map(t => `${t} (${(counts[t]/total*100).toFixed(0)}%)`).join(', ')}.`,
      img: 'icons/star.svg'
    };
  }
}

function showResultModal(isWin = false){
  const res = computeResult();
  resultTitle.innerText = res.title + (isWin ? ' — БИНГО!' : '');
  resultText.innerText = res.text;
  resultImage.src = res.img || 'icons/star.svg';
  resultModal.setAttribute('aria-hidden','false');
}

function closeModal(){
  resultModal.setAttribute('aria-hidden','true');
}

if (showResultBtn) {
  showResultBtn.addEventListener('click', () => showResultModal(false));
}
closeResultBtn.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);
modalNewGameBtn.addEventListener('click', () => { closeModal(); buildGrid(); });
shareResultBtn.addEventListener('click', () => {
  // try Web Share API or fallback to copying text
  const res = computeResult();
  const shareText = `${res.title}: ${res.text}`;
  if (navigator.share) {
    navigator.share({ title: res.title, text: res.text }).catch(()=>{});
  } else {
    navigator.clipboard?.writeText(shareText).then(()=> alert('Результат скопирован в буфер обмена'));
  }
});

// build first game on load
buildGrid();