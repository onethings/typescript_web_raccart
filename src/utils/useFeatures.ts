/**
 * 功能開關 Hook
 *
 * 從 server/user 屬性讀取 UI 功能開關。
 * 對應 FRONTME.md 13.12 useFeatures 章節。
 */

import { useAppSelector } from '../hooks/useAppStore';

/** UI 功能開關 */
export interface Features {
  disableSavedCommands: boolean;
  disableAttributes: boolean;
  disableDrivers: boolean;
  disableMaintenance: boolean;
  disableGroups: boolean;
  disableEvents: boolean;
  disableComputedAttributes: boolean;
  disableCalendars: boolean;
}

/**
 * 讀取所有 UI 功能開關
 * 檢查 `ui.disable*` 屬性在 server 或 user 上
 */
export const useFeatures = (): Features => {
  return useAppSelector((state) => {
    const serverAttrs = state.session.server?.attributes as Record<string, unknown> | undefined;
    const userAttrs = state.session.user?.attributes as Record<string, unknown> | undefined;

    const getFlag = (key: string): boolean => {
      // forceSettings 時優先使用 server 設定
      if (state.session.server?.forceSettings) {
        return !!serverAttrs?.[key];
      }
      return !!(userAttrs?.[key] ?? serverAttrs?.[key]);
    };

    return {
      disableSavedCommands: getFlag('ui.disableSavedCommands'),
      disableAttributes: getFlag('ui.disableAttributes'),
      disableDrivers: getFlag('ui.disableDrivers'),
      disableMaintenance: getFlag('ui.disableMaintenance'),
      disableGroups: getFlag('ui.disableGroups'),
      disableEvents: getFlag('ui.disableEvents'),
      disableComputedAttributes: getFlag('ui.disableComputedAttributes'),
      disableCalendars: getFlag('ui.disableCalendars'),
    };
  });
};
