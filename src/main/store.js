const Store = require('electron-store');

let _store;

function initStore() {
  _store = new Store({
    defaults: {
      // Translation
      sourceLanguage: 'auto',
      targetLanguage: 'zh-CN',

      // API
      apiConfigs: [],
      enabledApiIndices: [],

      // Hotkeys (all unbound by default)
      hotkeyConfigs: {
        translateSelection: null,
        translateInput: null,
        ocrScreenshot: null,
        ocrSilent: null,
        ocrFile: null,
      },

      // OCR
      ocrLanguages: 'eng',
      ocrPsm: 6,
      ocrContinuous: false,
      ocrAutoCopy: false,
      ocrSmartParagraph: true,

      // TTS
      ttsRate: 0.5,
      ttsPitch: 1.0,
      ttsVolume: 1.0,

      // General
      autoLaunch: false,
      appLanguage: 'zh',

      // History
      translateHistory: [],
      ocrHistory: [],
    },
  });

  // Validate and fix ocrLanguages on every startup
  const validCodes = ['eng','chi_sim','chi_tra','jpn','kor','fra','deu','spa','rus'];
  const currentLangs = _store.get('ocrLanguages', '') || '';
  let parts = currentLangs.split('+').filter(p => validCodes.includes(p));
  if (parts.length === 0) parts = ['eng'];
  const fixed = parts.join('+');
  if (fixed !== currentLangs) {
    console.log('OCR languages corrected:', JSON.stringify(currentLangs), '→', fixed);
    _store.set('ocrLanguages', fixed);
  }
}

function getStore() {
  return _store;
}

module.exports = { initStore, getStore };
