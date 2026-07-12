/**
 * Session Redux Slice
 * 
 * 管理認證狀態、伺服器資訊、使用者資料、位置資料。
 * 對應 FRONTME.md 10.2 Session Store 章節。
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Server, User, Position } from '../types/models';
import type { RouteHistory, LogEntry } from '../types/ui';

// ==================== 狀態型別 ====================

/** Session state 結構 */
export interface SessionState {
  /** 伺服器資訊 */
  server: Server | null;
  /** 目前登入使用者 */
  user: User | null;
  /** WebSocket 連線狀態 */
  socket: boolean | null;
  /** 是否啟用日誌記錄 */
  includeLogs: boolean;
  /** 裝置通訊日誌條目 */
  logs: LogEntry[];
  /** 以 deviceId 為索引的最新位置 */
  positions: Record<number, Position>;
  /** 即時路線歷史 [lng, lat][] */
  history: RouteHistory;
}

// ==================== 初始狀態 ====================

const initialState: SessionState = {
  server: null,
  user: null,
  socket: null,
  includeLogs: false,
  logs: [],
  positions: {},
  history: {},
};

// ==================== Slice ====================

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    /** 設定伺服器資訊 */
    updateServer(state, action: PayloadAction<Server>) {
      state.server = action.payload;
    },

    /** 設定目前使用者 */
    updateUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },

    /** 設定 WebSocket 連線狀態 */
    updateSocket(state, action: PayloadAction<boolean>) {
      state.socket = action.payload;
    },

    /** 啟用/停用日誌記錄 */
    enableLogs(state, action: PayloadAction<boolean>) {
      state.includeLogs = action.payload;
      if (!action.payload) {
        state.logs = [];
      }
    },

    /** 附加日誌條目 */
    updateLogs(state, action: PayloadAction<LogEntry[]>) {
      state.logs.push(...action.payload);
    },

    /**
     * 更新位置資料
     * 同時根據 mapLiveRoutes 設定管理即時路線歷史
     */
    updatePositions(state, action: PayloadAction<Position[]>) {
      const liveRoutes =
        state.user?.attributes?.mapLiveRoutes ||
        state.server?.attributes?.mapLiveRoutes ||
        'none';
      const liveRoutesLimit: number =
        state.user?.attributes?.['web.liveRouteLength'] ||
        state.server?.attributes?.['web.liveRouteLength'] ||
        10;

      action.payload.forEach((position) => {
        state.positions[position.deviceId] = position;

        if (liveRoutes !== 'none' && position.longitude != null && position.latitude != null) {
          const route: [number, number][] = state.history[position.deviceId] || [];
          const last = route[route.length - 1];
          if (
            !last ||
            last[0] !== position.longitude ||
            last[1] !== position.latitude
          ) {
            state.history[position.deviceId] = [
              ...route.slice(1 - liveRoutesLimit),
              [position.longitude, position.latitude],
            ];
          }
        } else {
          state.history = {};
        }
      });
    },
  },
});

export const sessionActions = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
