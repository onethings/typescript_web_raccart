/**
 * 駕駛名稱查詢元件
 *
 * 根據 driverUniqueId 從 Redux store 查詢駕駛名稱。
 * 對應 FRONTME.md 12.4 DriverValue 章節。
 */

import React from 'react';
import { Typography } from '@mui/material';
import { useAppSelector } from '../../hooks/useAppStore';

interface DriverValueProps {
  /** 駕駛唯一識別碼 */
  driverUniqueId?: string;
}

/**
 * 駕駛名稱查詢元件
 * 從 drivers store 中查詢對應名稱
 */
export const DriverValue: React.FC<DriverValueProps> = ({ driverUniqueId }) => {
  const driver = useAppSelector((state) =>
    driverUniqueId ? state.drivers.items[driverUniqueId] : undefined,
  );

  if (!driverUniqueId) {
    return <Typography variant="body2" color="textSecondary">-</Typography>;
  }

  return (
    <Typography variant="body2">
      {driver?.name || driverUniqueId}
    </Typography>
  );
};
