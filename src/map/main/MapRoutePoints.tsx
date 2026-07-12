/**
 * 路線點元件（方向箭頭）
 *
 * 在地圖上顯示路線各點的方向箭頭，依速度著色。
 * 對應 FRONTME.md 11.7 MapRoutePoints 章節。
 */

import React, { useId, useCallback, useEffect } from 'react';
import { useMap } from '../core/MapView';
import { getSpeedColor } from '../../utils/colors';
import { findFonts, toMapCoordinates } from '../core/mapUtil';
import { MapSpeedLegend } from '../control/MapSpeedLegend';
import type { Position } from '../../types/models';

interface MapRoutePointsProps {
  positions: Position[];
  onClick?: (id: number, index: number) => void;
  showSpeedControl?: boolean;
}

/**
 * 路線點（方向箭頭標記）
 * 顯示路線各點的航向與速度
 */
export const MapRoutePoints: React.FC<MapRoutePointsProps> = ({
  positions,
  onClick,
  showSpeedControl,
}) => {
  const { map, mapReady } = useMap();
  const id = useId();

  const onMouseEnter = () => { map.getCanvas().style.cursor = 'pointer'; };
  const onMouseLeave = () => { map.getCanvas().style.cursor = ''; };

  const onMarkerClick = useCallback(
    (event: { features?: GeoJSON.Feature[] }) => {
      event.preventDefault?.();
      const feature = event.features?.[0];
      if (feature && onClick) {
        const props = feature.properties as Record<string, unknown>;
        onClick(props.id as number, props.index as number);
      }
    },
    [onClick],
  );

  useEffect(() => {
    if (!mapReady) return;
    map.addSource(id, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id,
      type: 'symbol',
      source: id,
      paint: { 'text-color': ['get', 'color'] },
      layout: {
        'text-font': findFonts(map),
        'text-size': 12,
        'text-field': '▲',
        'text-allow-overlap': true,
        'text-rotate': ['get', 'rotation'],
      },
    });

    map.on('mouseenter', id, onMouseEnter);
    map.on('mouseleave', id, onMouseLeave);
    map.on('click', id, onMarkerClick);

    return () => {
      map.off('mouseenter', id, onMouseEnter);
      map.off('mouseleave', id, onMouseLeave);
      map.off('click', id, onMarkerClick);
      try {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      } catch { /* ignore */ }
    };
  }, [mapReady, onMarkerClick, id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapReady || positions.length === 0) return;

    const maxSpeed = positions.reduce((a, p) => Math.max(a, p.speed ?? 0), -Infinity);
    const minSpeed = positions.reduce((a, p) => Math.min(a, p.speed ?? 0), Infinity);

    const source = map.getSource(id) as { setData: (data: GeoJSON.FeatureCollection) => void } | undefined;
    source?.setData({
      type: 'FeatureCollection',
      features: positions.map((position, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: toMapCoordinates(position.longitude, position.latitude),
        },
        properties: {
          index,
          id: position.id,
          rotation: position.course,
          color: getSpeedColor(position.speed ?? 0, minSpeed, maxSpeed),
        },
      })),
    });
  }, [mapReady, positions, id]);

  if (showSpeedControl && positions.length > 0) {
    return <MapSpeedLegend positions={positions} />;
  }

  return null;
};
