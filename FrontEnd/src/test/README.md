# 懶載入功能測試指南

## 📋 測試概覽

本測試套件為台語學習遊戲的懶載入功能提供全面的測試覆蓋，包括單元測試、整合測試和效能測試。

## 🧪 測試結構

```
src/
├── test/
│   ├── setup.ts                    # 測試環境設置
│   ├── test-utils.tsx             # 測試工具函數
│   ├── performance.test.ts        # 效能測試
│   └── README.md                  # 本文件
├── hooks/
│   └── __tests__/
│       ├── useIntersectionObserver.test.ts  # Intersection Observer Hook 測試
│       ├── useImagePreloader.test.ts        # 圖片預載入 Hook 測試
│       └── useNetworkStatus.test.ts         # 網路狀態 Hook 測試
├── components/
│   └── __tests__/
│       └── LazyImage.test.tsx              # 懶載入圖片組件測試
└── view/
    └── __tests__/
        └── ThemeSelectionPage.integration.test.tsx  # 整合測試
```

## 🚀 運行測試

### 基本命令

```bash
# 運行所有測試
npm run test

# 運行測試並生成覆蓋率報告
npm run test:coverage

# 運行測試 UI 界面
npm run test:ui

# 監聽模式運行測試
npm run test:watch
```

### 特定測試

```bash
# 只運行懶載入相關測試
npm run test:lazy-loading

# 只運行整合測試
npm run test:integration

# 只運行效能測試
npm run test:performance
```

## 🔧 測試類型說明

### 1. 單元測試

**useIntersectionObserver Hook 測試**
- 測試 Hook 的初始化狀態
- 測試元素進入/離開視窗的偵測
- 測試 `hasBeenSeen` 狀態的持久性
- 測試清理機制

**useImagePreloader Hook 測試**
- 測試圖片預載入功能
- 測試優先級限制
- 測試錯誤處理
- 測試 URL 變更處理

**useNetworkStatus Hook 測試**
- 測試不同網路類型偵測
- 測試慢速連接判斷
- 測試 API 缺失情況處理

### 2. 組件測試

**LazyImage 組件測試**
- 測試佔位符顯示
- 測試骨架屏載入動畫
- 測試圖片載入成功/失敗
- 測試淡入動畫效果
- 測試 fallback 圖片機制

### 3. 整合測試

**ThemeSelectionPage 整合測試**
- 測試頁面完整載入流程
- 測試 API 錯誤處理
- 測試使用者互動（點擊、鍵盤導航）
- 測試網路狀況適應
- 測試圖片懶載入整合

### 4. 效能測試

**記憶體使用測試**
- 測試 IntersectionObserver 記憶體洩漏
- 測試組件卸載清理

**載入時間優化測試**
- 測試可見圖片優先載入
- 測試快速滾動效能

**網路效率測試**
- 測試批次請求處理
- 測試資源清理

## 🛠️ 測試工具函數

### `createMockIntersectionObserver`
```typescript
const MockObserver = createMockIntersectionObserver(isIntersecting, delay);
```
創建模擬的 IntersectionObserver，可控制是否相交和延遲時間。

### `mockImageLoad`
```typescript
const cleanup = mockImageLoad(shouldSucceed, delay);
```
模擬圖片載入，可控制成功/失敗和載入時間。

### `mockNetworkConnection`
```typescript
const cleanup = mockNetworkConnection('4g' | '3g' | '2g' | 'slow-2g');
```
模擬不同的網路連接類型。

### `waitForAsync`
```typescript
await waitForAsync(100); // 等待 100ms
```
等待異步操作完成。

## 📊 測試覆蓋率目標

- **單元測試覆蓋率**: > 90%
- **整合測試覆蓋率**: > 80%
- **關鍵路徑覆蓋率**: 100%

## 🐛 調試測試

### 查看測試輸出
```bash
# 詳細輸出模式
npm run test -- --reporter=verbose

# 只運行失敗的測試
npm run test -- --reporter=verbose --run-failed
```

### 調試特定測試
```bash
# 運行特定測試文件
npm run test -- useIntersectionObserver.test.ts

# 運行特定測試案例
npm run test -- --grep "should load and display image"
```

## 🔍 常見問題

### Q: IntersectionObserver 測試不穩定？
A: 確保使用 `createMockIntersectionObserver` 並設定適當的延遲時間。

### Q: 圖片載入測試失敗？
A: 檢查 `mockImageLoad` 的設定，確保 `cleanup` 函數在測試結束時被呼叫。

### Q: 整合測試超時？
A: 增加 `waitFor` 的超時時間，或檢查模擬的 API 回應。

## 📈 效能基準

- **初始載入時間**: < 2 秒
- **圖片懶載入觸發**: < 100ms
- **記憶體使用**: 穩定，無洩漏
- **網路請求**: 批次處理，不超過並發限制

## 🚀 持續改進

定期運行效能測試，監控：
1. 載入時間趨勢
2. 記憶體使用情況
3. 網路請求效率
4. 使用者體驗指標

通過測試確保懶載入功能在各種環境下都能提供最佳的使用體驗。
