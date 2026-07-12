# Traccar Web Frontend — 完整功能規格書

> 本文件詳細記錄 Traccar GPS 追蹤系統前端的所有功能、頁面、元件、API、狀態管理與資料流。
> 根據此文件，可用任何程式語言（React/Vue/Angular/Svelte/純 JS）完整還原此前端。

---

## 目錄

1. [專案概觀](#1-專案概觀)
2. [路由系統](#2-路由系統)
3. [登入／認證模組](#3-登入認證模組)
4. [主頁面與地圖系統](#4-主頁面與地圖系統)
5. [裝置列表與篩選](#5-裝置列表與篩選)
6. [事件系統](#6-事件系統)
7. [設定頁面](#7-設定頁面)
8. [報表頁面](#8-報表頁面)
9. [其他頁面](#9-其他頁面)
10. [狀態管理 (Redux Store)](#10-狀態管理-redux-store)
11. [地圖核心系統](#11-地圖核心系統)
12. [通用元件](#12-通用元件)
13. [通用工具函式](#13-通用工具函式)
14. [屬性定義](#14-屬性定義)
15. [主題與樣式](#15-主題與樣式)
16. [HTML 入口與 PWA](#16-html-入口與-pwa)
17. [控制器（Controller）](#17-控制器controller)
18. [API 端點總覽](#18-api-端點總覽)

---

## 1. 專案概觀

### 技術棧

| 技術 | 用途 |
|------|------|
| React 19 | UI 框架 |
| Redux Toolkit | 狀態管理 |
| React Router DOM v7 | 路由 |
| Material UI (MUI) v9 | UI 元件庫 |
| MapLibre GL JS v5 | 地圖引擎 |
| Vite 8 | 前端建置工具 |
| dayjs | 日期時間處理 |
| Recharts | 圖表繪製 |
| exceljs + file-saver | Excel 匯出 |
| @mapbox/mapbox-gl-draw | 地圖繪圖工具 |
| @turf/turf | 地理空間計算 |
| react-rnd | 可拖曳面板 |
| react-window | 虛擬滾動列表 |
| react-qr-code | QR Code 產生 |
| @yudiel/react-qr-scanner | QR Code 掃描 |
| hls.js | 影片串流播放 |
| tss-react | CSS-in-JS 樣式方案 |
| vite-plugin-pwa | PWA 支援 |

### 建置設定 (`vite.config.js`)

- 開發伺服器連接埠: `3000`
- API 代理: `/api` → `http://localhost:8082`, `/api/socket` → `ws://localhost:8082`
- 輸出目錄: `build/`
- PWA: 使用 Service Worker，含 navigateFallbackDenylist 排除 `/api` 路徑
- 外掛: `@vitejs/plugin-react-swc`, `vite-plugin-svgr`, `VitePWA`, `viteStaticCopy`

### 應用程式進入點 (`src/index.jsx`)

渲染階層（由外到內）:
```
ErrorBoundary
  └─ Provider (Redux)
      └─ LocalizationProvider (i18n)
          └─ StyledEngineProvider (MUI emotion)
              └─ AppThemeProvider (MUI 主題)
                  └─ CssBaseline (全域重置樣式)
                      └─ ServerProvider
                          └─ BrowserRouter
                              └─ Navigation
                                  └─ ErrorHandler (Snackbar 錯誤提示)
                                      └─ NativeInterface (原生橋接)
```

啟動時執行 `preloadImages()` 預載地圖圖示。

---

## 2. 路由系統

### 路由結構 (`src/Navigation.jsx`)

```
/login                          → LoginPage
/register                       → RegisterPage
/reset-password                 → ResetPasswordPage
/change-server                  → ChangeServerPage
/                               → App (Layout)
  /                             → MainPage (首頁地圖)
  /position/:id                 → PositionPage (位置詳情)
  /network/:positionId          → NetworkPage (網路資訊)
  /event/:id                    → EventPage (事件詳情含地圖)
  /replay                       → ReplayPage (路徑回放)
  /geofences                    → GeofencesPage (圍欄編輯)
  /emulator                     → EmulatorPage (位置模擬)
  /stream                       → StreamPage (影片串流)

  /settings
    /preferences                → PreferencesPage (使用者偏好)
    /notifications              → NotificationsPage (通知規則列表)
    /notification/:id           → NotificationPage (編輯通知)
    /notification               → NotificationPage (新增通知)
    /user/:id                   → UserPage (編輯使用者)
    /user                       → UserPage (新增使用者)
    /users                      → UsersPage (使用者列表)
    /server                     → ServerPage (伺服器設定)
    /devices                    → DevicesPage (裝置列表)
    /device/:id                 → DevicePage (編輯裝置)
    /device                     → DevicePage (新增裝置)
    /device/:id/connections     → DeviceConnectionsPage (裝置關聯)
    /device/:id/command         → CommandDevicePage (發送指令給裝置)
    /groups                     → GroupsPage (群組列表)
    /group/:id                  → GroupPage (編輯群組)
    /group                      → GroupPage (新增群組)
    /group/:id/connections      → GroupConnectionsPage (群組關聯)
    /group/:id/command          → CommandGroupPage (發送指令給群組)
    /geofence/:id               → GeofencePage (編輯圍欄)
    /geofence                   → GeofencePage (新增圍欄)
    /drivers                    → DriversPage (駕駛列表)
    /driver/:id                 → DriverPage (編輯駕駛)
    /driver                     → DriverPage (新增駕駛)
    /calendars                  → CalendarsPage (日曆列表)
    /calendar/:id               → CalendarPage (編輯日曆)
    /calendar                   → CalendarPage (新增日曆)
    /attributes                 → ComputedAttributesPage (計算屬性列表)
    /attribute/:id              → ComputedAttributePage (編輯計算屬性)
    /attribute                  → ComputedAttributePage (新增計算屬性)
    /maintenances               → MaintenancesPage (保養規則列表)
    /maintenance/:id            → MaintenancePage (編輯保養規則)
    /maintenance                → MaintenancePage (新增保養規則)
    /commands                   → CommandsPage (指令列表)
    /command/:id                → CommandPage (編輯指令)
    /command                    → CommandPage (新增指令)
    /:type/:id/share            → SharePage (產生分享連結)
    /accumulators/:deviceId     → AccumulatorsPage (編輯累計器)
    /announcement               → AnnouncementPage (發送公告)
    /user/:id/connections       → UserConnectionsPage (使用者關聯)
    /group/:id/connections      → GroupConnectionsPage (群組關聯)
    /device/:id/connections     → DeviceConnectionsPage (裝置關聯)

  /reports
    /combined                   → CombinedReportPage (綜合報表)
    /chart                      → ChartReportPage (圖表報表)
    /events                     → EventReportPage (事件報表)
    /geofences                  → GeofenceReportPage (圍欄報表)
    /route                      → PositionsReportPage (路線報表)
    /stops                      → StopReportPage (停留報表)
    /summary                    → SummaryReportPage (摘要報表)
    /trips                      → TripReportPage (行程報表)
    /scheduled                  → ScheduledPage (排程報表)
    /statistics                 → StatisticsPage (伺服器統計)
    /audit                      → AuditPage (稽核日誌)
    /logs                       → LogsPage (裝置通訊日誌)
```

### URL 參數處理

進入 Navigation 時，會解析 URL 查詢參數並處理：
- `locale`: 設定語言（透過 `setLocalLanguage`）
- `token`: 自動登入 token（POST `/api/session?token=...`）
- `uniqueId`: 自動選取對應裝置
- `openid`: OpenID 登入成功回呼，觸發 `generateLoginToken()`

所有參數處理完後會從 URL 清除。

### App 佈局元件 (`src/App.jsx`)

- 使用 `<Outlet />` 渲染子路由
- 初始化時檢查 session（GET `/api/session`）
- 若無 session → 導向 `/login` 或 `/register`
- 若使用者未接受條款 → 顯示 `TermsDialog`
- 嵌入控制器：`SocketController`, `CachingController`, `UpdateController`, `MotionController`
- 手機版顯示 `BottomMenu`

---

## 3. 登入／認證模組

### 3.1 登入頁面 (`src/login/LoginPage.jsx`)

**功能**: 使用者登入

**API 呼叫**:
- `POST /api/session` — 以 email + password 登入（支援 TOTP code）
- `GET /api/session?token=...` — Token 登入
- `GET /api/session/openid/auth` — OpenID 登入（頁面跳轉）

**UI 元件**:
- 語言選擇器（`<Select>` 顯示國旗 + 語系名稱）
- Email 輸入框（localStorage 記憶）
- 密碼輸入框（`PasswordField`，含顯示/隱藏切換）
- TOTP 驗證碼輸入框（當伺服器回應 401 且 `WWW-Authenticate: TOTP` 時顯示）
- 註冊按鈕（若 `registration` 啟用）
- 忘記密碼連結
- QR Code 掃碼登入按鈕（桌機版顯示 `QrCode2Icon`）
- 更換伺服器按鈕（原生 App 版顯示 `VpnLockIcon`，提示目前伺服器）

**資料流**:
1. 密碼登入成功 → `generateLoginToken()` → dispatch `sessionActions.updateUser()` → 導向 postLogin 目標或 `/`
2. Token 登入 → 從 Native 橋接收到 token → fetch → dispatch user → 導向 `/`
3. OpenID 登入 → 跳轉 `/api/session/openid/auth`

**狀態**: 使用 `usePersistedState('loginEmail', '')` 記住 Email

**錯誤處理**: 失敗時顯示錯誤訊息、清空密碼、`setFailed(true)`

### 3.2 註冊頁面 (`src/login/RegisterPage.jsx`)

**功能**: 新使用者註冊

**API 呼叫**:
- `POST /api/users` — 建立使用者
- `POST /api/users/totp` — 若 `totpForce` 啟用，預先產生 TOTP Key

**UI 元件**:
- 名稱輸入框
- Email 輸入框
- 密碼輸入框（`PasswordField`）
- TOTP Key 顯示（唯讀，若 `totpForce`）
- 註冊按鈕（disabled 條件: 無名稱/無密碼/無有效 Email）
- 返回登入按鈕

**驗證**: Email 正則 `/^(.*)@(.*)\.(.{2,})$/`（新伺服器模式可跳過 Email 驗證）

### 3.3 重設密碼頁面 (`src/login/ResetPasswordPage.jsx`)

**功能**: 忘記密碼 / 重設密碼

**API 呼叫**:
- `POST /api/password/reset` — 發送重設信（需 Email）
- `POST /api/password/update` — 更新密碼（需 token + 新密碼）

**兩種模式**:
1. 無 token: 顯示 Email 輸入 → 發送重設信
2. 有 token（`?passwordReset=...`）: 顯示新密碼輸入 → 更新密碼

### 3.4 更換伺服器頁面 (`src/login/ChangeServerPage.jsx`)

**功能**: 切換到不同的 Traccar 伺服器（原生 App 用）

**API**: 無（直接跳轉 URL 或透過 Native bridge 發送）

**UI 元件**:
- 伺服器 URL 輸入（`Autocomplete` 含官方伺服器列表）
- QR Code 掃描（`@yudiel/react-qr-scanner`）
- 確認按鈕

**官方伺服器列表**: demo.traccar.org, demo2, demo3, demo4, server.traccar.org, localhost:8082, localhost:3000

### 3.5 登入佈局 (`src/login/LoginLayout.jsx`)

- 左右分欄佈局
- 左側: 主要色背景 + Logo（桌機版）
- 右側: Paper 卡片 + 表單
- 響應式: 小螢幕隱藏左側欄

### 3.6 Logo 圖片 (`src/login/LogoImage.jsx`)

- 支援伺服器自訂 logo（`logo` / `logoInverted` 屬性）
- 無自訂 logo 時使用內建 SVG（`logo.svg`）
- 最大尺寸 240x120px

---

## 4. 主頁面與地圖系統

### 4.1 主頁面 (`src/main/MainPage.jsx`)

**功能**: 追蹤系統首頁，整合地圖 + 裝置列表

**API**: 無（資料透過 SocketController 即時推送）

**UI 佈局**:
- 桌機版:
  - 左側浮動側邊欄（350px 寬）:
    - 頂部: `MainToolbar`（搜尋、篩選）
    - 中間: `DeviceList`（裝置列表）
    - 底部: `BottomMenu`
  - 全螢幕: `MainMap`
  - 右側: `EventsDrawer`（事件抽屜）
  - 底部中央: `StatusCard`（選取裝置時顯示）
- 手機版:
  - 全螢幕 `MainMap`
  - 地圖上方疊加 `MainToolbar` + `DeviceList`
  - 底部: `BottomMenu`

**狀態管理**:
- `filteredDevices`, `filteredPositions` — 根據篩選條件動態計算
- `devicesOpen` — 裝置列表是否展開
- `eventsOpen` — 事件抽屜是否開啟
- `keyword` — 搜尋關鍵字
- `filter` — 進階篩選（狀態、群組、圍欄）
- `filterSort` — 排序方式
- `filterMap` — 是否只顯示符合篩選的裝置位置

### 4.2 主工具列 (`src/main/MainToolbar.jsx`)

**功能**: 裝置搜尋、篩選、快速切換

**UI 元件**:
- 切換地圖/列表按鈕（`MapIcon` / `DnsIcon`）
- 搜尋輸入框（`OutlinedInput`）— 搜尋裝置名稱、uniqueId、電話、型號、聯絡人
- 篩選按鈕（`TuneIcon`）— 開啟 Popover 篩選面板
- 快速裝置預覽 Popover — 搜尋焦點時顯示前 3 筆

**篩選面板 (Popover)**:
- 裝置狀態篩選（多選: online/offline/unknown，含數量統計）
- 群組篩選（多選，依名稱排序）
- 圍欄篩選（多選，依名稱排序）
- 排序方式（無/名稱/最後更新時間）

### 4.3 主地圖 (`src/main/MainMap.jsx`)

**組合以下地圖元件**:
- `MapView` — MapLibre GL 容器
- `MapOverlay` — 天氣、交通等疊加層
- `MapGeofence` — 圍欄繪製
- `MapAccuracy` — 位置精確度圓圈
- `MapLiveRoutes` — 裝置即時軌跡
- `MapPositions` — 位置標記（叢集、方向箭頭、狀態顏色）
- `MapDefaultCamera` — 初始地圖定位
- `MapSelectedDevice` — 選取裝置跟隨
- `PoiMap` — POI 圖層（KML/KMZ）
- `MapRuler` — 距離測量工具
- `MapNotification` — 事件通知按鈕
- `MapScale` — 比例尺
- `MapCurrentLocation` — GPS 定位按鈕
- `MapGeocoder` — 地址搜尋
- `MapPadding` — 地圖偏移（配合側邊欄）

---

## 5. 裝置列表與篩選

### 5.1 裝置列表 (`src/main/DeviceList.jsx`)

**功能**: 虛擬滾動裝置列表

**API**: `GET /api/devices` — 定期重新整理

**UI**:
- 使用 `react-window` 的 `<List>` 元件（每行高度 72px）
- 每 60 秒強制重新渲染（更新相對時間顯示）
- `overscanCount={5}` 預載

### 5.2 裝置行 (`src/main/DeviceRow.jsx`)

**功能**: 單一裝置資訊列

**UI 元件（由左至右）**:
- 頭像（`Avatar` + 裝置類別圖示）
- 主要資訊（可設定為 name/uniqueId/phone/model/contact/geofence/driver/motion）
- 次要資訊（同上 + 狀態文字）
- 警報圖示（`ErrorIcon`，紅色，有 alarm 時顯示）
- 點火狀態（`EngineIcon`，綠色=啟動/灰色=關閉）
- 電量顯示（依電量顯示不同圖示與顏色: >70 綠色, >30 黃色, ≤30 紅色；有充電圖示區別）
- MotionBar（若設定為次要欄位）

**狀態顏色**: online → 綠色, offline → 紅色, unknown → 灰色

**狀態文字**: online → "在線", offline/dayjs.fromNow()（取決於 lastUpdate）

### 5.3 篩選邏輯 (`src/main/useFilter.js`)

**過濾條件（AND 組合）**:
1. 狀態篩選: 符合選取的狀態
2. 群組篩選: 裝置所屬群組（含父群組遞迴）符合選取
3. 圍欄篩選: 裝置最新位置所在的圍欄符合選取
4. 關鍵字搜尋: name/uniqueId/phone/model/contact 包含關鍵字（不區分大小寫）

**排序**:
- name: 字母排序
- lastUpdate: 最後更新時間遞減
- 預設: 不排序（依伺服器回傳順序）

**地圖篩選**: `filterMap` 控制地圖是否只顯示符合條件的裝置位置

### 5.4 MotionBar (`src/main/components/MotionBar.jsx`)

**功能**: 顯示裝置過去 24 小時的移動/停止時間條

- 從 Redux `motion` store 讀取分段資料
- 綠色 = 移動中，紅色 = 停止
- 寬度比例對應時間長度
- 最小寬度 4px（超過 16 段時可為 0）

---

## 6. 事件系統

### 6.1 事件抽屜 (`src/main/EventsDrawer.jsx`)

**功能**: 顯示即時事件列表

**API**: 事件透過 WebSocket 即時推送

**UI 元件**:
- 右側 Drawer（320px 寬）
- 標題 "事件" + 全部刪除按鈕
- 事件列表:
  - 主要文字: `裝置名稱 • 事件類型`
  - 次要文字: 事件時間（`formatTime(eventTime, 'seconds')`）
  - 個別刪除按鈕
  - 點擊導向 `/event/:id`

### 6.2 事件控制器 (`src/events/store/events.js`)

- 最多保留 50 筆事件
- `add`: 從前方插入新事件，超過 50 筆從後方截斷
- `delete`: 依 id 過濾移除
- `deleteAll`: 清空

### 6.3 事件類型

透過 `prefixString('event', type)` 使用 i18n 翻譯，特殊類型 `alarm` 會解析逗號分隔的警報清單。

---

## 7. 設定頁面

### 7.1 設定選單 (`src/settings/components/SettingsMenu.jsx`)

左側導航選單，包含以下項目（依權限顯示）:

| 選單項目 | 圖示 | 路徑 | 權限 |
|---------|------|------|------|
| 偏好設定 | TuneIcon | `/settings/preferences` | 全部 |
| 通知 | NotificationsIcon | `/settings/notifications` | 非唯讀 |
| 使用者設定 | PersonIcon | `/settings/user/:id` | 非唯讀 |
| 裝置 | DnsIcon | `/settings/devices` | 非唯讀 |
| 圍欄 | DrawIcon | `/geofences` | 非唯讀 |
| 群組 | FolderIcon | `/settings/groups` | 非唯讀 + 未禁用 |
| 駕駛 | PersonIcon | `/settings/drivers` | 非唯讀 + 未禁用 |
| 日曆 | TodayIcon | `/settings/calendars` | 非唯讀 + 未禁用 |
| 計算屬性 | CalculateIcon | `/settings/attributes` | 非唯讀 + 未禁用 |
| 保養 | BuildIcon | `/settings/maintenances` | 非唯讀 + 未禁用 |
| 指令 | SendIcon | `/settings/commands` | 非唯讀 + 未禁用 |
| 帳單 | PaymentIcon | 外部連結 | 有 billingLink |
| 支援 | HelpIcon | 外部連結 | 有 supportLink |
| --- 分隔線 --- | | | |
| 公告 | CampaignIcon | `/settings/announcement` | 管理員 |
| 伺服器設定 | SettingsIcon | `/settings/server` | 管理員 |
| 使用者管理 | PeopleIcon | `/settings/users` | 管理員 |

### 7.2 通用設定頁面架構

#### `PageLayout` (`src/common/components/PageLayout.jsx`)

**響應式佈局**:
- 桌機版: 永久 Drawer（可收合 mini-variant）+ 內容區
- 手機版: 臨時 Drawer（AppBar 漢堡選單打開）+ AppBar + 內容區

**功能**:
- 麵包屑標題（桌機版只顯示最後一層，手機版顯示完整路徑）
- 返回按鈕（導向首頁）
- Drawer 收合按鈕（桌機版切換 mini-variant）

#### `EditItemView` (`src/settings/components/EditItemView.jsx`)

**通用 CRUD 元件**:
- 依 `:id` 參數判斷新增或編輯
- API: `GET /api/{endpoint}/{id}` → `PUT /api/{endpoint}/{id}` 或 `POST /api/{endpoint}`
- 載入中顯示 Skeleton 骨架
- 底部取消/儲存按鈕
- 儲存成功後導向上一頁

### 7.3 伺服器設定 (`src/settings/ServerPage.jsx`)

**功能**: 編輯伺服器全域設定（管理員專用）

**API**: `PUT /api/server`, `POST /api/server/file/{name}`

**區段（Accordion）**:
1. **偏好設定**: mapUrl（自訂地圖）, overlayUrl（自訂疊加層）, 地圖樣式選擇器, bingMapsKey, mapTilerKey, locationIqKey, tomTomKey, hereKey, googleKey, ordnanceSurveyKey, openWeatherKey
2. **伺服器**: registration（啟用 + 過期天數）, readonly, deviceReadonly, forceSettings, coordinateFormat, speedUnit, distanceUnit, altitudeUnit, volumeUnit
3. **其他**: poiLayer（POI 圖層 URL）, announcements
4. **屬性（Attributes）**: 使用 `useServerAttributes`, `useCommonDeviceAttributes`, `useCommonUserAttributes`

### 7.4 使用者管理

#### 使用者列表 (`src/settings/UsersPage.jsx`)

**API**: `GET /api/users?excludeAttributes&limit&offset&keyword`

**功能**: 管理員管理所有使用者

**UI**:
- 搜尋列（`SearchHeader`，500ms debounce）
- 無限滾動（`useScrollToLoad`）
- 表格欄位: 名稱, Email, 管理員, 停用, 過期日, 裝置數, 操作（模擬登入, 關聯）

**特殊操作**:
- 「登入為該使用者」功能（Admin 專用）
- 關聯頁面連結

#### 使用者編輯 (`src/settings/UserPage.jsx`)

**API**: `GET/PUT/POST/DELETE /api/users/{id}`, `POST /api/users/totp`, `POST /api/session/token/revoke`

**區段（Accordion）**:
1. **必要資訊**: name, email, password, TOTP Key（產生/清除）
2. **偏好設定**: phone, 預設地圖, coordinateFormat（dd/ddm/dms）, speedUnit（kn/kmh/mph）, distanceUnit（km/mi/nmi）, altitudeUnit（m/ft）, volumeUnit（ltr/impGal/usGal）
3. **限制**: readonly, deviceReadonly, disabled, userLimit, deviceLimit, expiration, tokenExpiration, fixedEmail
4. **權限**: admin, deviceReadonly, limitCommands, disableReports, disableShare, fixedEmail
5. **屬性**: 使用 `useCommonUserAttributes` + `useUserAttributes`

### 7.5 裝置管理

#### 裝置列表 (`src/settings/DevicesPage.jsx`)

**API**: `GET /api/devices?all&limit&offset&keyword`

**功能**: 管理所有裝置

**UI**:
- 搜尋列 + 「顯示全部」切換
- Excel 匯出按鈕（使用 `exportExcel.js`）
- 無限滾動
- 表格欄位: 名稱, 識別碼, 群組, 電話, 型號, 聯絡人, 過期日, 狀態, 最後更新, 地址, 操作

#### 裝置編輯 (`src/settings/DevicePage.jsx`)

**API**: `GET/PUT/POST /api/devices/{id}`, `POST /api/devices/{id}/image`

**區段（Accordion）**:
1. **必要資訊**: name, uniqueId（QR 掃描後不可編輯）
2. **額外資訊**: groupId, phone, model, contact, category（預設/動物/腳踏車/船/公車/汽車/露營車/起重機/直升機/機車/人/飛機/輪船/曳引機/拖車/火車/電車/卡車/廂型車/滑板車）
3. **圖片上傳**: `FileInput` → POST `/api/devices/{id}/image`
4. **QR Code**: 產生裝置設定 QR Code
5. **屬性**: 使用 `useDeviceAttributes`

### 7.6 群組管理

#### 群組列表 (`src/settings/GroupsPage.jsx`)

**API**: `GET /api/groups?limit&offset&keyword`

**功能**: 管理裝置群組

**操作**: 發送指令給群組, 分享連結, 關聯

#### 群組編輯 (`src/settings/GroupPage.jsx`)

**API**: `GET/PUT/POST /api/groups/{id}`

**區段**: 必要（name）, 額外（parent groupId）, 屬性

### 7.7 圍欄管理

#### 圍欄編輯 (`src/settings/GeofencePage.jsx`)

**API**: `GET/PUT/POST /api/geofences/{id}`

**區段**:
1. **必要資訊**: name
2. **額外**: description, calendarId, hide（隱藏於地圖）
3. **屬性**: color, lineWidth, lineOpacity, speedLimit, polylineDistance, hide, floor, ceiling

### 7.8 通知管理

#### 通知列表 (`src/settings/NotificationsPage.jsx`)

**API**: `GET /api/notifications?limit&offset&keyword`

**欄位**: 描述, 類型, 總是發送, 警報類型, 通知方式

#### 通知編輯 (`src/settings/NotificationPage.jsx`)

**API**: `GET/PUT/POST /api/notifications/{id}`, `POST /api/notifications/test/{notificator}`

**區段**:
1. **必要**: type（從 `/api/notifications/types` 載入）, notificators（逗號分隔）
2. **條件**: alarms（type=alarm 時顯示）, commandId（含 command notificator 時顯示）

**通知方式**: mail, sms, web, telegram, pushover, command

**測試按鈕**: 發送測試通知

### 7.9 指令管理

#### 指令列表 (`src/settings/CommandsPage.jsx`)

**API**: `GET /api/commands?limit&offset&keyword`

**欄位**: 描述, 類型, 發送簡訊, 操作

#### 指令編輯 (`src/settings/CommandPage.jsx`)

使用 `BaseCommandView` 元件

#### 發送指令給裝置 (`src/settings/CommandDevicePage.jsx`)

**API**: `POST /api/commands/send`（含 deviceId）

**功能**: 選取已儲存指令或輸入新指令類型

#### 發送指令給群組 (`src/settings/CommandGroupPage.jsx`)

**API**: `POST /api/commands/send?groupId={id}`

**功能**: 較簡化版本，只支援自訂指令

#### BaseCommandView (`src/settings/components/BaseCommandView.jsx`)

**功能**: 指令類型選擇 + 動態屬性欄位

**資料來源**:
- `GET /api/commands/send?deviceId=X` — 已儲存指令
- `GET /api/commands/types` — 指令類型

**指令類型（25+ 種）**: custom, positionPeriodic, setTimezone, sendSms, message, sendUssd, sosNumber, silenceTime, setPhonebook, voiceMessage, outputControl, voiceMonitoring, setAgps, setIndicator, configuration, setConnection, setOdometer, modePowerSaving, modeDeepSleep, alarmGeofence, alarmBattery, alarmSos, alarmRemove, alarmClock, alarmSpeed, engineStop, engineResume, doorLock, doorUnlock, relayOn, relayOff, arm, disarm, setHome, park, videoStart, videoStop 等

### 7.10 計算屬性

#### 計算屬性列表 (`src/settings/ComputedAttributesPage.jsx`)

**API**: `GET /api/attributes/computed?limit&offset&keyword`

**欄位**: 描述, 屬性, 表達式, 類型, 操作（管理員專用）

#### 計算屬性編輯 (`src/settings/ComputedAttributePage.jsx`)

**API**: `GET/PUT/POST /api/attributes/computed/{id}`, `POST /api/attributes/computed/test?deviceId=`

**區段**:
1. **必要**: description, attribute（從位置屬性 autocomplete）, expression（字串表達式）
2. **測試**: 選取裝置測試表達式，結果以 Snackbar 顯示

**允許的屬性**: valid, latitude, longitude, altitude, speed, course, address, accuracy

### 7.11 保養管理

#### 保養列表 (`src/settings/MaintenancesPage.jsx`)

**API**: `GET /api/maintenance?limit&offset&keyword`

**欄位**: 名稱, 類型, 起始值, 週期, 操作

#### 保養編輯 (`src/settings/MaintenancePage.jsx`)

**API**: `GET/PUT/POST /api/maintenance/{id}`

**區段**: 必要（name, type 從位置屬性的數值欄位選擇）, 起始/週期值（含單位轉換）, 屬性

### 7.12 日曆管理

#### 日曆列表 (`src/settings/CalendarsPage.jsx`)

**API**: `GET /api/calendars?limit&offset&keyword`

#### 日曆編輯 (`src/settings/CalendarPage.jsx`)

**API**: `GET/PUT/POST /api/calendars/{id}`

**功能**:
- 上傳 .ics 檔案
- 簡易日曆建立器（ONCE/DAILY/WEEKLY/MONTHLY 頻率，含 BYDAY/BYMONTHDAY）
- RRULE 解析與產生
- Base64 編碼 iCalendar 資料儲存

### 7.13 駕駛管理

#### 駕駛列表 (`src/settings/DriversPage.jsx`)

**API**: `GET /api/drivers?limit&offset&keyword`

**欄位**: 名稱, 識別碼, 操作

#### 駕駛編輯 (`src/settings/DriverPage.jsx`)

**API**: `GET/PUT/POST /api/drivers/{id}`

**區段**: 必要（name, uniqueId）, 屬性

### 7.14 偏好設定 (`src/settings/PreferencesPage.jsx`)

**功能**: 使用者個人偏好設定

**API**: `PUT /api/users/{id}`, `POST /api/session/token`

**區段**:
1. **偏好**: Token 產生（含過期日）, coordinateFormat, speedUnit, distanceUnit, altitudeUnit, volumeUnit
2. **地圖**: 預設地圖樣式, 啟用地圖樣式, 疊加層（交通/天氣等）
3. **裝置**: 裝置主要顯示欄位, 次要顯示欄位, 位置彈出欄位
4. **事件**: 聲音事件, 聲音警報, 警報類型
5. **外觀**: 深色模式, POI 圖層 URL
6. **版本資訊**: App 版本（VITE_APP_VERSION）, 伺服器版本

### 7.15 累計器編輯 (`src/settings/AccumulatorsPage.jsx`)

**API**: `PUT /api/devices/{deviceId}/accumulators`

**欄位**: Hours（小時）, Total Distance（依距離單位轉換）

### 7.16 分享連結 (`src/settings/SharePage.jsx`)

**API**: `POST /api/share/{type}`

**功能**: 產生裝置/群組的公開分享連結

**UI**: 項目名稱（唯讀）, 過期時間, 產生按鈕, 連結顯示 + 複製

### 7.17 公告 (`src/settings/AnnouncementPage.jsx`)

**API**: `POST /api/notifications/send/{notificator}?userId=...`

**功能**: 向指定使用者發送公告

**UI**: 使用者選擇器（多選）, 通知方式, 主旨, 內容

### 7.18 關聯頁面

#### 裝置關聯 (`src/settings/DeviceConnectionsPage.jsx`)

**功能**: 連結/解除連結裝置與其他實體

**使用 `LinkField`**: 圍欄, 通知, 駕駛, 計算屬性, 指令, 保養

#### 群組關聯 (`src/settings/GroupConnectionsPage.jsx`)

**功能**: 群組與圍欄/通知/駕駛/計算屬性/指令/保養的關聯

#### 使用者關聯 (`src/settings/UserConnectionsPage.jsx`)

**功能**: 使用者與裝置/群組/圍欄/通知/日曆/被管理使用者/計算屬性/駕駛的關聯

### 7.19 通用設定元件

#### `EditAttributesAccordion` (`src/settings/components/EditAttributesAccordion.jsx`)

**功能**: 動態屬性編輯器
- 新增/刪除屬性
- 布林值 checkbox
- 數字輸入（含單位轉換: speed/distance/volume）
- 字串輸入

#### `AddAttributeDialog` (`src/settings/components/AddAttributeDialog.jsx`)

**功能**: 新增自訂屬性的對話框
- 屬性名稱（自由文字）
- 類型選擇（string/number/boolean）

#### `CollectionActions` (`src/settings/components/CollectionActions.jsx`)

**功能**: 表格列操作按鈕
- 桌機版: 工具列按鈕
- 手機版: 選單

#### `CollectionFab` (`src/settings/components/CollectionFab.jsx`)

**功能**: 浮動新增按鈕（FAB）

#### `SearchHeader` (`src/settings/components/SearchHeader.jsx`)

**功能**: 搜尋輸入（500ms debounce）

#### `LinkField` (`src/common/components/LinkField.jsx`)

**功能**: Autocomplete 關聯選擇器
- `POST/DELETE /api/permissions` — 建立/移除關聯
- 第一次 focus 時載入資料

---

## 8. 報表頁面

### 8.1 報表選單 (`src/reports/components/ReportsMenu.jsx`)

| 報表 | 圖示 | 路徑 |
|------|------|------|
| 綜合報表 | StarIcon | `/reports/combined` |
| 事件報表 | NotificationsActiveIcon | `/reports/events` |
| 圍欄報表 | PlaceIcon | `/reports/geofences` |
| 行程報表 | PlayCircleFilledIcon | `/reports/trips` |
| 停留報表 | PauseCircleFilledIcon | `/reports/stops` |
| 摘要報表 | FormatListBulletedIcon | `/reports/summary` |
| 圖表報表 | TrendingUpIcon | `/reports/chart` |
| 路徑回放 | RouteIcon | `/replay` |
| 路線報表 | TimelineIcon | `/reports/route` |
| 排程報表 | EventRepeatIcon | `/reports/scheduled` |
| 統計報表 | BarChartIcon | `/reports/statistics`（管理員） |
| 稽核日誌 | VerifiedUserIcon | `/reports/audit`（管理員） |
| 裝置日誌 | NotesIcon | `/reports/logs` |

### 8.2 報表篩選器 (`src/reports/components/ReportFilter.jsx`)

**功能**: 通用報表篩選面板

**UI 元件**:
- 裝置選擇器（`SelectField`，支援「全部裝置」選項）
- 群組選擇器
- 時間區段選擇（今天/昨天/本週/上週/本月/上月/自訂）
- 自訂時間輸入（datetime-local）

**按鈕（SplitButton）**:
- 主要動作: 顯示報表（JSON）或排程
- 下拉選項: 匯出（XLSX/CSV/GPX/KML/KMZ）, 列印, 排程
- 排程時顯示: 描述 + 日曆選擇

**資料流**: 選擇裝置/時間後自動觸發查詢（URL searchParams 驅動）

### 8.3 綜合報表 (`src/reports/CombinedReportPage.jsx`)

**API**: `GET /api/reports/combined?from&to&deviceId&groupId`

**功能**: 同時顯示事件 + 路線的地圖報表

**UI**:
- 左側: `ReportFilter`
- 右側: 可調整大小的地圖（`ResizeHandle`）+ 表格
- 地圖: `MapRouteCoordinates`（路線）+ `MapMarkers`（事件標記）+ `MapCamera`（縮放至路線範圍）
- 表格欄位: 裝置, FixTime, 類型（事件類型）

### 8.4 圖表報表 (`src/reports/ChartReportPage.jsx`)

**API**: `GET /api/reports/route?from&to&deviceId`

**功能**: 位置資料圖表（Recharts）

**UI**:
- 可選 Y 軸欄位（多選）: speed, altitude, distance 等
- 時間類型選擇: fixTime/deviceTime/serverTime
- Line chart + Brush 縮放工具
- 動態單位轉換

### 8.5 事件報表 (`src/reports/EventReportPage.jsx`)

**API**: `GET /api/reports/events?from&to&deviceId&groupId&eventType&alarmType`

**功能**: 查詢事件記錄

**UI**:
- 可選欄位
- 可調整大小的地圖（顯示 `MapPositions` + 選取事件位置）
- Excel 匯出
- 排程報表

### 8.6 圍欄報表 (`src/reports/GeofenceReportPage.jsx`)

**API**: `GET /api/reports/geofences?from&to&deviceId&geofenceId`

**功能**: 圍欄進出記錄

**欄位**: geofenceId, startTime, endTime, duration

**特色**: Excel 匯出（依裝置分 sheet）, 排程報表

### 8.7 路線報表 (`src/reports/PositionsReportPage.jsx`)

**API**: `GET /api/positions?from&to&deviceId&geofenceId`

**功能**: 位置路線軌跡

**UI**:
- 地圖: `MapRoutePath`（速度著色路線）+ `MapRoutePoints`（方向箭頭標記）+ `MapPositions`
- 可選欄位（動態從位置屬性 + 位置屬性定義載入）
- 滾動至選取位置
- 排程報表

### 8.8 停留報表 (`src/reports/StopReportPage.jsx`)

**API**: `GET /api/reports/stops?from&to&deviceId&groupId`

**功能**: 裝置靜止停留記錄

**欄位**: startTime, startOdometer, address, endTime, duration, engineHours, spentFuel

**UI**: 地圖顯示停留起點/終點標記

### 8.9 摘要報表 (`src/reports/SummaryReportPage.jsx`)

**API**: `GET /api/reports/summary?from&to&daily&deviceId&groupId`

**功能**: 每日或整體摘要

**欄位**: startTime, distance, startOdometer, endOdometer, averageSpeed, maxSpeed, engineHours, spentFuel

**特色**: daily 參數切換日/總計

### 8.10 行程報表 (`src/reports/TripReportPage.jsx`)

**API**: `GET /api/reports/trips?from&to&deviceId&groupId`

**功能**: 移動行程記錄

**欄位**: startTime, startOdometer, startAddress, endTime, endOdometer, endAddress, distance, averageSpeed, maxSpeed, duration, spentFuel, driverName

**UI**: 地圖 + 路線 + 起終點標記

### 8.11 排程報表 (`src/reports/ScheduledPage.jsx`)

**API**: `GET /api/reports`, `DELETE /api/reports/{id}`

**功能**: 管理已排程的報表

**欄位**: 類型, 描述, 日曆, 刪除

### 8.12 統計報表 (`src/reports/StatisticsPage.jsx`)

**API**: `GET /api/statistics?from&to`

**功能**: 伺服器使用統計（管理員專用）

**欄位**: captureTime, activeUsers, activeDevices, requests, messagesReceived, messagesStored, mailSent, smsSent, geocoderRequests, geolocationRequests

### 8.13 稽核日誌 (`src/reports/AuditPage.jsx`)

**API**: `GET /api/audit?from&to`

**功能**: 管理員稽核軌跡

**欄位**: actionTime, address, userId, actionType, objectType, objectId

### 8.14 裝置日誌 (`src/reports/LogsPage.jsx`)

**功能**: 即時裝置通訊日誌檢視器

**資料來源**: WebSocket `logs` 訊息

**行為**:
- 掛載時啟用 `sessionActions.enableLogs(true)`
- 卸載時停用（`enableLogs(false)`）
- 表格欄位: 狀態（registered/unregistered）, uniqueId, protocol, data
- 未註冊裝置顯示「註冊」按鈕（導向新增裝置頁面）

### 8.15 報表元件

#### `ColumnSelect` (`src/reports/components/ColumnSelect.jsx`)

**功能**: 多選報表欄位

#### `ResizeHandle` (`src/reports/components/ResizeHandle.jsx`)

**功能**: 地圖/表格間可拖曳調整大小

#### `scheduleReport.js` (`src/reports/common/scheduleReport.js`)

**功能**: 排程報表 API 輔助函式
- `POST /api/reports` 建立排程
- 自動建立 deviceIds/groupIds 權限

#### `useReportStyles.js` (`src/reports/common/useReportStyles.js`)

**功能**: 報表頁面 CSS-in-JS 樣式（篩選器、地圖容器、表格、按鈕等）

---

## 9. 其他頁面

### 9.1 位置詳情 (`src/other/PositionPage.jsx`)

**API**: `GET /api/positions?id={id}`

**功能**: 檢視單一位置的所有屬性

**UI**:
- AppBar 顯示裝置名稱
- 表格顯示所有位置屬性（排除 `attributes` 物件）
- 使用 `PositionValue` 元件智慧渲染每個欄位

### 9.2 網路資訊 (`src/other/NetworkPage.jsx`)

**API**: `GET /api/positions?id={positionId}`

**功能**: 檢視基地台/WiFi 資訊

**UI**:
- 基地台表格: MCC, MNC, LAC, CID
- WiFi 存取點（若有資料）

### 9.3 事件詳情 (`src/other/EventPage.jsx`)

**API**: `GET /api/events/{id}`, `GET /api/positions?id={event.positionId}`

**功能**: 在地圖上檢視事件

**UI**:
- 地圖顯示圍欄 + 位置標記
- 點擊標記顯示 `StatusCard`
- 事件類型名稱（`formatNotificationTitle`）

### 9.4 路徑回放 (`src/other/ReplayPage.jsx`)

**API**: `GET /api/positions?from&to&deviceId`

**功能**: 播放裝置歷史軌跡

**UI**:
- 地圖: `MapRoutePath` + `MapRoutePoints` + 位置標記
- 播放控制:
  - 播放/暫停/前進/倒退
  - 時間軸滑桿
  - 速度控制（1x/2x/5x/10x）
- 裝置選擇器
- 疊加層支援
- 點擊標記顯示 `StatusCard`

### 9.5 圍欄編輯器 (`src/other/GeofencesPage.jsx`)

**功能**: 視覺化圍欄編輯

**API**: `POST /api/geofences`（透過地圖繪製建立）

**UI**:
- 左右分割: 地圖（`MapGeofenceEdit`）+ 列表（`GeofencesList`）
- GPX 檔案匯入（解析 `<trkpt>` → `LINESTRING` 圍欄）

### 9.6 位置模擬器 (`src/other/EmulatorPage.jsx`)

**功能**: 點擊地圖模擬裝置位置

**API**: `POST http://{host}:5055`（OSMAnd 伺服器協定）

**UI**:
- 裝置選擇器
- 地圖顯示位置標記
- 點擊地圖發送位置
- HTTPS 模式: 改為 POST 到目前來源（不經 port 5055）

**參數**: `id`, `lat`, `lon`, `timestamp`, `bearing`, `speed`, `altitude`, `batt`

### 9.7 影片串流 (`src/other/StreamPage.jsx`)

**功能**: 檢視裝置即時視訊串流

**API**:
- `POST /api/commands/send`（videoStart/videoStop）
- HLS 串流: `/api/stream/{deviceId}/{channel}/live.m3u8`

**UI**:
- 頻道選擇器
- 播放/停止按鈕
- `<video>` 元素（HLS.js 播放）

---

## 10. 狀態管理 (Redux Store)

### 10.1 Store 配置 (`src/store/index.js`)

**10 個 Reducer**:

| Reducer | State 結構 | 說明 |
|---------|-----------|------|
| `session` | `{ server, user, socket, includeLogs, logs, positions, history }` | session、位置、日誌 |
| `devices` | `{ items: {}, selectedId, loaded }` | 裝置資料 |
| `events` | `{ items: [] }` | 即時事件（最多 50 筆） |
| `motion` | `{ items: {} }` | 移動/停止分段資料 |
| `geofences` | `{ items: {} }` | 圍欄資料 |
| `groups` | `{ items: {} }` | 群組資料 |
| `drivers` | `{ items: {} }` （keyed by uniqueId） | 駕駛資料 |
| `maintenances` | `{ items: {} }` | 保養規則 |
| `calendars` | `{ items: {} }` | 日曆資料 |
| `errors` | `{ errors: [] }` | 錯誤佇列 |

### 10.2 Session Store (`src/store/session.js`)

**Actions**:
- `updateServer(server)` — 設定伺服器資訊
- `updateUser(user)` — 設定目前使用者
- `updateSocket(connected)` — 設定 WebSocket 連線狀態
- `enableLogs(enabled)` — 啟用/停用日誌記錄
- `updateLogs(entries)` — 附加日誌條目
- `updatePositions(positions[])` — 更新位置（keyed by deviceId）並管理即時路線歷史

**位置更新邏輯**:
- 根據 `mapLiveRoutes` 設定（none/selected/all）決定是否記錄歷史軌跡
- 歷史軌跡為 `[lng, lat]` 陣列，長度受 `web.liveRouteLength` 控制（預設 10）

### 10.3 Devices Store (`src/store/devices.js`)

**Actions**:
- `refresh(devices[])` — 完整取代（清空後重建）
- `update(devices[])` — 合併更新
- `selectId(id)` — 選取裝置（記錄 selectTime）
- `remove(id)` — 刪除裝置

### 10.4 其他 Store

- **geofences/groups/drivers/maintenances/calendars**: 皆為 `refresh`（完整取代）和 `update`（合併）
- **events**: `add`（前方插入，上限 50）、`delete`（依 id）、`deleteAll`
- **motion**: `set`（取代所有）、`clear`（清空）
- **errors**: `push`（加入錯誤）、`pop`（移除最舊）

### 10.5 Throttle Middleware (`src/store/throttleMiddleware.js`)

**目的**: 當 `devices.update` 和 `session.updatePositions` 更新頻率過高時批次處理

**機制**:
- 閾值: 3 次/秒
- 最小間隔: 1500ms
- 最大間隔: 30000ms
- 自適應演算法動態調整批次間隔

---

## 11. 地圖核心系統

### 11.1 MapView (`src/map/core/MapView.jsx`)

**技術**: MapLibre GL JS v5

**初始化**:
- 建立單例 `map`（整個應用共用一個 MapLibre 實例）
- 註冊自訂協定: `google:`（Google Maps tiles）, `pmtiles:`（PMTiles tiles）
- 地圖容器: 動態建立 `<div>`，插入到 `containerRef`

**生命週期**:
1. 載入地圖樣式（`map.setStyle()`）
2. 等待地圖載入完成（`map.once('styledata', waiting)`）
3. 載入地圖圖示（`initMap()`）
4. 通知子元件地圖就緒（`readyListeners`）

**地圖樣式**:
- 從 `activeMapStyles` 偏好篩選可用樣式
- 若無符合，回退到 OpenStreetMap（`osm`）
- 支援 22 種地圖服務提供商

**控制項**:
- `AttributionControl` — 壓縮模式
- `NavigationControl` — 縮放/指南針

**RTL 支援**: 動態載入 `mapbox-gl-rtl-text.js` 外掛

### 11.2 地圖樣式 (`src/map/core/useMapStyles.js`)

**22 種地圖提供商**:

| ID | 提供商 | 需要 Key |
|----|--------|---------|
| openFreeMap | OpenFreeMap | 否 |
| locationIqStreets | LocationIQ | 否 |
| locationIqDark | LocationIQ | 否 |
| osm | OpenStreetMap | 否 |
| openTopoMap | OpenTopoMap | 否 |
| carto | CartoDB | 否 |
| googleRoad | Google Maps | 是 |
| googleSatellite | Google Maps | 是 |
| googleHybrid | Google Maps | 是 |
| mapTilerBasic | MapTiler | 是 |
| mapTilerHybrid | MapTiler | 是 |
| bingRoad | Bing Maps | 是 |
| bingAerial | Bing Maps | 是 |
| bingHybrid | Bing Maps | 是 |
| tomTomBasic | TomTom | 是 |
| tomTomTopography | TomTom | 是 |
| tomTomNight | TomTom | 是 |
| hereBasic | HERE Maps | 是 |
| hereHybrid | HERE Maps | 是 |
| hereSatellite | HERE Maps | 是 |
| mapboxStreets | Mapbox | 是 |
| ordnanceSurvey | Ordnance Survey | 預設 Key |
| custom | 自訂 URL | - |

### 11.3 地圖圖示 (`src/map/core/preloadImages.js`)

**23 種裝置類別圖示**: animal, bicycle, boat, bus, car, camper, crane, default, finish, helicopter, motorcycle, person, plane, scooter, ship, start, tractor, trailer, train, tram, truck, van

**圖示渲染**: 每種圖示產生 4 種顏色版本（info/success/error/neutral），合成背景 + 著色圖示

**`mapIconKey(category)`**: 類別對應映射（如 offroad/pickup → car, trolleybus → bus）

### 11.4 地圖工具 (`src/map/core/mapUtil.js`)

- **`toMapCoordinates(lng, lat)`** / **`fromMapCoordinates(lng, lat)`** — GCJ-02 座標轉換
- **`reverseCoordinates(coordinates)`** — GeoJSON 座標反轉（lng/lat → lat/lng）
- **`transformGeometry(geometry)`** — WKT/GeoJSON 幾何轉換
- **`geofenceToFeature(geofence)`** — 圍欄 WKT 解析為 GeoJSON Feature（含 CIRCLE 類型 turf.js 圓形轉換）
- **`geometryToArea(geometry)`** — GeoJSON 轉回 WKT
- **`findFonts(mapStyle)`** — 從地圖樣式偵測字型堆疊
- **`loadImage(url)`** / **`prepareIcon(canvas, ...)`** — 圖片載入與 Canvas 著色

### 11.5 地圖元件

#### `MapCamera.js`

**功能**: 地圖鏡頭控制
- 依 `positions`/`coordinates` 陣列縮放至邊界
- 或跳轉至單一 `latitude`/`longitude`

#### `MapPositions.js`

**功能**: 裝置位置標記
- 叢集（可設定 `mapCluster`）
- 方向箭頭（無/全部/選取）
- 狀態顏色（online/offline/unknown）
- 圖示縮放比例
- 點擊標記/叢集/空白區域處理
- 選取位置高亮
- 點擊叢集放大

#### `MapGeofence.js`

**功能**: 圍欄圖層
- GeoJSON fill（0.1 透明度）+ line（可設定寬度/透明度）+ 標題標籤
- 排除 `hide` 屬性的圍欄

#### `MapCurrentLocation.js`

**功能**: `GeolocateControl` 加入地圖

#### `MapPadding.js`

**功能**: 設定地圖 padding 配合側邊欄

#### `MapScale.js`

**功能**: `ScaleControl`（公制/英制/海里）

#### `MapMarkers.js`

**功能**: 通用標記（報表/事件使用）

#### `MapRouteCoordinates.js`

**功能**: 路線線條（使用裝置的 `web.reportColor`）

#### `MapRoutePath.js`

**功能**: 速度著色路線段（turbo colormap）

#### `MapRoutePoints.jsx`

**功能**: 方向箭頭（速度著色）+ `MapSpeedLegend`

### 11.6 地圖控制項

#### `MapGeocoder.jsx`

**功能**: 地址搜尋（Nominatim OpenStreetMap）
- 300ms debounce
- Popover 搜尋結果
- 選取後縮放至 bounding box

#### `MapNotification.jsx`

**功能**: 事件通知切換按鈕

#### `MapRuler.jsx`

**功能**: 距離測量工具
- 點擊新增測量點
- 吸附到現有位置
- 即時距離計算（依設定單位顯示）

#### `MapSpeedLegend.jsx`

**功能**: 速度色階圖例

#### `MapSwitcher.jsx`

**功能**: 地圖樣式/圖層切換
- 地圖樣式選擇
- 可切換圖層（透過 `traccar:title` metadata）
- 隱藏圖層 localStorage 持久化

### 11.7 地圖主元件

#### `MapAccuracy.js`

**功能**: 精確度圓圈（turf.js circle），`accuracy > 0` 時顯示

#### `MapDefaultCamera.js`

**功能**: 初始定位
1. 選取裝置 → 定位至該裝置
2. 有預設 lat/lng/zoom → 跳轉
3. 否則縮放至所有可見位置

#### `MapLiveRoutes.js`

**功能**: 即時軌跡線
- 模式: none/selected/all
- 顏色使用 `web.reportColor`

#### `MapSelectedDevice.js`

**功能**: 跟隨選取裝置
- `mapFollow` 啟用時自動跟隨
- `selectZoom`（預設 10）
- 偏移鏡頭以容納彈出視窗

#### `PoiMap.js`

**功能**: POI 圖層（KML/KMZ）
- 從 `poiLayer` 偏好 URL 載入
- 支援 GCJ-02 座標轉換
- 圖層: fill, point, line, title

### 11.8 地圖繪圖

#### `MapGeofenceEdit.js`

**框架**: `@mapbox/mapbox-gl-draw`

**控制項**: polygon, line_string, trash

**事件**:
- `draw.create` → `POST /api/geofences` → 導向編輯
- `draw.delete` → `DELETE /api/geofences/{id}`
- `draw.update` → `PUT /api/geofences/{id}`

**行為**: 載入所有圍欄到繪圖圖層，縮放至選取圍欄

### 11.9 地圖疊加層

#### `MapOverlay.js`

**功能**: 啟用疊加層（由 `selectedMapOverlay` 偏好控制）作為 raster 圖層

**11 種疊加層來源**:
- googleTraffic（需 key）
- openSeaMap
- openRailwayMap
- openWeatherClouds/Precipitation/Pressure/Wind/Temperature（需 key）
- tomTomFlow/tomTomIncidents
- hereFlow
- 自訂 overlay URL

---

## 12. 通用元件

### 12.1 `AddressValue.jsx`

**功能**: 顯示地址或地理編碼連結
**API**: `GET /api/server/geocode?latitude&longitude`

### 12.2 `BackIcon.jsx`

**功能**: RTL 感知返回箭頭（`ArrowBack` 或 `ArrowForward`）

### 12.3 `BottomMenu.jsx`

**功能**: 手機版底部導航
- 地圖（WebSocket 中斷時顯示紅點 Badge）
- 報表（`disableReports` 時隱藏）
- 設定（`readonly` 時隱藏）
- 帳號/登出

**登出流程**:
1. 移除 notificationToken（從使用者屬性清除）
2. `DELETE /api/session`
3. `nativePostMessage('logout')`
4. 導向 `/login`
5. dispatch `sessionActions.updateUser(null)`

### 12.4 `DriverValue.js`

**功能**: 依 `driverUniqueId` 查詢駕駛名稱

### 12.5 `ErrorHandler.jsx`

**功能**: 全域錯誤 Snackbar
- 從 Redux `errors` store 讀取
- 多行錯誤顯示「顯示詳情」連結
- 詳情 Dialog 顯示完整錯誤堆疊

### 12.6 `FileInput.jsx`

**功能**: 檔案上傳輸入（含清除按鈕）

### 12.7 `GeofencesValue.js`

**功能**: 以逗號顯示圍欄名稱列表

### 12.8 `LinkField.jsx`

**功能**: 關聯 Autocomplete
- `POST/DELETE /api/permissions`
- 支援 endpointAll, endpointLinked, baseId, keyBase, keyLink

### 12.9 `Loader.jsx`

**功能**: 顯示/隱藏 `.loader` DOM 元素（CSS spinner）

### 12.10 `LocalizationProvider.jsx`

**功能**: 國際化系統

**支援 60+ 語系**: af, ar, az, bg, bn, ca, cs, da, de, el, en, es, fa, fi, fr, gl, he, hi, hr, hu, id, it, ja, ka, kk, km, ko, lo, lt, lv, mk, ml, mn, ms, nb, ne, nl, nn, pl, pt, pt_BR, ro, ru, si, sk, sl, sq, sr, sv, ta, th, tr, uk, uz, vi, zh, zh_TW

**功能**:
- 語言檔案: `resources/l10n/*.json`
- dayjs locale 動態載入
- 自動偵測瀏覽器語言
- RTL 支援（ar/he/fa）
- localStorage 持久化語言選擇

**Hooks**: `useTranslation()` → `t(key)`, `useLocalization()` → `{ languages, language, setLocalLanguage, direction }`

### 12.11 `MenuItem.jsx`

**功能**: 側邊欄導航項目（圖示 + 標題 + 連結 + 選取狀態）

### 12.12 `NativeInterface.js`

**功能**: 原生 App 橋接
- iOS: `window.webkit.messageHandlers.appInterface`
- Android: `window.appInterface`
- 登入 Token 處理（`handleLoginToken`）
- 推播通知 Token 註冊
- `generateLoginToken()`: 建立 6 個月有效 Token

### 12.13 `NavBar.jsx`

**功能**: 簡易 AppBar（漢堡選單 + 標題）

### 12.14 `PageLayout.jsx`

**功能**: 設定頁面響應式佈局
- 桌機: 永久 Drawer（可 mini-variant）+ 內容
- 手機: 臨時 Drawer + AppBar + 內容
- 麵包屑標題

### 12.15 `PasswordField.jsx`

**功能**: 密碼輸入（顯示/隱藏切換）

### 12.16 `PositionValue.jsx`

**功能**: 位置欄位智慧渲染器

**特殊欄位處理**:
- address → 地址
- fixTime/deviceTime/serverTime → 格式化時間
- latitude/longitude → 座標格式（dd/ddm/dms）
- speed → 速度 + 單位
- course → 方向箭頭符號
- altitude → 海拔 + 單位
- alarm → 警報類型翻譯
- fuelConsumption → 油耗格式
- coolantTemp → 溫度格式
- 圖片/影片/音訊 → 媒體連結
- totalDistance/hours → 累計器連結
- network → 網路頁面連結
- geofenceIds → 圍欄名稱
- driverUniqueId → 駕駛名稱

### 12.17 `QrCodeDialog.jsx`

**功能**: QR Code 產生（`react-qr-code`）
**用途**: 裝置設定 QR Code

### 12.18 `RemoveDialog.jsx`

**功能**: 刪除確認 Snackbar
**API**: `DELETE /api/{endpoint}/{itemId}`

### 12.19 `SelectField.jsx`

**功能**: Autocomplete 選擇器（單選/多選）
- 支援從 API 載入或靜態資料
- `allValue` 邏輯（防止 mixed all+specific）
- `singleLine` 模式（緊湊 chips）

### 12.20 `SideNav.jsx`

**功能**: 從路由設定陣列產生側邊導航

### 12.21 `SplitButton.jsx`

**功能**: 按鈕群組（主要動作 + 下拉選項）

### 12.22 `StatusCard.jsx`

**功能**: 可拖曳裝置狀態彈出卡片（`react-rnd`）

**區段**:
1. **標題**: 裝置名稱 + 關閉按鈕（drag handle: `.draggable-header`）
2. **圖片**: 裝置圖片（`/api/media/{uniqueId}/{deviceImage}`）
3. **狀態欄位**: 可設定（`positionItems` 偏好，預設: fixTime, address, speed, totalDistance）
4. **操作選單**:
   - 建立圍欄（在目前位置建立半徑 50m CIRCLE 圍欄 + 自動關聯裝置）
   - 導航（開啟外部導航 App）
   - 發送指令
   - 編輯裝置
   - 刪除裝置
5. **保養區段**: 若裝置有保養規則

### 12.23 `TableShimmer.jsx`

**功能**: 表格骨架載入（3 行）

### 12.24 `TermsDialog.jsx`

**功能**: 服務條款 + 隱私政策接受對話框

---

## 13. 通用工具函式

### 13.1 `colors.js`

**Turbo colormap**: 多項式插值（r/g/b 多項式）
**`getSpeedColor(speed, minSpeed, maxSpeed)`**: 將速度映射到 turbo 色譜

### 13.2 `converter.js`

**單位轉換**:

| 類別 | 支援單位 | 函式 |
|------|---------|------|
| 速度 | kn, kmh, mph | `speedFromKnots`, `speedToKnots`, `speedUnitString` |
| 距離 | km, mi, nmi | `distanceFromMeters`, `distanceToMeters`, `distanceUnitString` |
| 海拔 | m, ft | `altitudeFromMeters`, `altitudeToMeters`, `altitudeUnitString` |
| 容量 | ltr, impGal, usGal | `volumeFromLiters`, `volumeToLiters`, `volumeUnitString` |

### 13.3 `deviceCategories.js`

`['default', 'animal', 'bicycle', 'boat', 'bus', 'car', 'camper', 'crane', 'helicopter', 'motorcycle', 'person', 'plane', 'ship', 'tractor', 'trailer', 'train', 'tram', 'truck', 'van', 'scooter']`

### 13.4 `deviceEquality.js`

`deviceEquality(fields)`: 自訂 Redux selector equality — 只比對指定欄位

### 13.5 `duration.js`

`snackBarDurationShortMs = 1500`, `snackBarDurationLongMs = 2750`

### 13.6 `exportExcel.js`

**功能**: Excel 匯出（exceljs + file-saver）
- 多 sheet 工作簿
- 主題色標題
- 細邊框
- 自動欄寬

### 13.7 `fetchOrThrow.js`

`fetch()` 包裝，非 OK 回應時 throw `Error(responseText)`

### 13.8 `formatter.js`

**格式化工廠**:
- `formatBoolean(v, t)` — 是/否
- `formatNumber(v, precision)` — 數值（預設 1 位小數）
- `formatPercentage(v)` — `{v}%`
- `formatTemperature(v)` — `{v}°C`
- `formatVoltage(v, t)` — `{v} V`
- `formatConsumption(v, t)` — `{v} L/h`
- `formatTime(v, format)` — 日期/時間/分鐘/秒
- `formatStatus(v, t)` — 狀態翻譯
- `formatAlarm(v, t)` — 警報翻譯（逗號分隔）
- `formatCourse(v)` — 方向箭頭（↑↗→↘↓↙←↖）
- `formatDistance(v, unit, t)` — 距離含單位
- `formatAltitude(v, unit, t)` — 海拔含單位
- `formatSpeed(v, unit, t)` — 速度含單位
- `formatVolume(v, unit, t)` — 容量含單位
- `formatNumericHours(v, t)` — `X h Y min`
- `formatCoordinate(key, v, unit)` — dd/ddm/dms 座標格式
- `formatAddress(position, unit)` — 地址或座標
- `getStatusColor(status)` — online→success, offline→error, unknown→neutral
- `getBatteryStatus(level)` — ≥70 success, >30 warning, else error
- `formatNotificationTitle(t, notification, includeId)` — 通知標題格式化

### 13.9 `permissions.js`

| Hook | 邏輯 |
|------|------|
| `useAdministrator()` | `user.administrator` |
| `useManager()` | admin 或 `userLimit !== 0` |
| `useDeviceReadonly()` | 非 admin 且 (server/user readonly 或 deviceReadonly) |
| `useRestriction(key)` | 非 admin 且 (server[key] 或 user[key]) |

### 13.10 `preferences.js`

| Hook | 邏輯 |
|------|------|
| `usePreference(key, default)` | user[key] → server[key]（respect `forceSettings`） |
| `useAttributePreference(key, default)` | user.attributes[key] → server.attributes[key] |

### 13.11 `stringUtils.js`

- `prefixString(prefix, value)` — `prefix + capitalize(value)`，如 `'eventAlarm'`
- `unprefixString(prefix, value)` — 反向，如 `'alarm'`

### 13.12 `useFeatures.js`

從 server/user 屬性讀取功能開關:
- `disableSavedCommands`, `disableAttributes`, `disableDrivers`, `disableMaintenance`, `disableGroups`, `disableEvents`, `disableComputedAttributes`, `disableCalendars`

### 13.13 `usePersistedState.js`

localStorage 持久化 state hook（跨分頁同步）

### 13.14 `reactHelper.js`

| 函式 | 功能 |
|------|------|
| `useAsyncTask(effect, deps)` | 非同步 effect、自動 AbortController、錯誤 dispatch |
| `useCatch(method)` | 非同步函式錯誤捕捉 |
| `useCatchCallback(method, deps)` | 同上 + useCallback |
| `useScrollToLoad(loadMore)` | IntersectionObserver 無限滾動 |
| `usePrevious(value)` | 追蹤前次值 |
| `pageSize` | 50（分頁大小） |

---

## 14. 屬性定義

### 14.1 裝置屬性 (`useDeviceAttributes.js`)

- `command.sender` — 指令發送者
- `web.reportColor` — 報表顏色
- `devicePassword` — 裝置密碼
- `deviceImage` — 裝置圖片
- `processing.copyAttributes` — 複製屬性
- `decoder.timezone` — 解碼器時區
- `forward.url` — 轉發 URL

### 14.2 通用裝置屬性 (`useCommonDeviceAttributes.js`)

24 種屬性: speedLimit, proximityEnterDistance, proximityExitDistance, unaccompaniedDistance, fuelDropThreshold, fuelIncreaseThreshold, report.ignoreOdometer, deviceInactivityStart, deviceInactivityPeriod, notificationTokens, filter.*（invalid, zero, duplicate, outdated, future, past, accuracy, approximate, static, distance, maxSpeed, minPeriod, dailyLimit, dailyLimitInterval, skipLimit, skipAttributes）, time.override

### 14.3 通用使用者屬性 (`useCommonUserAttributes.js`)

40+ 屬性: language, mapLiveRoutes, mapDirection, mapFollow, mapCluster, mapOnSelect, activeMapStyles, devicePrimary, deviceSecondary, soundEvents, soundAlarms, positionItems, 各 map API key, 所有 `ui.disable*` 旗標, web.liveRouteLength, mapLineWidth, mapLineOpacity, web.selectZoom, web.maxZoom, iconScale, navigationAppLink, navigationAppTitle

### 14.4 使用者屬性 (`useUserAttributes.js`)

18 種屬性: telegramChatId, notificator.telegram.sendLocation, pushoverUserKey, pushoverDeviceNames, mail.smtp.*（host, port, starttls, ssl, from, auth, username, password）, termsAccepted, billingLink

### 14.5 圍欄屬性 (`useGeofenceAttributes.js`)

color, mapLineWidth, mapLineOpacity, speedLimit, polylineDistance, hide, floor, ceiling

### 14.6 群組屬性 (`useGroupAttributes.js`)

processing.copyAttributes, decoder.timezone

### 14.7 位置屬性 (`usePositionAttributes.js`)

70+ 屬性: 所有標準位置欄位（id, lat, lng, speed, course, altitude, accuracy, valid, protocol, address, 三種時間戳）+ geofenceIds + raw + hdop/vdop/pdop + sat/satVisible + rssi + coolantTemp/engineTemp + gps + roaming + event + alarm + status + 三種里程 + hours + steps + heartRate + input/output(1-4) + fuel*（consumption, level, temp）+ adc1-4 + 電池相關 + charging + rpm + obdSpeed/obdOdometer + throttle + driverUniqueId + image/video/audio

### 14.8 伺服器屬性 (`useServerAttributes.js`)

support, title, description, logo, logoInverted, colorPrimary, colorSecondary, disableChange, darkMode, termsUrl, privacyUrl, totpEnable, totpForce, serviceWorkerUpdateInterval, ui.disableLoginLanguage, disableShare

### 14.9 指令屬性 (`useCommandAttributes.js`)

25+ 指令類型（見 7.9 BaseCommandView 節）

---

## 15. 主題與樣式

### 15.1 主題設定 (`src/common/theme/index.js`)

**使用 `createTheme`（MUI）**:
- 字型: `'Roboto,Segoe UI,Helvetica Neue,Arial,sans-serif'`
- 色板: `palette.js`
- 方向: ltr/rtl（依語言）
- 尺寸: `dimensions.js`
- 元件覆寫: `components.js`

### 15.2 色板 (`src/common/theme/palette.js`)

- 模式: light/dark（依 `darkMode` 偏好或系統設定）
- primary: `colorPrimary` 伺服器屬性 → indigo[900]（淺色）/ indigo[200]（深色）
- secondary: `colorSecondary` 伺服器屬性 → green[800]（淺色）/ green[200]（深色）
- neutral: grey[500]
- geometry: `#3bb2d0`
- alwaysDark: grey[900]

### 15.3 尺寸 (`src/common/theme/dimensions.js`)

| 變數 | 值 |
|------|-----|
| sidebarWidth | 28% |
| sidebarWidthTablet | 52px |
| drawerWidthDesktop | 360px |
| drawerWidthTablet | 320px |
| drawerHeightPhone | 250px |
| filterFormWidth | 160px |
| eventsDrawerWidth | 320px |
| bottomBarHeight | 56 |
| popupMapOffset | 300 |
| popupMaxWidth | 288 |
| popupImageHeight | 144 |
| cardContentMaxHeight | 40vh |
| qrCodeSize | 192 |

### 15.4 AppThemeProvider (`src/AppThemeProvider.jsx`)

- 支援 RTL（`stylis-plugin-rtl`）
- 兩個 emotion cache: ltr + rtl
- 深色模式：伺服器設定優先，無設定則跟隨系統偏好

### 15.5 全域樣式 (`public/styles.css`)

- html/body: height 100%, margin 0
- `.root`: flex column, height 100%
- 深色模式 body background: black
- 列印: 強制 overflow visible

---

## 16. HTML 入口與 PWA

### 16.1 `index.html`

- 預留模板變數: `${title}`, `${description}`, `${colorPrimary}`
- meta theme-color = `${colorPrimary}`
- manifest: `/manifest.webmanifest`
- CSS spinner `.loader`（顯示於 JS 載入完成前）
- noscript 提示

### 16.2 PWA 設定（vite-plugin-pwa）

- Service Worker 自動註冊 + 更新提示（`UpdateController`）
- 定期檢查更新（`serviceWorkerUpdateInterval`，預設 1 小時）
- 離線快取: js, css, html, woff/woff2, mp3
- 導覽 fallback 排除 `/api` 路徑
- PWA 圖示: 64x64, 192x192, 512x512（any + maskable）

### 16.3 UpdateController (`src/UpdateController.jsx`)

**功能**: 偵測 Service Worker 更新

**行為**:
- 使用 `useRegisterSW` from `virtual:pwa-register/react`
- 設定間隔輪詢檢查新 SW（fetch SW URL 比對狀態碼）
- 更新可用時顯示 Snackbar + 重新整理按鈕

---

## 17. 控制器（Controller）

### 17.1 SocketController (`src/SocketController.jsx`)

**功能**: WebSocket 即時通訊

**連線流程**:
1. 使用者認證後建立 WebSocket 連線
2. WebSocket URL: `ws[s]://{host}/api/socket`
3. 初始載入: `GET /api/devices` + `GET /api/positions`

**訊息類型**:
- `{ devices: [...] }` — 裝置更新
- `{ positions: [...] }` — 位置更新
- `{ events: [...] }` — 事件通知
- `{ logs: [...] }` — 裝置通訊日誌

**重連機制**:
- WebSocket 關閉（非 4000 logout code）→ 重新 fetch 最新資料
- 若 fetch 失敗 → 60 秒後重連
- 頁面 focus 時檢查 WebSocket 狀態，必要時重連

**事件音效**:
- 設定 `soundEvents` 和 `soundAlarms` 偏好
- 符合條件時播放 `alarm.mp3`

**通知處理**:
- 顯示 Snackbar 通知（含 `event.attributes.message`）
- 原生推播通知監聽

**登出代碼**: `4000`

### 17.2 CachingController (`src/CachingController.js`)

**功能**: 認證後快取參考資料

**API 呼叫（平行非同步）**:
- `GET /api/geofences` → dispatch `geofencesActions.refresh()`
- `GET /api/groups` → dispatch `groupsActions.refresh()`
- `GET /api/drivers` → dispatch `driversActions.refresh()`
- `GET /api/maintenance` → dispatch `maintenancesActions.refresh()`
- `GET /api/calendars` → dispatch `calendarsActions.refresh()`

### 17.3 MotionController (`src/main/MotionController.jsx`)

**功能**: 計算裝置移動/停止分段

**API**: `GET /api/reports/events?type=deviceMoving&type=deviceStopped&from&to`

**邏輯**:
- 查詢過去 24 小時的移動/停止事件
- `buildSegments()`: 將事件轉換為時間分段（`{ type: 'moving'|'stopped', value: ms }`）
- 每 5 分鐘重新整理
- 只在 `deviceSecondary === 'motion'` 時啟用

### 17.4 ServerProvider (`src/ServerProvider.jsx`)

**功能**: 載入伺服器設定

**API**: `GET /api/server`

**行為**:
- 載入中顯示 Loader
- 載入失敗顯示錯誤 Alert + 重試按鈕
- 成功後 dispatch `sessionActions.updateServer()`

---

## 18. API 端點總覽

### 認證
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET | `/api/session` | 檢查 session |
| POST | `/api/session` | 登入 |
| DELETE | `/api/session` | 登出 |
| GET | `/api/session?token=` | Token 登入 |
| POST | `/api/session/token` | 產生 Token |
| POST | `/api/session/token/revoke` | 撤銷 Token |
| GET | `/api/session/openid/auth` | OpenID 登入跳轉 |

### 帳號
| Method | Endpoint | 用途 |
|--------|----------|------|
| POST | `/api/users` | 註冊 |
| POST | `/api/password/reset` | 發送重設信 |
| POST | `/api/password/update` | 更新密碼 |
| GET | `/api/server` | 伺服器設定 |
| PUT | `/api/server` | 更新伺服器設定 |

### 使用者
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET | `/api/users` | 使用者列表 |
| GET/PUT/POST/DELETE | `/api/users/{id}` | 使用者 CRUD |
| POST | `/api/users/totp` | 產生 TOTP Key |

### 裝置
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET | `/api/devices` | 裝置列表 |
| GET/PUT/POST/DELETE | `/api/devices/{id}` | 裝置 CRUD |
| POST | `/api/devices/{id}/image` | 上傳裝置圖片 |
| PUT | `/api/devices/{deviceId}/accumulators` | 更新累計器 |

### 群組
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET/PUT/POST/DELETE | `/api/groups/{id}` | 群組 CRUD |

### 圍欄
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET/PUT/POST/DELETE | `/api/geofences/{id}` | 圍欄 CRUD |

### 通知
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET/PUT/POST/DELETE | `/api/notifications/{id}` | 通知規則 CRUD |
| POST | `/api/notifications/test/{notificator}` | 測試通知 |
| POST | `/api/notifications/send/{notificator}` | 發送公告 |

### 指令
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET/PUT/POST/DELETE | `/api/commands/{id}` | 指令 CRUD |
| POST | `/api/commands/send` | 發送指令（給裝置） |
| GET | `/api/commands/send?deviceId=` | 取得裝置可用指令 |
| GET | `/api/commands/types` | 指令類型列表 |
| GET | `/api/notifications/types` | 通知類型列表 |

### 位置
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET | `/api/positions` | 最新位置 |
| GET | `/api/positions?id=` | 特定 ID 位置 |
| GET | `/api/positions?from&to&deviceId` | 歷史位置 |

### 事件
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET | `/api/events/{id}` | 事件詳情 |

### 報表
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET | `/api/reports/combined` | 綜合報表 |
| GET | `/api/reports/events` | 事件報表（含 type 篩選） |
| GET | `/api/reports/geofences` | 圍欄報表 |
| GET | `/api/reports/route` | 路線報表 |
| GET | `/api/reports/stops` | 停留報表 |
| GET | `/api/reports/summary` | 摘要報表 |
| GET | `/api/reports/trips` | 行程報表 |
| GET/POST/DELETE | `/api/reports/{id}` | 排程報表 CRUD |
| GET | `/api/statistics` | 伺服器統計 |
| GET | `/api/audit` | 稽核日誌 |

### 權限
| Method | Endpoint | 用途 |
|--------|----------|------|
| POST/DELETE | `/api/permissions` | 建立/移除關聯 |

### 分享
| Method | Endpoint | 用途 |
|--------|----------|------|
| POST | `/api/share/{type}` | 產生分享連結 |

### 其他
| Method | Endpoint | 用途 |
|--------|----------|------|
| GET | `/api/server/geocode` | 反向地理編碼 |
| GET/PUT/POST/DELETE | `/api/calendars/{id}` | 日曆 CRUD |
| GET/PUT/POST/DELETE | `/api/drivers/{id}` | 駕駛 CRUD |
| GET/PUT/POST/DELETE | `/api/maintenance/{id}` | 保養 CRUD |
| GET/PUT/POST/DELETE | `/api/attributes/computed/{id}` | 計算屬性 CRUD |
| POST | `/api/attributes/computed/test` | 測試計算屬性表達式 |
| GET/PUT | `/api/device` | ??? |
| WebSocket | `/api/socket` | 即時資料推送 |
| HLS | `/api/stream/{deviceId}/{channel}/live.m3u8` | 影片串流 |
| GET | `/api/media/{uniqueId}/{filename}` | 裝置媒體檔案 |

---

## 附錄: 資料流圖

### 認證流程
```
使用者輸入 Email/Password
  → POST /api/session
  → 成功: dispatch updateUser → generateLoginToken() → 導向首頁
  → 401 + TOTP: 顯示 TOTP 輸入框 → 重新 POST (含 code)
  → 其他錯誤: 顯示錯誤訊息

首頁載入:
  → GET /api/session (檢查 session)
  → 無 session: 導向 /login
  → 有 session: dispatch updateUser → 渲染 App
```

### 地圖資料流
```
WebSocket onmessage:
  → positions: dispatch updatePositions → Redux state.session.positions 更新
  → devices: dispatch devicesActions.update → Redux state.devices.items 更新
  → events: dispatch eventsActions.add → Snackbar + 音效 → EventsDrawer

MainMap:
  → MapPositions 讀取 positions → 更新地圖標記
  → MapLiveRoutes 讀取 history → 更新即時軌跡
  → MapSelectedDevice 監聽 selectedId → 跟隨裝置
```

### 報表資料流
```
ReportFilter:
  → 使用者選取裝置/時間
  → 更新 URL searchParams
  → ReportPage 讀取 searchParams
  → fetch 報表 API
  → 顯示表格 + 地圖
```

---

> 本文件涵蓋 Traccar Web Frontend 的所有功能細節。
> 依照此規格書，可使用任何前端框架（React/Vue/Angular/Svelte）或純 JavaScript 完整重建此專案。
