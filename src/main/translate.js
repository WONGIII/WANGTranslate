const TRANSLATE_SYSTEM_PROMPT = `You are a professional translator. Your task is to translate the text provided by the user.

Rules you must follow strictly:
1. ONLY output the translated text — nothing else
2. Do NOT add explanations, notes, disclaimers, or any additional text
3. Do NOT output the original text
4. Do NOT ask questions or engage in conversation
5. Preserve the formatting, line breaks, and paragraph structure
6. If the source contains markup or code, preserve it exactly
7. The output should be clean and directly usable as translated content
8. Never say "I can't translate this" or refuse — just do your best`;

function languageName(code) {
  const names = {
    'auto': 'auto-detected language',
    'zh-CN': 'Chinese (Simplified)', 'zh-TW': 'Chinese (Traditional)',
    'en': 'English', 'ja': 'Japanese', 'ko': 'Korean',
    'fr': 'French', 'de': 'German', 'es': 'Spanish', 'ru': 'Russian',
    'pt': 'Portuguese', 'it': 'Italian', 'ar': 'Arabic',
    'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian',
    'nl': 'Dutch', 'pl': 'Polish', 'tr': 'Turkish', 'uk': 'Ukrainian',
  };
  return names[code] || code;
}

function buildChatCompletionsUrl(baseUrl) {
  let url = baseUrl.trim().replace(/\/+$/, '');
  if (url.endsWith('/v1')) return `${url}/chat/completions`;
  if (url.includes('/v1/')) return `${url}/chat/completions`;
  return `${url}/v1/chat/completions`;
}

function buildModelsUrl(baseUrl) {
  let url = baseUrl.trim().replace(/\/+$/, '');
  if (url.endsWith('/v1')) return `${url}/models`;
  return `${url}/v1/models`;
}

function getFallbackUrls(baseUrl) {
  const url = baseUrl.trim().replace(/\/+$/, '');
  const variants = [];
  if (!url.endsWith('/v1') && !url.includes('/v1/')) {
    variants.push(`${url}/v1/chat/completions`);
  }
  if (url.endsWith('/v1')) {
    variants.push(`${url.substring(0, url.length - 3)}/chat/completions`);
  }
  return variants;
}

async function translateText({ text, config, sourceLang, targetLang }) {
  const primaryUrl = buildChatCompletionsUrl(config.baseUrl);
  const fallbackUrls = getFallbackUrls(config.baseUrl);
  const allUrls = [primaryUrl, ...fallbackUrls];

  let lastError;

  for (const url of allUrls) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const srcName = languageName(sourceLang);
      const tgtName = languageName(targetLang);

      let userMessage;
      if (sourceLang === 'auto') {
        userMessage = `Translate the following text to ${tgtName}. Output only the translation without any additional text:\n---\n${text}\n---`;
      } else {
        userMessage = `Translate the following text from ${srcName} to ${tgtName}. Output only the translation without any additional text:\n---\n${text}\n---`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: TRANSLATE_SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content.trim();
      }

      const errBody = await response.text();
      let errMsg = `HTTP ${response.status}`;
      try {
        const errJson = JSON.parse(errBody);
        errMsg = errJson.error?.message || errJson.error?.toString() || errMsg;
      } catch (_) {}
      throw new Error(errMsg);
    } catch (e) {
      lastError = e.message;
      continue;
    }
  }

  throw new Error(`All API endpoints failed. Last error: ${lastError}`);
}

async function fetchModels(config) {
  const url = buildModelsUrl(config.baseUrl);
  const headers = { 'Content-Type': 'application/json' };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return (data.data || []).map(m => m.id).sort();
}

module.exports = { translateText, fetchModels };
