const w = window.wangtranslate || {};
const p = new URLSearchParams(window.location.search);

// ============== Synchronous helpers (don't depend on async) ==============
function esc(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
function escAttr(text) {
  return (text || '').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/'/g, "\\'");
}

document.getElementById('inputText').focus();
document.getElementById('inputText').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doTranslate(); }
});
document.getElementById('translateBtn').addEventListener('click', doTranslate);

// ============== Async init ==============
(async function init() {
  try { await initLanguage(); } catch (_) {}
  document.getElementById('inputText').placeholder = t('translate.placeholder');

  let src = 'auto', tgt = 'zh-CN';
  try {
    src = (await w.storeGet('sourceLanguage')) || 'auto';
    tgt = (await w.storeGet('targetLanguage')) || 'zh-CN';
  } catch (_) {}
  document.getElementById('langInfo').textContent = src + ' → ' + tgt;

  // Render translate button text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.dataset.i18n) el.textContent = t(el.dataset.i18n);
  });
})();

// ============== Translate action ==============
async function doTranslate() {
  const text = document.getElementById('inputText').value.trim();
  if (!text) return;

  let src = 'auto', tgt = 'zh-CN';
  try {
    src = (await w.storeGet('sourceLanguage')) || 'auto';
    tgt = (await w.storeGet('targetLanguage')) || 'zh-CN';
  } catch (_) {}

  document.getElementById('results').innerHTML = '<div class="spinner"></div>';

  try {
    const result = await w.translate({ text, sourceLang: src, targetLang: tgt });
    if (!result || !result.success) {
      document.getElementById('results').innerHTML =
        `<p style="color:var(--red);padding:16px;">${result?.error || 'Translation failed'}</p>`;
      return;
    }
    let html = '';
    for (const r of result.results || []) {
      const label = esc(r.apiLabel || 'API');
      const txt = r.success ? esc(r.translatedText) : '<span style="color:var(--red)">' + esc(r.error || 'Error') + '</span>';
      html += `<div class="result-card">
        <div class="result-header">
          <span class="result-badge">${label}</span>
          <div class="row" style="gap:4px;">
            <button class="btn btn-sm btn-secondary" data-copy="${escAttr(r.translatedText)}">${t('translate.copy')}</button>
            <button class="btn btn-sm btn-secondary" data-speak="${escAttr(r.translatedText)}">${t('translate.speak')}</button>
          </div>
        </div>
        <div class="result-text">${txt}</div>
      </div>`;
    }
    document.getElementById('results').innerHTML = html;

    // Attach event handlers
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async function() {
        await w.setClipboard(this.dataset.copy);
        this.textContent = t('translate.copied');
        setTimeout(() => { this.textContent = t('translate.copy'); }, 1500);
      });
    });
    document.querySelectorAll('[data-speak]').forEach(btn => {
      btn.addEventListener('click', function() {
        const u = new SpeechSynthesisUtterance(this.dataset.speak);
        u.lang = (tgt === 'zh-CN') ? 'zh-CN' : 'en-US';
        u.rate = 0.9;
        speechSynthesis.speak(u);
      });
    });
  } catch (e) {
    document.getElementById('results').innerHTML =
      `<p style="color:var(--red);padding:16px;">Error: ${esc(e.message)}</p>`;
  }
}
