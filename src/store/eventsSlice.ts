/**
 * Events Redux Slice
 * 
 * 管理 WebSocket 推送的即時事件。
 * 最多保留 50 筆事件。
 * 對應 FRONTME.md 6.2 事件控制器章節。
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Event } from '../types/models';

// ==================== 狀態型別 ====================

/** Events state 結構 */
export interface EventsState {
  /** 即時事件列表（最多 50 筆） */
  items: Event[];
}

// ==================== 初始狀態 ====================

const initialState: EventsState = {
  items: [],
};

// ==================== Slice ====================

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    /**
     * 加入新事件
     * 從前方插入，超過 50 筆從後方截斷
     */
    add(state, action: PayloadAction<Event[]>) {
      state.items.unshift(...action.payload);
      state.items.splice(50);
    },

    /** 依 id 移除事件 */
    delete(state, action: PayloadAction<Event>) {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },

    /** 清空所有事件 */
    deleteAll(state) {
      state.items = [];
    },
  },
});

export const eventsActions = eventsSlice.actions;
export const eventsReducer = eventsSlice.reducer;
