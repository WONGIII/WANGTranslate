const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let tray = null;
let mainWin = null;

const labels = {
  en: {
    selectionTranslate: 'Selection Translate',
    inputTranslate: 'Input Translate',
    screenshotOcr: 'Screenshot OCR',
    silentOcr: 'Silent OCR',
    fileOcr: 'File OCR',
    history: 'History',
    settings: 'Settings',
    exit: 'Exit',
  },
  zh: {
    selectionTranslate: '划词翻译',
    inputTranslate: '输入翻译',
    screenshotOcr: '截图OCR',
    silentOcr: '静默OCR',
    fileOcr: '选图OCR',
    history: '历史记录',
    settings: '设置',
    exit: '退出',
  },
};

function getLang() {
  try {
    const { getStore } = require('./store');
    return getStore().get('appLanguage', 'zh') === 'en' ? 'en' : 'zh';
  } catch (_) {
    return 'zh';
  }
}

function t(key) {
  const lang = getLang();
  return labels[lang]?.[key] || labels.zh[key] || key;
}

function refreshMenu() {
  const menu = Menu.buildFromTemplate([
    { label: t('selectionTranslate'), click: () => triggerAction('translateSelection') },
    { label: t('inputTranslate'), click: () => triggerAction('translateInput') },
    { type: 'separator' },
    { label: t('screenshotOcr'), click: () => triggerAction('ocrScreenshot') },
    { label: t('silentOcr'), click: () => triggerAction('ocrSilent') },
    { label: t('fileOcr'), click: () => triggerAction('ocrFile') },
    { type: 'separator' },
    { label: t('history'), click: () => {
      const { createHistoryWindow } = require('./window-manager');
      createHistoryWindow();
    }},
    { label: t('settings'), click: () => {
      const { createSettingsWindow } = require('./window-manager');
      createSettingsWindow();
    }},
    { type: 'separator' },
    { label: t('exit'), click: () => {
      const { app } = require('electron');
      app.isQuitting = true;
      app.quit();
    }},
  ]);
  tray.setContextMenu(menu);
}

function createTray(mainWindow) {
  mainWin = mainWindow;

  // Locate tray icon: in packaged app, extraResources puts assets/ in resources/
  let iconPath = path.join(process.resourcesPath, 'assets', 'tray-32.png');
  const fs = require('fs');
  if (!fs.existsSync(iconPath)) {
    // Dev fallback
    iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-32.png');
  }
  if (!fs.existsSync(iconPath)) {
    // Last resort: use main icon
    iconPath = path.join(process.resourcesPath, 'assets', 'icon.png');
  }
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);
  tray.setToolTip('WANGTranslate');
  refreshMenu();

  tray.on('click', () => {
    const { createOverlayWindow } = require('./window-manager');
    const { screen } = require('electron');
    const pos = screen.getCursorScreenPoint();
    createOverlayWindow('input', { x: pos.x, y: pos.y });
  });

  tray.on('right-click', () => {
    refreshMenu(); // re-read language each time
    tray.popUpContextMenu();
  });

  return tray;
}

function triggerAction(action) {
  const { screen } = require('electron');
  const pos = screen.getCursorScreenPoint();

  switch (action) {
    case 'translateSelection': {
      // From tray: same as hotkey - simulate Ctrl+C and read clipboard
      const { handleHotkeyAction } = require('./hotkey');
      handleHotkeyAction('translateSelection');
      break;
    }
    case 'translateInput': {
      const { createOverlayWindow } = require('./window-manager');
      createOverlayWindow('input', { x: pos.x, y: pos.y });
      break;
    }
    case 'ocrScreenshot': {
      const { handleHotkeyAction } = require('./hotkey');
      handleHotkeyAction('ocrScreenshot');
      break;
    }
    case 'ocrSilent': {
      const { handleHotkeyAction } = require('./hotkey');
      handleHotkeyAction('ocrSilent');
      break;
    }
    case 'ocrFile': {
      const { handleHotkeyAction } = require('./hotkey');
      handleHotkeyAction('ocrFile');
      break;
    }
  }
}

function triggerFromMain(channel) {
  if (mainWin) {
    mainWin.webContents.send(channel);
  }
}

module.exports = { createTray, refreshMenu };
