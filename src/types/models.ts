/**
 * Traccar GPS 追蹤系統 - TypeScript 資料模型
 * 
 * 根據 openapi.yaml 的 schemas 定義產生。
 * 所有模型對應 Traccar Server REST API 的回傳/請求結構。
 */

// ==================== 位置 (Position) ====================

/** 裝置回報的位置記錄 */
export interface Position {
  /** 唯一位置記錄識別碼 */
  id: number;
  /** 回報此位置的裝置識別碼 */
  deviceId: number;
  /** 產生此訊息的裝置協定名稱 */
  protocol?: string;
  /** 裝置時間 (ISO 8601) */
  deviceTime?: string;
  /** 定位時間 (ISO 8601) */
  fixTime?: string;
  /** 伺服器時間 (ISO 8601) */
  serverTime?: string;
  /** 位置是否被裝置標記為有效 */
  valid?: boolean;
  /** 緯度 (十進位度數) */
  latitude?: number;
  /** 經度 (十進位度數) */
  longitude?: number;
  /** 海拔 (公尺) */
  altitude?: number;
  /** 速度 ( knots) */
  speed?: number;
  /** 航向 (0-360 度，0 = 正北) */
  course?: number;
  /** 反向地理編碼地址 */
  address?: string;
  /** 估計位置精度 (公尺) */
  accuracy?: number;
  /** 裝置提供的網路元資料 (基地台/WiFi) */
  network?: Record<string, unknown>;
  /** 適用的圍欄 ID 列表 */
  geofenceIds?: number[];
  /** 自訂 key-value 屬性 */
  attributes?: Record<string, unknown>;
}

// ==================== 使用者 (User) ====================

/** 系統使用者 */
export interface User {
  /** 唯一使用者識別碼 */
  id: number;
  /** 使用者顯示名稱 */
  name: string;
  /** 登入與通知用 Email */
  email: string;
  /** 連絡電話 */
  phone?: string | null;
  /** 是否為唯讀使用者 (無法修改設定) */
  readonly?: boolean;
  /** 是否為管理員 */
  administrator?: boolean;
  /** 偏好的預設地圖圖層 */
  map?: string | null;
  /** 預設地圖中心緯度 */
  latitude?: number;
  /** 預設地圖中心經度 */
  longitude?: number;
  /** 預設地圖縮放層級 */
  zoom?: number;
  /** 密碼 (僅寫入時使用) */
  password?: string;
  /** 偏好的座標顯示格式 */
  coordinateFormat?: string | null;
  /** 帳號是否停用 */
  disabled?: boolean;
  /** 帳號過期時間 (ISO 8601) */
  expirationTime?: string | null;
  /** 可管理的最大裝置數 */
  deviceLimit?: number;
  /** 可建立的使用者上限 */
  userLimit?: number;
  /** 限制使用者修改裝置屬性 */
  deviceReadonly?: boolean;
  /** 限制使用者發送不支援的指令 */
  limitCommands?: boolean;
  /** 鎖定 Email 欄位避免修改 */
  fixedEmail?: boolean;
  /** 外部 POI 圖層設定 */
  poiLayer?: string | null;
  /** 自訂使用者屬性 */
  attributes?: Record<string, unknown>;
}

// ==================== 伺服器 (Server) ====================

/** 伺服器全域設定 */
export interface Server {
  /** 唯一伺服器設定識別碼 */
  id: number;
  /** 是否允許新使用者註冊 */
  registration?: boolean;
  /** 僅管理員可修改伺服器設定 */
  readonly?: boolean;
  /** 非管理員無法修改裝置屬性 */
  deviceReadonly?: boolean;
  /** 限制指令執行 */
  limitCommands?: boolean;
  /** 預設地圖圖層識別碼 */
  map?: string;
  /** Bing Maps API 金鑰 */
  bingKey?: string;
  /** 自訂 tile 伺服器 URL */
  mapUrl?: string;
  /** 外部 POI 圖層設定 */
  poiLayer?: string;
  /** 顯示給所有使用者的公告 */
  announcement?: string;
  /** 預設地圖中心緯度 */
  latitude?: number;
  /** 預設地圖中心經度 */
  longitude?: number;
  /** 預設地圖縮放層級 */
  zoom?: number;
  /** Traccar 伺服器版本 */
  version?: string;
  /** 強制使用者使用伺服器設定 */
  forceSettings?: boolean;
  /** 預設座標格式 */
  coordinateFormat?: string;
  /** OpenID 是否啟用 */
  openIdEnabled?: boolean;
  /** 是否強制使用 OpenID */
  openIdForce?: boolean;
  /** 伺服器層級自訂屬性 */
  attributes?: Record<string, unknown>;
}

