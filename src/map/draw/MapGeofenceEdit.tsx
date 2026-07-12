/**
 * 圍欄繪圖編輯元件
 *
 * 使用 @mapbox/mapbox-gl-draw 在地圖上視覺化建立/編輯/刪除圍欄。
 * - draw.create → POST /api/geofences → 導向編輯
 * - draw.delete → DELETE /api/geofences/{id}
 * - draw.update → PUT /api/geofences/{id}
 * 對應 FRONTME.md 11.8 MapGeofenceEdit 章節。
 */

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useMap } from '../core/MapView';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useCatch } from '../../hooks/useAsyncTask';
import { geofencesActions } from '../../store';
import { createGeofence, deleteGeofence, updateGeofence } from '../../api/endpoints';
import type { Geofence } from '../../types/models';

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
      // 確保閉合
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
const geoJsonToWkt = (feature: GeoJSON.Feature): string => {
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

// 常數
const DRAW_SOURCE_ID = 'mapbox-gl-draw-cold';
const DRAW_SELECTED_ID = 'gl-draw-selected';

interface MapGeofenceEditProps {
  /** 選取的圍欄 ID（縮放至該圍欄） */
  selectedGeofenceId?: number | null;
  /** 編輯完成回呼 */
  onEditNavigate?: (id: number) => void;
}

/**
 * 圍欄繪圖編輯器
 * 使用 mapbox-gl-draw 建立/編輯/刪除圍欄
 */
export const MapGeofenceEdit: React.FC<MapGeofenceEditProps> = ({
  selectedGeofenceId,
  onEditNavigate,
}) => {
  const { map, mapReady } = useMap();
  const dispatch = useAppDispatch();
  const geofences = useAppSelector((state) => state.geofences.items);
  const [drawEnabled, setDrawEnabled] = useState(false);
  const drawRef = useRef<MapboxDraw | null>(null);
  const initializedRef = useRef(false);

  const handleCreate = useCatch(async (geojson: GeoJSON.Feature) => {
    const wkt = geoJsonToWkt(geojson);
    const res = await createGeofence({ name: 'New Geofence', area: wkt });
    dispatch(geofencesActions.update([res.data]));
    onEditNavigate?.(res.data.id);
  });

  const handleDelete = useCatch(async (geojson: GeoJSON.Feature) => {
    const id = (geojson.properties as Record<string, unknown>)?.id as number;
    if (!id) return;
    await deleteGeofence(id);
    dispatch(geofencesActions.update([]));
    const res = await fetch('/api/geofences');
    const data = await res.json();
    dispatch(geofencesActions.refresh(data));
  });

  const handleUpdate = useCatch(async (geojson: GeoJSON.Feature) => {
    const id = (geojson.properties as Record<string, unknown>)?.id as number;
    if (!id) return;
    const wkt = geoJsonToWkt(geojson);
    const existing = geofences[id];
    if (existing) {
      await updateGeofence(id, { ...existing, area: wkt });
      dispatch(geofencesActions.update([]));
      const res = await fetch('/api/geofences');
      const data = await res.json();
      dispatch(geofencesActions.refresh(data));
    }
  });

  // 初始化/清理 draw
  useEffect(() => {
    if (!mapReady || !drawEnabled) {
      if (drawRef.current && map) {
        drawRef.current = null;
      }
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        trash: true,
      },
      defaultMode: 'simple_select',
    });

    drawRef.current = draw;
    map.addControl(draw);

    // 載入既有圍欄到繪圖圖層
    const geofenceList = Object.values(geofences);
    geofenceList.forEach((gf: Geofence) => {
      if (gf.area) {
        const feature = wktToGeoJson(gf.area);
        if (feature) {
          (feature.properties as Record<string, unknown>).id = gf.id;
          draw.add(feature);
        }
      }
    });

    // 縮放至選取圍欄
    if (selectedGeofenceId) {
      const features = draw.getAll().features;
      const target = features.find(
        (f) => (f.properties as Record<string, unknown>)?.id === selectedGeofenceId,
      );
      if (target) {
        const coords = (target.geometry as GeoJSON.Polygon).coordinates[0] as [number, number][];
        if (coords.length === 1) {
          map.flyTo({ center: [coords[0][0], coords[0][1]], zoom: 14, duration: 1000 });
        } else if (coords.length > 1) {
          const bounds = coords.reduce(
            (b, [lng, lat]) => b.extend([lng, lat]),
            new maplibregl.LngLatBounds([coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]),
          );
          map.fitBounds(bounds, { padding: 50 });
        }
      }
    }

    // 事件監聽
    map.on('draw.create', (e: { features: GeoJSON.Feature[] }) => {
      if (e.features?.[0]) handleCreate(e.features[0]);
    });

    map.on('draw.delete', (e: { features: GeoJSON.Feature[] }) => {
      if (e.features?.[0]) handleDelete(e.features[0]);
    });

    map.on('draw.update', (e: { features: GeoJSON.Feature[] }) => {
      if (e.features?.[0]) handleUpdate(e.features[0]);
    });

    return () => {
      try {
        if (map.getControl(draw)) map.removeControl(draw);
      } catch { /* ignore */ }
      drawRef.current = null;
      initializedRef.current = false;
    };
  }, [mapReady, drawEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDraw = () => {
    setDrawEnabled((prev) => !prev);
  };

  return (
    <Tooltip title={drawEnabled ? 'Finish Editing' : 'Edit Geofences'}>
      <IconButton
        onClick={toggleDraw}
        sx={{
          position: 'absolute',
          top: 88,
          right: 8,
          zIndex: 10,
          bgcolor: drawEnabled ? 'primary.main' : 'background.paper',
          color: drawEnabled ? 'primary.contrastText' : undefined,
          boxShadow: 1,
          '&:hover': { bgcolor: drawEnabled ? 'primary.dark' : 'action.hover' },
        }}
        size="small"
      >
        <EditIcon />
      </IconButton>
    </Tooltip>
  );
};
