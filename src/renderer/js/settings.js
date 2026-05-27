// Settings page - navigation and sub-page rendering
const w = window.wangtranslate;
const pageContainer = document.getElementById('pageContainer');
const navItems = document.querySelectorAll('.nav-item');

let currentPage = 'general';

// Init i18n first
initLanguage().then(() => {
  renderPage(currentPage);
});

// Navigation
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    currentPage = item.dataset.page;
    renderPage(currentPage);
  });
});

async function renderPage(page) {
  switch (page) {
    case 'general': await renderGeneral(); break;
    case 'shortcuts': await renderShortcuts(); break;
    case 'api': await renderApi(); break;
    case 'ocr': await renderOcr(); break;
  }
  // Apply i18n to new content
  setLanguage(currentLang);
}

// ==================== General Page ====================
async function renderGeneral() {
  const sourceLang = (await w.storeGet('sourceLanguage')) || 'auto';
  const targetLang = (await w.storeGet('targetLanguage')) || 'zh-CN';
  const ttsRate = (await w.storeGet('ttsRate')) || 0.5;
  const ttsPitch = (await w.storeGet('ttsPitch')) || 1.0;
  const ttsVolume = (await w.storeGet('ttsVolume')) || 1.0;
  const autoLaunch = (await w.storeGet('autoLaunch')) || false;
  const appLang = (await w.storeGet('appLanguage')) || 'en';

  const languages = {
    'auto': 'lang.auto', 'zh-CN': 'lang.zh-CN', 'zh-TW': 'lang.zh-TW',
    'en': 'lang.en', 'ja': 'lang.ja', 'ko': 'lang.ko', 'fr': 'lang.fr', 'de': 'lang.de',
    'es': 'lang.es', 'ru': 'lang.ru', 'pt': 'lang.pt', 'it': 'lang.it',
  };

  const targetLangs = Object.entries(languages).filter(([k]) => k !== 'auto');
  const langOptions = Object.entries(languages).map(([k, v]) => `<option value="${k}" ${k === sourceLang ? 'selected' : ''}>${t(v)}</option>`).join('');
  const targetOptions = targetLangs.map(([k, v]) => `<option value="${k}" ${k === targetLang ? 'selected' : ''}>${t(v)}</option>`).join('');

  pageContainer.innerHTML = `
    <h2 data-i18n="settings.general">General</h2>

    <div class="section">
      <h3 data-i18n="general.language">App Language</h3>
      <select id="appLang" style="max-width:200px;">
        <option value="en" ${appLang === 'en' ? 'selected' : ''}>English</option>
        <option value="zh" ${appLang === 'zh' ? 'selected' : ''}>中文</option>
      </select>
    </div>

    <div class="section">
      <h3 data-i18n="general.translation_languages" style="display:none;"></h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px;">
        <div>
          <div class="label" data-i18n="general.source_lang">Source Language</div>
          <select id="sourceLang">${langOptions}</select>
        </div>
        <div>
          <div class="label" data-i18n="general.target_lang">Target Language</div>
          <select id="targetLang">${targetOptions}</select>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 data-i18n="general.tts">Text-to-Speech</h3>
      ${slider('general.speed', 'ttsRate', ttsRate, 0, 1, 0.05)}
      ${slider('general.pitch', 'ttsPitch', ttsPitch, 0.5, 2, 0.1)}
      ${slider('general.volume', 'ttsVolume', ttsVolume, 0, 1, 0.1)}
    </div>

    <div class="section">
      <div class="card" style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="color:var(--text);font-size:13px;" data-i18n="general.startup_label">Launch at system startup</div>
          <div style="font-size:11px;color:var(--text-muted);" data-i18n="general.startup_desc">Automatically start WANGTranslate with Windows</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="autoLaunch" ${autoLaunch ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  `;

  // Event bindings
  document.getElementById('sourceLang').onchange = (e) => w.storeSet('sourceLanguage', e.target.value);
  document.getElementById('targetLang').onchange = (e) => w.storeSet('targetLanguage', e.target.value);
  document.getElementById('autoLaunch').onchange = (e) => w.storeSet('autoLaunch', e.target.checked);
  document.getElementById('ttsRate').oninput = (e) => w.storeSet('ttsRate', parseFloat(e.target.value));
  document.getElementById('ttsPitch').oninput = (e) => w.storeSet('ttsPitch', parseFloat(e.target.value));
  document.getElementById('ttsVolume').oninput = (e) => w.storeSet('ttsVolume', parseFloat(e.target.value));
  document.getElementById('appLang').onchange = (e) => {
    w.storeSet('appLanguage', e.target.value);
    setLanguage(e.target.value);
    renderPage('general');
    // Also update nav items
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
  };

  setLanguage(currentLang);
}

