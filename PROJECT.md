# WANGTranslate 项目技术文档

## 1. 基本信息

| 项目 | 内容 |
|------|------|
| **软件名称** | WANGTranslate |
| **软件定位** | Windows 桌面 AI 翻译 + OCR 识别工具 |
| **开发语言** | JavaScript (Node.js) |
| **运行框架** | Electron 33.x |
| **代码规模** | ~3000 行，40 个源文件 |
| **分发体积** | 安装包约 89 MB，便携版约 88 MB |
| **协议** | MIT License |

### Logo

![WANGTranslate Logo](https://ch.977744.xyz/images/2026/05/28/-WANGTranslate.png)

Logo URL: `https://ch.977744.xyz/images/2026/05/28/-WANGTranslate.png`

---

## 2. 功能特性

### 2.1 核心功能

| 功能 | 说明 |
|------|------|
| **AI 翻译** | 支持任意 OpenAI 兼容 API 端点，用户自备 API Key |
| **本地 OCR** | 基于 tesseract.js，纯离线识别，支持 9 种语言 |
| **划词翻译** | 选中文字后按快捷键，自动读取选中内容并翻译 |
| **截图 OCR** | 鼠标框选屏幕区域，识别其中文字，支持复制和后续翻译 |
| **静默 OCR** | 后台识别截图文字，直接复制到剪贴板，无弹窗 |
| **选图 OCR** | 选择本地图片文件进行文字识别 |
| **输入翻译** | 手动输入文字进行翻译 |
| **翻译多开** | 支持同时配置多个 API 端点，翻译时并发调用，结果并排显示 |
| **历史记录 & 收藏** | 翻译历史和 OCR 记录自动保存，支持搜索和收藏 |
| **语音朗读** | 基于 Web Speech API，调用系统 TTS 引擎朗读原文/译文 |
| **系统托盘驻留** | 启动后最小化到系统托盘，不占任务栏空间 |
| **全局快捷键** | 可自定义组合键，默认全部未绑定，用户自行设置 |
| **中英双语界面** | 完整的中英文界面切换，支持 20 种翻译语言 |
| **开机自启动** | 可选开机自动启动 |
| **圆角悬浮窗** | 翻译和 OCR 结果以圆角悬浮窗展示，点击空白处自动消失 |

### 2.2 OCR 支持的语言

| 代码 | 语言 |
|------|------|
| `eng` | English (英文) |
| `chi_sim` | Simplified Chinese (简体中文) |
| `chi_tra` | Traditional Chinese (繁体中文) |
| `jpn` | Japanese (日文) |
| `kor` | Korean (韩文) |
| `fra` | French (法文) |
| `deu` | German (德文) |
| `spa` | Spanish (西班牙文) |
| `rus` | Russian (俄文) |

### 2.3 翻译支持的语言

Auto Detect, 简体中文, 繁体中文, 英文, 日文, 韩文, 法文, 德文, 西班牙文, 俄文, 葡萄牙文, 意大利文, 阿拉伯文, 泰文, 越南文, 印尼文, 荷兰文, 波兰文, 土耳其文, 乌克兰文 — 共 20 种。

---

## 3. 技术栈

### 3.1 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| [Electron](https://www.electronjs.org/) | ~33.4 | 桌面应用框架，提供 Chromium + Node.js 运行时 |
| [Node.js](https://nodejs.org/) | v22.13+ | JavaScript 运行时 |

### 3.2 主要依赖 (npm packages)

| 包名 | 版本 | 用途 |
|------|------|------|
| `tesseract.js` | ^5.1.1 | 纯 JavaScript OCR 引擎，基于 WASM，本地离线文字识别 |
| `electron-store` | ^8.2.0 | 本地 JSON 文件存储 (API 配置、快捷键、历史记录、用户设置) |
| `auto-launch` | ^5.0.6 | Windows 开机自启动 |
| `electron-builder` | ^25.1.8 | 打包分发工具 (NSIS 安装包 + 便携版) |

### 3.3 Electron 原生 API 使用情况

| API | 用途 |
|-----|------|
| `Tray` | 系统托盘图标 + 右键菜单 |
| `globalShortcut` | 全局快捷键注册 |
| `BrowserWindow` | 多窗口管理 (主窗口、悬浮窗、设置、历史) |
| `desktopCapturer` | 屏幕截图抓取 |
| `clipboard` | 剪贴板读写 |
| `ipcMain / ipcRenderer` | 主进程 ↔ 渲染进程通信 |
| `Notification` | 系统通知 |
| `nativeImage` | 图片裁剪、格式转换 |
| `screen` | 屏幕信息 (光标位置、显示器边界) |
| `dialog` | 文件选择对话框 |
| `contextBridge` | 安全预加载脚本，隔离 Node.js 和浏览器上下文 |

### 3.4 Web 标准 API

| API | 用途 |
|-----|------|
| `SpeechSynthesis` | 语音朗读 (TTS) |
| `Fetch API` | AI API HTTP 请求 |
| `CSS -webkit-app-region: drag` | 无边框窗口拖拽 |

---

## 4. 项目架构

### 4.1 目录结构

```
WANGTranslate/
├── main.js                          # 主进程入口，IPC 路由，应用生命周期
├── preload.js                       # 安全的上下文桥接，暴露 API 给渲染进程
├── electron-builder.yml             # 打包配置 (NSIS + portable)
├── package.json                     # 项目依赖和脚本
├── assets/
│   ├── icon.png                     # 应用图标 (256x256 PNG)
│   ├── icon.ico                     # Windows 图标
│   ├── tray-16.png                  # 托盘图标 16x16 (带 alpha)
│   └── tray-32.png                  # 托盘图标 32x32 (带 alpha)
├── scripts/
│   ├── build.bat                    # 一键构建脚本
│   ├── package.bat                  # 便携版打包脚本
│   └── generate-icon.js             # 图标生成脚本
├── src/
│   ├── main/                        # ---- 主进程模块 (Node.js) ----
│   │   ├── hotkey.js                # 全局快捷键注册 + 核心动作处理
│   │   ├── ocr.js                   # tesseract.js OCR 服务封装
│   │   ├── screenshot.js            # 屏幕截图服务 (desktopCapturer)
│   │   ├── store.js                 # 本地存储 (electron-store)
│   │   ├── translate.js             # AI 翻译服务 (OpenAI 兼容 API)
│   │   ├── tray.js                  # 系统托盘管理 (菜单 + 中英文)
│   │   └── window-manager.js        # 窗口管理器 (悬浮窗/设置/历史/截图选取)
│   │
│   └── renderer/                    # ---- 渲染进程 (HTML/CSS/JS) ----
│       ├── css/
│       │   └── style.css            # 全局样式 (浅色主题, Catppuccin 风格)
│       ├── js/
│       │   ├── i18n.js              # 中英文国际化
│       │   ├── settings.js          # 设置页逻辑 (通用/快捷键/API/OCR)
│       │   ├── history.js           # 历史记录 + 收藏页
│       │   ├── main.js              # 主窗口逻辑 (托盘/快捷键事件)
│       │   ├── translate-overlay.js # 翻译结果悬浮窗
│       │   ├── ocr-overlay.js       # OCR 结果悬浮窗
│       │   ├── input-translate.js   # 输入翻译窗
│       │   └── screenshot-select.js # 截图区域选取窗
│       ├── index.html               # 主窗口 (不可见的后台窗口)
│       ├── settings.html            # 设置窗口
│       ├── history.html             # 历史记录窗口
│       ├── translate-overlay.html   # 翻译结果悬浮窗
│       ├── ocr-overlay.html         # OCR 结果悬浮窗
│       ├── input-translate.html     # 输入翻译窗口
│       └── screenshot-select.html   # 截图选取窗口
│
└── dist/                            # 构建输出
    ├── WANGTranslate Setup 1.0.0.exe   # NSIS 安装程序
    ├── WANGTranslate-portable.exe      # 便携版
    └── win-unpacked/                   # 解压即用文件夹
```

### 4.2 进程模型

```
┌─────────────────────────────────────────────────┐
│             Electron Main Process               │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  tray.js │ │ hotkey.js│ │ window-mgr.js  │  │
│  │  (托盘)   │ │ (快捷键)  │ │ (窗口管理)      │  │
│  └──────────┘ └──────────┘ └────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ ocr.js   │ │translate │ │ screenshot.js  │  │
│  │(Tesseract)│ │.js (API) │ │ (屏幕截图)      │  │
│  └──────────┘ └──────────┘ └────────────────┘  │
│  ┌──────────┐                                   │
│  │ store.js │ (electron-store, JSON 持久化)     │
│  └──────────┘                                   │
├─────────────────────────────────────────────────┤
│                  IPC Bridge                     │
│  ┌────────────────────────────────────────────┐│
│  │              preload.js                    ││
│  │  (contextBridge 安全暴露 API 给渲染进程)     ││
│  └────────────────────────────────────────────┘│
├─────────────────────────────────────────────────┤
│          Electron Renderer Processes            │
│  ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ 翻译弹窗  │ │ OCR 弹窗  │ │ 设置 / 历史    │  │
│  │(translate │ │(ocr-     │ │(settings     │  │
│  │ overlay)  │ │ overlay) │ │ / history)   │  │
│  └──────────┘ └──────────┘ └───────────────┘  │
└─────────────────────────────────────────────────┘
```

### 4.3 核心数据流

#### 划词翻译流程
```
用户选中文字 → 按快捷键
  → globalShortcut 触发
  → hotkey.js 通过 PowerShell SendKeys 发送 Ctrl+C
  → 读取剪贴板
  → 创建翻译悬浮窗
  → 悬浮窗调用 translate IPC
  → main.js 并发调用所有启用的 API
  → translate.js 发送 OpenAI 格式请求
  → 结果显示在悬浮窗
```

#### 截图 OCR 流程
```
用户按 OCR 快捷键 / 托盘菜单
  → desktopCapturer 捕获全屏截图
  → 打开全屏透明选区窗口
  → 用户拖拽框选
  → nativeImage.crop() 剪裁 (含 DPI 缩放修正)
  → 打开 OCR 悬浮窗 (带加载动画)
  → OCR 悬浮窗通过 IPC 调用 run-ocr
  → tesseract.js 识别文字
  → 结果回传到 OCR 悬浮窗
```

#### AI 翻译 API 请求格式
```
POST {baseUrl}/v1/chat/completions

System Prompt:
  "You are a professional translator..."
  (要求只输出译文，不输出原文、解释等任何额外内容)

User Message:
  "Translate the following text from {源语言} to {目标语言}.
   Output only the translation without any additional text:
   ---
   {用户文字}
   ---"

参数: temperature=0.3, max_tokens=4096
```

#### URL 智能处理
```
if URL 已包含 /v1/ → 直接用
if URL 不含 /v1   → 自动追加 /v1/
if 请求失败        → 尝试替代路径 (去掉/添加 /v1)
if 全部失败        → 弹出顶部通知，显示错误信息
```

---

## 5. 分发方式

### 5.1 安装版 (NSIS)

文件: `WANGTranslate Setup 1.0.0.exe` (~89 MB)

- 标准 Windows 安装向导
- 用户可选择安装目录
- 创建桌面快捷方式和开始菜单项
- 支持卸载

### 5.2 便携版

文件: `WANGTranslate-portable.exe` (~88 MB)

- 双击即运行，无需安装
- 所有文件自包含
- 用户数据存储在 `%APPDATA%/WANGTranslate/`

### 5.3 免安装文件夹

路径: `dist/win-unpacked/`

- 整个文件夹解压即用
- 双击 `WANGTranslate.exe` 启动

---

## 6. 开发指南

### 6.1 环境要求

- Node.js v22+
- Windows 11 (理论上 Win10 也可)
- npm v11+

### 6.2 开发命令

```bash
# 安装依赖
npm install

# 启动开发模式
npm start

# 构建分发版本
npx electron-builder --win --publish=never

# 仅打包便携版
npx electron-builder --win portable
```

### 6.3 构建产物

构建产物在 `dist/` 目录：
- `WANGTranslate Setup 1.0.0.exe` — NSIS 安装程序
- `WANGTranslate-portable.exe` — 便携版
- `win-unpacked/` — 解压即用文件夹

---

## 7. 存储结构

所有用户数据通过 `electron-store` 存储在：
```
%APPDATA%/Roaming/WANGTranslate/config.json
```

### 存储的数据项

| 键 | 类型 | 说明 |
|----|------|------|
| `sourceLanguage` | string | 翻译源语言，默认 `"auto"` |
| `targetLanguage` | string | 翻译目标语言，默认 `"zh-CN"` |
| `apiConfigs` | array | API 端点配置列表 |
| `enabledApiIndices` | array | 已启用的 API 索引 |
| `hotkeyConfigs` | object | 快捷键绑定配置 |
| `ocrLanguages` | string | OCR 语言列表，默认 `"eng"` |
| `ocrPsm` | number | Tesseract 页面分割模式，默认 6 |
| `ocrContinuous` | boolean | 连续识别模式 |
| `ocrAutoCopy` | boolean | OCR 自动复制到剪贴板 |
| `ocrSmartParagraph` | boolean | 智能分段 |
| `ttsRate` | number | TTS 语速 |
| `ttsPitch` | number | TTS 音调 |
| `ttsVolume` | number | TTS 音量 |
| `autoLaunch` | boolean | 开机自启动 |
| `appLanguage` | string | 界面语言，默认 `"zh"` |
| `translateHistory` | array | 翻译历史记录 |
| `ocrHistory` | array | OCR 历史记录 |

---

## 8. 设计哲学

1. **零配置 OCR** — tesseract.js 纯 JS 实现，不需要用户手动安装任何 OCR 二进制文件。首次使用时自动下载 WASM 语言包并缓存。

2. **API 自由** — 不像 Bob 或其他翻译软件绑定特定翻译服务商，WANGTranslate 让用户完全自主选择 AI 服务 (OpenAI / LM Studio / Ollama / 任何 OpenAI 兼容 API)。

3. **多 API 并发** — 同时调用多个 AI 端点对比翻译结果，适合需要评估不同 AI 模型翻译质量的用户。

4. **剪贴板恢复** — 划词翻译模拟 Ctrl+C 后，800ms 内自动恢复用户原来的剪贴板内容，不污染剪贴板。

5. **轻量级** — 相比 Flutter 方案 (~5GB 工具链 + 需开发者模式)，Electron 方案仅需 Node.js，打包后 ~88MB。

6. **所有操作本地** — OCR 识别、语音朗读全部在本地完成，翻译通过用户自己的 API 端点和密钥，所有数据不外泄给第三方。

---

## 9. 常见预设 API 端点

| 服务 | URL | 说明 |
|------|-----|------|
| OpenAI | `https://api.openai.com/v1` | 需要 API Key |
| LM Studio | `http://localhost:1234/v1` | 本地免费 |
| Ollama | `http://localhost:11434/v1` | 本地免费 |
| 其他兼容 API | 用户自定义 | 任何 OpenAI Chat Completions 兼容接口 |

---

## 10. 版本信息

| 项 | 内容 |
|----|------|
| 当前版本 | 1.0.0 |
| 发布日期 | 2026-05 |
| 平台 | Windows 10/11 x64 |
| 协议 | MIT License |

---

*本文档由项目代码自动整理生成，涵盖所有技术实现细节，可用于撰写软件官网或产品 PDF。*
