# 咖啡店 POS 系統

基於 React + MariaDB + Node.js 的咖啡店 POS (銷售點) 系統。

## 專案概述

這是一個網頁版的 POS 系統，專為咖啡店設計，支援跨平台使用（iPad 和 Windows 觸控螢幕）。系統部署在群暉 NAS 723+ 上，使用 Docker 容器管理。

### 主要功能

- **前端介面**：直覺的觸控友好界面，方便點餐和結帳
- **產品管理**：輕鬆管理咖啡、飲料和食品項目
- **訂單處理**：即時訂單創建和管理
- **報表生成**：銷售數據分析和報表

## 技術架構

- **前端**：React.js
- **後端**：Node.js + Express
- **資料庫**：MariaDB
- **部署**：Docker on Synology NAS

## 目錄結構

```
/coffee-pos/
  /frontend/         # React 前端
    /src/
      /components/   # React 組件
      App.js         # 主應用程式
      index.js       # 入口文件
  /backend/          # Node.js 後端
    server.js        # Express 服務器
    .env             # 環境變數
  /database/         # 資料庫相關
    schema.sql       # 資料庫結構
```

## 安裝與設定

詳細的安裝和設定步驟請參閱 [installation-guide.md](installation-guide.md)。

## 開發指南

### 前端開發

```bash
cd frontend
npm install
npm start
```

### 後端開發

```bash
cd backend
npm install
npm run dev
```

### 資料庫設定

執行 `database/schema.sql` 建立初始資料庫結構。

## 貢獻

歡迎提交問題報告和改進建議。

## 授權

本專案採用 MIT 授權條款。