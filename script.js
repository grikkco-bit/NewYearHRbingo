// local icons (auto-generated from files in ./icons/)
let ICONS = [
  { text: "Корпоратив перенесли на январь", title: "Январь", attribute: "организаторы" },
  { text: "Бюджет на корпоратив выдали в ветках", title: "Бюджет", attribute: "организаторы" },
  { text: "Все площадки забронировали..", title: "Площадки", attribute: "организаторы" },
  { text: "Кто-то напьется и будет петь караоке", title: "Караоке", attribute: "люди" },
  { text: "А нам хватит еды?", title: "Еда", attribute: "организаторы" },
  { text: "А премия будет?", title: "Премия", attribute: "деньги" },
  { text: "Нам не нравится этот ваш маскарад", title: "Маскарад", attribute: "люди" },
  { text: "Хочу детский подарок, но у меня нет ребенка", title: "Подарок", attribute: "деньги" },
  { text: "А тайный санта будет?", title: "Тайный санта", attribute: "санта" },
  { text: "Хочу +1 на корпоратив!", title: "+1", attribute: "люди" },
  { text: "А мы работаем 31?", title: "31 декабря", attribute: "организаторы" },
  { text: "Когда будут фотки?", title: "Фотки", attribute: "организаторы" },
  { text: "Зарплату раньше заплатят?", title: "Зарплата", attribute: "деньги" },
  { text: "Можно начать сразу утром?", title: "Утро", attribute: "люди" },
  { text: "Можно не пить за «успех компании» — я уже за всё выпил?", title: "2026", attribute: "люди" },
  { text: "Включу свой плейлист?", title: "Плейлист", attribute: "люди" },
  // если добавите новые, укажите attribute: one of [инноватор, инженер, дизайнер, стратег, хакер, аналитик]
];

// filter out items without text (legacy - for backward compatibility)
// ICONS = ICONS.filter(i => i.text);

const GRID_SIZE = 4;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const CENTER = -1; // 4x4 не имеет центра, используем -1
const REQUIRED_SELECTIONS = 5; // number of selections required to show result

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
    pool = [{ text: "Нет", title: "Нет" }];
  }
  // repeat available icons until we have at least 16 entries (for 4x4)
  while (pool.length < 16) {
    pool = pool.concat(shuffle(ICONS));
  }
  pool = shuffle(pool).slice(0, 16);

  // create 16 cells (4x4)
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

    // все ячейки одинаковые в 4x4 (нет центра)
    const icon = pool[p++];
    const text = document.createElement("div");
    text.className = "cell-text";
    text.innerText = icon.text;
    text.title = icon.title;
    cell.appendChild(text);

    // click handler
    cell.addEventListener("click", () => toggleCell(i));
    bingoEl.appendChild(cell);
    cells.push({ el: cell, marked: false, index: i });
  }
  updateSelectionCounter();
}

function toggleCell(index){
  if (hasWon) return; // prevent toggling after win until new game
  if (index === CENTER) return; // center is fixed free space (but CENTER = -1 now, so this won't trigger)

  const cellObj = cells[index];
  const el = cellObj.el;
  // in 4x4, no limit on selection count - select all 16 cells
  // prevent selecting more than REQUIRED_SELECTIONS
  const currentlySelected = cells.filter(c => c.marked).length;
  if (!cellObj.marked && currentlySelected >= REQUIRED_SELECTIONS) {
    // brief pulse feedback
    el.style.transform = 'scale(0.98)';
    setTimeout(()=> el.style.transform = '', 120);
    return;
  }

  cellObj.marked = !cellObj.marked;
  el.classList.toggle("marked", cellObj.marked);
  // if we've reached exactly 3 selections, auto-show result
  const afterSelected = cells.filter(c => c.marked).length;
  updateSelectionCounter();
  if (afterSelected === REQUIRED_SELECTIONS) {
    setTimeout(()=> showResultModal(false), 220);
  }
  checkWin();
}

