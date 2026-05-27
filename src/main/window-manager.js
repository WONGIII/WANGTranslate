const { BrowserWindow, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const windows = new Map();

// Resolve asset path: works in both dev (relative to __dirname) and packaged (extraResources → process.resourcesPath)
function resolveAsset(relativePath) {
  // Packaged: extraResources dumps assets/ into resources/assets/
  const packaged = path.join(process.resourcesPath, relativePath);
  if (fs.existsSync(packaged)) return packaged;
  // Dev: relative to project root
  const dev = path.join(__dirname, '..', '..', relativePath);
  if (fs.existsSync(dev)) return dev;
  // Fallback
  return packaged;
}

// Resolve renderer HTML path: in asar, src/renderer/ is inside the asar
function resolveRenderer(htmlFile) {
  // __dirname in asar = /path/to/app.asar/src/main
  // src/renderer/ is at the same level: /path/to/app.asar/src/renderer/
  const asarPath = path.join(__dirname, '..', 'renderer', htmlFile);
  return asarPath;
}

const iconPath = resolveAsset('assets/icon.png');

function createOverlayWindow(type, data = {}) {
  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { x: cx, y: cy } = data.x !== undefined ? { x: data.x, y: data.y } : cursorPoint;

  let width = 420;
  let height = 300;
  if (type === 'input') { width = 450; height = 400; }
  if (type === 'ocr') { width = 420; height = 300; }
  if (type === 'translate') { width = 420; height = 300; }

  let wx = cx + 12;
  let wy = cy + 12;
  if (wx + width > display.bounds.x + display.bounds.width) wx = display.bounds.x + display.bounds.width - width - 8;
  if (wy + height > display.bounds.y + display.bounds.height) wy = display.bounds.y + display.bounds.height - height - 8;
  if (wx < display.bounds.x) wx = display.bounds.x + 8;
  if (wy < display.bounds.y) wy = display.bounds.y + 8;

  let htmlFile;
  switch (type) {
    case 'translate': htmlFile = 'translate-overlay.html'; break;
    case 'ocr': htmlFile = 'ocr-overlay.html'; break;
    case 'input': htmlFile = 'input-translate.html'; break;
    default: return;
  }

  const win = new BrowserWindow({
    width, height,
    x: Math.round(wx), y: Math.round(wy),
    frame: false, transparent: false,
    alwaysOnTop: true, skipTaskbar: true,
    resizable: false, maximizable: false, minimizable: false, fullscreenable: false,
    backgroundColor: '#FFFFFF', icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, '..', '..', 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
    },
  });

  const parts = [];
  for (const [key, value] of Object.entries(data)) {
    parts.push(`${key}=${encodeURIComponent(value)}`);
  }
  const htmlPath = resolveRenderer(htmlFile);
  const url = 'file:///' + htmlPath.replace(/\\/g, '/') + (parts.length ? '?' + parts.join('&') : '');
  win.loadURL(url);

  win.on('blur', () => { if (type !== 'input' && type !== 'ocr') win.hide(); });
  win.on('hide', () => windows.delete(`${type}-overlay`));
  windows.set(`${type}-overlay`, win);
  return win;
}

function createSettingsWindow() {
  if (windows.has('settings')) {
    const w = windows.get('settings');
    if (w && !w.isDestroyed()) { if (!w.isVisible()) w.show(); w.focus(); return w; }
    windows.delete('settings');
  }

  const win = new BrowserWindow({
    width: 750, height: 580, minWidth: 600, minHeight: 450,
    frame: false, transparent: false, resizable: true,
    maximizable: false, fullscreenable: false,
    backgroundColor: '#FFFFFF', icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, '..', '..', 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
    },
  });

  win.loadURL('file:///' + resolveRenderer('settings.html').replace(/\\/g, '/'));
  win.on('closed', () => windows.delete('settings'));
  windows.set('settings', win);
  return win;
}

function createHistoryWindow() {
  if (windows.has('history')) {
    const w = windows.get('history');
    if (w && !w.isDestroyed()) { if (!w.isVisible()) w.show(); w.focus(); return w; }
    windows.delete('history');
  }

  const win = new BrowserWindow({
    width: 600, height: 650, minWidth: 400, minHeight: 400,
    frame: false, transparent: false, resizable: true,
    maximizable: false, fullscreenable: false,
    backgroundColor: '#FFFFFF', icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, '..', '..', 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
    },
  });

  win.loadURL('file:///' + resolveRenderer('history.html').replace(/\\/g, '/'));
  win.on('closed', () => windows.delete('history'));
  windows.set('history', win);
  return win;
}

function createScreenshotWindow(screenCapturePath) {
  const { ipcMain, nativeImage } = require('electron');
  const display = screen.getPrimaryDisplay();

  const win = new BrowserWindow({
    x: display.bounds.x, y: display.bounds.y,
    width: display.bounds.width, height: display.bounds.height,
    frame: false, transparent: true, alwaysOnTop: true,
    skipTaskbar: true, resizable: false, fullscreen: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, '..', '..', 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
    },
  });

  win.loadURL('file:///' + resolveRenderer('screenshot-select.html').replace(/\\/g, '/') + '?imagePath=' + encodeURIComponent(screenCapturePath));

  return new Promise((resolve) => {
    let settled = false;
    const handler = (_, data) => {
      if (settled) return;
      if (data.type === 'cropped') {
        settled = true;
        try {
          const img = nativeImage.createFromPath(screenCapturePath);
          const imgSize = img.getSize();
          const disp = display.bounds;
          const scaleX = imgSize.width / disp.width;
          const scaleY = imgSize.height / disp.height;
          const rect = {
            x: Math.round(data.rect.x * scaleX),
            y: Math.round(data.rect.y * scaleY),
            width: Math.round(data.rect.width * scaleX),
            height: Math.round(data.rect.height * scaleY),
          };
          const cropped = img.crop(rect);
          const croppedPath = screenCapturePath.replace('.png', '_crop.png');
          fs.writeFileSync(croppedPath, cropped.toPNG());
          win.close();
          resolve(croppedPath);
        } catch (e) {
          win.close();
          resolve(screenCapturePath);
        }
      } else if (data.type === 'cancelled') {
        settled = true; win.close(); resolve(null);
      }
    };
    ipcMain.on('screenshot-result', handler);
    win.on('closed', () => {
      ipcMain.removeListener('screenshot-result', handler);
      if (!settled) { settled = true; resolve(null); }
    });
  });
}

module.exports = { createOverlayWindow, createSettingsWindow, createHistoryWindow, createScreenshotWindow };
