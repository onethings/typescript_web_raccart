/**
 * 偏好設定 Hook
 * 
 * 從使用者或伺服器屬性讀取偏好設定。
 * 對應 FRONTME.md 13.10 preferences.js 章節。
 */

import { useAppSelector } from '../hooks/useAppStore';

/**
 * 取得偏好值（使用者 → 伺服器，支援 forceSettings）
 * 
 * @param key - 屬性名稱
 * @param defaultValue - 預設值
 * @returns 偏好值
 */
export const usePreference = <T>(key: string, defaultValue: T): T =>
  useAppSelector((state) => {
    const userValue = (state.session.user as Record<string, unknown>)?.[key] as T | undefined;
    const serverValue = (state.session.server as Record<string, unknown>)?.[key] as T | undefined;
    const forceSettings = state.session.server?.forceSettings;

    if (forceSettings) {
      return serverValue ?? userValue ?? defaultValue;
    }
    return userValue ?? serverValue ?? defaultValue;
  });

/**
 * 取得屬性偏好值（從 attributes 子物件）
 * 
 * @param key - 屬性名稱
 * @param defaultValue - 預設值
 * @returns 屬性值
 */
export const useAttributePreference = <T>(key: string, defaultValue?: T): T | undefined =>
  useAppSelector((state) => {
    const userAttributes = state.session.user?.attributes as Record<string, unknown> | undefined;
    const serverAttributes = state.session.server?.attributes as Record<string, unknown> | undefined;
    const forceSettings = state.session.server?.forceSettings;

    if (forceSettings) {
      return (serverAttributes?.[key] as T | undefined) ??
        (userAttributes?.[key] as T | undefined) ??
        defaultValue;
    }
    return (userAttributes?.[key] as T | undefined) ??
      (serverAttributes?.[key] as T | undefined) ??
      defaultValue;
  });
