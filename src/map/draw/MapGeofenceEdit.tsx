/**
 * 圍欄繪圖編輯元件
 *
 * 使用 @mapbox/mapbox-gl-draw 在地圖上視覺化建立/編輯/刪除圍欄。
 * 控制項固定顯示在地圖左上角（Polygon, LineString, Trash）。
 * - draw.create → POST /api/geofences → 導向編輯
 * - draw.delete → DELETE /api/geofences/{id}
 * - draw.update → PUT /api/geofences/{id}
 * 對應 FRONTME.md 11.8 MapGeofenceEdit 章節。
 */

import React, { useEffect, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import drawTheme from './drawTheme';
import { useMap } from '../core/MapView';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useCatchCallback } from '../../hooks/useAsyncTask';
import { geofencesActions } from '../../store';
import { fetchOrThrow } from '../../utils/fetchOrThrow';
import type { Geofence } from '../../types/models';

// 讓 MapboxDraw 使用 MapLibre 的 CSS class
MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

/**
 * WKT → GeoJSON 轉換
 * Traccar 使用 lat lng 順序
 */
const wktToGeoJson = (wkt: string): GeoJSON.Feature | null => {
  try {
    if (wkt.startsWith('POLYGON')) {
      const coordsStr = wkt.replace('POLYGON ((', '').replace('))', '');
      const coords = coordsStr.split(',').map((pair) => {
        const [lat, lng] = pair.trim().split(' ').map(Number);
        return [lng, lat] as [number, number];
      });
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push(first);
      }
      return {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [coords] },
        properties: {},
      };
    }
    if (wkt.startsWith('LINESTRING')) {
      const coordsStr = wkt.replace('LINESTRING (', '').replace(')', '');
      const coords = coordsStr.split(',').map((pair) => {
        const [lat, lng] = pair.trim().split(' ').map(Number);
        return [lng, lat] as [number, number];
      });
      return {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {},
      };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * GeoJSON → WKT 轉換
 * 輸出 Traccar 格式的 lat lng 順序
 */
export const geoJsonToWkt = (feature: GeoJSON.Feature): string => {
  if (feature.geometry.type === 'Polygon') {
    const coords = (feature.geometry as GeoJSON.Polygon).coordinates[0];
    const points = coords.map(([lng, lat]) => `${lat} ${lng}`).join(', ');
    return `POLYGON ((${points}))`;
  }
  if (feature.geometry.type === 'LineString') {
    const coords = (feature.geometry as GeoJSON.LineString).coordinates as [number, number][];
    const points = coords.map(([lng, lat]) => `${lat} ${lng}`).join(', ');
    return `LINESTRING (${points})`;
  }
  if (feature.geometry.type === 'Point') {
    const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
    return `POINT (${lat} ${lng})`;
  }
  return '';
};

interface MapGeofenceEditProps {
  /** 選取的圍欄 ID（縮放至該圍欄） */
  selectedGeofenceId?: number | null;
  /** 編輯完成回呼 */
  onEditNavigate?: (id: number) => void;
}

/**
 * 圍欄繪圖編輯器
 * 使用 mapbox-gl-draw 建立/編輯/刪除圍欄
 * 控制項固定顯示在地圖左上角
 */
export const MapGeofenceEdit: React.FC<MapGeofenceEditProps> = ({
  selectedGeofenceId,
  onEditNavigate,
}) => {
  const { map, mapReady } = useMap();
  const dispatch = useAppDispatch();
  const geofences = useAppSelector((state) => state.geofences.items);

  const draw = useMemo(
    () =>
      new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          line_string: true,
          trash: true,
        },
        defaultMode: 'simple_select',
        userProperties: true,
        styles: [
          ...drawTheme,
          {
            id: 'gl-draw-title',
            type: 'symbol',
            filter: ['all'],
            layout: {
              'text-field': '{user_name}',
              'text-size': 12,
            },
            paint: {
              'text-halo-color': 'white',
              'text-halo-width': 1,
            },
          },
        ],
      }),
    [],
  );

  const refreshGeofences = useCatchCallback(async () => {
    const response = await fetchOrThrow('/api/geofences');
    dispatch(geofencesActions.refresh(await response.json()));
  }, [dispatch]);

  // 初始化 draw 控制項（固定顯示在地圖左上角）
  useEffect(() => {
    if (!mapReady) return;

    map.addControl(draw, 'top-left');

    return () => {
      try { map.removeControl(draw); } catch { /* ignore */ }
    };
  }, [mapReady, draw]);

  // 載入圍欄資料
  useEffect(() => {
    if (!mapReady) return;
    refreshGeofences();
  }, [mapReady, refreshGeofences]);

  // 同步圍欄到 draw 圖層
  useEffect(() => {
    if (!mapReady) return;
    draw.deleteAll();
    Object.values(geofences).forEach((gf: Geofence) => {
      if (gf.area) {
        const feature = wktToGeoJson(gf.area);
        if (feature) {
          (feature.properties as Record<string, unknown>).id = gf.id;
          (feature.properties as Record<string, unknown>).user_name = gf.name;
          draw.add(feature);
        }
      }
    });
  }, [mapReady, geofences, draw]);

  // draw.create → POST
  useEffect(() => {
    if (!mapReady) return;
    const listener = async (event: { features: GeoJSON.Feature[] }) => {
      const feature = event.features[0];
      if (!feature) return;
      draw.delete(feature.id as string);
      const wkt = geoJsonToWkt(feature);
      try {
        const response = await fetchOrThrow('/api/geofences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'New Geofence', area: wkt }),
        });
        const item = await response.json();
        onEditNavigate?.(item.id);
      } catch { /* ignore */ }
    };
    map.on('draw.create', listener);
    return () => map.off('draw.create', listener);
  }, [mapReady, draw, onEditNavigate]);

  // draw.delete → DELETE
  useEffect(() => {
    if (!mapReady) return;
    const listener = async (event: { features: GeoJSON.Feature[] }) => {
      const feature = event.features[0];
      if (!feature) return;
      try {
        await fetchOrThrow(`/api/geofences/${feature.id}`, { method: 'DELETE' });
        refreshGeofences();
      } catch { /* ignore */ }
    };
    map.on('draw.delete', listener);
    return () => map.off('draw.delete', listener);
  }, [mapReady, refreshGeofences]);

  // draw.update → PUT
  useEffect(() => {
    if (!mapReady) return;
    const listener = async (event: { features: GeoJSON.Feature[] }) => {
      const feature = event.features[0];
      if (!feature) return;
      const item = Object.values(geofences).find((i) => i.id === feature.id);
      if (item) {
        const wkt = geoJsonToWkt(feature);
        try {
          await fetchOrThrow(`/api/geofences/${feature.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, area: wkt }),
          });
          refreshGeofences();
        } catch { /* ignore */ }
      }
    };
    map.on('draw.update', listener);
    return () => map.off('draw.update', listener);
  }, [mapReady, geofences, refreshGeofences]);

  // 縮放至選取圍欄
  useEffect(() => {
    if (!mapReady || !selectedGeofenceId) return;
    const feature = draw.get(selectedGeofenceId);
    if (!feature?.geometry) return;
    let coordinates: [number, number][];
    const geom = feature.geometry;
    if (geom.type === 'Polygon') {
      coordinates = (geom as GeoJSON.Polygon).coordinates[0] as [number, number][];
    } else if (geom.type === 'LineString') {
      coordinates = (geom as GeoJSON.LineString).coordinates as [number, number][];
    } else if (geom.type === 'Point') {
      const [lng, lat] = (geom as GeoJSON.Point).coordinates;
      map.flyTo({ center: [lng, lat], zoom: 14, duration: 1000 });
      return;
    } else {
      return;
    }
    const bounds = coordinates.reduce(
      (b, [lng, lat]) => b.extend([lng, lat]),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[1]),
    );
    const canvas = map.getCanvas();
    map.fitBounds(bounds, { padding: Math.min(canvas.width, canvas.height) * 0.1 });
  }, [mapReady, selectedGeofenceId, draw]);

  return null;
};
