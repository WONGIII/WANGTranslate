const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, clipboard, screen, nativeImage, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { initStore, getStore } = require('./src/main/store');
const { createTray, updateTrayMenu } = require('./src/main/tray');
const { registerHotkeys, unregisterHotkeys, reloadHotkeys, runOcr } = require('./src/main/hotkey');
const { createOverlayWindow, createSettingsWindow, createHistoryWindow, createScreenshotWindow } = require('./src/main/window-manager');
const { performOCR } = require('./src/main/ocr');
const { translateText, fetchModels } = require('./src/main/translate');
const { captureScreen, cropImage } = require('./src/main/screenshot');

let mainWindow = null;
let tray = null;

// ==================== App Lifecycle ====================

app.whenReady().then(async () => {
  initStore();
  createMainWindow();
  tray = createTray(mainWindow);
  registerHotkeys();
  setupIPC();

  // Open settings on first launch so user can configure API & shortcuts
  createSettingsWindow();

  // Auto launch - sync with stored setting
  try {
    const AutoLaunch = require('auto-launch');
    const autoLauncher = new AutoLaunch({ name: 'WANGTranslate' });
    const shouldLaunch = getStore().get('autoLaunch', false);
    const isEnabled = await autoLauncher.isEnabled();
    if (shouldLaunch && !isEnabled) {
      await autoLauncher.enable();
    } else if (!shouldLaunch && isEnabled) {
      await autoLauncher.disable();
    }
  } catch (_) {}
});

app.on('window-all-closed', (e) => {
  // Don't quit; keep running in tray
  e.preventDefault();
});

app.on('will-quit', () => {
  unregisterHotkeys();
});

