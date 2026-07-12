/**
 * 通用裝置屬性定義
 *
 * 24 種通用裝置屬性（用於使用者/伺服器設定）。
 * 對應 FRONTME.md 14.2 useCommonDeviceAttributes 章節。
 */

import type { AttributeDef } from './useDeviceAttributes';

export const useCommonDeviceAttributes = (): AttributeDef[] => [
  { key: 'speedLimit', name: 'Speed Limit (kn)', type: 'number' },
  { key: 'proximityEnterDistance', name: 'Proximity Enter Distance (m)', type: 'number' },
  { key: 'proximityExitDistance', name: 'Proximity Exit Distance (m)', type: 'number' },
  { key: 'unaccompaniedDistance', name: 'Unaccompanied Distance (m)', type: 'number' },
  { key: 'fuelDropThreshold', name: 'Fuel Drop Threshold', type: 'number' },
  { key: 'fuelIncreaseThreshold', name: 'Fuel Increase Threshold', type: 'number' },
  { key: 'report.ignoreOdometer', name: 'Ignore Odometer', type: 'boolean' },
  { key: 'deviceInactivityStart', name: 'Inactivity Start (min)', type: 'number' },
  { key: 'deviceInactivityPeriod', name: 'Inactivity Period (min)', type: 'number' },
  { key: 'notificationTokens', name: 'Notification Tokens', type: 'string' },
  { key: 'filter.invalid', name: 'Filter Invalid', type: 'boolean' },
  { key: 'filter.zero', name: 'Filter Zero', type: 'boolean' },
  { key: 'filter.duplicate', name: 'Filter Duplicate', type: 'boolean' },
  { key: 'filter.outdated', name: 'Filter Outdated', type: 'boolean' },
  { key: 'filter.future', name: 'Filter Future', type: 'boolean' },
  { key: 'filter.approximate', name: 'Filter Approximate', type: 'boolean' },
  { key: 'filter.static', name: 'Filter Static', type: 'boolean' },
  { key: 'filter.distance', name: 'Filter Distance (m)', type: 'number' },
  { key: 'filter.maxSpeed', name: 'Filter Max Speed', type: 'number' },
  { key: 'filter.minPeriod', name: 'Filter Min Period (s)', type: 'number' },
  { key: 'filter.dailyLimit', name: 'Filter Daily Limit', type: 'number' },
  { key: 'filter.dailyLimitInterval', name: 'Filter Daily Limit Interval (s)', type: 'number' },
  { key: 'filter.skipLimit', name: 'Filter Skip Limit', type: 'boolean' },
  { key: 'filter.skipAttributes', name: 'Filter Skip Attributes', type: 'string' },
  { key: 'time.override', name: 'Time Override', type: 'string' },
];
