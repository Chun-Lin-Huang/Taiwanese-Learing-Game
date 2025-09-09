# Taiwanese Learning Game

台語學習遊戲 - 整合語音對話、單字學習、互動遊戲等功能的全端應用程式。

## 快速開始

### 系統需求
- Node.js (v16+)
- Python 3.8+
- MongoDB
- FFmpeg

### 1. 環境準備

#### 1.1 啟動 MongoDB
確保 MongoDB 服務正在運行：
- 本地 MongoDB 或 MongoDB Compass

#### 1.2 設置 Python 虛擬環境（台語語音服務）
```bash
# 進入專案根目錄
cd /Taiwanese-Learing-Game

# 創建 Python 虛擬環境
python3 -m venv venv

# 啟動虛擬環境
source venv/bin/activate

# 安裝 Python 依賴
pip install -r requirements_voice.txt
```

### 2. 後端啟動

#### 2.1 安裝 Node.js 依賴
```bash
# 進入後端目錄
cd BackEnd

# 安裝依賴
npm install
```

#### 2.2 啟動後端服務
```bash
# 在 BackEnd 目錄下
npm run dev
```

**後端服務將運行在：`http://localhost:2083`**

### 3. 前端啟動

#### 3.1 安裝前端依賴
```bash
# 進入前端目錄
cd FrontEnd

# 安裝依賴
npm install
```

#### 3.2 啟動前端服務
```bash
# 在 FrontEnd 目錄下
npm run dev
```

**前端服務將運行在：`http://localhost:5173`**

### 4. 台語語音服務啟動

#### 4.1 啟動 Python 服務
```bash
# 確保虛擬環境已啟動
source venv/bin/activate

# 啟動台語語音服務
python app_local.py
```

**台語語音服務將運行在：`http://localhost:5050`**

## 🔧 完整啟動順序

### 終端1：後端服務
```bash
cd BackEnd
npm run dev
```

### 終端2：前端服務
```bash
cd FrontEnd
npm run dev
```

### 終端3：台語語音服務
```bash
cd /Taiwanese-Learing-Game
source venv/bin/activate
python app_local.py
```

## 驗證服務狀態

### 檢查後端 API
```bash
curl http://localhost:2083/api/v1/chat-choose/list
```

### 檢查台語語音服務
```bash
curl http://localhost:5050/health
```

### 檢查前端
```bash
# 瀏覽器打開
open http://localhost:5173
```

## 功能測試

### 語音對話功能
1. **打開前端**：`http://localhost:5173`
2. **選擇主題**：點擊任意對話主題
3. **開始語音對話**：點擊麥克風按鈕錄音
4. **檢查記錄**：使用以下 API 查詢對話記錄

```bash
# 查詢特定會話的記錄
curl "http://localhost:2083/api/v1/scenario/history/{session_id}"
```

## 🛠️ 常用指令

### 停止服務
```bash
# 停止所有 Node.js 服務
pkill -f node

# 停止 Python 服務
pkill -f app_local.py
```

### 重新啟動
```bash
# 重新啟動後端
cd BackEnd && npm run dev

# 重新啟動前端
cd FrontEnd && npm run dev

# 重新啟動台語語音服務
cd /Taiwanese-Learing-Game
source venv/bin/activate
python app_local.py
```

## 🔍 故障排除

### 端口衝突
```bash
# 檢查端口使用情況
lsof -i :2083  # 後端
lsof -i :5173  # 前端
lsof -i :5050  # 台語語音服務
```

### 依賴問題
```bash
# 重新安裝後端依賴
cd BackEnd
rm -rf node_modules package-lock.json
npm install

# 重新安裝前端依賴
cd FrontEnd
rm -rf node_modules package-lock.json
npm install

# 重新安裝 Python 依賴
cd /Taiwanese-Learing-Game
source venv/bin/activate
pip install -r requirements_voice.txt
```

## 📊 服務狀態檢查

所有服務正常運行時，您應該看到：

- **後端**：`listening on *:2083`
- **前端**：`Local: http://localhost:5173/`
- **台語語音服務**：`Running on http://127.0.0.1:5050`

## 🏗️ 專案結構

```
Taiwanese-Learing-Game/
├── BackEnd/                 # Node.js + Express 後端
│   ├── src/
│   │   ├── controller/     # 控制器
│   │   ├── Service/        # 業務邏輯
│   │   ├── routers/        # 路由
│   │   └── orm/schemas/    # MongoDB 模型
│   └── build/              # 編譯後的 JavaScript
├── FrontEnd/               # React + TypeScript 前端
│   ├── src/
│   │   ├── view/          # 頁面組件
│   │   ├── style/         # CSS 樣式
│   │   └── utils/         # 工具函數
│   └── public/
├── app_local.py           # 台語語音服務 (Python Flask)
├── requirements_voice.txt # Python 依賴
└── .env                   # 環境變數
```

## 🎮 主要功能

- **語音對話**：台語語音識別與合成
- **單字學習**：台語單字卡系統
- **互動遊戲**：多種學習遊戲模式
- **故事模式**：台語故事閱讀
- **對話記錄**：MongoDB 保存學習歷程

## 開發注意事項

- 前端使用 React + TypeScript + Vite
- 後端使用 Node.js + Express + MongoDB
- 台語語音服務使用 Python Flask
- 所有 API 調用使用統一的 `api.ts` 配置
- 語音對話記錄自動保存到 ChatHistory 集合