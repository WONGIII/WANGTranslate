const { desktopCapturer, screen } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function captureScreen() {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: screen.getPrimaryDisplay().workAreaSize,
  });

  if (sources.length === 0) {
    throw new Error('No screen sources found');
  }

  const screenshot = sources[0].thumbnail;
  const tempPath = path.join(os.tmpdir(), `wangtranslate_${Date.now()}.png`);
  fs.writeFileSync(tempPath, screenshot.toPNG());
  return tempPath;
}

function cropImage(imagePath, rect) {
  // rect: { x, y, width, height }
  // For the screenshot selection, we let the renderer handle cropping
  // by passing the crop coordinates back
  const { nativeImage } = require('electron');
  const img = nativeImage.createFromPath(imagePath);
  const cropped = img.crop(rect);
  const tempPath = path.join(os.tmpdir(), `wangtranslate_crop_${Date.now()}.png`);
  fs.writeFileSync(tempPath, cropped.toPNG());
  return tempPath;
}

module.exports = { captureScreen, cropImage };
