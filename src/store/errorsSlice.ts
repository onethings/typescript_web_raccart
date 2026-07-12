/**
 * Errors Redux Slice
 * 
 * 全域錯誤佇列，用於 ErrorHandler Snackbar 顯示。
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ==================== 狀態型別 ====================

/** Errors state 結構 */
export interface ErrorsState {
  /** 錯誤訊息佇列 */
  errors: string[];
}

// ==================== 初始狀態 ====================

const initialState: ErrorsState = {
  errors: [],
};

// ==================== Slice ====================

const errorsSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    /** 加入錯誤訊息 */
    push(state, action: PayloadAction<string>) {
      state.errors.push(action.payload);
    },

    /** 移除最舊的錯誤 */
    pop(state) {
      state.errors.shift();
    },
  },
});

export const errorsActions = errorsSlice.actions;
export const errorsReducer = errorsSlice.reducer;
