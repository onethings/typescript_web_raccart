/**
 * Traccar API 端點模組
 * 
 * 根據 openapi.yaml 定義的所有 API 端點。
 * 每個函式都對應一個 REST 操作，使用 axios client 進行請求。
 */

import apiClient, { buildQueryString } from './client';
import type {
  Server,
  User,
  Device,
  DeviceAccumulators,
  Position,
  Event,
  Group,
  Geofence,
  Notification,
  NotificationType,
  Command,
  CommandType,
  QueuedCommand,
  Permission,
  Attribute,
  Driver,
  Maintenance,
  Calendar,
  Statistics,
  Action,
  ReportSummary,
  ReportGeofences,
  ReportTrips,
  ReportStops,
  CombinedReportItem,
} from '../types/models';
import type { PaginationParams, ReportParams } from '../types/ui';

// ==================== Session ====================

/** 登入（建立 Session） */
export const login = (email: string, password: string, code?: string) =>
  apiClient.post<User>(
    '/api/session',
    new URLSearchParams(
      code ? { email, password, code } : { email, password },
    ),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );

/** 使用 Token 登入 */
export const loginWithToken = (token: string) =>
  apiClient.get<User>('/api/session', { params: { token } });

/** 檢查目前 Session */
export const checkSession = (signal?: AbortSignal) =>
  apiClient.get<User>('/api/session', { signal });

/** 檢查 Session Token */
export const checkToken = (token: string) =>
  apiClient.get('/api/session', { params: { token } });

/** 登出 （銷毀 Session） */
export const logout = () =>
  apiClient.delete('/api/session');

/** 模擬登入為指定使用者 （管理員專用） */
export const impersonateUser = (userId: number) =>
  apiClient.get<User>(`/api/session/${userId}`);

/** 產生 Session Token */
export const generateToken = (expiration?: string) =>
  apiClient.post<string>(
    '/api/session/token',
    new URLSearchParams(expiration ? { expiration } : {}),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );

