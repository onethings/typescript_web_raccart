/**
 * Groups Redux Slice
 * 
 * 管理群組資料快取。
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Group } from '../types/models';

export interface GroupsState {
  items: Record<number, Group>;
}

const initialState: GroupsState = {
  items: {},
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Group[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },
    update(state, action: PayloadAction<Group[]>) {
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },
  },
});

export const groupsActions = groupsSlice.actions;
export const groupsReducer = groupsSlice.reducer;
