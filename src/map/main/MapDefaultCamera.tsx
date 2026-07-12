/**
 * 地圖初始定位元件
 *
 * 決定地圖首次載入時的初始視角：
 * 1. 若有選取裝置 → 定位至該裝置
 * 2. 若有預設 lat/lng/zoom → 跳轉至該位置
 * 3. 否則縮放至所有可見位置
 * 對應 FRONTME.md 11.7 MapDefaultCamera 章節。
 */

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';
import { useAppSelector } from '../../hooks/useAppStore';
import { useAttributePreference } from '../../utils/preferences';
import type { Position } from '../../types/models';

/**
 * 初始定位控制器
 * 在地圖就緒後執行一次初始定位
 */
export const MapDefaultCamera: React.FC = () => {
  const { map, mapReady } = useMap();
  const executedRef = useRef(false);
  const selectedDeviceId = useAppSelector((state) => state.devices.selectedId);
  const positions = useAppSelector((state) => state.session.positions);
  const devices = useAppSelector((state) => state.devices.items);

  const defaultLatitude = useAttributePreference('defaultLatitude', null);
  const defaultLongitude = useAttributePreference('defaultLongitude', null);
  const defaultZoom = useAttributePreference('defaultZoom', null);

  useEffect(() => {
    if (!mapReady || executedRef.current) return;
    executedRef.current = true;

    // 1. 有選取裝置 → 定位至該裝置
    if (selectedDeviceId) {
      const pos = positions[selectedDeviceId];
      if (pos) {
        map.flyTo({
          center: [pos.longitude, pos.latitude],
          zoom: 10,
          duration: 0,
        });
        return;
      }
    }

    // 2. 有預設座標 → 跳轉至該位置
    if (defaultLatitude != null && defaultLongitude != null) {
      map.flyTo({
        center: [Number(defaultLongitude), Number(defaultLatitude)],
        zoom: defaultZoom != null ? Number(defaultZoom) : 10,
        duration: 0,
      });
      return;
    }

    // 3. 否則縮放至所有可見位置
    const positionValues = Object.values(positions).filter(
      (p): p is Position & { latitude: number; longitude: number } =>
        typeof p.latitude === 'number' && typeof p.longitude === 'number'
        && isFinite(p.latitude) && isFinite(p.longitude),
    );
    if (positionValues.length === 1) {
      map.flyTo({ center: [positionValues[0].longitude, positionValues[0].latitude], zoom: 10, duration: 0 });
    } else if (positionValues.length > 1) {
      const first = positionValues[0];
      const bounds = positionValues.reduce(
        (b, p) => b.extend([p.longitude, p.latitude]),
        new maplibregl.LngLatBounds([first.longitude, first.latitude], [first.longitude, first.latitude]),
      );
      map.fitBounds(bounds, { padding: 50, duration: 0 });
    }
  }, [mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};
