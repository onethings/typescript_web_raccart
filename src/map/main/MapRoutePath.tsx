/**
 * 路線路徑元件（速度著色）
 *
 * 將路線依速度分為多個線段，每段使用速度色階上色。
 * 對應 FRONTME.md 11.7 MapRoutePath 章節。
 */

import React, { useId, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAppSelector } from '../../hooks/useAppStore';
import { useAttributePreference } from '../../utils/preferences';
import { useMap } from '../core/MapView';
import { toMapCoordinates } from '../core/mapUtil';
import { getSpeedColor } from '../../utils/colors';
import type { Position } from '../../types/models';

interface MapRoutePathProps {
  positions: Position[];
}

/**
 * 路線路徑
 * 依速度將路線分段著色
 */
export const MapRoutePath: React.FC<MapRoutePathProps> = ({ positions }) => {
  const { map, mapReady } = useMap();
  const id = useId();
  const theme = useTheme();

  const reportColor = useAppSelector((state) => {
    const pos = positions.find(() => true);
    if (pos) {
      const attributes = (state.devices.items[pos.deviceId]?.attributes ?? {}) as Record<string, unknown>;
      return (attributes['web.reportColor'] as string) || null;
    }
    return null;
  });

  const mapLineWidth = useAttributePreference('mapLineWidth', 2);
  const mapLineOpacity = useAttributePreference('mapLineOpacity', 1);

  useEffect(() => {
    if (!mapReady) return;
    map.addSource(id, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      source: id,
      id: `${id}-line`,
      type: 'line',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['get', 'width'],
        'line-opacity': ['get', 'opacity'],
      },
    });

    return () => {
      try {
        if (map.getLayer(`${id}-line`)) map.removeLayer(`${id}-line`);
        if (map.getSource(id)) map.removeSource(id);
      } catch { /* ignore */ }
    };
  }, [id, mapReady]);

  useEffect(() => {
    if (!mapReady || positions.length < 2) return;

    const minSpeed = positions.reduce((a, p) => Math.min(a, p.speed ?? 0), Infinity);
    const maxSpeed = positions.reduce((a, p) => Math.max(a, p.speed ?? 0), -Infinity);
    const features: GeoJSON.Feature[] = [];

    for (let i = 0; i < positions.length - 1; i += 1) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            toMapCoordinates(positions[i].longitude, positions[i].latitude),
            toMapCoordinates(positions[i + 1].longitude, positions[i + 1].latitude),
          ],
        },
        properties: {
          color: reportColor || getSpeedColor(positions[i + 1].speed ?? 0, minSpeed, maxSpeed),
          width: mapLineWidth,
          opacity: mapLineOpacity,
        },
      });
    }

    const source = map.getSource(id) as { setData: (data: GeoJSON.FeatureCollection) => void } | undefined;
    source?.setData({ type: 'FeatureCollection', features });
  }, [mapReady, positions, reportColor, mapLineWidth, mapLineOpacity, id]);

  return null;
};
