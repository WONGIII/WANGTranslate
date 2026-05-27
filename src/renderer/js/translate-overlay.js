const w = window.wangtranslate || {};
const p = new URLSearchParams(window.location.search);
const sourceText = p.get('text') || '';

document.getElementById('sourceText').textContent = sourceText;

function esc(text) {
  if (!text) return '';
  const d = document.createElement('div'); d.textContent = text; return d.innerHTML;
}
function escAttr(text) {
  return (text || '').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/'/g, "\\'");
}

(async function init() {
  try { await initLanguage(); } catch (_) {}

  if (!sourceText) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results').innerHTML =
      '<p style="color:var(--text-muted);text-align:center;padding:20px;">' + t('translate.no_text') + '</p>';
    return;
  }

  try {
    let src = 'auto', tgt = 'zh-CN';
    try {
      src = (await w.storeGet('sourceLanguage')) || 'auto';
      tgt = (await w.storeGet('targetLanguage')) || 'zh-CN';
    } catch (_) {}

    const result = await w.translate({ text: sourceText, sourceLang: src, targetLang: tgt });
    document.getElementById('loading').style.display = 'none';

    if (!result || !result.success) {
      document.getElementById('results').innerHTML =
        '<p style="color:var(--red);padding:16px;">' + esc(result?.error || 'Translation failed') + '</p>';
      return;
    }

    let html = '';
    for (const r of result.results || []) {
      const label = esc(r.apiLabel || 'API');
      const txt = r.success ? esc(r.translatedText) : '<span style="color:var(--red)">' + esc(r.error || 'Error') + '</span>';
      html += '<div class="result-card">' +
        '<div class="result-header">' +
        '<span class="result-badge">' + label + '</span>' +
        '<div class="row" style="gap:4px;">' +
        '<button class="btn btn-sm btn-secondary" data-copy="' + escAttr(r.translatedText) + '">' + t('translate.copy') + '</button>' +
        '<button class="btn btn-sm btn-secondary" data-speak="' + escAttr(r.translatedText) + '">' + t('translate.speak') + '</button>' +
        '</div></div>' +
        '<div class="result-text">' + txt + '</div></div>';
    }
    document.getElementById('results').innerHTML = html;

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
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results').innerHTML =
      '<p style="color:var(--red);padding:16px;">' + esc(e.message) + '</p>';
  }
})();