// ==================== 裝置 (Device) ====================

/** GPS 追蹤裝置 */
export interface Device {
  /** Traccar 指定的唯一識別碼 */
  id: number;
  /** 裝置顯示名稱 */
  name: string;
  /** 硬體或協定的唯一識別碼 */
  uniqueId: string;
  /** 目前連線狀態 */
  status: 'online' | 'offline' | 'unknown';
  /** 管理員是否停用此裝置 */
  disabled?: boolean;
  /** 最後更新時間 (ISO 8601) */
  lastUpdate?: string | null;
  /** 最後已知位置的 ID */
  positionId?: number | null;
  /** 父群組 ID */
  groupId?: number | null;
  /** 連絡電話 (SMS 指令用) */
  phone?: string | null;
  /** 裝置型號 */
  model?: string | null;
  /** 負責人連絡資訊 */
  contact?: string | null;
  /** UI 分類 */
  category?: string | null;
  /** 自訂屬性 */
  attributes?: Record<string, unknown>;
}

// ==================== 群組 (Group) ====================

/** 裝置群組 */
export interface Group {
  /** 唯一群組識別碼 */
  id: number;
  /** 群組顯示名稱 */
  name: string;
  /** 父群組 ID (巢狀分組) */
  groupId?: number;
  /** 自訂元資料 */
  attributes?: Record<string, unknown>;
}

// ==================== 圍欄 (Geofence) ====================

/** 地理圍欄 */
export interface Geofence {
  /** 唯一圍欄識別碼 */
  id: number;
  /** 顯示名稱 */
  name: string;
  /** 詳細描述 */
  description?: string;
  /** WKT 格式的圍欄區域定義 */
  area?: string;
  /** 日曆 ID (限制圍欄啟用時間) */
  calendarId?: number;
  /** 自訂屬性 */
  attributes?: Record<string, unknown>;
}

// ==================== 通知 (Notification) ====================

/** 通知規則 */
export interface Notification {
  /** 唯一通知識別碼 */
  id: number;
  /** 通知類型 (如 geofenceEnter, ignitionOn) */
  type: string;
  /** 使用者自訂描述 */
  description?: string | null;
  /** 無論排程都觸發 */
  always?: boolean;
  /** 觸發時發送的指令 ID */
  commandId?: number;
  /** 逗號分隔的傳送管道 (如 web, mail) */
  notificators?: string;
  /** 日曆 ID (限制通知啟用時間) */
  calendarId?: number;
  /** 自訂屬性 */
  attributes?: Record<string, unknown>;
}

// ==================== 事件 (Event) ====================

/** 系統事件 */
export interface Event {
  /** 唯一事件識別碼 */
  id: number;
  /** 事件類型名稱 */
  type: string;
  /** 事件時間 (ISO 8601) */
  eventTime?: string;
  /** 關聯的裝置 ID */
  deviceId?: number;
  /** 關聯的位置記錄 ID */
  positionId?: number;
  /** 關聯的圍欄 ID */
  geofenceId?: number;
  /** 關聯的保養記錄 ID */
  maintenanceId?: number;
  /** 事件自訂屬性 */
  attributes?: Record<string, unknown>;
}

// ==================== 指令 (Command) ====================

/** 已儲存或待發送的指令 */
export interface Command {
  /** 唯一指令識別碼 */
  id?: number;
  /** 目標裝置 ID */
  deviceId?: number;
  /** UI 顯示標籤 */
  description?: string;
  /** 裝置協定定義的指令類型 */
  type: string;
  /** 是否使用 SMS 通道 */
  textChannel?: boolean;
  /** 指令所需的其他參數 */
  attributes?: Record<string, unknown>;
}

/** 佇列中的指令 */
export interface QueuedCommand {
  /** 佇列指令工作 ID */
  id: number;
  /** 目標裝置 ID */
  deviceId: number;
  /** 將執行的指令類型 */
  type: string;
  /** 是否使用 SMS 傳送 */
  textChannel?: boolean;
  /** 儲存的參數 */
  attributes?: Record<string, unknown>;
}

