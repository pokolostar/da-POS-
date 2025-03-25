# 咖啡店 POS 系統安裝指南

本文檔提供在群暉 NAS 723+ 上安裝和設定咖啡店 POS 系統的完整步驟。

## 系統需求

- 群暉 NAS 723+
- Docker 已安裝在 NAS 上
- NAS 具有足夠的儲存空間

## 步驟 1: 設置 MariaDB 資料庫

1. 在 Synology NAS 上開啟 Docker 套件
2. 搜尋並下載 MariaDB 映像檔 (推薦使用 `mariadb:10.6` 版本)
3. 建立一個 MariaDB 容器，設定如下:

```
容器名稱: coffee-pos-db
端口映射: 3306:3306
環境變數:
  - MYSQL_ROOT_PASSWORD=your_strong_password
  - MYSQL_DATABASE=coffee_pos_db
  - MYSQL_USER=coffee_pos_user
  - MYSQL_PASSWORD=your_user_password
掛載卷:
  - /docker/mariadb/data:/var/lib/mysql (用於持久化資料)
```

4. 啟動 MariaDB 容器

## 步驟 2: 初始化資料庫結構

1. 使用 phpMyAdmin (可以通過 Docker 安裝) 或其他 SQL 客戶端連接到 MariaDB
2. 執行 `database-schema.sql` 檔案中的 SQL 腳本來建立資料表結構和初始數據

## 步驟 3: 設置 Node.js 後端

1. 在 NAS 上安裝 Node.js Docker 映像檔 (推薦使用 `node:18` 版本)
2. 將後端程式碼上傳到 NAS 的共享資料夾，例如 `/docker/coffee-pos/backend`
3. 在該目錄建立名為 `.env` 的檔案，內容如下:

```
PORT=3001
DB_HOST=coffee-pos-db
DB_USER=coffee_pos_user
DB_PASSWORD=your_user_password
DB_NAME=coffee_pos_db
```

4. 在該目錄建立 `package.json` 檔案，內容如下:

```json
{
  "name": "coffee-pos-backend",
  "version": "1.0.0",
  "description": "Coffee Shop POS System Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.1",
    "mysql2": "^2.3.3",
    "dotenv": "^16.0.3"
  }
}
```

5. 建立 Node.js 容器，設定如下:

```
容器名稱: coffee-pos-backend
端口映射: 3001:3001
環境變數:
  從 .env 檔案載入
掛載卷:
  - /docker/coffee-pos/backend:/app
工作目錄:
  - /app
命令:
  - npm install && npm start
```

6. 啟動 Node.js 容器

## 步驟 4: 設置 React 前端

1. 在開發電腦上使用 Create React App 建立前端專案:

```bash
npx create-react-app coffee-pos-frontend
cd coffee-pos-frontend
```

2. 安裝必要套件:

```bash
npm install axios tailwindcss @headlessui/react @heroicons/react
```

3. 拷貝 `POS.jsx` 到 `src/components` 目錄
4. 在 `src/App.js` 中導入並使用 POS 元件
5. 建立 `.env` 檔案，設定後端 API 地址:

```
REACT_APP_API_URL=http://your-nas-ip:3001/api
```

6. 構建前端專案:

```bash
npm run build
```

7. 將構建後的檔案上傳到 NAS 的 `/docker/coffee-pos/frontend/build` 目錄

8. 使用 Nginx 容器來部署前端:

```
容器名稱: coffee-pos-frontend
端口映射: 8080:80
掛載卷:
  - /docker/coffee-pos/frontend/build:/usr/share/nginx/html
```

## 步驟 5: 設定網路連接

1. 在 Docker 中創建名為 `coffee-pos-network` 的自定義網路
2. 將所有容器 (MariaDB, Node.js, Nginx) 添加到該網路中，確保它們可以互相通信

## 步驟 6: 測試系統

1. 在瀏覽器中訪問 `http://your-nas-ip:8080`
2. 應該能看到 POS 系統的登入頁面
3. 使用預設帳號 `admin` 和密碼 `admin123` 登入 (記得在正式環境中更改)

## 注意事項

- **安全性**: 這只是一個基本設置，實際部署時應考慮更多安全措施，例如 HTTPS, 密碼加密等
- **備份**: 定期備份 MariaDB 資料，可以設定 Synology 的備份任務
- **監控**: 使用 Synology 的資源監控工具檢查系統資源使用情況
- **更新**: 定期更新 Docker 映像檔和應用程式套件以獲取安全更新

## 疑難排解

如遇到問題，請查看各容器的日誌:

```bash
docker logs coffee-pos-db
docker logs coffee-pos-backend
docker logs coffee-pos-frontend
```

這些日誌通常可以幫助識別並解決大多數問題。

---

成功設置後，你可以從任何裝置的瀏覽器 (iPad, Windows 觸控螢幕) 訪問這個 POS 系統，這就是使用網頁應用的優勢 - 跨平台兼容。