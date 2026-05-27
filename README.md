<p align="center">
  <img src="https://ch.977744.xyz/images/2026/05/28/-WANGTranslate.png" alt="WANGTranslate Logo" width="128" height="128" />
</p>

# WANGTranslate

<p align="center">
  <strong>Windows 桌面 AI 翻译 + OCR 识别工具</strong>
</p>

<p align="center">
  <a href="README_EN.md">English</a>
</p>

---

<h2 id="中文">中文</h2>

## 功能介绍

- **AI 翻译** — 自带 API Key，支持 OpenAI / LM Studio / Ollama 及任何 OpenAI 兼容接口
- **本地 OCR** — 基于 tesseract.js 离线文字识别，支持 9 种语言
- **划词翻译** — 选中文字，按下快捷键，弹出翻译结果悬浮窗
- **截图 OCR** — 鼠标框选屏幕区域，识别其中文字并可一键翻译
- **静默 OCR** — 后台识别截图文字，直接复制到剪贴板
- **输入翻译** — 手动输入或粘贴文字进行翻译
- **多 API 对比** — 同时启用多个 API 端点，翻译结果并排展示
- **系统托盘驻留** — 安静运行在托盘，随时待命
- **自定义快捷键** — 全局快捷键完全可定制，默认不绑定
- **历史记录 & 收藏** — 翻译和 OCR 记录自动保存，支持搜索
- **语音朗读** — 调用系统 TTS 引擎朗读原文或译文
- **中英双语界面** — 界面语言自由切换
- **开机自启动** — 可选择随系统启动

### OCR 识别语言

英文、简体中文、繁体中文、日文、韩文、法文、德文、西班牙文、俄文

### 翻译支持语言

20 种语言：自动检测、简体中文、繁体中文、英文、日文、韩文、法文、德文、西班牙文、俄文、葡萄牙文、意大利文、阿拉伯文、泰文、越南文、印尼文、荷兰文、波兰文、土耳其文、乌克兰文

---

## 下载

前往 [Releases](https://github.com/WONGIII/WANGTranslate/releases) 下载最新版本：

| 类型 | 文件 | 说明 |
|------|------|------|
| **安装版** | `WANGTranslate Setup x.x.x.exe` | 标准 Windows 安装程序 |
| **便携版** | `WANGTranslate-portable.exe` | 免安装，下载即用 |

---

## 快速开始

1. 下载安装包（或运行便携版）
2. 点击托盘图标或按快捷键打开 **设置**
3. 进入 **API** 页 → 添加你的 AI 端点
4. 进入 **快捷键** 页 → 绑定你习惯的组合键
5. 开始使用！

### API 预设

| 服务 | 默认地址 |
|------|----------|
| OpenAI | `https://api.openai.com/v1` |
| LM Studio | `http://localhost:1234/v1` |
| Ollama | `http://localhost:11434/v1` |
| 自定义 | 任何 OpenAI Chat Completions 兼容接口 |

---

## 开发

### 环境要求

- Node.js v22+
- npm v11+

### 本地运行

```bash
git clone https://github.com/WONGIII/WANGTranslate.git
cd WANGTranslate
npm install
npm start
```

### 构建

```bash
# 完整构建（安装包 + 便携版）
npx electron-builder --win --publish=never

# 仅构建便携版
npx electron-builder --win portable
```

构建产物在 `dist/` 目录。

### 技术栈

| 技术 | 用途 |
|------|------|
| [Electron](https://www.electronjs.org/) | 桌面应用框架 |
| [tesseract.js](https://github.com/naptha/tesseract.js) | 本地 OCR 引擎（WASM） |
| [electron-store](https://github.com/sindresorhus/electron-store) | 持久化配置存储 |
| [electron-builder](https://www.electron.build/) | 构建与分发 |
| Web Speech API | 语音朗读 |
| Fetch API | AI API 请求 |

---

## 项目结构

```
src/main/          主进程 (Node.js)
  hotkey.js        全局快捷键 + 核心动作处理
  ocr.js           tesseract.js OCR 服务
  screenshot.js    屏幕截图 (desktopCapturer)
  store.js         本地 JSON 存储
  translate.js     AI 翻译 (OpenAI 兼容 API)
  tray.js          系统托盘图标与菜单
  window-manager.js 弹窗、设置、历史窗口管理

src/renderer/      渲染进程 (HTML/CSS/JS)
  css/style.css    浅色主题样式
  js/settings.js   设置页 (通用 / 快捷键 / API / OCR)
  js/history.js    翻译 & OCR 历史记录与收藏
  js/translate-overlay.js  翻译结果弹窗
  js/ocr-overlay.js  OCR 结果弹窗
  js/input-translate.js    手动输入翻译窗
  js/i18n.js        中英文国际化
```

---

## 协议

MIT

