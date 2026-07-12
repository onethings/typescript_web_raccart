/**
 * 非同步任務 Hook
 * 
 * 自動管理 AbortController，元件卸載時取消請求。
 * 錯誤會自動 dispatch 到 errors store。
 * 對應 FRONTME.md 13.14 reactHelper.js 章節。
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch } from './useAppStore';
import { errorsActions } from '../store';

/**
 * 非同步任務上下文
 */
export interface AsyncTaskContext {
  signal: AbortSignal;
}

/**
 * 執行非同步 effect 的 hook
 * 自動 AbortController 管理、錯誤處理
 * 
 * @param effect - 非同步函式，接收 { signal } 參數
 * @param deps - 相依陣列
 * 
 * @example
 * useAsyncTask(async ({ signal }) => {
 *   const response = await fetch('/api/devices', { signal });
 *   const data = await response.json();
 *   dispatch(updateDevices(data));
 * }, [dispatch]);
 */
export const useAsyncTask = (
  effect: (context: AsyncTaskContext) => Promise<(() => void) | null | void>,
  deps: React.DependencyList,
): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const controller = new AbortController();
    let cleanup: (() => void) | null | void;

    effect({ signal: controller.signal })
      .then((result) => {
        cleanup = result;
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') {
          dispatch(errorsActions.push(error.message));
        }
      });

    return () => {
      controller.abort();
      if (cleanup) {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

/**
 * 捕捉非同步函式錯誤的 hook
 * 
 * @param method - 非同步函式
 * @returns 包裝後的函式（錯誤會自動 dispatch）
 * 
 * @example
 * const handleSave = useCatch(async () => {
 *   await fetchOrThrow('/api/users', { method: 'POST', body: ... });
 * });
 */
export const useCatch = <T extends (...args: unknown[]) => Promise<unknown>>(
  method: T,
): ((...args: Parameters<T>) => void) => {
  const dispatch = useAppDispatch();

  return useCallback(
    (...args: Parameters<T>) => {
      method(...args).catch((error: Error) => {
        dispatch(errorsActions.push(error.message));
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, method],
  );
};

/**
 * 使用 useCallback 的非同步錯誤捕捉 hook
 * 
 * @param method - 非同步函式
 * @param deps - useCallback 的相依陣列
 * @returns useCallback 包裝後的函式
 */
export const useCatchCallback = <T extends (...args: unknown[]) => Promise<unknown>>(
  method: T,
  deps: React.DependencyList,
): ((...args: Parameters<T>) => void) => {
  const dispatch = useAppDispatch();

  return useCallback(
    (...args: Parameters<T>) => {
      method(...args).catch((error: Error) => {
        dispatch(errorsActions.push(error.message));
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, dispatch],
  );
};

/**
 * IntersectionObserver 無限滾動 hook
 * 
 * @param loadMore - 載入更多資料的函式
 * @returns sentinel ref setter
 * 
 * @example
 * const sentinelRef = useScrollToLoad(loadMore);
 * // 在列表底部: <div ref={sentinelRef} />
 */
export const useScrollToLoad = (
  loadMore: (() => Promise<void>) | undefined,
): React.Dispatch<React.SetStateAction<HTMLElement | null>> => {
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);
  const loadingRef = useRef(false);
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingRef.current) {
        loadingRef.current = true;
        Promise.resolve(loadMoreRef.current?.()).finally(() => {
          loadingRef.current = false;
        });
      }
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel]);

  return setSentinel;
};

/**
 * 追蹤前次值的 hook
 * 
 * @param value - 目前值
 * @returns 前次值（首次渲染回傳 undefined）
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

/** 分頁大小常數 */
export const PAGE_SIZE = 50;
