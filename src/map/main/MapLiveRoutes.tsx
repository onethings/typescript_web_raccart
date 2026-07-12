/**
 * 即時軌跡線元件
 *
 * 顯示裝置的即時路線軌跡（歷史位置連線）。
 * 對應 FRONTME.md 11.7 MapLiveRoutes 章節。
 */

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';
import { useAppSelector } from '../../hooks/useAppStore';

const ROUTE_SOURCE = 'live-routes';
const ROUTE_LAYER = 'live-routes-line';

/**
 * 即時軌跡線
 * 將裝置的位置歷史繪製為地圖上的線條
 */
export const MapLiveRoutes: React.FC<{ deviceIds: number[] }> = ({ deviceIds }) => {
  const { map, mapReady } = useMap();
  const history = useAppSelector((state) => state.session.history);
  const addedRef = useRef(false);

  useEffect(() => {
    if (!mapReady) return;

    const features: GeoJSON.Feature[] = deviceIds
      .filter((id) => history[id] && history[id].length > 1)
      .map((id) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: history[id],
        },
        properties: { deviceId: id },
      }));

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    if (map.getSource(ROUTE_SOURCE)) {
      (map.getSource(ROUTE_SOURCE) as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource(ROUTE_SOURCE, { type: 'geojson', data: geojson });
      map.addLayer({
        id: ROUTE_LAYER,
        type: 'line',
        source: ROUTE_SOURCE,
        paint: {
          'line-color': '#3bb2d0',
          'line-width': 2,
          'line-opacity': 0.6,
        },
      });
    }

    addedRef.current = true;
  }, [history, deviceIds, map, mapReady]);

  return null;
};
