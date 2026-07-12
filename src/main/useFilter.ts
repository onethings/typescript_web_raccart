/**
 * 裝置篩選與排序 Hook
 *
 * 根據關鍵字、狀態、群組、圍欄篩選裝置，支援排序。
 * 對應 FRONTME.md 5.3 useFilter 章節。
 */

import { useEffect } from 'react';
import dayjs from 'dayjs';
import { useAppSelector } from '../hooks/useAppStore';
import type { Position } from '../types/models';

export interface DeviceFilter {
  statuses: string[];
  groups: number[];
  geofences: number[];
}

export interface DeviceFilterState {
  keyword: string;
  filter: DeviceFilter;
  filterSort: string;
  filterMap: boolean;
}

/**
 * 裝置篩選 Hook
 *
 * @param keyword - 搜尋關鍵字
 * @param filter - 篩選條件（狀態/群組/圍欄）
 * @param filterSort - 排序方式（''/name/lastUpdate）
 * @param filterMap - 是否只顯示符合篩選條件的裝置在地圖上
 * @param positions - 所有位置資料
 * @param setFilteredDevices - 設定篩選後的裝置列表
 * @param setFilteredPositions - 設定篩選後的位置列表
 */
export const useFilter = (
  keyword: string,
  filter: DeviceFilter,
  filterSort: string,
  filterMap: boolean,
  positions: Record<number, Position>,
  setFilteredDevices: (devices: Record<string, unknown>[]) => void,
  setFilteredPositions: (positions: Position[]) => void,
) => {
  const groups = useAppSelector((state) => state.groups.items);
  const devices = useAppSelector((state) => state.devices.items);

  useEffect(() => {
    const deviceGroups = (device: { groupId?: number }): number[] => {
      const groupIds: number[] = [];
      let groupId = device.groupId;
      while (groupId) {
        groupIds.push(groupId);
        groupId = (groups[groupId] as { groupId?: number } | undefined)?.groupId || 0;
      }
      return groupIds;
    };

    const filtered = Object.values(devices)
      .filter(
        (device) =>
          !filter.statuses.length || filter.statuses.includes(device.status ?? 'unknown'),
      )
      .filter(
        (device) =>
          !filter.groups.length ||
          deviceGroups(device as { groupId?: number }).some((id) => filter.groups.includes(id)),
      )
      .filter(
        (device) =>
          !filter.geofences.length ||
          ((positions[device.id!]?.geofenceIds as number[] | undefined) || []).some((id) =>
            filter.geofences.includes(id),
          ),
      )
      .filter((device) => {
        const lowerCaseKeyword = keyword.toLowerCase();
        return [device.name, device.uniqueId, device.phone, device.model, device.contact].some(
          (s) => s && String(s).toLowerCase().includes(lowerCaseKeyword),
        );
      });

    switch (filterSort) {
      case 'name':
        filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        break;
      case 'lastUpdate':
        filtered.sort((a, b) => {
          const timeA = a.lastUpdate ? dayjs(a.lastUpdate).valueOf() : 0;
          const timeB = b.lastUpdate ? dayjs(b.lastUpdate).valueOf() : 0;
          return timeB - timeA;
        });
        break;
      default:
        break;
    }

    setFilteredDevices(filtered as unknown as Record<string, unknown>[]);
    setFilteredPositions(
      filterMap
        ? filtered
            .map((device) => positions[device.id!])
            .filter((pos): pos is Position => Boolean(pos))
        : Object.values(positions),
    );
  }, [
    keyword,
    filter,
    filterSort,
    filterMap,
    groups,
    devices,
    positions,
    setFilteredDevices,
    setFilteredPositions,
  ]);
};
