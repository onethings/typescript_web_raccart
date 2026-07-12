/**
 * 圍欄屬性定義
 *
 * 8 種圍欄層級屬性。
 * 對應 FRONTME.md 14.5 useGeofenceAttributes 章節。
 */

import type { AttributeDef } from './useDeviceAttributes';

export const useGeofenceAttributes = (): AttributeDef[] => [
  { key: 'color', name: 'Color', type: 'string' },
  { key: 'mapLineWidth', name: 'Line Width', type: 'number' },
  { key: 'mapLineOpacity', name: 'Line Opacity', type: 'number' },
  { key: 'speedLimit', name: 'Speed Limit', type: 'number' },
  { key: 'polylineDistance', name: 'Polyline Distance', type: 'number' },
  { key: 'hide', name: 'Hide from Map', type: 'boolean' },
  { key: 'floor', name: 'Floor', type: 'number' },
  { key: 'ceiling', name: 'Ceiling', type: 'number' },
];
