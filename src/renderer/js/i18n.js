// WANGTranslate - Internationalization
const I18N = {
  'app.name': { en: 'WANGTranslate', zh: 'WANGTranslate' },
  'app.running': { en: 'Running in system tray', zh: '正在系统托盘运行' },

  'app.title': { en: 'WANGTranslate Settings', zh: 'WANGTranslate 设置' },
  'settings.title': { en: 'Settings', zh: '设置' },
  'settings.general': { en: 'General', zh: '通用' },
  'settings.shortcuts': { en: 'Shortcuts', zh: '快捷键' },
  'settings.api': { en: 'API', zh: 'API' },
  'settings.ocr': { en: 'OCR', zh: 'OCR' },
  'general.language': { en: 'App Language', zh: '软件语言' },
  'general.source_lang': { en: 'Source Language', zh: '源语言' },
  'general.target_lang': { en: 'Target Language', zh: '目标语言' },
  'general.tts': { en: 'Text-to-Speech', zh: '语音朗读' },
  'general.speed': { en: 'Speed', zh: '语速' },
  'general.pitch': { en: 'Pitch', zh: '音调' },
  'general.volume': { en: 'Volume', zh: '音量' },
  'general.startup_label': { en: 'Launch at system startup', zh: '开机时自动启动' },
  'general.startup_desc': { en: 'Automatically start WANGTranslate with Windows', zh: 'Windows 启动时自动运行 WANGTranslate' },

  'shortcuts.title': { en: 'Keyboard Shortcuts', zh: '键盘快捷键' },
  'shortcuts.desc': { en: 'Click "Bind" to set a shortcut, then press your key combination.', zh: '点击"绑定"设置快捷键，然后按下组合键即可。' },
  'shortcuts.not_bound': { en: 'Not bound', zh: '未绑定' },
  'shortcuts.clear': { en: 'Clear', zh: '清除' },
  'shortcuts.press_keys': { en: 'Press keys...', zh: '按下按键...' },

  'shortcuts.action.translateSelection': { en: 'Selection Translate', zh: '划词翻译' },
  'shortcuts.action.translateSelection.desc': { en: 'Translate selected text', zh: '选中文字后按快捷键翻译' },
  'shortcuts.action.translateScreenshot': { en: 'Screenshot Translate', zh: '截图翻译' },
  'shortcuts.action.translateScreenshot.desc': { en: 'Capture area and translate', zh: '截取屏幕区域并翻译' },
  'shortcuts.action.translateInput': { en: 'Input Translate', zh: '输入翻译' },
  'shortcuts.action.translateInput.desc': { en: 'Open translation input box', zh: '打开翻译输入框' },
  'shortcuts.action.ocrScreenshot': { en: 'Screenshot OCR', zh: '截图OCR' },
  'shortcuts.action.ocrScreenshot.desc': { en: 'Capture area for text recognition', zh: '截取区域进行文字识别' },
  'shortcuts.action.ocrSilent': { en: 'Silent OCR', zh: '静默OCR' },
  'shortcuts.action.ocrSilent.desc': { en: 'OCR and copy to clipboard silently', zh: '后台识别并复制到剪贴板' },
  'shortcuts.action.ocrFile': { en: 'File OCR', zh: '选图OCR' },
  'shortcuts.action.ocrFile.desc': { en: 'Select image file for OCR', zh: '选择图片文件进行识别' },

  'api.title': { en: 'AI Translation API', zh: 'AI 翻译 API' },
  'api.desc': { en: 'Configure your AI API endpoints. Enable multiple APIs for comparison.', zh: '配置 AI API 端点。启用多个 API 可对比翻译结果。' },
  'api.add': { en: '+ Custom', zh: '+ 自定义' },
  'api.edit': { en: 'Edit', zh: '编辑' },
  'api.fetch': { en: 'Fetch Models', zh: '获取模型' },
  'api.test': { en: 'Test', zh: '测试' },
  'api.delete': { en: 'Delete', zh: '删除' },
  'api.provider': { en: 'Provider Name', zh: '厂商名称' },
  'api.url': { en: 'API URL', zh: 'API 地址' },
  'api.key': { en: 'API Key (optional)', zh: 'API 密钥 (可空)' },
  'api.model': { en: 'Model Name', zh: '模型名称' },
  'api.save': { en: 'Save', zh: '保存' },
  'api.cancel': { en: 'Cancel', zh: '取消' },
  'api.models_title': { en: 'Available Models', zh: '可用模型' },
  'api.close': { en: 'Close', zh: '关闭' },
  'api.ok': { en: 'Connection successful!', zh: '连接成功！' },
  'api.fail': { en: 'Connection failed: ', zh: '连接失败：' },
  'api.url_needed': { en: 'Please configure the API URL first.', zh: '请先配置 API 地址。' },

  'ocr.title': { en: 'OCR Settings', zh: 'OCR 设置' },
  'ocr.languages': { en: 'Recognition Languages', zh: '识别语言' },
  'ocr.psm': { en: 'Page Segmentation Mode', zh: '页面分割模式' },
  'ocr.continuous': { en: 'Continuous Recognition', zh: '连续识别' },
  'ocr.continuous_desc': { en: 'Append results to the same text box', zh: '将结果拼接在同一个文本框内' },
  'ocr.autocopy': { en: 'Auto Copy', zh: '自动复制' },
  'ocr.autocopy_desc': { en: 'Copy OCR results to clipboard automatically', zh: '自动将识别结果复制到剪贴板' },
  'ocr.smart_para': { en: 'Smart Paragraph', zh: '智能分段' },
  'ocr.smart_para_desc': { en: 'Intelligently restore paragraph structure', zh: '智能还原图片中的段落信息' },

  'translate.copy': { en: 'Copy', zh: '复制' },
  'translate.speak': { en: 'Speak', zh: '朗读' },
  'translate.copied': { en: 'Copied!', zh: '已复制' },
  'translate.no_text': { en: 'No text to translate', zh: '没有要翻译的文字' },
  'translate.placeholder': { en: 'Enter text to translate...', zh: '输入要翻译的文字...' },
  'translate.title': { en: 'Input Translate', zh: '输入翻译' },
  'translate.translate': { en: 'Translate', zh: '翻译' },

  'ocr.result': { en: 'OCR Result', zh: 'OCR 结果' },
  'ocr.no_text': { en: 'No text recognized', zh: '未识别到文字' },
  'ocr.copied': { en: 'Copied to clipboard', zh: '已复制到剪贴板' },

  'lang.auto': { en: 'Auto Detect', zh: '自动检测' },
  'lang.zh-CN': { en: 'Chinese (Simplified)', zh: '简体中文' },
  'lang.zh-TW': { en: 'Chinese (Traditional)', zh: '繁体中文' },
  'lang.en': { en: 'English', zh: '英文' },
  'lang.ja': { en: 'Japanese', zh: '日文' },
  'lang.ko': { en: 'Korean', zh: '韩文' },
  'lang.fr': { en: 'French', zh: '法文' },
  'lang.de': { en: 'German', zh: '德文' },
  'lang.es': { en: 'Spanish', zh: '西班牙文' },
  'lang.ru': { en: 'Russian', zh: '俄文' },
  'lang.pt': { en: 'Portuguese', zh: '葡萄牙文' },
  'lang.it': { en: 'Italian', zh: '意大利文' },

  'history.title': { en: 'History & Favorites', zh: '历史记录与收藏' },
  'history.search': { en: 'Search...', zh: '搜索...' },
  'history.translations': { en: 'Translations', zh: '翻译记录' },
  'history.ocr': { en: 'OCR', zh: 'OCR 记录' },
  'history.favorites': { en: 'Favorites', zh: '收藏夹' },
  'history.empty.translate': { en: 'No translation history', zh: '没有翻译记录' },
  'history.empty.ocr': { en: 'No OCR history', zh: '没有 OCR 记录' },
  'history.empty.favorites': { en: 'No favorites', zh: '没有收藏' },
  'history.empty.search': { en: 'No results found', zh: '没有找到结果' },
  'history.copy': { en: 'Copy', zh: '复制' },
  'history.unfav': { en: 'Unfav', zh: '取消收藏' },
  'history.del': { en: 'Del', zh: '删除' },
};

let currentLang = 'zh';

function t(key) {
  const entry = I18N[key];
  if (!entry) return key;
  return entry[currentLang] || entry['en'] || key;
}

function setLanguage(lang) {
  currentLang = lang || 'zh';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (key) el.placeholder = t(key);
  });
}

async function initLanguage() {
  try {
    if (window.wangtranslate && window.wangtranslate.storeGet) {
      const saved = await window.wangtranslate.storeGet('appLanguage');
      if (saved === 'en' || saved === 'zh') currentLang = saved;
    }
  } catch (_) {
    // wangtranslate not available yet, use default
  }
  setLanguage(currentLang);
}
