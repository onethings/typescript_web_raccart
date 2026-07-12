/**
 * 地圖鏡頭控制元件
 *
 * 根據位置資料或座標自動調整地圖視角。
 * 對應 FRONTME.md 11.5 MapCamera 章節。
 */

import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';
import type { Position } from '../../types/models';

interface MapCameraProps {
  /** 緯度（跳轉到單點時使用） */
  latitude?: number;
  /** 經度 */
  longitude?: number;
  /** 位置陣列（縮放至邊界時使用） */
  positions?: Position[];
  /** 座標陣列 [lng, lat][] */
  coordinates?: [number, number][];
  /** 縮放層級 */
  zoom?: number;
}

/**
 * 地圖鏡頭控制器
 * 自動定位地圖到指定位置或所有位置的可視邊界
 */
export const MapCamera: React.FC<MapCameraProps> = ({
  latitude,
  longitude,
  positions,
  coordinates,
  zoom,
}) => {
  const { map, mapReady } = useMap();

  useEffect(() => {
    if (!mapReady) return;

    try {
      // 有單一經緯度 → 跳轉
      if (latitude != null && longitude != null) {
        map.flyTo({
          center: [longitude, latitude],
          zoom: zoom ?? 10,
          duration: 1000,
        });
        return;
      }

      // 有座標陣列 → 縮放至邊界
      if (coordinates && coordinates.length > 0) {
        const validCoords = coordinates.filter(
          (c): c is [number, number] => c != null && c.length === 2 && isFinite(c[0]) && isFinite(c[1]),
        );
        if (validCoords.length > 0) {
          if (validCoords.length === 1) {
            map.flyTo({ center: validCoords[0], zoom: zoom ?? 10, duration: 1000 });
          } else {
            const bounds = validCoords.reduce(
              (b, c) => b.extend(c),
              new maplibregl.LngLatBounds(validCoords[0], validCoords[0]),
            );
            map.fitBounds(bounds, { padding: 50, duration: 1000 });
          }
        }
        return;
      }

      // 有位置陣列 → 縮放至邊界
      if (positions && positions.length > 0) {
        const coords: [number, number][] = [];
        for (const p of positions) {
          const lng = Number(p.longitude);
          const lat = Number(p.latitude);
          if (!isFinite(lng) || !isFinite(lat)) continue;
          coords.push([lng, lat]);
        }
        if (coords.length === 0) return;
        if (coords.length === 1) {
          map.flyTo({ center: coords[0], zoom: zoom ?? 10, duration: 1000 });
        } else {
          const bounds = coords.reduce(
            (b, c) => b.extend(c),
            new maplibregl.LngLatBounds(coords[0], coords[0]),
          );
          map.fitBounds(bounds, { padding: 50, duration: 1000, maxZoom: zoom ?? 15 });
        }
      }
    } catch (err) {
      console.warn('[MapCamera] fitBounds error:', err);
    }
  }, [latitude, longitude, positions, coordinates, zoom, map, mapReady]);

  return null;
};