/** 撤銷 Session Token */
export const revokeToken = (token: string) =>
  apiClient.post(
    '/api/session/token/revoke',
    new URLSearchParams({ token }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );

/** 發起 OpenID 認證（跳轉到 OpenID 提供者） */
export const openidAuth = () =>
  apiClient.get('/api/session/openid/auth');

// ==================== Server ====================

/** 取得伺服器資訊 */
export const getServer = (signal?: AbortSignal) =>
  apiClient.get<Server>('/api/server', { signal });

/** 更新伺服器資訊 */
export const updateServer = (server: Server) =>
  apiClient.put<Server>('/api/server', server);

/** 上傳伺服器檔案 */
export const uploadServerFile = (path: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/api/server/file/${path}`, formData);
};

/** 反向地理編碼 */
export const reverseGeocode = (latitude: number, longitude: number) =>
  apiClient.get<string>('/api/server/geocode', {
    params: { latitude, longitude },
  });

// ==================== Users ====================

/** 取得使用者列表 */
export const getUsers = (params?: PaginationParams & { userId?: string }) =>
  apiClient.get<User[]>('/api/users', { params });

/** 取得單一使用者 */
export const getUser = (id: number) =>
  apiClient.get<User>(`/api/users/${id}`);

/** 建立使用者 */
export const createUser = (user: Partial<User>) =>
  apiClient.post<User>('/api/users', user);

/** 更新使用者 */
export const updateUser = (id: number, user: Partial<User>) =>
  apiClient.put<User>(`/api/users/${id}`, user);

/** 刪除使用者 */
export const deleteUser = (id: number) =>
  apiClient.delete(`/api/users/${id}`);

/** 產生 TOTP 金鑰 */
export const generateTotpKey = () =>
  apiClient.post<string>('/api/users/totp');

// ==================== Devices ====================

/** 取得裝置列表 */
export const getDevices = (params?: PaginationParams & { userId?: number; id?: number[]; uniqueId?: string[]; excludeAttributes?: boolean }) =>
  apiClient.get<Device[]>('/api/devices', { params });

/** 取得單一裝置 */
export const getDevice = (id: number) =>
  apiClient.get<Device>(`/api/devices/${id}`);

/** 建立裝置 */
export const createDevice = (device: Partial<Device>) =>
  apiClient.post<Device>('/api/devices', device);

/** 更新裝置 */
export const updateDevice = (id: number, device: Partial<Device>) =>
  apiClient.put<Device>(`/api/devices/${id}`, device);

/** 刪除裝置 */
export const deleteDevice = (id: number) =>
  apiClient.delete(`/api/devices/${id}`);

/** 更新裝置累計器 */
export const updateDeviceAccumulators = (id: number, accumulators: DeviceAccumulators) =>
  apiClient.put(`/api/devices/${id}/accumulators`, accumulators);

/** 上傳裝置圖片 */
export const uploadDeviceImage = (id: number, file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return apiClient.post<string>(`/api/devices/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ==================== Groups ====================

/** 取得群組列表 */
export const getGroups = (params?: PaginationParams) =>
  apiClient.get<Group[]>('/api/groups', { params });

/** 取得單一群組 */
export const getGroup = (id: number) =>
  apiClient.get<Group>(`/api/groups/${id}`);

/** 建立群組 */
export const createGroup = (group: Partial<Group>) =>
  apiClient.post<Group>('/api/groups', group);

/** 更新群組 */
export const updateGroup = (id: number, group: Partial<Group>) =>
  apiClient.put<Group>(`/api/groups/${id}`, group);

/** 刪除群組 */
export const deleteGroup = (id: number) =>
  apiClient.delete(`/api/groups/${id}`);

// ==================== Positions ====================

/** 取得位置列表 */
export const getPositions = (
  params?: {
    deviceId?: number;
    from?: string;
    to?: string;
    id?: number[];
  },
  signal?: AbortSignal,
) =>
  apiClient.get<Position[]>('/api/positions', { params, signal });

/** 刪除裝置在時間範圍內的位置 */
export const deletePositions = (deviceId: number, from: string, to: string) =>
  apiClient.delete('/api/positions', { params: { deviceId, from, to } });

// ==================== Events ====================

/** 取得單一事件 */
export const getEvent = (id: number) =>
  apiClient.get<Event>(`/api/events/${id}`);

// ==================== Geofences ====================

/** 取得圍欄列表 */
export const getGeofences = (signal?: AbortSignal) =>
  apiClient.get<Geofence[]>('/api/geofences', { signal });

/** 取得單一圍欄 */
export const getGeofence = (id: number) =>
  apiClient.get<Geofence>(`/api/geofences/${id}`);

/** 建立圍欄 */
export const createGeofence = (geofence: Partial<Geofence>) =>
  apiClient.post<Geofence>('/api/geofences', geofence);

/** 更新圍欄 */
export const updateGeofence = (id: number, geofence: Partial<Geofence>) =>
  apiClient.put<Geofence>(`/api/geofences/${id}`, geofence);

/** 刪除圍欄 */
export const deleteGeofence = (id: number) =>
  apiClient.delete(`/api/geofences/${id}`);

// ==================== Notifications ====================

/** 取得通知列表 */
export const getNotifications = (params?: PaginationParams & { deviceId?: number; groupId?: number }) =>
  apiClient.get<Notification[]>('/api/notifications', { params });

/** 取得單一通知 */
export const getNotification = (id: number) =>
  apiClient.get<Notification>(`/api/notifications/${id}`);

/** 建立通知 */
export const createNotification = (notification: Partial<Notification>) =>
  apiClient.post<Notification>('/api/notifications', notification);

/** 更新通知 */
export const updateNotification = (id: number, notification: Partial<Notification>) =>
  apiClient.put<Notification>(`/api/notifications/${id}`, notification);

/** 刪除通知 */
export const deleteNotification = (id: number) =>
  apiClient.delete(`/api/notifications/${id}`);

/** 取得通知類型 */
export const getNotificationTypes = () =>
  apiClient.get<NotificationType[]>('/api/notifications/types');

/** 測試通知 */
export const testNotification = (notificator: string) =>
  apiClient.post(`/api/notifications/test/${notificator}`);

/** 發送通知（公告） */
export const sendNotification = (notificator: string, userIds: number[], subject?: string, body?: string) => {
  const params = userIds.map((id) => `userId=${id}`).join('&');
  return apiClient.post(
    `/api/notifications/send/${notificator}?${params}`,
    { subject, body },
  );
};

// ==================== Commands ====================

/** 取得已儲存指令列表 */
export const getCommands = (params?: PaginationParams) =>
  apiClient.get<Command[]>('/api/commands', { params });

/** 取得單一指令 */
export const getCommand = (id: number) =>
  apiClient.get<Command>(`/api/commands/${id}`);

/** 建立指令 */
export const createCommand = (command: Partial<Command>) =>
  apiClient.post<Command>('/api/commands', command);

/** 更新指令 */
export const updateCommand = (id: number, command: Partial<Command>) =>
  apiClient.put<Command>(`/api/commands/${id}`, command);

/** 刪除指令 */
export const deleteCommand = (id: number) =>
  apiClient.delete(`/api/commands/${id}`);

/** 取得裝置支援的指令 */
export const getDeviceCommands = (deviceId: number) =>
  apiClient.get<Command[]>('/api/commands/send', { params: { deviceId } });

/** 取得指令類型 */
export const getCommandTypes = (deviceId?: number) =>
  apiClient.get<CommandType[]>('/api/commands/types', { params: { deviceId } });

/** 發送指令給裝置 */
export const sendCommand = (command: Partial<Command>, groupId?: number) =>
  apiClient.post<Command | QueuedCommand | QueuedCommand[]>('/api/commands/send', command, {
    params: groupId ? { groupId } : undefined,
  });

// ==================== Permissions ====================

/** 建立權限關聯 */
export const createPermission = (permission: Permission) =>
  apiClient.post('/api/permissions', permission);

/** 移除權限關聯 */
export const deletePermission = (permission: Permission) =>
  apiClient.delete('/api/permissions', { data: permission });

/** 批次建立權限 */
export const createPermissionsBulk = (permissions: Permission[]) =>
  apiClient.post('/api/permissions/bulk', permissions);

/** 批次移除權限 */
export const deletePermissionsBulk = (permissions: Permission[]) =>
  apiClient.delete('/api/permissions/bulk', { data: permissions });

/** 查詢權限關聯 */
export const getPermissions = (params: Record<string, number>) =>
  apiClient.get<Permission[]>('/api/permissions', { params });

// ==================== Reports ====================

/** 綜合報表 */
export const getCombinedReport = (params: ReportParams, signal?: AbortSignal) =>
  apiClient.get<CombinedReportItem[]>('/api/reports/combined', {
    params: {
      from: params.from,
      to: params.to,
      deviceId: params.deviceIds,
      groupId: params.groupIds,
    },
    signal,
  });

/** 事件報表 */
export const getEventReport = (
  params: ReportParams & { eventType?: string; alarmType?: string },
  signal?: AbortSignal,
) =>
  apiClient.get<Event[]>('/api/reports/events', {
    params: {
      from: params.from,
      to: params.to,
      eventType: (params as Record<string, unknown>).eventType as string | undefined,
      alarmType: (params as Record<string, unknown>).alarmType as string | undefined,
      deviceId: params.deviceIds,
      groupId: params.groupIds,
    },
    signal,
  });

/** 圍欄報表 */
export const getGeofenceReport = (
  params: ReportParams & { geofenceId?: number },
  signal?: AbortSignal,
) =>
  apiClient.get<ReportGeofences[]>('/api/reports/geofences', {
    params: {
      from: params.from,
      to: params.to,
      geofenceId: (params as Record<string, unknown>).geofenceId as number | undefined,
      deviceId: params.deviceIds,
      groupId: params.groupIds,
    },
    signal,
  });

/** 路線報表 */
export const getRouteReport = (params: ReportParams, signal?: AbortSignal) =>
  apiClient.get<Position[]>('/api/reports/route', {
    params: {
      from: params.from,
      to: params.to,
      deviceId: params.deviceIds,
      groupId: params.groupIds,
    },
    signal,
  });

/** 停留報表 */
export const getStopReport = (params: ReportParams, signal?: AbortSignal) =>
  apiClient.get<ReportStops[]>('/api/reports/stops', {
    params: {
      from: params.from,
      to: params.to,
      deviceId: params.deviceIds,
      groupId: params.groupIds,
    },
    signal,
  });

/** 摘要報表 */
export const getSummaryReport = (
  params: ReportParams & { daily?: boolean },
  signal?: AbortSignal,
) =>
  apiClient.get<ReportSummary[]>('/api/reports/summary', {
    params: {
      from: params.from,
      to: params.to,
      daily: (params as Record<string, unknown>).daily as boolean | undefined,
      deviceId: params.deviceIds,
      groupId: params.groupIds,
    },
    signal,
  });

/** 行程報表 */
export const getTripReport = (params: ReportParams, signal?: AbortSignal) =>
  apiClient.get<ReportTrips[]>('/api/reports/trips', {
    params: {
      from: params.from,
      to: params.to,
      deviceId: params.deviceIds,
      groupId: params.groupIds,
    },
    signal,
  });

/** 取得排程報表列表 */
export const getScheduledReports = () =>
  apiClient.get('/api/reports');

/** 建立排程報表 */
export const createScheduledReport = (data: {
  type: string;
  description?: string;
  calendarId?: number;
  attributes?: Record<string, unknown>;
}) =>
  apiClient.post('/api/reports', data);

/** 刪除排程報表 */
export const deleteScheduledReport = (id: number) =>
  apiClient.delete(`/api/reports/${id}`);

// ==================== Statistics ====================

/** 取得伺服器統計 */
export const getStatistics = (from: string, to: string) =>
  apiClient.get<Statistics[]>('/api/statistics', { params: { from, to } });

// ==================== Audit ====================

/** 取得稽核日誌 */
export const getAudit = (from: string, to: string) =>
  apiClient.get<Action[]>('/api/audit', { params: { from, to } });

// ==================== Attributes (Computed) ====================

/** 取得計算屬性列表 */
export const getAttributes = (params?: PaginationParams) =>
  apiClient.get<Attribute[]>('/api/attributes/computed', { params });

/** 取得單一計算屬性 */
export const getAttribute = (id: number) =>
  apiClient.get<Attribute>(`/api/attributes/computed/${id}`);

/** 建立計算屬性 */
export const createAttribute = (attribute: Partial<Attribute>) =>
  apiClient.post<Attribute>('/api/attributes/computed', attribute);

/** 更新計算屬性 */
export const updateAttribute = (id: number, attribute: Partial<Attribute>) =>
  apiClient.put<Attribute>(`/api/attributes/computed/${id}`, attribute);

/** 刪除計算屬性 */
export const deleteAttribute = (id: number) =>
  apiClient.delete(`/api/attributes/computed/${id}`);

/** 測試計算屬性 */
export const testAttribute = (attribute: Partial<Attribute>, deviceId: number) =>
  apiClient.post('/api/attributes/computed/test', attribute, {
    params: { deviceId },
  });

// ==================== Drivers ====================

/** 取得駕駛列表 */
export const getDrivers = (params?: PaginationParams) =>
  apiClient.get<Driver[]>('/api/drivers', { params });

/** 取得單一駕駛 */
export const getDriver = (id: number) =>
  apiClient.get<Driver>(`/api/drivers/${id}`);

/** 建立駕駛 */
export const createDriver = (driver: Partial<Driver>) =>
  apiClient.post<Driver>('/api/drivers', driver);

/** 更新駕駛 */
export const updateDriver = (id: number, driver: Partial<Driver>) =>
  apiClient.put<Driver>(`/api/drivers/${id}`, driver);

/** 刪除駕駛 */
export const deleteDriver = (id: number) =>
  apiClient.delete(`/api/drivers/${id}`);

// ==================== Maintenance ====================

/** 取得保養規則列表 */
export const getMaintenances = (params?: PaginationParams) =>
  apiClient.get<Maintenance[]>('/api/maintenance', { params });

/** 取得單一保養規則 */
export const getMaintenance = (id: number) =>
  apiClient.get<Maintenance>(`/api/maintenance/${id}`);

/** 建立保養規則 */
export const createMaintenance = (maintenance: Partial<Maintenance>) =>
  apiClient.post<Maintenance>('/api/maintenance', maintenance);

/** 更新保養規則 */
export const updateMaintenance = (id: number, maintenance: Partial<Maintenance>) =>
  apiClient.put<Maintenance>(`/api/maintenance/${id}`, maintenance);

/** 刪除保養規則 */
export const deleteMaintenance = (id: number) =>
  apiClient.delete(`/api/maintenance/${id}`);

// ==================== Calendars ====================

/** 取得日曆列表 */
export const getCalendars = (params?: PaginationParams) =>
  apiClient.get<Calendar[]>('/api/calendars', { params });

/** 取得單一日曆 */
export const getCalendar = (id: number) =>
  apiClient.get<Calendar>(`/api/calendars/${id}`);

/** 建立日曆 */
export const createCalendar = (calendar: Partial<Calendar>) =>
  apiClient.post<Calendar>('/api/calendars', calendar);

/** 更新日曆 */
export const updateCalendar = (id: number, calendar: Partial<Calendar>) =>
  apiClient.put<Calendar>(`/api/calendars/${id}`, calendar);

/** 刪除日曆 */
export const deleteCalendar = (id: number) =>
  apiClient.delete(`/api/calendars/${id}`);

// ==================== Share ====================

/** 分享裝置 */
export const shareDevice = (deviceId: number, expiration: string) =>
  apiClient.post<string>(
    '/api/share/device',
    new URLSearchParams({ deviceId: String(deviceId), expiration }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );

/** 分享群組 */
export const shareGroup = (groupId: number, expiration: string) =>
  apiClient.post<string>(
    '/api/share/group',
    new URLSearchParams({ groupId: String(groupId), expiration }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );

// ==================== Password ====================

/** 發送密碼重設 Email */
export const resetPassword = (email: string) =>
  apiClient.post(
    '/api/password/reset',
    new URLSearchParams({ email }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );

/** 使用 Token 更新密碼 */
export const updatePassword = (token: string, password: string) =>
  apiClient.post(
    '/api/password/update',
    new URLSearchParams({ token, password }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
