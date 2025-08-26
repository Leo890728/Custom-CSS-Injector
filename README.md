# Custom CSS Injector Chrome 擴充功能

一個功能強大的Chrome擴充功能，讓您可以為任何網站自訂和注入CSS樣式。

## 功能特色

### 🎨 主要功能
- **自訂CSS注入**: 為任何網站建立和管理自訂CSS規則
- **即時控制**: 透過popup界面快速開關CSS規則
- **完整管理介面**: 使用Vue.js框架建構的現代化選項頁面
- **CSS編輯器**: 整合Monaco Editor，支援語法高亮和自動完成
- **網站管理**: 為不同網站建立獨立的CSS規則集

### 🛠 技術特色
- **Vue.js 3**: 現代化的前端框架
- **Monaco Editor**: Visual Studio Code同款編輯器
- **Chrome Extensions Manifest V3**: 最新的擴充功能標準
- **響應式設計**: 支援不同螢幕尺寸

## 安裝方法

### 開發者模式安裝
1. 開啟Chrome瀏覽器
2. 前往 `chrome://extensions/`
3. 開啟右上角的「開發者模式」
4. 點擊「載入未封裝項目」
5. 選擇此專案的資料夾 (`chrome-ext`)
6. 擴充功能將會自動載入並啟用

## 使用方法

### 1. 基本設定
- 點擊工具列中的擴充功能圖示開啟popup
- 使用全域開關來啟用/停用整個擴充功能
- 查看當前網站的CSS規則狀態

### 2. 管理CSS規則
- 點擊「管理CSS規則」或「前往設定頁面」開啟選項頁面
- 在左側面板新增網站或選擇現有網站
- 為選中的網站建立新的CSS規則

### 3. 編輯CSS
- 選擇一個CSS規則進行編輯
- 使用Monaco編輯器撰寫CSS代碼，支援：
  - 語法高亮
  - 自動完成
  - 錯誤檢測
  - 代碼摺疊
- 隨時儲存變更

### 4. 測試CSS
- 在編輯器中點擊「測試CSS」按鈕
- CSS將立即注入到當前頁面進行預覽
- 確認效果後記得儲存規則

## 檔案結構

```
chrome-ext/
├── manifest.json          # 擴充功能配置檔
├── background.js          # 背景腳本
├── content.js            # 內容腳本
├── popup/               # Popup界面
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── options/             # 選項頁面
    ├── options.html
    ├── options.css
    └── options.js
```

## 核心技術

### Vue.js 3 整合
- 使用Composition API進行狀態管理
- 響應式數據綁定
- 組件化開發

### Monaco Editor 整合
- CDN載入Monaco Editor
- 支援CSS語法高亮
- 自訂編輯器主題和設定

### Chrome Extension API
- `chrome.storage.local`: 本地資料儲存
- `chrome.scripting`: CSS注入
- `chrome.tabs`: 標籤頁管理
- `chrome.runtime`: 訊息傳遞

## 資料儲存結構

### 全域設定
```javascript
{
  "globalEnabled": true  // 全域啟用狀態
}
```

### 網站CSS規則
```javascript
{
  "example.com": [
    {
      "id": "rule_1234567890_abc123",
      "name": "隱藏廣告",
      "description": "隱藏頁面中的廣告區塊",
      "css": ".ad-banner { display: none !important; }",
      "enabled": true,
      "createdAt": "2025-08-26T12:00:00.000Z",
      "updatedAt": "2025-08-26T12:30:00.000Z"
    }
  ]
}
```

## 開發說明

### 本地開發
1. 修改源代碼
2. 在 `chrome://extensions/` 頁面點擊重新載入按鈕
3. 重新整理正在測試的網頁

### 除錯方法
- **背景腳本**: 在擴充功能頁面點擊「檢查視圖」
- **內容腳本**: 在網頁上按F12，查看控制台
- **Popup**: 右鍵點擊擴充功能圖示，選擇「檢查」
- **選項頁面**: 直接按F12開啟開發者工具

## 注意事項

1. **權限**: 擴充功能需要存取所有網站來注入CSS
2. **效能**: 大量CSS規則可能影響頁面載入速度
3. **相容性**: 建議使用Chrome 88+版本
4. **安全性**: 請勿注入惡意CSS代碼

## 常見問題

### Q: CSS沒有生效？
A: 請檢查：
- 全域開關是否開啟
- 規則開關是否啟用
- CSS語法是否正確
- 是否需要使用 `!important`

### Q: 編輯器無法載入？
A: 請確保網路連線正常，Monaco Editor從CDN載入

### Q: 如何備份設定？
A: 在選項頁面的開發者工具中執行：
```javascript
chrome.storage.local.get(null, console.log)
```

## 版本歷史

### v1.0 (2025-08-26)
- 初始版本發布
- 基本CSS注入功能
- Vue.js + Monaco Editor整合
- 完整的管理界面

## 授權

MIT License

## 貢獻

歡迎提交Issue和Pull Request來改善此擴充功能！
