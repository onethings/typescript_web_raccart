/**
 * 路由導航設定
 *
 * 定義所有應用路由路徑與對應頁面元件。
 * 使用 React.lazy 和 Suspense 實現程式碼分割。
 * 對應 FRONTME.md 2. 路由系統 章節。
 */

import React, { lazy, Suspense } from 'react';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from './hooks/useAppStore';
import { useAsyncTask } from './hooks/useAsyncTask';
import { devicesActions } from './store';
import { Loader } from './components/Loader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useLocalization } from './i18n/LocalizationProvider';
import App from './App';

// ==================== 登入頁面 ====================
const LoginPage = lazy(() => import('./pages/login/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/login/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ResetPasswordPage = lazy(() => import('./pages/login/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const ChangeServerPage = lazy(() => import('./pages/login/ChangeServerPage').then((m) => ({ default: m.ChangeServerPage })));

// ==================== 主頁面 ====================
const MainPage = lazy(() => import('./pages/main/MainPage').then((m) => ({ default: m.MainPage })));

// ==================== 設定頁面 ====================
const ServerPage = lazy(() => import('./pages/settings/ServerPage').then((m) => ({ default: m.ServerPage })));
const UsersPage = lazy(() => import('./pages/settings/UsersPage').then((m) => ({ default: m.UsersPage })));
const UserPage = lazy(() => import('./pages/settings/UserPage').then((m) => ({ default: m.UserPage })));
const DevicesPage = lazy(() => import('./pages/settings/DevicesPage').then((m) => ({ default: m.DevicesPage })));
const DevicePage = lazy(() => import('./pages/settings/DevicePage').then((m) => ({ default: m.DevicePage })));
const GroupsPage = lazy(() => import('./pages/settings/GroupsPage').then((m) => ({ default: m.GroupsPage })));
const GroupPage = lazy(() => import('./pages/settings/GroupPage').then((m) => ({ default: m.GroupPage })));
const GeofencePage = lazy(() => import('./pages/settings/GeofencePage').then((m) => ({ default: m.GeofencePage })));
const NotificationsPage = lazy(() => import('./pages/settings/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const NotificationPage = lazy(() => import('./pages/settings/NotificationPage').then((m) => ({ default: m.NotificationPage })));
const CommandsPage = lazy(() => import('./pages/settings/CommandsPage').then((m) => ({ default: m.CommandsPage })));
const DriversPage = lazy(() => import('./pages/settings/DriversPage').then((m) => ({ default: m.DriversPage })));
const DriverPage = lazy(() => import('./pages/settings/DriverPage').then((m) => ({ default: m.DriverPage })));
const CalendarsPage = lazy(() => import('./pages/settings/CalendarsPage').then((m) => ({ default: m.CalendarsPage })));
const CalendarPage = lazy(() => import('./pages/settings/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const MaintenancesPage = lazy(() => import('./pages/settings/MaintenancesPage').then((m) => ({ default: m.MaintenancesPage })));
const MaintenancePage = lazy(() => import('./pages/settings/MaintenancePage').then((m) => ({ default: m.MaintenancePage })));
const ComputedAttributesPage = lazy(() => import('./pages/settings/ComputedAttributesPage').then((m) => ({ default: m.ComputedAttributesPage })));

// ==================== 其他頁面 ====================
const PositionPage = lazy(() => import('./pages/other/PositionPage').then((m) => ({ default: m.PositionPage })));
const EventPage = lazy(() => import('./pages/other/EventPage').then((m) => ({ default: m.EventPage })));
const ReplayPage = lazy(() => import('./pages/other/ReplayPage').then((m) => ({ default: m.ReplayPage })));

// ==================== 其他頁面（已實作）====================
const NetworkPage = lazy(() => import('./pages/other/NetworkPage').then((m) => ({ default: m.NetworkPage })));
const EmulatorPage = lazy(() => import('./pages/other/EmulatorPage').then((m) => ({ default: m.EmulatorPage })));
const StreamPage = lazy(() => import('./pages/other/StreamPage').then((m) => ({ default: m.StreamPage })));
const CommandDevicePage = lazy(() => import('./pages/settings/CommandDevicePage').then((m) => ({ default: m.CommandDevicePage })));
const SharePage = lazy(() => import('./pages/settings/SharePage').then((m) => ({ default: m.SharePage })));
const AccumulatorsPage = lazy(() => import('./pages/settings/AccumulatorsPage').then((m) => ({ default: m.AccumulatorsPage })));
const AnnouncementPage = lazy(() => import('./pages/settings/AnnouncementPage').then((m) => ({ default: m.AnnouncementPage })));
const DeviceConnectionsPage = lazy(() => import('./pages/settings/DeviceConnectionsPage').then((m) => ({ default: m.DeviceConnectionsPage })));
const GroupConnectionsPage = lazy(() => import('./pages/settings/GroupConnectionsPage').then((m) => ({ default: m.GroupConnectionsPage })));
const UserConnectionsPage = lazy(() => import('./pages/settings/UserConnectionsPage').then((m) => ({ default: m.UserConnectionsPage })));
const PreferencesPage = lazy(() => import('./pages/settings/PreferencesPage').then((m) => ({ default: m.PreferencesPage })));
const CombinedReportPage = lazy(() => import('./pages/reports/CombinedReportPage').then((m) => ({ default: m.CombinedReportPage })));
const EventReportPage = lazy(() => import('./pages/reports/EventReportPage').then((m) => ({ default: m.EventReportPage })));
const GeofenceReportPage = lazy(() => import('./pages/reports/GeofenceReportPage').then((m) => ({ default: m.GeofenceReportPage })));
const TripReportPage = lazy(() => import('./pages/reports/TripReportPage').then((m) => ({ default: m.TripReportPage })));
const StopReportPage = lazy(() => import('./pages/reports/StopReportPage').then((m) => ({ default: m.StopReportPage })));
const StatisticsPage = lazy(() => import('./pages/reports/StatisticsPage').then((m) => ({ default: m.StatisticsPage })));
const AuditPage = lazy(() => import('./pages/reports/AuditPage').then((m) => ({ default: m.AuditPage })));
const LogsPage = lazy(() => import('./pages/reports/LogsPage').then((m) => ({ default: m.LogsPage })));

// ==================== 所有頁面已實作 ====================
const GeofencesPage = lazy(() => import('./pages/other/GeofencesPage').then((m) => ({ default: m.GeofencesPage })));
const CommandPage = lazy(() => import('./pages/settings/CommandPage').then((m) => ({ default: m.CommandPage })));
const CommandGroupPage = lazy(() => import('./pages/settings/CommandGroupPage').then((m) => ({ default: m.CommandGroupPage })));
const ComputedAttributePage = lazy(() => import('./pages/settings/ComputedAttributePage').then((m) => ({ default: m.ComputedAttributePage })));
const ChartReportPage = lazy(() => import('./pages/reports/ChartReportPage').then((m) => ({ default: m.ChartReportPage })));
const PositionsReportPage = lazy(() => import('./pages/reports/PositionsReportPage').then((m) => ({ default: m.PositionsReportPage })));
const SummaryReportPage = lazy(() => import('./pages/reports/SummaryReportPage').then((m) => ({ default: m.SummaryReportPage })));
const ScheduledPage = lazy(() => import('./pages/reports/ScheduledPage').then((m) => ({ default: m.ScheduledPage })));

/**
 * 路由導航元件
 * 處理 URL 查詢參數（locale/token/uniqueId/openid）
 */
const Navigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const { setLocalLanguage } = useLocalization();
  const [searchParams, setSearchParams] = useSearchParams();

  const hasQueryParams = ['locale', 'token', 'uniqueId', 'openid'].some((key) =>
    searchParams.has(key),
  );

  // 處理 URL 查詢參數
  useAsyncTask(
    async ({ signal }) => {
      if (!hasQueryParams) return;

      const newParams = new URLSearchParams(searchParams);

      if (searchParams.has('locale')) {
        setLocalLanguage(searchParams.get('locale')!);
        newParams.delete('locale');
      }

      if (searchParams.has('token')) {
        const token = searchParams.get('token')!;
        await fetch(`/api/session?token=${encodeURIComponent(token)}`, { signal });
        newParams.delete('token');
      }

      if (searchParams.has('uniqueId')) {
        const uniqueId = searchParams.get('uniqueId')!;
        const response = await fetch(`/api/devices?uniqueId=${encodeURIComponent(uniqueId)}`, { signal });
        const items = await response.json();
        if (items.length > 0) {
          dispatch(devicesActions.selectId(items[0].id));
        }
        newParams.delete('uniqueId');
      }

      if (searchParams.has('openid')) {
        // OpenID 登入成功回呼
        if (searchParams.get('openid') === 'success') {
          // 產生登入 token
          await fetch('/api/session/token', { method: 'POST' });
        }
        newParams.delete('openid');
      }

      setSearchParams(newParams, { replace: true });
    },
    [hasQueryParams, searchParams, setSearchParams, dispatch, setLocalLanguage],
  );

  if (hasQueryParams) {
    return <Loader />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Routes>
        {/* 公開路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/change-server" element={<ChangeServerPage />} />

        {/* 已認證路由 */}
        <Route path="/" element={<App />}>
          <Route index element={<MainPage />} />

          {/* 其他頁面 */}
          <Route path="position/:id" element={<PositionPage />} />
          <Route path="network/:positionId" element={<NetworkPage />} />
          <Route path="event/:id" element={<EventPage />} />
          <Route path="replay" element={<ReplayPage />} />
          <Route path="geofences" element={<GeofencesPage />} />
          <Route path="emulator" element={<EmulatorPage />} />
          <Route path="stream" element={<StreamPage />} />

          {/* 設定頁面 */}
          <Route path="settings">
            <Route path=":type/:id/share" element={<SharePage />} />
            <Route path="accumulators/:deviceId" element={<AccumulatorsPage />} />
            <Route path="announcement" element={<AnnouncementPage />} />
            <Route path="calendars" element={<CalendarsPage />} />
            <Route path="calendar/:id" element={<CalendarPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="commands" element={<CommandsPage />} />
            <Route path="command/:id" element={<CommandPage />} />
            <Route path="command" element={<CommandPage />} />
            <Route path="attributes" element={<ComputedAttributesPage />} />
            <Route path="attribute/:id" element={<ComputedAttributePage />} />
            <Route path="attribute" element={<ComputedAttributePage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="device/:id/connections" element={<DeviceConnectionsPage />} />
            <Route path="device/:id/command" element={<CommandDevicePage />} />
            <Route path="device/:id" element={<DevicePage />} />
            <Route path="device" element={<DevicePage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="driver/:id" element={<DriverPage />} />
            <Route path="driver" element={<DriverPage />} />
            <Route path="geofence/:id" element={<GeofencePage />} />
            <Route path="geofence" element={<GeofencePage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="group/:id/connections" element={<GroupConnectionsPage />} />
            <Route path="group/:id/command" element={<CommandGroupPage />} />
            <Route path="group/:id" element={<GroupPage />} />
            <Route path="group" element={<GroupPage />} />
            <Route path="maintenances" element={<MaintenancesPage />} />
            <Route path="maintenance/:id" element={<MaintenancePage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notification/:id" element={<NotificationPage />} />
            <Route path="notification" element={<NotificationPage />} />
            <Route path="preferences" element={<PreferencesPage />} />
            <Route path="server" element={<ServerPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="user/:id/connections" element={<UserConnectionsPage />} />
            <Route path="user/:id" element={<UserPage />} />
            <Route path="user" element={<UserPage />} />
          </Route>

          {/* 報表頁面 */}
          <Route path="reports">
            <Route path="combined" element={<CombinedReportPage />} />
            <Route path="chart" element={<ChartReportPage />} />
            <Route path="events" element={<EventReportPage />} />
            <Route path="geofences" element={<GeofenceReportPage />} />
            <Route path="route" element={<PositionsReportPage />} />
            <Route path="stops" element={<StopReportPage />} />
            <Route path="summary" element={<SummaryReportPage />} />
            <Route path="trips" element={<TripReportPage />} />
            <Route path="scheduled" element={<ScheduledPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
        </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Navigation;
