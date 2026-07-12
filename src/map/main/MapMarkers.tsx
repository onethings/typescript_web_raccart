/**
 * 通用地圖標記元件
 *
 * 顯示一組自訂圖示標記（報表起始/結束點、事件位置等）。
 * 對應 FRONTME.md 11.7 MapMarkers 章節。
 */

import React, { useId, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAttributePreference } from '../../utils/preferences';
import { useMap } from '../core/MapView';
import { findFonts, toMapCoordinates } from '../core/mapUtil';

interface MapMarker {
  latitude: number;
  longitude: number;
  image?: string;
  title?: string;
}

interface MapMarkersProps {
  markers: MapMarker[];
  showTitles?: boolean;
}

/**
 * 通用地圖標記
 * 使用預載圖示顯示一組標記點
 */
export const MapMarkers: React.FC<MapMarkersProps> = ({ markers, showTitles = true }) => {
  const { map, mapReady } = useMap();
  const id = useId();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const iconScale = useAttributePreference('iconScale', desktop ? 0.75 : 1);

  useEffect(() => {
    if (!mapReady) return;
    map.addSource(id, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    if (showTitles) {
      map.addLayer({
        id,
        type: 'symbol',
        source: id,
        filter: ['!has', 'point_count'],
        layout: {
          'icon-image': '{image}',
          'icon-size': iconScale,
          'icon-allow-overlap': true,
          'text-field': '{title}',
          'text-allow-overlap': true,
          'text-anchor': 'bottom',
          'text-offset': [0, -2 * iconScale],
          'text-font': findFonts(map),
          'text-size': 12,
        },
        paint: { 'text-halo-color': 'white', 'text-halo-width': 1 },
      });
    } else {
      map.addLayer({
        id,
        type: 'symbol',
        source: id,
        layout: {
          'icon-image': '{image}',
          'icon-size': iconScale,
          'icon-allow-overlap': true,
        },
      });
    }

    return () => {
      try {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      } catch { /* ignore */ }
    };
  }, [mapReady, showTitles, iconScale, id]);

  useEffect(() => {
    if (!mapReady) return;
    const source = map.getSource(id) as { setData: (data: GeoJSON.FeatureCollection) => void } | undefined;
    source?.setData({
      type: 'FeatureCollection',
      features: markers.map(({ latitude, longitude, image, title }) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: toMapCoordinates(longitude, latitude),
        },
        properties: {
          image: image || 'default-neutral',
          title: title || '',
        },
      })),
    });
  }, [mapReady, markers, id]);

  return null;
};
