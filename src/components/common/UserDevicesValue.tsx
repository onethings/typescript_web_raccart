/**
 * 使用者裝置數量元件
 *
 * 顯示使用者擁有的裝置數量。
 * 對應 FRONTME.md 7. 設定元件列表 章節。
 */

import React, { useState, useCallback } from 'react';
import { Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface UserDevicesValueProps {
  userId: number;
}

/** 使用者裝置數量元件 */
export const UserDevicesValue: React.FC<UserDevicesValueProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (count != null) {
      navigate(`/settings/user/${userId}/connections`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/permissions?userId=${userId}&deviceId=0`);
      if (res.ok) {
        const data = await res.json();
        setCount(data.length);
      }
    } catch {
      setCount(0);
    }
    setLoading(false);
  }, [userId, count, navigate]);

  return (
    <Link
      href="#"
      onClick={(e) => { e.preventDefault(); handleClick(); }}
      variant="body2"
      sx={{ cursor: 'pointer' }}
    >
      {loading ? '...' : count != null ? `${count} devices` : 'Click to load'}
    </Link>
  );
};
