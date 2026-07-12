/**
 * 裝置關聯使用者數量元件
 *
 * 點擊後載入並顯示與裝置關聯的使用者數量。
 * 對應 FRONTME.md 7. 設定元件列表 章節。
 */

import React, { useState, useCallback } from 'react';
import { Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface DeviceUsersValueProps {
  deviceId: number;
}

/** 裝置關聯使用者數量元件 */
export const DeviceUsersValue: React.FC<DeviceUsersValueProps> = ({ deviceId }) => {
  const navigate = useNavigate();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (count != null) {
      navigate(`/settings/device/${deviceId}/connections`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/permissions?deviceId=${deviceId}&userId=0`);
      if (res.ok) {
        const data = await res.json();
        setCount(data.length);
      }
    } catch {
      setCount(0);
    }
    setLoading(false);
  }, [deviceId, count, navigate]);

  return (
    <Link
      href="#"
      onClick={(e) => { e.preventDefault(); handleClick(); }}
      variant="body2"
      sx={{ cursor: 'pointer' }}
    >
      {loading ? '...' : count != null ? `${count} users` : 'Click to load'}
    </Link>
  );
};
