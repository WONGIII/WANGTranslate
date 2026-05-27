const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wangtranslate', {
  translate: (data) => ipcRenderer.invoke('translate', data),
  fetchModels: (config) => ipcRenderer.invoke('fetch-models', config),
  testConnection: (config) => ipcRenderer.invoke('test-connection', config),

  ocrScreenshot: () => ipcRenderer.invoke('ocr-screenshot'),
  ocrSilent: () => ipcRenderer.invoke('ocr-silent'),
  ocrFile: () => ipcRenderer.invoke('ocr-file'),
  runOcr: (imagePath) => ipcRenderer.invoke('run-ocr', imagePath),

  getClipboard: () => ipcRenderer.invoke('get-clipboard'),
  setClipboard: (text) => ipcRenderer.invoke('set-clipboard', text),
  copySelection: () => ipcRenderer.invoke('copy-selection'),

  showTranslateOverlay: (data) => ipcRenderer.invoke('show-translate-overlay', data),
  showOcrOverlay: (data) => ipcRenderer.invoke('show-ocr-overlay', data),
  showInputTranslate: (data) => ipcRenderer.invoke('show-input-translate', data),
  showSettings: () => ipcRenderer.invoke('show-settings'),
  showHistory: () => ipcRenderer.invoke('show-history'),
  hideWindow: () => ipcRenderer.send('hide-window'),

  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  storeGetAll: () => ipcRenderer.invoke('store-get-all'),

  notify: (title, body) => ipcRenderer.send('notify', { title, body }),
  sendScreenshotResult: (data) => ipcRenderer.send('screenshot-result', data),

  onTrayAction: (callback) => { ipcRenderer.on('tray-action', (_, a) => callback(a)); },
  onTrigger: (channel, callback) => { ipcRenderer.on(channel, (_, d) => callback(d)); },
});

// Auto-bind close buttons
function bindAll() {
  document.querySelectorAll('#closeBtn').forEach(btn => {
    btn.addEventListener('click', () => ipcRenderer.send('hide-window'));
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindAll);
else bindAll();
