/**
 * Redux Store 根設定
 * 
 * 合併所有 reducer 並設定 middleware。
 * 對應 FRONTME.md 10.1 Store 配置章節。
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { errorsReducer } from './errorsSlice';
import { sessionReducer } from './sessionSlice';
import { devicesReducer } from './devicesSlice';
import { eventsReducer } from './eventsSlice';
import { motionReducer } from './motionSlice';
import { geofencesReducer } from './geofencesSlice';
import { groupsReducer } from './groupsSlice';
import { driversReducer } from './driversSlice';
import { maintenancesReducer } from './maintenancesSlice';
import { calendarsReducer } from './calendarsSlice';
import throttleMiddleware from './throttleMiddleware';

/**
 * 根 reducer
 * 組合 10 個子 reducer
 */
const rootReducer = combineReducers({
  errors: errorsReducer,
  session: sessionReducer,
  devices: devicesReducer,
  events: eventsReducer,
  motion: motionReducer,
  geofences: geofencesReducer,
  groups: groupsReducer,
  drivers: driversReducer,
  maintenances: maintenancesReducer,
  calendars: calendarsReducer,
});

/**
 * Redux store 實例
 * 使用 throttleMiddleware 處理高頻率更新
 */
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(throttleMiddleware),
});

// ==================== 型別匯出 ====================

/** 根 state 型別 */
export type RootState = ReturnType<typeof rootReducer>;

/** Dispatch 型別 */
export type AppDispatch = typeof store.dispatch;

export default store;

// 重新匯出所有 actions
export { errorsActions } from './errorsSlice';
export { sessionActions } from './sessionSlice';
export { devicesActions } from './devicesSlice';
export { eventsActions } from './eventsSlice';
export { motionActions } from './motionSlice';
export { geofencesActions } from './geofencesSlice';
export { groupsActions } from './groupsSlice';
export { driversActions } from './driversSlice';
export { maintenancesActions } from './maintenancesSlice';
export { calendarsActions } from './calendarsSlice';
