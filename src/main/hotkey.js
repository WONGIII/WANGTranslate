const { globalShortcut, clipboard, screen, dialog, BrowserWindow } = require('electron');
const { getStore } = require('./store');
const fs = require('fs');

const actionNames = [
  'translateSelection', 'translateInput',
  'ocrScreenshot', 'ocrSilent', 'ocrFile',
];

function hotkeyToString(config) {
  if (!config || !config.key) return null;
  const parts = [];
  if (config.modifiers & 0x2) parts.push('Control');
  if (config.modifiers & 0x4) parts.push('Alt');
  if (config.modifiers & 0x1) parts.push('Shift');
  if (config.modifiers & 0x8) parts.push('Meta');
  parts.push(config.key.charAt(0).toUpperCase() + config.key.slice(1));
  return parts.join('+');
}

function registerHotkeys() {
  const configs = getStore().get('hotkeyConfigs', {}) || {};
  for (const action of actionNames) {
    const config = configs[action];
    const keyStr = hotkeyToString(config);
    if (keyStr) {
      try { globalShortcut.register(keyStr, () => handleHotkeyAction(action)); }
      catch (e) { console.error('Hotkey failed:', action, e.message); }
    }
  }
}
function unregisterHotkeys() { globalShortcut.unregisterAll(); }
function reloadHotkeys() { unregisterHotkeys(); registerHotkeys(); }

function handleHotkeyAction(action) {
  const pos = screen.getCursorScreenPoint();
  const { createOverlayWindow } = require('./window-manager');
  switch (action) {
    case 'translateSelection': doSelectionTranslate(pos); break;
    case 'translateInput': createOverlayWindow('input', { x: pos.x, y: pos.y }); break;
    case 'ocrScreenshot': doOcrScreenshot(pos); break;
    case 'ocrSilent': doOcrSilent(pos); break;
    case 'ocrFile': doFileOcr(pos); break;
  }
}

async function doSelectionTranslate(pos) {
  const { createOverlayWindow } = require('./window-manager');
  const { execSync } = require('child_process');

  // Save clipboard
  const prev = clipboard.readText();

  // Send Ctrl+C immediately via PowerShell (inline, no file dependency)
  try {
    execSync(
      'powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms;[System.Windows.Forms.SendKeys]::SendWait(\'^c\')"',
      { timeout: 3000, stdio: 'ignore' }
    );
  } catch (_) {}

  // Wait for clipboard to receive the text
  await new Promise(r => setTimeout(r, 200));

  const text = clipboard.readText();

  if (text && text.trim() && text !== prev) {
    createOverlayWindow('translate', { x: pos.x, y: pos.y, text: text.trim() });
    // Restore previous clipboard asynchronously
    setTimeout(() => {
      const current = clipboard.readText();
      if (current === text && prev) clipboard.writeText(prev);
    }, 800);
  } else {
    showNotify('No text selected');
  }
}

async function doOcrScreenshot(pos) {
  const { captureScreen } = require('./screenshot');
  const { createOverlayWindow, createScreenshotWindow } = require('./window-manager');

  const fullPath = await captureScreen();
  if (!fullPath) return;
  const croppedPath = await createScreenshotWindow(fullPath);
  try { fs.unlinkSync(fullPath); } catch (_) {}
  if (!croppedPath) return;

  createOverlayWindow('ocr', { x: pos.x, y: pos.y, text: '', imagePath: croppedPath });
}

async function doOcrSilent(pos) {
  const { captureScreen } = require('./screenshot');
  const { createScreenshotWindow } = require('./window-manager');

  const fullPath = await captureScreen();
  if (!fullPath) return;
  const croppedPath = await createScreenshotWindow(fullPath);
  try { fs.unlinkSync(fullPath); } catch (_) {}
  if (!croppedPath) return;

  try {
    const text = await runOcr(croppedPath);
    try { fs.unlinkSync(croppedPath); } catch (_) {}
    if (text) {
      clipboard.writeText(text);
      saveOcrHistory(text);
      showNotify('OCR Complete', 'Text copied.');
    }
  } catch (e) {
    showNotify('Error', e.message);
  }
}

async function doFileOcr(pos) {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'tiff'] }],
  });
  if (result.canceled || result.filePaths.length === 0) return;
  const { createOverlayWindow } = require('./window-manager');
  createOverlayWindow('ocr', { x: pos.x, y: pos.y, text: '', imagePath: result.filePaths[0] });
}

// Called by renderer via IPC to do actual OCR
async function runOcr(imagePath) {
  const { performOCR } = require('./ocr');
  const languages = getStore().get('ocrLanguages', 'eng');
  return await performOCR(imagePath, languages);
}

function showNotify(title, body) {
  const { Notification } = require('electron');
  if (Notification.isSupported()) new Notification({ title, body: body || '' }).show();
}

function saveOcrHistory(text) {
  if (!text) return;
  const store = getStore();
  const history = store.get('ocrHistory', []) || [];
  history.unshift({ id: Date.now().toString(), text, languages: store.get('ocrLanguages', 'eng'), timestamp: new Date().toISOString(), favorite: false });
  if (history.length > 100) history.pop();
  store.set('ocrHistory', history);
}

module.exports = { registerHotkeys, unregisterHotkeys, reloadHotkeys, hotkeyToString, runOcr, handleHotkeyAction };
