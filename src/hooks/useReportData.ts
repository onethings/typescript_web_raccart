/**
 * 報表資料載入 Hook
 *
 * 解決在 useCallback 中呼叫 useAsyncTask 的 hooks 規則違反問題。
 * 使用 params state 驅動 useAsyncTask 在 top-level 執行。
 */

import { useState, useCallback, useRef } from 'react';
import { useAsyncTask } from './useAsyncTask';
import type { ReportParams } from '../types/ui';

/**
 * 報表資料 hooks - 正確的 hooks 模式
 *
 * @param fetcher - 接收 ReportParams + AbortSignal 的非同步載入函式
 * @returns [loading, handleShow]
 */
export function useReportData<T>(
  fetcher: (params: ReportParams, signal: AbortSignal) => Promise<void>,
): [boolean, (params: ReportParams) => void] {
  const [pendingParams, setPendingParams] = useState<ReportParams | null>(null);
  const [loading, setLoading] = useState(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useAsyncTask(
    async ({ signal }) => {
      if (pendingParams) {
        setLoading(true);
        try {
          await fetcherRef.current(pendingParams, signal);
          if (signal.aborted) return;
        } catch {
          // ignore
        }
        setLoading(false);
        setPendingParams(null);
      }
    },
    [pendingParams],
  );

  const handleShow = useCallback((params: ReportParams) => {
    setPendingParams(params);
  }, []);

  return [loading, handleShow];
}