function updateSelectionCounter(){
  if (!selectionCounterEl) return;
  const count = cells.filter(c => c.marked).length;
  selectionCounterEl.innerText = `Выбрано ${count}/${REQUIRED_SELECTIONS}`;
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
  // return array of {text, attribute} of marked cells
  return cells.filter(c => c.marked).map(c => {
    const textDiv = c.el.querySelector('.cell-text');
    if (!textDiv) return null;
    const text = textDiv.innerText || textDiv.textContent;
    // try to find attribute from ICONS by matching text
    const match = ICONS.find(i => i.text === text);
    return { text: text, attribute: match ? match.attribute : null };
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
  { attribute: 'люди', title: 'Твоя забота - люди!', text: 'Они приходят к тебе со своими вопросами и знают, что ты всегда поможешь' },
  { attribute: 'деньги', title: 'Ты решаешь по финансам, я прав?', text: 'Деньги и что на них можно купить хранишь именно ты, без тебя бы ничего не случилось!' },
  { attribute: 'организаторы', title: 'Вокруг тебя и создается праздник!', text: 'Ты тот самый многорукий организатор - незаменимый человек в Новогоднем корпоративе' },
  
];

function computeResult(){
  const sel = getSelectedIcons();
  // if no selection, base on ICONS pool
  const pool = sel.length ? sel : ICONS.map(i => ({ text: i.text, attribute: i.attribute }));

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

  // Always choose the top attribute (no mixed results) - pick the attribute with highest count
  if (proportions.length === 0) {
    return { title: RESULT_TEMPLATES[0].title, text: RESULT_TEMPLATES[0].text, img: null };
  }
  const topAttr = proportions[0].attribute;
  const tmpl = RESULT_TEMPLATES.find(t => t.attribute === topAttr) || RESULT_TEMPLATES[0];
  return { title: tmpl.title, text: tmpl.text, img: null };
}

function showResultModal(isWin = false){
  const res = computeResult();
  resultTitle.innerText = res.title + (isWin ? ' — БИНГО!' : '');
  resultText.innerText = res.text;
  // hide image in result output as requested
  if (resultImage) {
    resultImage.style.display = 'none';
  }
  resultModal.setAttribute('aria-hidden','false');
}

function closeModal(){
  resultModal.setAttribute('aria-hidden','true');
}

if (showResultBtn) {
  showResultBtn.addEventListener('click', () => showResultModal(false));
}
// close buttons should close modal and reset selections
closeResultBtn.addEventListener('click', () => {
  closeModal();
  resetSelections();
});

closeBtn.addEventListener('click', () => {
  closeModal();
  resetSelections();
});

// handle sharing: save image, copy image and text to clipboard, show toast
async function shareResult() {
  const res = computeResult();
  const shareText = `${res.title}: ${res.text}`;

  // create canvas snapshot
  const w = 900, h = 480;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  // background: mimic main game colors (green -> dark green -> red)
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0, '#0b6623');
  g.addColorStop(0.5, '#1a4d2e');
  g.addColorStop(1, '#c41e3a');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // draw decorative snowflakes on background
  const snowCount = 60;
  for (let i = 0; i < snowCount; i++) {
    const sx = Math.random() * w;
    const sy = Math.random() * h;
    const r = Math.random() * 3 + (i % 8 === 0 ? 3 : 0);
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${0.6 + Math.random()*0.4})`;
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // draw semi-transparent panel for text for readability
  const panelX = 60, panelY = 60, panelW = w - 120, panelH = h - 160;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  const radius = 12;
  roundRect(ctx, panelX, panelY, panelW, panelH, radius, true, false);

  // title
  ctx.fillStyle = '#0b6623';
  ctx.font = '700 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  wrapText(ctx, res.title, w/2, panelY + 48, panelW - 40, 36);

  // body text
  ctx.fillStyle = '#111';
  ctx.font = '400 20px Arial, sans-serif';
  ctx.textAlign = 'left';
  wrapText(ctx, res.text, panelX + 20, panelY + 110, panelW - 40, 28);

  // footer credit
  ctx.fillStyle = '#aaaaaaff';
  ctx.font = '600 14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Создано @HR_weekend', w/2, h - 24);

  // convert to blob and trigger download + clipboard
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    // trigger download
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'minerva-result.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Download failed', e);
    }

    // try to copy image to clipboard
    let copiedImage = false;
    if (navigator.clipboard && window.ClipboardItem) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        copiedImage = true;
      } catch (e) {
        // image copy failed
        copiedImage = false;
      }
    }

    // always copy text to clipboard as fallback/extra
    try {
      await navigator.clipboard.writeText(shareText);
    } catch (e) {
      console.warn('Text copy failed', e);
    }

    showCopyToast('Результат скопирован');
  }, 'image/png');
}

shareResultBtn.addEventListener('click', shareResult);

// helper: wrap text on canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
}

// helper: draw rounded rectangle
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (const side in defaultRadius) radius[side] = radius[side] || defaultRadius[side];
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// small toast inside modal
function showCopyToast(message) {
  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.innerText = message;
  // style inline to avoid CSS edits
  toast.style.position = 'fixed';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.bottom = '24px';
  toast.style.background = 'rgba(17,24,39,0.9)';
  toast.style.color = 'white';
  toast.style.padding = '8px 14px';
  toast.style.borderRadius = '8px';
  toast.style.zIndex = 2000;
  toast.style.fontWeight = '600';
  document.body.appendChild(toast);
  setTimeout(()=> { toast.style.transition = 'opacity 0.3s'; toast.style.opacity = '0'; }, 1600);
  setTimeout(()=> toast.remove(), 2000);
}

// Reset current selections and highlights
function resetSelections() {
  hasWon = false;
  cells.forEach(c => {
    c.marked = false;
    if (c.el) {
      c.el.classList.remove('marked');
      c.el.classList.remove('win');
    }
  });
  updateSelectionCounter();
}

// Create animated snowflakes
function createSnowflakes() {
  const snowflakesContainer = document.body;
  const snowflakeCount = 25; // количество снежинок
  const sizes = ['size-small', 'size-medium', 'size-large'];
  
  for (let i = 0; i < snowflakeCount; i++) {
    const snowflake = document.createElement('div');
    const sizeClass = sizes[Math.floor(Math.random() * sizes.length)];
    snowflake.className = `snowflake ${sizeClass}`;
    snowflake.textContent = '❄';
    
    // Random horizontal position
    const leftPercent = Math.random() * 100;
    snowflake.style.left = leftPercent + '%';
    
    // Random animation delay
    const delay = Math.random() * 8;
    snowflake.style.animationDelay = delay + 's';
    
    snowflakesContainer.appendChild(snowflake);
  }
}

// Initialize snowflakes as soon as script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createSnowflakes);
} else {
  createSnowflakes();
}

// build first game on load
buildGrid();