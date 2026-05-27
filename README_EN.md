<p align="center">
  <img src="https://ch.977744.xyz/images/2026/05/28/-WANGTranslate.png" alt="WANGTranslate Logo" width="128" height="128" />
</p>

<h1 align="center">WANGTranslate</h1>

<p align="center">
  <strong>AI-powered translation & OCR tool for Windows</strong>
</p>

<p align="center">
  <a href="README.md">中文文档</a>
</p>

---

## Features

- **AI Translation** — Bring your own API key. Works with OpenAI, LM Studio, Ollama, and any OpenAI-compatible endpoint
- **Local OCR** — Offline text recognition via tesseract.js, 9 languages supported
- **Selection Translate** — Select text, press hotkey, get instant translation popup
- **Screenshot OCR** — Drag to select screen area, extract text, translate with one click
- **Silent OCR** — Screenshot text recognition straight to clipboard
- **Input Translate** — Type or paste text for translation
- **Multi-API Comparison** — Enable multiple APIs and compare translations side by side
- **System Tray** — Quietly runs in the tray, always ready
- **Custom Hotkeys** — Fully customizable global shortcuts
- **History & Favorites** — Auto-saved records with search
- **Text-to-Speech** — Read text aloud via system TTS engine
- **Bilingual UI** — Chinese / English, switch anytime
- **Auto Startup** — Optionally launch with Windows

### OCR Languages

English, Simplified Chinese, Traditional Chinese, Japanese, Korean, French, German, Spanish, Russian

### Translation Languages

20 languages: Auto Detect, Chinese (Simplified & Traditional), English, Japanese, Korean, French, German, Spanish, Russian, Portuguese, Italian, Arabic, Thai, Vietnamese, Indonesian, Dutch, Polish, Turkish, Ukrainian

---

## Download

Go to [Releases](https://github.com/WONGIII/WANGTranslate/releases) and download the latest:

| Type | File | Description |
|------|------|-------------|
| **Installer** | `WANGTranslate Setup x.x.x.exe` | Standard Windows installer |
| **Portable** | `WANGTranslate-portable.exe` | No installation needed, run anywhere |

---

## Quick Start

1. Download and install (or run portable version)
2. Click tray icon or press hotkey to open **Settings**
3. Go to **API** tab → add your AI endpoint (OpenAI / LM Studio / Ollama / custom)
4. Go to **Shortcuts** tab → bind your preferred hotkeys
5. Start translating!

### API Presets

| Service | Default URL |
|---------|-------------|
| OpenAI | `https://api.openai.com/v1` |
| LM Studio | `http://localhost:1234/v1` |
| Ollama | `http://localhost:11434/v1` |
| Custom | Any OpenAI Chat Completions compatible endpoint |

---

## Development

### Prerequisites

- Node.js v22+
- npm v11+

### Setup

```bash
git clone https://github.com/WONGIII/WANGTranslate.git
cd WANGTranslate
npm install
npm start
```

### Build

```bash
# Full build (installer + portable)
npx electron-builder --win --publish=never

# Portable only
npx electron-builder --win portable
```

Output goes to `dist/`.

### Tech Stack

| Technology | Purpose |
|------------|---------|
| [Electron](https://www.electronjs.org/) | Desktop app framework |
| [tesseract.js](https://github.com/naptha/tesseract.js) | Local OCR engine (WASM) |
| [electron-store](https://github.com/sindresorhus/electron-store) | Persistent settings storage |
| [electron-builder](https://www.electron.build/) | Build & distribution |
| Web Speech API | Text-to-speech |
| Fetch API | AI API requests |

---

## Project Structure

```
src/main/          Main process (Node.js)
  hotkey.js        Global shortcuts + core action handlers
  ocr.js           tesseract.js OCR service
  screenshot.js    Screen capture via desktopCapturer
  store.js         Local JSON storage
  translate.js     AI translation (OpenAI-compatible API)
  tray.js          System tray icon & context menu
  window-manager.js  Overlay, settings, history window management

src/renderer/      Renderer process (HTML/CSS/JS)
  css/style.css    Catppuccin-inspired light theme
  js/settings.js   Settings page (General / Shortcuts / API / OCR)
  js/history.js    Translation & OCR history with favorites
  js/translate-overlay.js  Translation result popup
  js/ocr-overlay.js  OCR result popup
  js/input-translate.js   Manual input translation window
  js/i18n.js       Chinese/English internationalization
```

---

## License

MIT
