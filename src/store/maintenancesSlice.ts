/**
 * Maintenances Redux Slice
 * 
 * 管理保養規則資料快取。
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Maintenance } from '../types/models';

export interface MaintenancesState {
  items: Record<number, Maintenance>;
}

const initialState: MaintenancesState = {
  items: {},
};

const maintenancesSlice = createSlice({
  name: 'maintenances',
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Maintenance[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },
  },
});

export const maintenancesActions = maintenancesSlice.actions;
export const maintenancesReducer = maintenancesSlice.reducer;
