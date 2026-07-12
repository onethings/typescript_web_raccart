/**
 * 路線座標線條元件
 *
 * 在地圖上繪製一條路線（LineString），用於報表路線顯示。
 * 對應 FRONTME.md 11.7 MapRouteCoordinates 章節。
 */

import React, { useId, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAppSelector } from '../../hooks/useAppStore';
import { useAttributePreference } from '../../utils/preferences';
import { useMap } from '../core/MapView';
import { findFonts, toMapCoordinates } from '../core/mapUtil';
import type { Position } from '../../types/models';

interface MapRouteCoordinatesProps {
  name?: string;
  coordinates: [number, number][];
  deviceId?: number;
}

/**
 * 路線座標線條
 * 繪製單一裝置的路線座標線
 */
export const MapRouteCoordinates: React.FC<MapRouteCoordinatesProps> = ({
  name,
  coordinates,
  deviceId,
}) => {
  const { map, mapReady } = useMap();
  const id = useId();
  const theme = useTheme();

  const reportColor = useAppSelector((state) => {
    if (!deviceId) return null;
    const attributes = (state.devices.items[deviceId]?.attributes ?? {}) as Record<string, unknown>;
    return (attributes['web.reportColor'] as string) || null;
  });

  const mapLineWidth = useAttributePreference('mapLineWidth', 2);
  const mapLineOpacity = useAttributePreference('mapLineOpacity', 1);

  useEffect(() => {
    if (!mapReady) return;
    const color = reportColor || (theme.palette as Record<string, unknown>).geometry?.['main'] as string || '#1976d2';

    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [] },
        properties: { name, color, width: mapLineWidth, opacity: mapLineOpacity },
      },
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
    map.addLayer({
      source: id,
      id: `${id}-title`,
      type: 'symbol',
      layout: {
        'text-field': '{name}',
        'text-font': findFonts(map),
        'text-size': 12,
      },
      paint: { 'text-halo-color': 'white', 'text-halo-width': 1 },
    });

    return () => {
      try {
        if (map.getLayer(`${id}-title`)) map.removeLayer(`${id}-title`);
        if (map.getLayer(`${id}-line`)) map.removeLayer(`${id}-line`);
        if (map.getSource(id)) map.removeSource(id);
      } catch { /* ignore */ }
    };
  }, [id, mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapReady) return;
    const source = map.getSource(id) as { setData: (data: unknown) => void } | undefined;
    if (!source) return;
    const color = reportColor || (theme.palette as Record<string, unknown>).geometry?.['main'] as string || '#1976d2';

    source.setData({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: coordinates.map(([lng, lat]) => toMapCoordinates(lng, lat)),
      },
      properties: { name, color, width: mapLineWidth, opacity: mapLineOpacity },
    });
  }, [mapReady, coordinates, reportColor, mapLineWidth, mapLineOpacity, id, name]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};
