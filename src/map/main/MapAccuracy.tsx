/**
 * 位置精確度圓圈元件
 *
 * 使用 turf.js circle 在半徑 accuracy > 0 時繪製誤差圓圈。
 * 對應 FRONTME.md 11.7 MapAccuracy 章節。
 */

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import circle from '@turf/circle';
import { useMap } from '../core/MapView';
import type { Position } from '../../types/models';

interface MapAccuracyProps {
  /** 位置物件（含 attributes.accuracy） */
  position?: Position;
}

/**
 * 精確度圓圈
 * 在位置周圍繪製半徑為 accuracy 的圓，表示 GPS 誤差範圍
 */
export const MapAccuracy: React.FC<MapAccuracyProps> = ({ position }) => {
  const { map, mapReady } = useMap();
  const sourceId = 'accuracy-circle';
  const layerId = 'accuracy-circle-fill';
  const addedRef = useRef(false);

  useEffect(() => {
    if (!mapReady || !position) return;

    const accuracy = (position.attributes as Record<string, unknown>)?.accuracy as number | undefined;
    if (!accuracy || accuracy <= 0) {
      // 移除圖層
      if (addedRef.current) {
        try {
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        } catch { /* ignore */ }
        addedRef.current = false;
      }
      return;
    }

    const center: [number, number] = [position.longitude, position.latitude];
    const radius = accuracy; // 單位：公尺
    const geoJson = circle(center, radius, { steps: 64, units: 'meters' });

    if (!addedRef.current) {
      map.addSource(sourceId, { type: 'geojson', data: geoJson });
      map.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#4285F4',
          'fill-opacity': 0.15,
          'fill-outline-color': '#4285F4',
        },
      });
      addedRef.current = true;
    } else {
      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
      if (source) source.setData(geoJson);
    }

    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch { /* ignore */ }
      addedRef.current = false;
    };
  }, [map, mapReady, position]);

  return null;
};
