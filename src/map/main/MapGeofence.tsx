/**
 * 圍欄圖層元件
 *
 * 在地圖上繪製圍欄 GeoJSON 圖層。
 * 對應 FRONTME.md 11.5 MapGeofence 章節。
 */

import React, { useEffect, useRef } from 'react';
import { useMap } from '../core/MapView';
import { useAppSelector } from '../../hooks/useAppStore';
import type { Geofence } from '../../types/models';

const GEOFENCE_SOURCE = 'geofences';
const GEOFENCE_FILL_LAYER = 'geofences-fill';
const GEOFENCE_LINE_LAYER = 'geofences-line';

/** 簡易 WKT 轉 GeoJSON（支援 POLYGON） */
const wktToGeoJson = (wkt: string): GeoJSON.Geometry | null => {
  try {
    const match = wkt.match(/POLYGON\s*\(\((.*?)\)\)/i);
    if (!match) return null;
    const rings = match[1].split('),(');
    const coordinates = rings.map((ring) =>
      ring.split(',').map((pair) => {
        const [lat, lng] = pair.trim().split(/\s+/).map(Number);
        return [lng, lat];
      }),
    );
    return { type: 'Polygon', coordinates };
  } catch {
    return null;
  }
};

/**
 * 圍欄圖層元件
 * 將圍欄資料繪製為地圖上的 GeoJSON 圖層
 */
export const MapGeofence: React.FC = () => {
  const { map, mapReady } = useMap();
  const geofences = useAppSelector((state) => state.geofences.items);
  const addedRef = useRef(false);

  useEffect(() => {
    if (!mapReady) return;

    const features: GeoJSON.Feature[] = Object.values(geofences)
      .filter((g) => g.area && !(g.attributes as Record<string, unknown>)?.hide)
      .map((g) => {
        const geometry = wktToGeoJson(g.area!);
        return geometry
          ? {
              type: 'Feature' as const,
              geometry,
              properties: { id: g.id, name: g.name },
            }
          : null;
      })
      .filter((f): f is GeoJSON.Feature => f !== null);

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    // 移除舊圖層
    if (map.getLayer(GEOFENCE_LINE_LAYER)) map.removeLayer(GEOFENCE_LINE_LAYER);
    if (map.getLayer(GEOFENCE_FILL_LAYER)) map.removeLayer(GEOFENCE_FILL_LAYER);
    if (map.getSource(GEOFENCE_SOURCE)) map.removeSource(GEOFENCE_SOURCE);

    // 加入新資料
    map.addSource(GEOFENCE_SOURCE, { type: 'geojson', data: geojson });

    map.addLayer({
      id: GEOFENCE_FILL_LAYER,
      type: 'fill',
      source: GEOFENCE_SOURCE,
      paint: {
        'fill-color': '#3bb2d0',
        'fill-opacity': 0.1,
      },
    });

    map.addLayer({
      id: GEOFENCE_LINE_LAYER,
      type: 'line',
      source: GEOFENCE_SOURCE,
      paint: {
        'line-color': '#3bb2d0',
        'line-width': 2,
      },
    });

    addedRef.current = true;
  }, [geofences, map, mapReady]);

  return null;
};
