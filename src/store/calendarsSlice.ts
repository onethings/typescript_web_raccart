/**
 * Calendars Redux Slice
 * 
 * 管理日曆資料快取。
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Calendar } from '../types/models';

export interface CalendarsState {
  items: Record<number, Calendar>;
}

const initialState: CalendarsState = {
  items: {},
};

const calendarsSlice = createSlice({
  name: 'calendars',
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Calendar[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },
  },
});

export const calendarsActions = calendarsSlice.actions;
export const calendarsReducer = calendarsSlice.reducer;
