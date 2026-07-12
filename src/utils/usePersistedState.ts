/**
 * localStorage 持久化 state hook
 *
 * 支援跨分頁同步（自訂廣播機制）。
 * 對應 FRONTME.md 13.13 usePersistedState 章節。
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * localStorage 持久化 state
 *
 * @param key - localStorage key
 * @param defaultValue - 預設值
 * @returns [value, setValue]
 *
 * @example
 * const [filter, setFilter] = usePersistedState('deviceFilter', { statuses: [], groups: [] });
 */
export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // 寫入 localStorage
  const setPersistedValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(prev)
          : newValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // localStorage 可能滿
        }
        return resolved;
      });
    },
    [key],
  );

  // 跨分頁同步（storage event）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue) as T);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [value, setPersistedValue];
}
