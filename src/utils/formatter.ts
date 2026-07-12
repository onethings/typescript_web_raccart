/**
 * 格式化工具函式
 * 
 * 提供日期、時間、速度、距離、座標等格式化功能。
 * 對應 FRONTME.md 13.8 formatter.js 章節。
 */

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { speedFromKnots, distanceFromMeters, altitudeFromMeters, volumeFromLiters } from './converter';
import type { SpeedUnit, DistanceUnit, AltitudeUnit, VolumeUnit, CoordinateFormat } from '../types/ui';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// ==================== 基礎格式化 ====================

/** 格式化布林值為是/否 */
export const formatBoolean = (value: boolean, t: (key: string) => string): string =>
  value ? t('sharedYes') : t('sharedNo');

/** 格式化數值（指定小數位數） */
export const formatNumber = (value: number, precision: number = 1): number =>
  Number(value.toFixed(precision));

/** 格式化百分比 */
export const formatPercentage = (value: number): string => `${value}%`;

/** 格式化溫度 */
export const formatTemperature = (value: number): string => `${value.toFixed(1)}°C`;

/** 格式化電壓 */
export const formatVoltage = (value: number, t: (key: string) => string): string =>
  `${value.toFixed(2)} ${t('sharedVoltAbbreviation')}`;

/** 格式化油耗 */
export const formatConsumption = (value: number, t: (key: string) => string): string =>
  `${value.toFixed(2)} ${t('sharedLiterPerHourAbbreviation')}`;

// ==================== 時間格式化 ====================

/** 時間格式類型 */
export type TimeFormat = 'date' | 'time' | 'minutes' | 'seconds';

/**
 * 格式化時間
 * @param value - ISO 時間字串
 * @param format - 格式類型
 * @returns 格式化後的字串
 */
export const formatTime = (value: string | undefined, format: TimeFormat = 'seconds'): string => {
  if (!value) return '';
  const d = dayjs(value).toDate();

  const dateConfig: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const minuteConfig: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  const secondConfig: Intl.DateTimeFormatOptions = {
    ...minuteConfig,
    second: '2-digit',
  };

  switch (format) {
    case 'date':
      return d.toLocaleDateString(undefined, dateConfig);
    case 'time':
      return d.toLocaleTimeString(undefined, secondConfig);
    case 'minutes':
      return d.toLocaleString(undefined, { ...dateConfig, ...minuteConfig });
    default:
      return d.toLocaleString(undefined, { ...dateConfig, ...secondConfig });
  }
};

// ==================== 狀態格式化 ====================

/** 裝置狀態顏色對應 */
export const getStatusColor = (status: string): 'success' | 'error' | 'neutral' => {
  switch (status) {
    case 'online':
      return 'success';
    case 'offline':
      return 'error';
    case 'unknown':
    default:
      return 'neutral';
  }
};

/** 電量狀態顏色 */
export const getBatteryStatus = (batteryLevel: number): 'success' | 'warning' | 'error' => {
  if (batteryLevel >= 70) return 'success';
  if (batteryLevel > 30) return 'warning';
  return 'error';
};

/** 格式化狀態文字 */
export const formatStatus = (value: string, t: (key: string) => string): string =>
  t(`deviceStatus${value.charAt(0).toUpperCase() + value.slice(1)}`);

/** 格式化警報文字 */
export const formatAlarm = (value: string | undefined, t: (key: string) => string): string => {
  if (!value) return '';
  return value
    .split(',')
    .map((alarm) => t(`alarm${alarm.charAt(0).toUpperCase() + alarm.slice(1)}`))
    .join(', ');
};

// ==================== 航向格式化 ====================

/** 方向箭頭符號 */
const COURSE_SYMBOLS = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'] as const;

/** 格式化航向為方向箭頭 */
export const formatCourse = (value: number): string => {
  let normalizedValue = (value + 45 / 2) % 360;
  if (normalizedValue < 0) {
    normalizedValue += 360;
  }
  return COURSE_SYMBOLS[Math.floor(normalizedValue / 45)];
};

// ==================== 單位轉換格式化 ====================

