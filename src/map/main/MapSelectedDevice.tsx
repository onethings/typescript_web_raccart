/**
 * 選取裝置跟隨元件
 *
 * 當 mapFollow 啟用時，自動跟隨選取裝置的位置。
 * 支援偏移鏡頭以容納側邊彈出視窗。
 * 對應 FRONTME.md 11.7 MapSelectedDevice 章節。
 */

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';
import { useAppSelector } from '../../hooks/useAppStore';
import { useAttributePreference } from '../../utils/preferences';

/**
 * 選取裝置跟隨控制器
 * 當選取裝置時，自動將地圖中心移動至該裝置位置
 */
export const MapSelectedDevice: React.FC = () => {
  const { map, mapReady } = useMap();
  const selectedDeviceId = useAppSelector((state) => state.devices.selectedId);
  const positions = useAppSelector((state) => state.session.positions);
  const mapFollow = useAttributePreference('mapFollow', true);
  const selectZoom = useAttributePreference('selectZoom', 10);
  const sidebarWidth = useAttributePreference('sidebarWidth', 360);
  const previousIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapReady || !selectedDeviceId || !mapFollow) return;
    if (previousIdRef.current === selectedDeviceId) return;
    previousIdRef.current = selectedDeviceId;

    const position = positions[selectedDeviceId];
    if (!position) return;

    const zoom = Number(selectZoom);
    const offset = [sidebarWidth ? Number(sidebarWidth) / 2 : 0, 0] as [number, number];

    map.flyTo({
      center: [position.longitude, position.latitude],
      zoom,
      offset,
      duration: 800,
    });
  }, [mapReady, selectedDeviceId, positions, mapFollow, selectZoom, sidebarWidth]);

  return null;
};
