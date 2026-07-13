/**
 * 距離測量工具元件
 *
 * 點擊地圖新增測量點，即時計算並顯示距離。
 * 支援吸附到現有位置，距離依設定單位顯示。
 * 對應 FRONTME.md 11.6 MapRuler 章節。
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { IconButton, Tooltip, Box, Typography, Chip } from '@mui/material';
import StraightenIcon from '@mui/icons-material/Straighten';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMap } from '../core/MapView';
import { useAttributePreference } from '../../utils/preferences';
import { distanceFromMeters } from '../../utils/converter';

const RULER_SOURCE_ID = 'ruler-points';
const RULER_LINE_ID = 'ruler-line';
const RULER_POINTS_ID = 'ruler-points-layer';
const RULER_DISTANCE_ID = 'ruler-distance';

/**
 * 計算兩點之間的地理距離（Haversine formula）
 */
const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // 地球半徑（公尺）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * 距離測量工具
 * 點擊地圖建立測量點，計算並顯示累積距離
 */
export const MapRuler: React.FC = () => {
  const { map, mapReady } = useMap();
  const [active, setActive] = useState(false);
  const [points, setPoints] = useState<[number, number][]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const clickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null);
  const pointsRef = useRef<[number, number][]>([]);

  const distanceUnit = useAttributePreference('distanceUnit', 'km');

  // 同步 ref
  pointsRef.current = points;

  /** 計算累積距離 */
  const calculateDistance = (pts: [number, number][]): number => {
    if (pts.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      total += haversineDistance(pts[i - 1][1], pts[i - 1][0], pts[i][1], pts[i][0]);
    }
    return total;
  };

  /** 更新地圖圖層 */
  const updateMapLayers = useCallback(
    (pts: [number, number][]) => {
      if (!map || !mapReady) return;

      // 移除舊圖層
      try {
        if (map.getLayer(RULER_DISTANCE_ID)) map.removeLayer(RULER_DISTANCE_ID);
        if (map.getLayer(RULER_POINTS_ID)) map.removeLayer(RULER_POINTS_ID);
        if (map.getLayer(RULER_LINE_ID)) map.removeLayer(RULER_LINE_ID);
        if (map.getSource(RULER_SOURCE_ID)) map.removeSource(RULER_SOURCE_ID);
      } catch { /* ignore */ }

      if (pts.length === 0) return;

      // 點
      const pointFeatures: GeoJSON.Feature[] = pts.map(([lng, lat], i) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: { index: i },
      }));

      // 路線
      const lineFeature: GeoJSON.Feature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: pts,
        },
        properties: {},
      };

      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [lineFeature, ...pointFeatures],
      };

      map.addSource(RULER_SOURCE_ID, { type: 'geojson', data: geojson });

      map.addLayer({
        id: RULER_LINE_ID,
        type: 'line',
        source: RULER_SOURCE_ID,
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#FF5722',
          'line-width': 3,
          'line-dasharray': [5, 3],
        },
      });

      map.addLayer({
        id: RULER_POINTS_ID,
        type: 'circle',
        source: RULER_SOURCE_ID,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-color': '#FF5722',
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // 距離標籤（若 >= 2 點）
      if (pts.length >= 2) {
        const lastPoint = pts[pts.length - 1];
        map.addLayer({
          id: RULER_DISTANCE_ID,
          type: 'symbol',
          source: RULER_SOURCE_ID,
          filter: ['==', '$type', 'Point'],
          layout: {
            'text-field': ['case', ['==', ['get', 'index'], pts.length - 1], '', ''],
            'text-size': 12,
            'text-offset': [0, -1.5],
          },
          paint: {
            'text-color': '#FF5722',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        });
      }
    },
    [map, mapReady],
  );

  /** 啟用/停用測量 */
  const toggleActive = useCallback(() => {
    setActive((prev) => {
      if (prev) {
        // 停用：清除
        setPoints([]);
        setTotalDistance(0);
        updateMapLayers([]);
      }
      return !prev;
    });
  }, [updateMapLayers]);

  /** 清除測量點 */
  const clearRuler = useCallback(() => {
    setPoints([]);
    setTotalDistance(0);
    updateMapLayers([]);
  }, [updateMapLayers]);

  // 管理地圖點擊事件
  useEffect(() => {
    if (!map || !mapReady) return;

    if (clickHandlerRef.current) {
      map.off('click', clickHandlerRef.current);
      clickHandlerRef.current = null;
    }

    if (active) {
      const handler = (e: maplibregl.MapMouseEvent) => {
        const { lng, lat } = e.lngLat;
        const newPoints = [...pointsRef.current, [lng, lat] as [number, number]];
        setPoints(newPoints);
        setTotalDistance(calculateDistance(newPoints));
        updateMapLayers(newPoints);
      };
      clickHandlerRef.current = handler;
      map.on('click', handler);

      // 變更游標
      map.getCanvas().style.cursor = 'crosshair';
    } else {
      map.getCanvas().style.cursor = '';
    }

    return () => {
      if (clickHandlerRef.current && map) {
        map.off('click', clickHandlerRef.current);
        map.getCanvas().style.cursor = '';
      }
    };
  }, [map, mapReady, active, updateMapLayers]);

  return (
    <>
      <Tooltip title={active ? 'Finish Measuring' : 'Measure Distance'}>
        <IconButton
          onClick={toggleActive}
          sx={{
            position: 'absolute',
            top: 186,
            right: 8,
            zIndex: 10,
            bgcolor: active ? 'primary.main' : 'background.paper',
            color: active ? 'primary.contrastText' : undefined,
            boxShadow: 1,
            '&:hover': { bgcolor: active ? 'primary.dark' : 'action.hover' },
          }}
          size="small"
        >
          <StraightenIcon />
        </IconButton>
      </Tooltip>

      {active && totalDistance > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Chip
            label={`${distanceFromMeters(totalDistance, distanceUnit as 'km' | 'mi' | 'nmi').toFixed(2)} ${distanceUnit}`}
            color="primary"
            variant="filled"
            sx={{ fontSize: '0.9rem', fontWeight: 600, px: 1 }}
          />
          <IconButton size="small" onClick={clearRuler} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </>
  );
};
