/**
 * 位置欄位智慧渲染元件
 *
 * 依欄位類型自動選擇適當的格式化方式。
 * 對應 FRONTME.md 12.16 PositionValue 章節。
 */

import React from 'react';
import { Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LocalizationProvider';
import {
  formatTime,
  formatSpeed,
  formatAltitude,
  formatCourse,
  formatCoordinate,
  formatTemperature,
  formatVoltage,
  formatPercentage,
  formatDistance,
  formatAlarm,
} from '../../utils/formatter';
import { useAttributePreference } from '../../utils/preferences';
import type { CoordinateFormat, SpeedUnit, DistanceUnit, AltitudeUnit } from '../../types/ui';

interface PositionValueProps {
  /** 欄位名稱 */
  field: string;
  /** 欄位值 */
  value: unknown;
  /** 裝置 ID（用於建立連結） */
  deviceId?: number;
  /** 位置 ID（用於建立連結） */
  positionId?: number;
}

/**
 * 智慧位置欄位渲染器
 * 根據欄位名稱自動選擇格式化方式
 */
export const PositionValue: React.FC<PositionValueProps> = ({ field, value, deviceId, positionId }) => {
  const navigate = useNavigate();
  const t = useTranslation();
  const coordinateFormat = useAttributePreference<CoordinateFormat>('coordinateFormat', 'dd');
  const speedUnit = useAttributePreference<SpeedUnit>('speedUnit', 'kn');
  const distanceUnit = useAttributePreference<DistanceUnit>('distanceUnit', 'km');
  const altitudeUnit = useAttributePreference<AltitudeUnit>('altitudeUnit', 'm');

  if (value == null) return <span>-</span>;

  switch (field) {
    case 'address':
      return <span>{String(value)}</span>;

    case 'fixTime':
    case 'deviceTime':
    case 'serverTime':
      return <span>{formatTime(String(value))}</span>;

    case 'latitude':
      return <span>{formatCoordinate('latitude', Number(value), coordinateFormat)}</span>;

    case 'longitude':
      return <span>{formatCoordinate('longitude', Number(value), coordinateFormat)}</span>;

    case 'speed':
      return <span>{formatSpeed(Number(value), speedUnit, t)}</span>;

    case 'course':
      return <span>{formatCourse(Number(value))} ({Number(value)}°)</span>;

    case 'altitude':
      return <span>{formatAltitude(Number(value), altitudeUnit, t)}</span>;

    case 'accuracy':
      return <span>{Number(value).toFixed(1)} m</span>;

    case 'alarm':
      return <span>{formatAlarm(String(value), t)}</span>;

    case 'batteryLevel':
      return <span>{formatPercentage(Number(value))}</span>;

    case 'valid':
      return <span>{value ? 'Yes' : 'No'}</span>;

    case 'totalDistance':
    case 'distance':
      return <span>{formatDistance(Number(value), distanceUnit, t)}</span>;

    case 'geofenceIds': {
      const ids = Array.isArray(value) ? value : [];
      return <span>{ids.join(', ') || '-'}</span>;
    }

    case 'driverUniqueId':
      return <span>{String(value)}</span>;

    default:
      // 數值型欄位
      if (typeof value === 'number') {
        return <span>{value.toFixed(2)}</span>;
      }
      return <span>{String(value)}</span>;
  }
};
