/**
 * Devices Redux Slice
 * 
 * 管理裝置資料與目前選取狀態。
 * 對應 FRONTME.md 10.3 Devices Store 章節。
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Device } from '../types/models';

// ==================== 狀態型別 ====================

/** Devices state 結構 */
export interface DevicesState {
  /** 以 id 為索引的裝置字典 */
  items: Record<number, Device>;
  /** 目前選取的裝置 ID */
  selectedId: number | null;
  /** 裝置列表載入時間戳 */
  selectTime?: number;
  /** 是否已載入 */
  loaded: boolean;
}

// ==================== 初始狀態 ====================

const initialState: DevicesState = {
  items: {},
  selectedId: null,
  loaded: false,
};

// ==================== Slice ====================

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    /** 完整取代裝置列表（清空後重建） */
    refresh(state, action: PayloadAction<Device[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
      state.loaded = true;
    },

    /** 合併更新裝置 */
    update(state, action: PayloadAction<Device[]>) {
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },

    /** 選取裝置（記錄選取時間） */
    selectId(state, action: PayloadAction<number | null>) {
      state.selectTime = Date.now();
      state.selectedId = action.payload;
    },

    /** 刪除裝置 */
    remove(state, action: PayloadAction<number>) {
      delete state.items[action.payload];
    },
  },
});

export const devicesActions = devicesSlice.actions;
export const devicesReducer = devicesSlice.reducer;
