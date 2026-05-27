const w = window.wangtranslate;
let currentTab = 'translations';

async function init() {
  await initLanguage();
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      await renderHistory();
    });
  });
  document.getElementById('searchInput').placeholder = t('history.search');
  document.getElementById('searchInput').addEventListener('input', debounce(async (e) => {
    await renderHistory(e.target.value);
  }, 300));
  await renderHistory();
}

async function renderHistory(searchQuery) {
  if (currentTab === 'translations') await renderTranslations(searchQuery);
  else if (currentTab === 'ocr') await renderOcrHistory();
  else await renderFavorites(searchQuery);
}

async function renderTranslations(searchQuery = '') {
  let history = (await w.storeGet('translateHistory')) || [];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    history = history.filter(h => (h.sourceText && h.sourceText.toLowerCase().includes(q)) || (h.translatedText && h.translatedText.toLowerCase().includes(q)));
  }
  if (history.length === 0) {
    document.getElementById('historyContent').innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">${t(searchQuery ? 'history.empty.search' : 'history.empty.translate')}</div>`;
    return;
  }
  let html = '';
  for (const item of history) {
    html += `
      <div class="result-card">
        <div class="row" style="margin-bottom:4px;font-size:10px;color:var(--text-muted);">
          <span>${item.sourceLanguage || 'auto'} → ${item.targetLanguage || 'zh-CN'}</span>
          <span class="spacer"></span><span>${formatTime(item.timestamp)}</span>
        </div>
        <div style="color:var(--text-dim);font-size:12px;margin-bottom:6px;">${esc((item.sourceText || '').substring(0, 100))}</div>
        <div class="result-text">${esc(item.translatedText || '')}</div>
        <div class="row" style="margin-top:8px;font-size:10px;color:var(--text-muted);">
          <span>${item.apiLabel || ''}</span><span class="spacer"></span>
          <button class="btn btn-sm btn-secondary" onclick="copyText('${escapeAttr(item.translatedText || '')}')">${t('history.copy')}</button>
          <button class="btn btn-sm btn-secondary" onclick="toggleFav('${item.id}','translate',${!item.favorite})">${item.favorite ? '★' : '☆'}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteHistory('${item.id}','translate')">${t('history.del')}</button>
        </div>
      </div>`;
  }
  document.getElementById('historyContent').innerHTML = html;
  window.copyText = copyText; window.toggleFav = toggleFav; window.deleteHistory = deleteHistory;
}

async function renderOcrHistory() {
  const history = (await w.storeGet('ocrHistory')) || [];
  if (history.length === 0) {
    document.getElementById('historyContent').innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">${t('history.empty.ocr')}</div>`;
    return;
  }
  let html = '';
  for (const item of history) {
    html += `
      <div class="result-card">
        <div class="row" style="margin-bottom:4px;font-size:10px;color:var(--text-muted);">
          <span>${item.languages || ''}</span><span class="spacer"></span><span>${formatTime(item.timestamp)}</span>
        </div>
        <div class="result-text">${esc((item.text || '').substring(0, 300))}</div>
        <div class="row" style="margin-top:8px;justify-content:flex-end;gap:6px;">
          <button class="btn btn-sm btn-secondary" onclick="copyText('${escapeAttr(item.text || '')}')">${t('history.copy')}</button>
          <button class="btn btn-sm btn-secondary" onclick="toggleFav('${item.id}','ocr',${!item.favorite})">${item.favorite ? '★' : '☆'}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteHistory('${item.id}','ocr')">${t('history.del')}</button>
        </div>
      </div>`;
  }
  document.getElementById('historyContent').innerHTML = html;
  window.copyText = copyText; window.toggleFav = toggleFav; window.deleteHistory = deleteHistory;
}

async function renderFavorites(searchQuery = '') {
  let translateHistory = (await w.storeGet('translateHistory')) || [];
  let ocrHistory = (await w.storeGet('ocrHistory')) || [];
  let favorites = [
    ...translateHistory.filter(h => h.favorite).map(h => ({ ...h, type: 'translate' })),
    ...ocrHistory.filter(h => h.favorite).map(h => ({ ...h, sourceText: h.text, translatedText: h.text, type: 'ocr' })),
  ];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    favorites = favorites.filter(h => (h.sourceText && h.sourceText.toLowerCase().includes(q)) || (h.translatedText && h.translatedText.toLowerCase().includes(q)));
  }
  if (favorites.length === 0) {
    document.getElementById('historyContent').innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">${t(searchQuery ? 'history.empty.search' : 'history.empty.favorites')}</div>`;
    return;
  }
  let html = '';
  for (const item of favorites) {
    html += `
      <div class="result-card">
        <div class="row" style="margin-bottom:4px;font-size:10px;color:var(--text-muted);">
          <span>${item.type === 'translate' ? (item.sourceLanguage || 'auto') + ' → ' + (item.targetLanguage || 'zh-CN') : 'OCR: ' + (item.languages || '')}</span>
          <span class="spacer"></span><span>★ ${formatTime(item.timestamp)}</span>
        </div>
        <div class="result-text">${esc(item.sourceText || '')}</div>
        ${item.type === 'translate' ? `<div style="color:var(--text-dim);font-size:12px;margin-top:6px;">→ ${esc(item.translatedText || '')}</div>` : ''}
        <div class="row" style="margin-top:8px;justify-content:flex-end;gap:6px;">
          <button class="btn btn-sm btn-secondary" onclick="copyText('${escapeAttr(item.translatedText || '')}')">${t('history.copy')}</button>
          <button class="btn btn-sm btn-danger" onclick="toggleFav('${item.id}','${item.type}',false)">${t('history.unfav')}</button>
        </div>
      </div>`;
  }
  document.getElementById('historyContent').innerHTML = html;
  window.copyText = copyText; window.toggleFav = toggleFav;
}

async function copyText(text) { await w.setClipboard(text); }
async function toggleFav(id, type, value) {
  const key = type === 'translate' ? 'translateHistory' : 'ocrHistory';
  const history = (await w.storeGet(key)) || [];
  const idx = history.findIndex(h => h.id === id);
  if (idx >= 0) { history[idx].favorite = value; await w.storeSet(key, history); await renderHistory(); }
}
async function deleteHistory(id, type) {
  let history = (await w.storeGet(type === 'translate' ? 'translateHistory' : 'ocrHistory')) || [];
  history = history.filter(h => h.id !== id);
  await w.storeSet(type === 'translate' ? 'translateHistory' : 'ocrHistory', history);
  await renderHistory();
}
function esc(text) { if (!text) return ''; const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }
function escapeAttr(text) { return (text || '').replace(/`/g, '\\`').replace(/\$/g, '\\$'); }
function formatTime(iso) { if (!iso) return ''; const d = new Date(iso); const pad = n => n.toString().padStart(2, '0'); return `${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

init();