function slider(key, id, value, min, max, step) {
  return `<div style="margin-bottom:10px;">
    <div class="row">
      <span style="width:50px;font-size:12px;color:var(--text-dim);" data-i18n="${key}">${t(key)}</span>
      <input type="range" id="${id}" value="${value}" min="${min}" max="${max}" step="${step}" style="flex:1;">
      <span style="width:30px;text-align:right;font-size:12px;color:var(--text-dim);" id="${id}Val">${value}</span>
    </div>
  </div>`;
}

// ==================== Shortcuts Page ====================
async function renderShortcuts() {
  const configs = (await w.storeGet('hotkeyConfigs')) || {};

  const actions = [
    { id: 'translateSelection', i18nName: 'shortcuts.action.translateSelection', i18nDesc: 'shortcuts.action.translateSelection.desc' },
    { id: 'translateInput', i18nName: 'shortcuts.action.translateInput', i18nDesc: 'shortcuts.action.translateInput.desc' },
    { id: 'ocrScreenshot', i18nName: 'shortcuts.action.ocrScreenshot', i18nDesc: 'shortcuts.action.ocrScreenshot.desc' },
    { id: 'ocrSilent', i18nName: 'shortcuts.action.ocrSilent', i18nDesc: 'shortcuts.action.ocrSilent.desc' },
    { id: 'ocrFile', i18nName: 'shortcuts.action.ocrFile', i18nDesc: 'shortcuts.action.ocrFile.desc' },
  ];

  let html = `<h2 data-i18n="shortcuts.title">Keyboard Shortcuts</h2>`;
  html += `<p style="color:var(--text-dim);font-size:12px;margin-bottom:16px;" data-i18n="shortcuts.desc"></p>`;

  for (const action of actions) {
    const config = configs[action.id];
    const isBound = config && config.key;
    const display = isBound ? shortcutDisplay(config) : t('shortcuts.not_bound');

    html += `
      <div class="card" style="display:flex;align-items:center;gap:12px;">
        <div style="flex:1;">
          <div style="color:var(--text);font-size:13px;" data-i18n="${action.i18nName}">${t(action.i18nName)}</div>
          <div style="color:var(--text-muted);font-size:11px;" data-i18n="${action.i18nDesc}">${t(action.i18nDesc)}</div>
        </div>
        <button class="shortcut-btn ${isBound ? 'bound' : ''}" data-action="${action.id}" id="btn-${action.id}">${display}</button>
        ${isBound ? `<button class="btn btn-sm btn-danger" data-action="${action.id}" data-clear="1" data-i18n="shortcuts.clear">${t('shortcuts.clear')}</button>` : ''}
      </div>`;
  }

  pageContainer.innerHTML = html;

  document.querySelectorAll('.shortcut-btn').forEach(btn => {
    btn.addEventListener('click', () => startListening(btn.dataset.action));
  });
  document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => clearShortcut(btn.dataset.action));
  });

  setLanguage(currentLang);
}

function shortcutDisplay(config) {
  const parts = [];
  if (config.modifiers & 0x2) parts.push('Ctrl');
  if (config.modifiers & 0x4) parts.push('Alt');
  if (config.modifiers & 0x1) parts.push('Shift');
  if (config.modifiers & 0x8) parts.push('Win');
  if (config.key) parts.push(config.key.toUpperCase());
  return parts.join('+');
}

let listeningAction = null;
let listeningModifiers = '';
let listeningKey = '';

function startListening(action) {
  listeningAction = action;
  listeningModifiers = '';
  listeningKey = '';
  const btn = document.getElementById(`btn-${action}`);
  btn.classList.add('listening');
  btn.textContent = t('shortcuts.press_keys');
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('click', stopListeningCapture, true);
}

function onKeyDown(e) {
  e.preventDefault(); e.stopPropagation();
  const mods = [];
  if (e.ctrlKey) mods.push('Ctrl');
  if (e.altKey) mods.push('Alt');
  if (e.shiftKey) mods.push('Shift');
  if (e.metaKey) mods.push('Win');
  listeningModifiers = mods.join('+');
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
  listeningKey = e.key;
  const btn = document.getElementById(`btn-${listeningAction}`);
  const display = listeningKey ? `${listeningModifiers}+${listeningKey.toUpperCase()}`.replace(/^\+/, '') : t('shortcuts.press_keys');
  btn.textContent = display;
  setTimeout(() => saveShortcut(), 200);
}

function onKeyUp(e) {}

