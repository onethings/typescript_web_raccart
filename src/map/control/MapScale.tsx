/**
 * 地圖比例尺元件
 * 對應 FRONTME.md 11.5 MapScale 章節。
 */

import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';
import { useAttributePreference } from '../../utils/preferences';

/**
 * 比例尺控制項
 * 支援公制/英制/海里單位
 */
export const MapScale: React.FC = () => {
  const { map, mapReady } = useMap();
  const distanceUnit = useAttributePreference<string>('distanceUnit', 'km');

  useEffect(() => {
    if (!mapReady) return;

    let unit: maplibregl.Unit = 'metric';
    if (distanceUnit === 'mi') unit = 'imperial';
    else if (distanceUnit === 'nmi') unit = 'nautical';

    const scale = new maplibregl.ScaleControl({ unit, maxWidth: 150 });
    map.addControl(scale, 'bottom-left');
    return () => { map.removeControl(scale); };
  }, [map, mapReady, distanceUnit]);

  return null;
};
