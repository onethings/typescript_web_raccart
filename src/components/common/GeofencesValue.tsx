/**
 * 圍欄名稱列表元件
 *
 * 根據 geofenceIds 陣列顯示逗號分隔的圍欄名稱。
 * 對應 FRONTME.md 12.7 GeofencesValue 章節。
 */

import React from 'react';
import { Typography } from '@mui/material';
import { useAppSelector } from '../../hooks/useAppStore';

interface GeofencesValueProps {
  /** 圍欄 ID 陣列 */
  geofenceIds?: number[];
}

/**
 * 圍欄名稱列表元件
 * 將 geofenceIds 轉換為圍欄名稱的逗號分隔字串
 */
export const GeofencesValue: React.FC<GeofencesValueProps> = ({ geofenceIds }) => {
  const geofences = useAppSelector((state) => state.geofences.items);

  if (!geofenceIds || geofenceIds.length === 0) {
    return <Typography variant="body2" color="textSecondary">-</Typography>;
  }

  const names = geofenceIds
    .map((id) => geofences[id]?.name)
    .filter(Boolean);

  return (
    <Typography variant="body2">
      {names.join(', ') || geofenceIds.join(', ')}
    </Typography>
  );
};