async function saveShortcut() {
  const modifiers = { 'Ctrl': 0x2, 'Alt': 0x4, 'Shift': 0x1, 'Win': 0x8 };
  let modValue = 0;
  for (const mod of listeningModifiers.split('+').filter(Boolean)) {
    modValue |= modifiers[mod] || 0;
  }
  const config = { modifiers: modValue, key: listeningKey.toUpperCase(), keyCode: 0 };
  const allConfigs = (await w.storeGet('hotkeyConfigs')) || {};
  allConfigs[listeningAction] = config;
  await w.storeSet('hotkeyConfigs', allConfigs);
  stopListening();
  renderShortcuts();
}

async function clearShortcut(action) {
  const allConfigs = (await w.storeGet('hotkeyConfigs')) || {};
  allConfigs[action] = null;
  await w.storeSet('hotkeyConfigs', allConfigs);
  renderShortcuts();
}

function stopListening() {
  if (!listeningAction) return;
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp);
  document.removeEventListener('click', stopListeningCapture, true);
  listeningAction = null;
}

function stopListeningCapture(e) {
  const btn = document.getElementById(`btn-${listeningAction}`);
  if (btn && !btn.contains(e.target)) { stopListening(); renderShortcuts(); }
}

// ==================== API Page ====================
async function renderApi() {
  const apiConfigs = (await w.storeGet('apiConfigs')) || [];
  const enabledIndices = (await w.storeGet('enabledApiIndices')) || [];

  let html = `<h2 data-i18n="api.title">AI Translation API</h2>`;
  html += `<p style="color:var(--text-dim);font-size:12px;margin-bottom:8px;" data-i18n="api.desc"></p>`;
  html += `
    <div class="row" style="gap:8px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="btn btn-secondary btn-sm" onclick="addPreset('openai', 'https://api.openai.com/v1')">+ OpenAI</button>
      <button class="btn btn-secondary btn-sm" onclick="addPreset('lmstudio', 'http://localhost:1234/v1')">+ LM Studio</button>
      <button class="btn btn-secondary btn-sm" onclick="addPreset('ollama', 'http://localhost:11434/v1')">+ Ollama</button>
      <button class="btn btn-secondary btn-sm" onclick="showAddDialog()" data-i18n="api.add">+ Custom</button>
    </div>`;

  for (let i = 0; i < apiConfigs.length; i++) {
    const config = apiConfigs[i];
    const enabled = enabledIndices.includes(i);
    html += `
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <span style="color:var(--text);">${config.provider || 'Custom'}${config.model ? ` (${config.model})` : ''}</span>
            <div style="font-size:11px;color:var(--text-muted);">${config.baseUrl || 'No URL'}</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${enabled ? 'checked' : ''} onchange="toggleApi(${i}, this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="row" style="gap:6px;margin-top:8px;">
          <button class="btn btn-sm btn-secondary" onclick="showEditDialog(${i})" data-i18n="api.edit"></button>
          <button class="btn btn-sm btn-secondary" onclick="fetchModels(${i})" data-i18n="api.fetch"></button>
          <button class="btn btn-sm btn-secondary" onclick="testConnection(${i})" data-i18n="api.test"></button>
          <button class="btn btn-sm btn-danger" onclick="deleteConfig(${i})" data-i18n="api.delete"></button>
        </div>
      </div>`;
  }

  pageContainer.innerHTML = html;
  setLanguage(currentLang);

  window.addPreset = addPreset;
  window.showAddDialog = showAddDialog;
  window.showEditDialog = showEditDialog;
  window.deleteConfig = deleteConfig;
  window.toggleApi = toggleApi;
  window.fetchModels = fetchModels;
  window.testConnection = testConnection;
}

async function addPreset(provider, baseUrl) {
  const configs = (await w.storeGet('apiConfigs')) || [];
  configs.push({ provider, baseUrl, apiKey: '', model: '' });
  await w.storeSet('apiConfigs', configs);
  const enabled = (await w.storeGet('enabledApiIndices')) || [];
  enabled.push(configs.length - 1);
  await w.storeSet('enabledApiIndices', enabled);
  renderApi();
}

async function showAddDialog() { showApiDialog(null); }
async function showEditDialog(index) {
  const configs = (await w.storeGet('apiConfigs')) || [];
  showApiDialog(index, configs[index]);
}

