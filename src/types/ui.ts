/**
 * Traccar Web - UI 專用類型定義
 * 
 * 包含狀態管理、WebSocket、篩選、偏好設定等前端專用型別。
 */

// ==================== 裝置篩選 ====================

/** 裝置列表篩選條件 */
export interface DeviceFilter {
  /** 篩選的狀態列表 */
  statuses: string[];
  /** 篩選的群組 ID 列表 */
  groups: number[];
  /** 篩選的圍欄 ID 列表 */
  geofences: number[];
}

/** 篩選排序方式 */
export type FilterSort = '' | 'name' | 'lastUpdate';

// ==================== WebSocket ====================

/** WebSocket 接收的資料訊息 */
export interface SocketMessage {
  devices?: import('./models').Device[];
  positions?: import('./models').Position[];
  events?: import('./models').Event[];
  logs?: LogEntry[];
}

/** 裝置通訊日誌條目 */
export interface LogEntry {
  /** 註冊狀態 */
  status: 'registered' | 'unregistered';
  /** 裝置唯一識別碼 */
  uniqueId: string;
  /** 通訊協定 */
  protocol: string;
  /** 原始資料 */
  data: string;
}

// ==================== 運動分段 (Motion) ====================

/** 運動分段（移動/停止） */
export interface MotionSegment {
  /** 'moving' 或 'stopped' */
  type: 'moving' | 'stopped';
  /** 持續時間 (毫秒) */
  value: number;
}

/** 以 deviceId 為索引的運動分段資料 */
export type MotionMap = Record<number, MotionSegment[]>;

// ==================== 位置歷史 ====================

/** 位置歷史路線點 [經度, 緯度] */
export type RoutePoint = [number, number];

/** 以 deviceId 為索引的路線歷史 */
export type RouteHistory = Record<number, RoutePoint[]>;

// ==================== 本地化 ====================

/** 語言定義 */
export interface Language {
  /** 國家代碼 (ISO 3166-1 alpha-2) */
  country: string;
  /** 語言名稱 */
  name: string;
  /** 翻譯資料 (載入後填入) */
  data?: Record<string, string>;
}

/** 語言對映表 */
export type Languages = Record<string, Language>;

/** 本地化上下文值 */
export interface LocalizationContextValue {
  languages: Languages;
  language: string;
  setLocalLanguage: (lang: string) => void;
  /** 文字方向 'ltr' | 'rtl' */
  direction: 'ltr' | 'rtl';
}

// ==================== 主題 ====================

/** 主題尺寸定義 */
export interface ThemeDimensions {
  sidebarWidth: string;
  sidebarWidthTablet: string;
  drawerWidthDesktop: string;
  drawerWidthTablet: string;
  drawerHeightPhone: string;
  filterFormWidth: string;
  eventsDrawerWidth: string;
  bottomBarHeight: number;
  popupMapOffset: number;
  popupMaxWidth: number;
  popupImageHeight: number;
  cardContentMaxHeight: string;
  qrCodeSize: number;
}

// ==================== 報表 ====================

/** 報表匯出格式 */
export type ExportFormat = 'xlsx' | 'csv' | 'gpx' | 'kml' | 'kmz';

/** 報表查詢參數 */
export interface ReportParams {
  deviceIds: number[];
  groupIds: number[];
  from: string;
  to: string;
  format?: ExportFormat;
}

/** 排程報表參數 */
export interface ScheduleParams {
  description?: string;
  calendarId?: number;
  attributes?: Record<string, unknown>;
}

// ==================== 指令屬性 ====================

/** 指令屬性定義 */
export interface CommandAttributeDef {
  key: string;
  name: string;
  type: 'string' | 'number' | 'boolean';
}

/** 指令選項（已儲存或類型） */
export interface CommandOption {
  id?: number;
  type?: string;
  description?: string;
  optionType: 'saved' | 'type';
  key: string;
  attributes?: Record<string, unknown>;
}

// ==================== 地圖 ====================

/** 地圖樣式定義 */
export interface MapStyle {
  id: string;
  name: string;
  style: Record<string, unknown>;
  available?: boolean;
  coordinateSystem?: string;
  transformRequest?: (url: string, resourceType: string) => { url: string } | void;
}

/** 地圖疊加層定義 */
export interface MapOverlay {
  id: string;
  name: string;
  url: string;
  requiresKey?: string;
}

// ==================== 單位系統 ====================

/** 速度單位 */
export type SpeedUnit = 'kn' | 'kmh' | 'mph';
/** 距離單位 */
export type DistanceUnit = 'km' | 'mi' | 'nmi';
/** 海拔單位 */
export type AltitudeUnit = 'm' | 'ft';
/** 容量單位 */
export type VolumeUnit = 'ltr' | 'impGal' | 'usGal';
/** 座標格式 */
export type CoordinateFormat = 'dd' | 'ddm' | 'dms';

// ==================== 通用工具型別 ====================

/** 分頁查詢參數 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  keyword?: string;
  all?: boolean;
}

/** 非同步任務回呼 */
export interface AsyncTaskContext {
  signal: AbortSignal;
}

/** 可拖曳狀態卡片位置 */
export interface StatusCardPosition {
  x: number;
  y: number;
}
