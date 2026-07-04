# Google Apps Script 部署指南

## 快速開始（不需要手動建立工作表！）

### 第一步：建立 Google Sheets

1. 開啟 [Google Sheets](https://sheets.new) 建立新試算表
2. 命名為 "LawQuiz Database"（名稱不重要，之後會由程式自動建立工作表）

### 第二步：部署 Apps Script

1. 在 Sheets 上方選單點選 **擴充功能 (Extensions)** → **Apps Script**
2. 開啟 [apps-script-code.gs](./apps-script-code.gs) 複製全部程式碼
3. 回到 Apps Script 編輯器，**刪除所有現有程式碼並貼上**
4. 點選 **儲存** 圖示 (Ctrl+S)

### 第三步：部署為 Web App

1. 點選右上角 **部署 (Deploy)** → **新增部署作業 (New deployment)**
2. 點選 **選取類型** → 選擇 **Web App**
3. 設定：
   - 說明: `LawQuiz API`
   - 執行身分: **我 (Me)**
   - 誰有存取權限: **任何人 (Anyone)** ← 這很重要！
4. 點選 **部署 (Deploy)**
5. 如果需要授權，請按照提示允許
6. 複製 **Web App URL** (格式: `https://script.google.com/macros/s/xxxxxx/exec`)

### 第四步：自動建立工作表

1. 在瀏覽器開啟您的 Web App URL 加上 `?action=setup-sheets`
   ```
   https://script.google.com/macros/s/您的SCRIPT_ID/exec?action=setup-sheets
   ```
2. 應該會看到回應：
   ```json
   {
     "status": "ok",
     "message": "All sheets created successfully",
     "sheetIds": {
       "laws": "1 rows",
       "quizzes": "1 rows",
       "scores": "1 rows",
       "wrong_answers": "1 rows"
     }
   }
   ```
3. 回到 Google Sheets，您會看到已自動建立 4 個工作表！

### 第五步：設定 Vercel

將 Web App URL 設定到 Vercel 的環境變數：
- **Key**: `GAS_WEB_APP_URL`
- **Value**: 您的 Web App URL

---

## Apps Script 程式碼

檔案位置：[apps-script-code.gs](./apps-script-code.gs)

主要功能：
- `setup-sheets` - 自動建立所有工作表（含標題列）
- `get-laws` - 取得所有法規列表
- `get-law?id=xxx` - 取得單一法規內容
- `get-quizzes?subject=xxx&count=10` - 取得題目
- `get-subjects` - 取得所有科目
- `submit-answer` - 提交答案並記錄成績
- `get-stats?userId=xxx` - 取得使用者統計
- `check-db` - 檢查資料庫狀態

---

## 測試部署

1. 測試工作表建立：`?action=setup-sheets`
2. 測試資料庫狀態：`?action=check-db`
3. 測試取得法規：`?action=get-laws`

---

## 注意事項

- 首次呼叫可能需要授權，請按照提示允許
- Google Apps Script 有執行時間限制 (6 分鐘)，大量資料同步建議分批進行
- 每天 API 呼叫次數有限制，正常使用不會遇到問題