function showApiDialog(index, existing) {
  const config = existing || { provider: 'custom', baseUrl: '', apiKey: '', model: '' };
  const dialog = document.createElement('div');
  dialog.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;z-index:1000;';
  dialog.innerHTML = `
    <div style="background:var(--bg);border-radius:12px;padding:20px;width:400px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.15);">
      <h3 style="margin-bottom:16px;">${index !== null ? t('api.edit') : t('api.title')}</h3>
      <div class="col" style="gap:10px;">
        <div><div class="label" data-i18n="api.provider">Provider Name</div><input id="dlgProvider" value="${config.provider}"></div>
        <div><div class="label" data-i18n="api.url">API URL</div><input id="dlgUrl" value="${config.baseUrl}"></div>
        <div><div class="label" data-i18n="api.key">API Key (optional)</div><input id="dlgKey" value="${config.apiKey}" type="password"></div>
        <div><div class="label" data-i18n="api.model">Model Name</div><input id="dlgModel" value="${config.model}"></div>
      </div>
      <div class="row" style="justify-content:flex-end;gap:8px;margin-top:16px;">
        <button class="btn btn-secondary" onclick="this.closest('[style*=fixed]').remove()" data-i18n="api.cancel">Cancel</button>
        <button class="btn btn-primary" id="dlgSave" data-i18n="api.save">Save</button>
      </div>
    </div>`;
  document.body.appendChild(dialog);
  setLanguage(currentLang);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });

  document.getElementById('dlgSave').onclick = async () => {
    const newConfig = {
      provider: document.getElementById('dlgProvider').value.trim(),
      baseUrl: document.getElementById('dlgUrl').value.trim(),
      apiKey: document.getElementById('dlgKey').value.trim(),
      model: document.getElementById('dlgModel').value.trim(),
    };
    const configs = (await w.storeGet('apiConfigs')) || [];
    if (index !== null) {
      configs[index] = newConfig;
    } else {
      configs.push(newConfig);
      const enabled = (await w.storeGet('enabledApiIndices')) || [];
      enabled.push(configs.length - 1);
      await w.storeSet('enabledApiIndices', enabled);
    }
    await w.storeSet('apiConfigs', configs);
    dialog.remove();
    renderApi();
  };
}

async function deleteConfig(index) {
  const configs = (await w.storeGet('apiConfigs')) || [];
  configs.splice(index, 1);
  await w.storeSet('apiConfigs', configs);
  const enabled = (await w.storeGet('enabledApiIndices')) || [];
  await w.storeSet('enabledApiIndices', enabled.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  renderApi();
}

async function toggleApi(index, checked) {
  const enabled = (await w.storeGet('enabledApiIndices')) || [];
  if (checked) { if (!enabled.includes(index)) enabled.push(index); }
  else { const idx = enabled.indexOf(index); if (idx >= 0) enabled.splice(idx, 1); }
  await w.storeSet('enabledApiIndices', enabled);
}

async function fetchModels(index) {
  const configs = (await w.storeGet('apiConfigs')) || [];
  if (!configs[index]?.baseUrl) { showToast(t('api.url_needed'), 'error'); return; }
  try {
    const result = await w.fetchModels(configs[index]);
    if (result.success) { showModelsDialog(index, result.models); }
    else { showToast(t('api.fail') + result.error, 'error'); }
  } catch (e) { showToast(t('api.fail') + e.message, 'error'); }
}

async function testConnection(index) {
  const configs = (await w.storeGet('apiConfigs')) || [];
  if (!configs[index]?.baseUrl) { showToast(t('api.url_needed'), 'error'); return; }
  try {
    const result = await w.testConnection(configs[index]);
    showToast(result.success ? t('api.ok') : t('api.fail') + result.error, result.success ? 'success' : 'error');
  } catch (e) { showToast(t('api.fail') + e.message, 'error'); }
}

function showModelsDialog(index, models) {
  let listHtml = '';
  for (const model of models) {
    listHtml += `<div style="padding:6px 8px;cursor:pointer;border-radius:4px;font-size:12px;color:var(--text);" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'" onclick="selectModel(${index}, '${model.replace(/'/g, "\\'")}')">${model}</div>`;
  }

  const dialog = document.createElement('div');
  dialog.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;z-index:1000;';
  dialog.innerHTML = `
    <div style="background:var(--bg);border-radius:12px;padding:20px;width:350px;box-shadow:0 8px 32px rgba(0,0,0,0.15);">
      <h3 style="margin-bottom:12px;" data-i18n="api.models_title">Available Models</h3>
      <div class="col" style="gap:2px;max-height:300px;overflow-y:auto;">${listHtml}</div>
      <button class="btn btn-secondary" style="margin-top:12px;width:100%;" onclick="this.closest('[style*=fixed]').remove()" data-i18n="api.close">Close</button>
    </div>`;
  document.body.appendChild(dialog);
  setLanguage(currentLang);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });

  window.selectModel = async (idx, model) => {
    const configs = (await w.storeGet('apiConfigs')) || [];
    if (configs[idx]) { configs[idx].model = model; await w.storeSet('apiConfigs', configs); }
    dialog.remove();
    renderApi();
  };
}

