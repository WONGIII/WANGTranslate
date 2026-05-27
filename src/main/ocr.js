const { createWorker } = require('tesseract.js');

let worker = null;
let workerLoadedLanguages = '';

async function getWorker(languages) {
  if (worker && workerLoadedLanguages === languages) {
    return worker;
  }

  if (worker) {
    await worker.terminate();
    worker = null;
  }

  console.log('Creating OCR worker for languages:', languages);

  worker = await createWorker(languages, 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  workerLoadedLanguages = languages;
  console.log('OCR worker ready');
  return worker;
}

async function performOCR(imagePath, languages) {
  console.log('OCR starting for:', imagePath, 'langs:', languages);
  const w = await getWorker(languages);
  const { data } = await w.recognize(imagePath);
  console.log('OCR result length:', (data.text || '').length);
  return (data.text || '').trim();
}

function cleanup() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}

module.exports = { performOCR, cleanup };
