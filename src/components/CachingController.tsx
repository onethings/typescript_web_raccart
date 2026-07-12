/**
 * 快取控制器
 *
 * 認證後快取圍欄、群組、駕駛、保養、日曆等參考資料。
 * 對應 FRONTME.md 17.2 CachingController 章節。
 */

import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { useAsyncTask } from '../hooks/useAsyncTask';
import {
  geofencesActions,
  groupsActions,
  driversActions,
  maintenancesActions,
  calendarsActions,
} from '../store';

/**
 * 快取控制器 - 認證後載入參考資料
 * 使用原生 fetch 而非 api/endpoints 以正確傳遞 AbortSignal
 */
export const CachingController: React.FC = () => {
  const authenticated = useAppSelector((state) => !!state.session.user);
  const dispatch = useAppDispatch();

  useAsyncTask(
    async ({ signal }) => {
      if (authenticated) {
        const res = await fetch('/api/geofences', { signal });
        if (res.ok) dispatch(geofencesActions.refresh(await res.json()));
      }
    },
    [authenticated, dispatch],
  );

  useAsyncTask(
    async ({ signal }) => {
      if (authenticated) {
        const res = await fetch('/api/groups', { signal });
        if (res.ok) dispatch(groupsActions.refresh(await res.json()));
      }
    },
    [authenticated, dispatch],
  );

  useAsyncTask(
    async ({ signal }) => {
      if (authenticated) {
        const res = await fetch('/api/drivers', { signal });
        if (res.ok) dispatch(driversActions.refresh(await res.json()));
      }
    },
    [authenticated, dispatch],
  );

  useAsyncTask(
    async ({ signal }) => {
      if (authenticated) {
        const res = await fetch('/api/maintenance', { signal });
        if (res.ok) dispatch(maintenancesActions.refresh(await res.json()));
      }
    },
    [authenticated, dispatch],
  );

  useAsyncTask(
    async ({ signal }) => {
      if (authenticated) {
        const res = await fetch('/api/calendars', { signal });
        if (res.ok) dispatch(calendarsActions.refresh(await res.json()));
      }
    },
    [authenticated, dispatch],
  );

  return null;
};
