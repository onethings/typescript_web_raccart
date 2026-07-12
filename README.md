# Traccar Web - TypeScript 重寫版(非官方版)

Traccar GPS 追蹤系統前端的 TypeScript 重寫版本。

## 快速開始

```bash
# 1. 安裝相依套件
npm install

# 2. 啟動開發伺服器（預設 http://localhost:3000）
npx vite

# 3. 生產建置
npx vite build
```

## 測試說明

### 使用公開測試伺服器

開發伺服器預設將 API 請求代理到 **https://demo3.traccar.org**：

| 端點 | 代理目標 |
|---|---|
| `/api/*` | `https://demo3.traccar.org/api/*` |
| `/api/socket` (WebSocket) | `wss://demo3.traccar.org/api/socket` |

開啟 http://localhost:3000 即可看到登入頁面，使用 demo3 的帳號密碼登入測試。

### 使用本地 Traccar 伺服器

若需連接到本地端 Traccar server，修改 `vite.config.ts` 中的 proxy 設定：

```ts
proxy: {
  '/api/socket': {
    target: 'ws://localhost:8082',
    ws: true,
  },
  '/api': {
    target: 'http://localhost:8082',
  },
},
```

### 常用指令

| 指令 | 說明 |
|---|---|
| `npm install` | 安裝所有相依套件 |
| `npx vite` | 啟動開發伺服器（port 3000） |
| `npx vite build` | 生產建置，輸出到 `build/` |
| `npx vite preview` | 預覽 production build |
| `npx tsc --noEmit` | TypeScript 型別檢查 |

## 技術棧

- **框架**: React 19 + TypeScript 5.8
- **狀態管理**: Redux Toolkit 2.12
- **路由**: React Router DOM v7
- **UI**: Material UI (MUI) v7
- **地圖**: MapLibre GL JS v5
- **圖表**: Recharts 2.15
- **建置**: Vite 6 + SWC
- **PWA**: vite-plugin-pwa

## 專案結構

```
src/
├── api/            # API 用戶端（axios + 50+ endpoints）
├── attributes/     # 裝置/位置/指令等屬性定義
├── components/     # 通用元件（36 個）
│   ├── common/     #   - PageLayout, DeviceList, StatusCard 等
│   └── core/       #   - ErrorBoundary, SocketController 等
├── hooks/          # 自訂 hooks（useAsyncTask, useReportData 等）
├── i18n/           # 國際化（60+ 語言）
├── login/          # LogoImage 元件
├── main/           # MainToolbar, useFilter
├── map/            # 地圖系統（21 個元件）
│   ├── core/       #   - MapView, preloadImages, mapUtil
│   ├── main/       #   - MapPositions, MapGeofence, MapRoutePath 等
│   ├── control/    #   - MapScale, MapGeocoder, MapRuler 等
│   └── draw/       #   - MapGeofenceEdit
├── pages/          # 頁面元件（55+ 路由）
│   ├── login/      #   - 登入/註冊/重設密碼/更換伺服器
│   ├── main/       #   - 主地圖頁面 + MainMap
│   ├── settings/   #   - 29 個設定 CRUD 頁面
│   ├── reports/    #   - 12 種報表頁面
│   └── other/      #   - Event, Replay, Geofences, Emulator 等
├── reports/        # 報表輔助元件（ColumnSelect, ResizeHandle 等）
├── resources/      # 圖片資源（SVG 圖示）
├── store/          # Redux store（10 slices）
├── theme/          # MUI 主題（含 RTL 支援）
├── types/          # TypeScript 型別定義
└── utils/          # 工具函式（15 檔）
```
