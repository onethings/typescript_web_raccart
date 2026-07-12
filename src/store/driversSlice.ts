/**
 * Drivers Redux Slice
 * 
 * 管理駕駛資料快取（以 uniqueId 為索引）。
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Driver } from '../types/models';

export interface DriversState {
  /** 以 uniqueId 為索引的駕駛字典 */
  items: Record<string, Driver>;
}

const initialState: DriversState = {
  items: {},
};

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Driver[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        state.items[item.uniqueId] = item;
      });
    },
  },
});

export const driversActions = driversSlice.actions;
export const driversReducer = driversSlice.reducer;
