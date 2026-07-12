/**
 * 權限檢查 Hook
 * 
 * 提供管理員、管理者、唯讀等權限檢查。
 * 對應 FRONTME.md 13.9 permissions.js 章節。
 */

import { useAppSelector } from '../hooks/useAppStore';

/** 是否為管理員 */
export const useAdministrator = (): boolean =>
  useAppSelector((state) => Boolean(state.session.user?.administrator));

/** 是否為管理者（管理員或 userLimit > 0） */
export const useManager = (): boolean =>
  useAppSelector((state) => {
    const admin = state.session.user?.administrator;
    const manager = (state.session.user?.userLimit || 0) !== 0;
    return Boolean(admin) || manager;
  });

/** 裝置是否唯讀 */
export const useDeviceReadonly = (): boolean =>
  useAppSelector((state) => {
    const admin = state.session.user?.administrator;
    const serverReadonly = state.session.server?.readonly;
    const userReadonly = state.session.user?.readonly;
    const serverDeviceReadonly = state.session.server?.deviceReadonly;
    const userDeviceReadonly = state.session.user?.deviceReadonly;
    return !admin && Boolean(serverReadonly || userReadonly || serverDeviceReadonly || userDeviceReadonly);
  });

/**
 * 限制檢查
 * 非管理員時檢查 server[key] 或 user[key]
 * 
 * @param key - 限制屬性名稱
 * @returns 是否受限制
 */
export const useRestriction = (key: string): boolean =>
  useAppSelector((state) => {
    const admin = state.session.user?.administrator;
    const serverValue = (state.session.server as Record<string, unknown>)?.[key];
    const userValue = (state.session.user as Record<string, unknown>)?.[key];
    return !admin && Boolean(serverValue || userValue);
  });