/** 指令類型 */
export interface CommandType {
  /** 指令類型識別碼 */
  type: string;
}

// ==================== 權限 (Permission) ====================

/** 
 * 物件間的權限關聯對映
 * 用於連結/解除連結兩個物件。
 * 順序重要。例如: { deviceId: 8, geofenceId: 16 }
 */
export interface Permission {
  userId?: number;
  deviceId?: number;
  groupId?: number;
  geofenceId?: number;
  notificationId?: number;
  calendarId?: number;
  attributeId?: number;
  driverId?: number;
  managedUserId?: number;
  commandId?: number;
}

// ==================== 報表 (Report) ====================

/** 綜合報表項目 */
export interface CombinedReportItem {
  /** 裝置 ID */
  deviceId: number;
  /** 簡化路線 (經度, 緯度) 配對 */
  route?: number[][];
  /** 事件清單 */
  events?: Event[];
  /** 位置清單 */
  positions?: Position[];
}

/** 報表摘要 */
export interface ReportSummary {
  deviceId: number;
  deviceName?: string;
  /** 最高速度 (knots) */
  maxSpeed?: number;
  /** 平均速度 (knots) */
  averageSpeed?: number;
  /** 距離 (公尺) */
  distance?: number;
  /** 油耗 (公升) */
  spentFuel?: number;
  /** 引擎運轉時數 */
  engineHours?: number;
}

/** 圍欄報表 */
export interface ReportGeofences {
  deviceId: number;
  deviceName?: string;
  geofenceId?: number;
  startTime?: string;
  endTime?: string;
}

/** 行程報表 */
export interface ReportTrips {
  deviceId: number;
  deviceName?: string;
  maxSpeed?: number;
  averageSpeed?: number;
  distance?: number;
  spentFuel?: number;
  /** 行程持續時間 (秒) */
  duration?: number;
  startTime?: string;
  startAddress?: string;
  startLat?: number;
  startLon?: number;
  endTime?: string;
  endAddress?: string;
  endLat?: number;
  endLon?: number;
  driverUniqueId?: string;
  driverName?: string;
}

/** 停留報表 */
export interface ReportStops {
  deviceId: number;
  deviceName?: string;
  /** 停留持續時間 (秒) */
  duration?: number;
  startTime?: string;
  address?: string;
  lat?: number;
  lon?: number;
  endTime?: string;
  spentFuel?: number;
  engineHours?: number;
}

// ==================== 其他 (Misc) ====================

/** 伺服器統計 */
export interface Statistics {
  captureTime?: string;
  activeUsers?: number;
  activeDevices?: number;
  requests?: number;
  messagesReceived?: number;
  messagesStored?: number;
}

/** 裝置累計器 (里程/時數) */
export interface DeviceAccumulators {
  deviceId: number;
  /** 總距離 (公尺) */
  totalDistance?: number;
  /** 引擎總時數 */
  hours?: number;
}

/** 日曆 */
export interface Calendar {
  id: number;
  name: string;
  /** base64 編碼的 iCalendar 格式資料 */
  data?: string;
  attributes?: Record<string, unknown>;
}

/** 計算屬性 */
export interface Attribute {
  id?: number;
  description: string;
  /** 表達式中使用的屬性名稱 */
  attribute: string;
  /** 計算表達式 */
  expression: string;
  /** String | Number | Boolean */
  type: string;
}

/** 駕駛 */
export interface Driver {
  id: number;
  name: string;
  uniqueId: string;
  attributes?: Record<string, unknown>;
}

/** 保養規則 */
export interface Maintenance {
  id: number;
  name: string;
  /** 保養依據的度量 */
  type: string;
  /** 開始追蹤時的累積值 */
  start?: number;
  /** 觸發保養的閾值 */
  period?: number;
  attributes?: Record<string, unknown>;
}

/** 稽核動作記錄 */
export interface Action {
  id: number;
  actionTime?: string;
  address?: string;
  userId?: number;
  userEmail?: string;
  actionType?: string;
  objectType?: string;
  objectId?: number;
}

/** 通知類型 */
export interface NotificationType {
  type: string;
}

/** 通知訊息 */
export interface NotificationMessage {
  subject?: string;
  digest?: string;
  body: string;
  priority?: boolean;
}

/** 訂單 */
export interface Order {
  id: number;
  uniqueId: string;
  description?: string;
  fromAddress?: string;
  toAddress?: string;
  attributes?: Record<string, unknown>;
}