// ==================== Main Window ====================

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 200,
    show: false,
    skipTaskbar: true,
    resizable: false,
    frame: false,
    transparent: false,
    focusable: false,
    backgroundColor: '#FFFFFF',
    icon: path.join(process.resourcesPath, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // __dirname in asar = app.asar/, src/renderer/index.html is inside asar
  mainWindow.loadURL('file:///' + path.join(__dirname, 'src', 'renderer', 'index.html').replace(/\\/g, '/'));

  // Prevent close, hide to tray instead
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

// ==================== IPC Handlers ====================

function setupIPC() {
  // Translation
  ipcMain.handle('translate', async (_, { text, sourceLang, targetLang }) => {
    try {
      const apis = getStore().get('apiConfigs', []);
      const enabledIndices = getStore().get('enabledApiIndices', []);
      const enabled = enabledIndices.map(i => apis[i]).filter(Boolean);

      if (enabled.length === 0) {
        return { success: false, error: 'No API configured. Please set up an API in Settings.' };
      }

      const results = await Promise.all(enabled.map(async (config) => {
        const apiLabel = `${config.provider} (${config.model})`;
        try {
          const translated = await translateText({
            text,
            config,
            sourceLang: sourceLang || 'auto',
            targetLang: targetLang || 'zh-CN',
          });
          // Save to history
          saveTranslateHistory(text, translated, sourceLang || 'auto', targetLang || 'zh-CN', apiLabel);
          return { success: true, translatedText: translated, apiLabel };
        } catch (e) {
          return { success: false, error: e.message, apiLabel };
        }
      }));

      return { success: true, results };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // Fetch models
  ipcMain.handle('fetch-models', async (_, config) => {
    try {
      const models = await fetchModels(config);
      return { success: true, models };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // Test API connection
  ipcMain.handle('test-connection', async (_, config) => {
    try {
      await translateText({
        text: 'Hello',
        config,
        sourceLang: 'en',
        targetLang: 'zh-CN',
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // OCR
  ipcMain.handle('ocr-screenshot', async () => {
    try {
      mainWindow.hide();
      // Step 1: capture screen
      const fullCapturePath = await captureScreen();
      if (!fullCapturePath) {
        mainWindow.show();
        return { success: false, error: 'Screenshot failed' };
      }

      // Step 2: let user select region
      const croppedPath = await createScreenshotWindow(fullCapturePath);
      try { fs.unlinkSync(fullCapturePath); } catch (_) {}

      if (!croppedPath) {
        mainWindow.show();
        return { success: false, error: 'Screenshot cancelled' };
      }

      const languages = getStore().get('ocrLanguages', 'eng+chi_sim+chi_tra+jpn+kor+fra+deu+spa+rus');
      const text = await performOCR(croppedPath, languages);
      try { fs.unlinkSync(croppedPath); } catch (_) {}

      if (getStore().get('ocrAutoCopy', false)) {
        clipboard.writeText(text);
      }
      saveOcrHistory(text, languages);

      return { success: true, text };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('ocr-silent', async () => {
    try {
      mainWindow.hide();
      const fullCapturePath = await captureScreen();
      if (!fullCapturePath) {
        mainWindow.show();
        return { success: false, error: 'Screenshot failed' };
      }

      const croppedPath = await createScreenshotWindow(fullCapturePath);
      try { fs.unlinkSync(fullCapturePath); } catch (_) {}

      if (!croppedPath) {
        mainWindow.show();
        return { success: false, error: 'Screenshot cancelled' };
      }

      const languages = getStore().get('ocrLanguages', 'eng+chi_sim');
      const text = await performOCR(croppedPath, languages);
      try { fs.unlinkSync(croppedPath); } catch (_) {}

      if (text) {
        clipboard.writeText(text);
        saveOcrHistory(text, languages);
      }

      mainWindow.show();
      return { success: true, text };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('ocr-file', async () => {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'tiff'] }],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'No file selected' };
    }
    try {
      const languages = getStore().get('ocrLanguages', 'eng+chi_sim');
      const text = await performOCR(result.filePaths[0], languages);
      saveOcrHistory(text, languages);
      return { success: true, text };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // Clipboard
  ipcMain.handle('get-clipboard', () => clipboard.readText());
  ipcMain.handle('set-clipboard', (_, text) => clipboard.writeText(text));


  // Window management
  ipcMain.handle('show-translate-overlay', (_, { text, x, y }) => {
    const pos = (x > 0 && y > 0) ? { x, y } : screen.getCursorScreenPoint();
    createOverlayWindow('translate', { text, x: pos.x, y: pos.y });
  });

  ipcMain.handle('show-ocr-overlay', (_, { text, x, y }) => {
    const pos = (x > 0 && y > 0) ? { x, y } : screen.getCursorScreenPoint();
    createOverlayWindow('ocr', { text, x: pos.x, y: pos.y });
  });

  ipcMain.handle('show-input-translate', (_, { x, y }) => {
    createOverlayWindow('input', { x, y });
  });

  ipcMain.handle('show-settings', () => createSettingsWindow());
  ipcMain.handle('show-history', () => createHistoryWindow());

  // OCR from renderer: overlay calls this with the imagePath to get text
  ipcMain.handle('run-ocr', async (_, imagePath) => {
    try {
      const text = await runOcr(imagePath);
      // Save history
      if (text) {
        const h = getStore().get('ocrHistory', []) || [];
        h.unshift({ id: Date.now().toString(), text, languages: getStore().get('ocrLanguages', 'eng'), timestamp: new Date().toISOString(), favorite: false });
        if (h.length > 100) h.pop();
        getStore().set('ocrHistory', h);
        if (getStore().get('ocrAutoCopy', false)) clipboard.writeText(text);
      }
      return { success: true, text };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.on('hide-window', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.hide();
  });

  ipcMain.on('notify', (_, { title, body }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });

  // Settings store
  ipcMain.handle('store-get', (_, key) => getStore().get(key));
  ipcMain.handle('store-set', async (_, key, value) => {
    getStore().set(key, value);
    if (key === 'hotkeyConfigs') reloadHotkeys();
    if (key === 'autoLaunch') {
      try {
        const AutoLaunch = require('auto-launch');
        const al = new AutoLaunch({ name: 'WANGTranslate' });
        if (value) await al.enable();
        else await al.disable();
      } catch (_) {}
    }
    return true;
  });
  ipcMain.handle('store-get-all', () => getStore().store);
}

function saveOcrHistory(text, languages) {
  if (!text) return;
  const history = getStore().get('ocrHistory', []);
  history.unshift({
    id: Date.now().toString(),
    text,
    languages,
    timestamp: new Date().toISOString(),
    favorite: false,
  });
  if (history.length > 100) history.pop();
  getStore().set('ocrHistory', history);
}

function saveTranslateHistory(sourceText, translatedText, sourceLang, targetLang, apiLabel) {
  if (!translatedText) return;
  const history = getStore().get('translateHistory', []);
  history.unshift({
    id: Date.now().toString(),
    sourceText,
    translatedText,
    sourceLanguage: sourceLang || 'auto',
    targetLanguage: targetLang || 'zh-CN',
    apiLabel,
    timestamp: new Date().toISOString(),
    favorite: false,
  });
  if (history.length > 100) history.pop();
  getStore().set('translateHistory', history);
}
