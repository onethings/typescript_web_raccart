/**
 * 目前位置控制項元件
 * 對應 FRONTME.md 11.5 MapCurrentLocation 章節。
 */

import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';

/**
 * GPS 定位按鈕
 * 點擊後定位到使用者目前位置
 */
export const MapCurrentLocation: React.FC = () => {
  const { map, mapReady } = useMap();

  useEffect(() => {
    if (!mapReady) return;
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    });
    map.addControl(geolocate, 'bottom-left');
    return () => { map.removeControl(geolocate); };
  }, [map, mapReady]);

  return null;
};