/** 格式化距離 */
export const formatDistance = (
  value: number,
  unit: DistanceUnit,
  t: (key: string) => string,
): string =>
  `${distanceFromMeters(value, unit).toFixed(2)} ${unit === 'km' ? t('sharedKm') : unit === 'mi' ? t('sharedMi') : t('sharedNmi')}`;

/** 格式化海拔 */
export const formatAltitude = (
  value: number,
  unit: AltitudeUnit,
  t: (key: string) => string,
): string =>
  `${altitudeFromMeters(value, unit).toFixed(2)} ${unit === 'm' ? t('sharedMeters') : t('sharedFeet')}`;

/** 格式化速度 */
export const formatSpeed = (
  value: number,
  unit: SpeedUnit,
  t: (key: string) => string,
): string =>
  `${speedFromKnots(value, unit).toFixed(2)} ${unit === 'kn' ? t('sharedKn') : unit === 'kmh' ? t('sharedKmh') : t('sharedMph')}`;

/** 格式化容量 */
export const formatVolume = (
  value: number,
  unit: VolumeUnit,
  t: (key: string) => string,
): string =>
  `${volumeFromLiters(value, unit).toFixed(2)} ${t('sharedLiterAbbreviation')}`;

// ==================== 時數格式化 ====================

/** 格式化時數為「X h Y min」 */
export const formatNumericHours = (value: number, t: (key: string) => string): string => {
  const hours = Math.floor(value / 3600000);
  const minutes = Math.floor((value % 3600000) / 60000);
  return `${hours} ${t('sharedHourAbbreviation')} ${minutes} ${t('sharedMinuteAbbreviation')}`;
};

// ==================== 座標格式化 ====================

/**
 * 格式化座標
 * @param key - 'latitude' 或 'longitude'
 * @param value - 十進位度數
 * @param unit - 格式 (dd/ddm/dms)
 * @returns 格式化座標字串
 */
export const formatCoordinate = (
  key: 'latitude' | 'longitude',
  value: number,
  unit: CoordinateFormat,
): string => {
  const hemisphere = key === 'latitude' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
  let degrees: number;
  let minutes: number;
  let seconds: number;

  switch (unit) {
    case 'ddm': {
      const absVal = Math.abs(value);
      degrees = Math.floor(absVal);
      minutes = (absVal - degrees) * 60;
      return `${degrees}° ${minutes.toFixed(3)}' ${hemisphere}`;
    }
    case 'dms': {
      const absVal = Math.abs(value);
      degrees = Math.floor(absVal);
      minutes = Math.floor((absVal - degrees) * 60);
      seconds = Math.round((absVal - degrees - minutes / 60) * 3600);
      return `${degrees}° ${minutes}' ${seconds}" ${hemisphere}`;
    }
    default:
      return `${value.toFixed(5)}°`;
  }
};

// ==================== 地址格式化 ====================

/** 格式化位置為地址或座標 */
export const formatAddress = (
  position: { address?: string; latitude?: number; longitude?: number },
  unit: CoordinateFormat,
): string => {
  if (position.address) return position.address;
  if (position.latitude != null && position.longitude != null) {
    const formattedLat = formatCoordinate('latitude', position.latitude, unit);
    const formattedLng = formatCoordinate('longitude', position.longitude, unit);
    return `${formattedLat}, ${formattedLng}`;
  }
  return '';
};

// ==================== 通知標題格式化 ====================

/** 格式化通知標題 */
export const formatNotificationTitle = (
  t: (key: string) => string,
  notification: {
    type: string;
    description?: string;
    attributes?: { alarms?: string };
    id?: number;
  },
  includeId?: boolean,
): string => {
  if (notification.description) return notification.description;

  const typeKey = `event${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`;
  let title = t(typeKey);

  if (notification.type === 'alarm') {
    const alarmString = notification.attributes?.alarms;
    if (alarmString) {
      const alarms = alarmString.split(',');
      if (alarms.length > 1) {
        title += ` (${alarms.length})`;
      } else {
        title += ` ${formatAlarm(alarms[0], t)}`;
      }
    }
  }

  if (includeId && notification.id != null) {
    title += ` [${notification.id}]`;
  }

  return title;
};
