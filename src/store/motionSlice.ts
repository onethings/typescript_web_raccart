/**
 * Motion Redux Slice
 * 
 * 管理裝置的移動/停止分段資料。
 * 用於 MotionBar 元件顯示 24 小時移動狀態條。
 * 對應 FRONTME.md 5.4 MotionBar 章節。
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MotionSegment, MotionMap } from '../types/ui';

// ==================== 狀態型別 ====================

/** Motion state 結構 */
export interface MotionState {
  /** 以 deviceId 為索引的運動分段 */
  items: MotionMap;
}

// ==================== 初始狀態 ====================

const initialState: MotionState = {
  items: {},
};

// ==================== Slice ====================

const motionSlice = createSlice({
  name: 'motion',
  initialState,
  reducers: {
    /** 取代所有運動分段資料 */
    set(state, action: PayloadAction<MotionMap>) {
      state.items = action.payload;
    },

    /** 清空所有運動資料 */
    clear(state) {
      state.items = {};
    },
  },
});

export const motionActions = motionSlice.actions;
export const motionReducer = motionSlice.reducer;