// ==================== OCR Page ====================
async function renderOcr() {
  const ocrLanguages = (await w.storeGet('ocrLanguages')) || 'eng+chi_sim+chi_tra+jpn+kor+fra+deu+spa+rus';
  const ocrPsm = (await w.storeGet('ocrPsm')) || 6;
  const ocrContinuous = (await w.storeGet('ocrContinuous')) || false;
  const ocrAutoCopy = (await w.storeGet('ocrAutoCopy')) || false;
  const ocrSmartParagraph = (await w.storeGet('ocrSmartParagraph')) || true;

  const langs = {
    'eng': 'English', 'chi_sim': 'Simplified Chinese', 'chi_tra': 'Traditional Chinese',
    'jpn': 'Japanese', 'kor': 'Korean', 'fra': 'French', 'deu': 'German',
    'spa': 'Spanish', 'rus': 'Russian',
  };

  const selected = ocrLanguages.split('+').filter(Boolean);

  let html = `<h2 data-i18n="ocr.title">OCR Settings</h2>`;
  html += `<div class="section"><h3 data-i18n="ocr.languages">Recognition Languages</h3><div class="col" style="gap:2px;">`;
  for (const [code, name] of Object.entries(langs)) {
    const checked = selected.includes(code);
    html += `<label class="card" style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 14px;">
      <input type="checkbox" value="${code}" ${checked ? 'checked' : ''} onchange="updateOcrLangs()" style="width:auto;">
      <span style="font-size:13px;">${name}</span></label>`;
  }
  html += `</div></div>`;

  html += `
    <div class="section">
      <h3 data-i18n="ocr.psm">Page Segmentation Mode</h3>
      <select id="ocrPsm">
        <option value="6" ${ocrPsm == 6 ? 'selected' : ''}>6 - Single uniform block (recommended)</option>
        <option value="3" ${ocrPsm == 3 ? 'selected' : ''}>3 - Fully automatic</option>
        <option value="4" ${ocrPsm == 4 ? 'selected' : ''}>4 - Single column</option>
        <option value="7" ${ocrPsm == 7 ? 'selected' : ''}>7 - Single line</option>
        <option value="1" ${ocrPsm == 1 ? 'selected' : ''}>1 - Auto with OSD</option>
      </select>
    </div>
    ${toggleRow('ocr.continuous', 'ocr.continuous_desc', 'ocrContinuous', ocrContinuous)}
    ${toggleRow('ocr.autocopy', 'ocr.autocopy_desc', 'ocrAutoCopy', ocrAutoCopy)}
    ${toggleRow('ocr.smart_para', 'ocr.smart_para_desc', 'ocrSmartParagraph', ocrSmartParagraph)}
  `;

  pageContainer.innerHTML = html;
  setLanguage(currentLang);

  document.getElementById('ocrPsm').onchange = (e) => w.storeSet('ocrPsm', parseInt(e.target.value));
  document.getElementById('ocrContinuous').onchange = (e) => w.storeSet('ocrContinuous', e.target.checked);
  document.getElementById('ocrAutoCopy').onchange = (e) => w.storeSet('ocrAutoCopy', e.target.checked);
  document.getElementById('ocrSmartParagraph').onchange = (e) => w.storeSet('ocrSmartParagraph', e.target.checked);

  window.updateOcrLangs = async () => {
    const valid = ['eng','chi_sim','chi_tra','jpn','kor','fra','deu','spa','rus'];
    const checked = [...document.querySelectorAll('#pageContainer input[type=checkbox]:checked')]
      .map(c => c.value)
      .filter(v => valid.includes(v));
    await w.storeSet('ocrLanguages', checked.length ? checked.join('+') : 'eng');
    renderOcr(); // re-render to fix checkboxes
  };
}

function toggleRow(key, descKey, id, checked) {
  return `<div class="section"><div class="card" style="display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="color:var(--text);font-size:13px;" data-i18n="${key}">${t(key)}</div>
      <div style="font-size:11px;color:var(--text-muted);" data-i18n="${descKey}">${t(descKey)}</div>
    </div>
    <label class="toggle">
      <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
      <span class="toggle-slider"></span>
    </label>
  </div></div>`;
}

function showToast(msg, type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type || ''}`;
  toast.textContent = msg;
  toast.style.position = 'fixed';
  toast.style.top = '12px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}
