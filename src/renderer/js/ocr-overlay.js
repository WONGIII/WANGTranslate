const w = window.wangtranslate;
const qs = window.location.search.substring(1);
const p = {};
qs.split('&').forEach(pair => { const [k, v] = pair.split('='); if (k) p[k] = decodeURIComponent(v || ''); });
const imagePath = p['imagePath'] || '';

let ocrDone = false;

(async () => {
  try { await initLanguage(); } catch (_) {}
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.dataset.i18n) el.textContent = t(el.dataset.i18n);
  });
})();

document.getElementById('copyBtn').addEventListener('click', async () => {
  const text = document.getElementById('ocrText').textContent;
  if (text && ocrDone) {
    await w.setClipboard(text);
    const b = document.getElementById('copyBtn');
    b.textContent = t('translate.copied');
    setTimeout(() => { b.textContent = t('translate.copy'); }, 1500);
  }
});

document.getElementById('translateBtn').addEventListener('click', async () => {
  const text = document.getElementById('ocrText').textContent;
  if (text && ocrDone) await w.showTranslateOverlay({ text, x: 0, y: 0 });
});

(async function doOcr() {
  if (!imagePath) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('ocrText').textContent = t('ocr.no_text');
    return;
  }
  try {
    const result = await w.runOcr(imagePath);
    document.getElementById('loading').style.display = 'none';
    if (result.success && result.text) {
      document.getElementById('ocrText').textContent = result.text;
      ocrDone = true;
    } else {
      document.getElementById('ocrText').textContent = result.error || t('ocr.no_text');
    }
  } catch (e) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('ocrText').textContent = 'Error: ' + e.message;
  }
})();
