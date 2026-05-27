// Main window JS - handles actions from tray/hotkey triggers

const w = window.wangtranslate;

// Listen for tray action triggers
w.onTrigger('trigger-selection-translate', async (data) => {
  handleSelectionTranslate(data);
});

w.onTrigger('trigger-screenshot-translate', async (data) => {
  handleScreenshotTranslate(data);
});

w.onTrigger('trigger-ocr-screenshot', async (data) => {
  handleOcrScreenshot(data);
});

w.onTrigger('trigger-ocr-silent', async (data) => {
  handleOcrSilent(data);
});

w.onTrigger('start-ocr-screenshot', async () => {
  const result = await w.ocrScreenshot();
  if (result.success) {
    w.showOcrOverlay({ text: result.text, x: 0, y: 0 });
  } else {
    notify('OCR Failed', result.error || 'No text recognized');
  }
});

w.onTrigger('start-ocr-silent', async () => {
  const result = await w.ocrSilent();
  if (result.success && result.text) {
    notify('OCR Complete', 'Text copied to clipboard.');
  }
});

async function handleSelectionTranslate(data) {
  try {
    // Get text from clipboard
    const text = await w.copySelection();
    if (!text || !text.trim()) {
      notify('No Text', 'Please select text first and try again.');
      return;
    }
    w.showTranslateOverlay({ text: text.trim(), x: data.x, y: data.y });
  } catch (e) {
    notify('Error', 'Failed to get selected text. Use Input Translate instead.');
    w.showInputTranslate({ x: data.x, y: data.y });
  }
}

async function handleScreenshotTranslate(data) {
  try {
    const result = await w.ocrScreenshot();
    if (!result.success || !result.text) {
      notify('No Text', 'Could not recognize text in the selected area.');
      return;
    }
    w.showTranslateOverlay({ text: result.text, x: data.x, y: data.y });
  } catch (e) {
    notify('Error', 'Screenshot translation failed.');
  }
}

async function handleOcrScreenshot(data) {
  const result = await w.ocrScreenshot();
  if (result.success) {
    w.showOcrOverlay({ text: result.text, x: data.x, y: data.y });
  } else {
    notify('OCR Failed', result.error || 'No text recognized');
  }
}

async function handleOcrSilent() {
  const result = await w.ocrSilent();
  if (result.success && result.text) {
    notify('OCR Complete', 'Text copied to clipboard.');
  }
}

function notify(title, body) {
  w.notify(title, body);
}

console.log('WANGTranslate main window ready');
