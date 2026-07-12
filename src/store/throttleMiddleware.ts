/**
 * Throttle Middleware
 * 
 * 當 devices.update 和 session.updatePositions 更新頻率過高時進行批次處理。
 * 機制：
 * - 閾值: 3 次/秒
 * - 最小間隔: 1500ms
 * - 最大間隔: 30000ms
 * - 自適應演算法動態調整批次間隔
 * 
 * 對應 FRONTME.md 10.5 Throttle Middleware 章節。
 */

import { Middleware } from '@reduxjs/toolkit';

// 需要 throttle 的 action type
const THROTTLED_ACTIONS = ['devices/update', 'session/updatePositions'];

interface ThrottleState {
  /** 計數器 */
  count: number;
  /** 時間窗口開始時間 */
  windowStart: number;
  /** 目前間隔 */
  interval: number;
  /** 緩衝的 action */
  buffer: Record<string, unknown[]>[];
  /** 計時器 ID */
  timerId: ReturnType<typeof setTimeout> | null;
}

/** 閾值: 3 次/秒 */
const THRESHOLD = 3;
/** 最小間隔: 1500ms */
const MIN_INTERVAL = 1500;
/** 最大間隔: 30000ms */
const MAX_INTERVAL = 30000;

const createInitialState = (): ThrottleState => ({
  count: 0,
  windowStart: Date.now(),
  interval: MIN_INTERVAL,
  buffer: [],
  timerId: null,
});

/**
 * Throttle Middleware 工廠函式
 * 在開發模式會輸出除錯資訊
 */
const throttleMiddleware: Middleware = (store) => {
  const state = createInitialState();

  return (next) => (action: unknown) => {
    const typedAction = action as { type: string };
    
    if (!THROTTLED_ACTIONS.includes(typedAction.type)) {
      return next(action);
    }

    const now = Date.now();

    // 計算時間窗口內的請求率
    state.count += 1;
    const elapsed = now - state.windowStart;

    if (elapsed >= 1000) {
      // 重置時間窗口
      const rate = state.count / (elapsed / 1000);
      state.count = 0;
      state.windowStart = now;

      // 自適應調整間隔
      if (rate > THRESHOLD) {
        // 超過閾值，增加間隔（上限 MAX_INTERVAL）
        state.interval = Math.min(state.interval * 2, MAX_INTERVAL);
      } else {
        // 低於閾值，減少間隔（下限 MIN_INTERVAL）
        state.interval = Math.max(state.interval / 2, MIN_INTERVAL);
      }
    }

    // 緩存 action
    state.buffer.push(typedAction as Record<string, unknown>[]);

    // 如果沒有排程 flush，則排程一個
    if (!state.timerId) {
      state.timerId = setTimeout(() => {
        // 合併並 flush 所有緩存的 action
        const mergedActions = state.buffer;
        state.buffer = [];
        state.timerId = null;

        if (mergedActions.length > 0) {
          // 只 flush 最後一個相同類型的 action（取最新狀態）
          const lastAction = mergedActions[mergedActions.length - 1];
          const lastType = (lastAction as { type: string }).type;
          
          if (process.env.NODE_ENV === 'development') {
            console.debug(
              `[Throttle] 合併 ${mergedActions.length} 個 ${lastType} 請求，間隔: ${state.interval}ms`,
            );
          }
          
          next(lastAction);
        }
      }, state.interval);
    }
  };
};

export default throttleMiddleware;
