/**
 * 地址顯示元件
 *
 * 顯示地址或反向地理編碼連結。
 * 對應 FRONTME.md 12.1 AddressValue 章節。
 */

import React, { useState } from 'react';
import { Link, Typography } from '@mui/material';

interface AddressValueProps {
  /** 緯度 */
  latitude?: number;
  /** 經度 */
  longitude?: number;
  /** 預先解析的地址 */
  address?: string;
}

/**
 * 地址值元件
 * 有地址時直接顯示，否則提供地理編碼連結
 */
export const AddressValue: React.FC<AddressValueProps> = ({ latitude, longitude, address }) => {
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(address || null);
  const [loading, setLoading] = useState(false);

  /** 反向地理編碼 */
  const handleGeocode = async () => {
    if (latitude == null || longitude == null || loading) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/server/geocode?latitude=${latitude}&longitude=${longitude}`,
      );
      if (response.ok) {
        setResolvedAddress(await response.text());
      }
    } catch {
      // 忽略錯誤
    }
    setLoading(false);
  };

  if (resolvedAddress) {
    return <Typography variant="body2">{resolvedAddress}</Typography>;
  }

  if (latitude != null && longitude != null) {
    return (
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleGeocode();
        }}
        variant="body2"
        sx={{ cursor: 'pointer' }}
      >
        {loading ? 'Resolving...' : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
      </Link>
    );
  }

  return <Typography variant="body2" color="textSecondary">-</Typography>;
};
