/**
 * Geofences Redux Slice
 * 
 * 管理圍欄資料快取。
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Geofence } from '../types/models';

export interface GeofencesState {
  items: Record<number, Geofence>;
}

const initialState: GeofencesState = {
  items: {},
};

const geofencesSlice = createSlice({
  name: 'geofences',
  initialState,
  reducers: {
    /** 完整取代圍欄列表 */
    refresh(state, action: PayloadAction<Geofence[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },
    /** 合併更新圍欄 */
    update(state, action: PayloadAction<Geofence[]>) {
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },
  },
});

export const geofencesActions = geofencesSlice.actions;
export const geofencesReducer = geofencesSlice.reducer;
