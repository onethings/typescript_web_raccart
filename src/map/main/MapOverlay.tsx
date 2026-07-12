/**
 * 地圖疊加層元件
 *
 * 根據 selectedMapOverlay 偏好設定啟用對應的 raster 圖層疊加在地圖上。
 * 支援 11 種疊加層來源。
 * 對應 FRONTME.md 11.9 MapOverlay 章節。
 */

import React, { useEffect } from 'react';
import { useMap } from '../core/MapView';
import { useAttributePreference } from '../../utils/preferences';

// ==================== 疊加層來源定義 ====================

interface OverlaySource {
  id: string;
  name: string;
  tiles: string[];
  attribution?: string;
  /** 是否需要有 API key */
  requiresKey?: boolean;
}

/** 11 種疊加層來源 */
const OVERLAY_SOURCES: Record<string, OverlaySource> = {
  googleTraffic: {
    id: 'googleTraffic',
    name: 'Google Traffic',
    tiles: ['https://mt1.google.com/vt/lyrs=m@221097413,traffic|al&style=3&x={x}&y={y}&z={z}'],
    requiresKey: true,
  },
  openSeaMap: {
    id: 'openSeaMap',
    name: 'Open Sea Map',
    tiles: ['https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'],
    attribution: '&copy; OpenSeaMap contributors',
  },
  openRailwayMap: {
    id: 'openRailwayMap',
    name: 'Open Railway Map',
    tiles: ['https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png'],
    attribution: '&copy; OpenRailwayMap',
  },
  openWeatherClouds: {
    id: 'openWeatherClouds',
    name: 'Weather Clouds',
    tiles: ['https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid={key}'],
    requiresKey: true,
  },
  openWeatherPrecipitation: {
    id: 'openWeatherPrecipitation',
    name: 'Weather Precipitation',
    tiles: ['https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid={key}'],
    requiresKey: true,
  },
  openWeatherPressure: {
    id: 'openWeatherPressure',
    name: 'Weather Pressure',
    tiles: ['https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid={key}'],
    requiresKey: true,
  },
  openWeatherWind: {
    id: 'openWeatherWind',
    name: 'Weather Wind',
    tiles: ['https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid={key}'],
    requiresKey: true,
  },
  openWeatherTemperature: {
    id: 'openWeatherTemperature',
    name: 'Weather Temperature',
    tiles: ['https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid={key}'],
    requiresKey: true,
  },
  tomTomFlow: {
    id: 'tomTomFlow',
    name: 'TomTom Traffic Flow',
    tiles: ['https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key={key}'],
    requiresKey: true,
  },
  tomTomIncidents: {
    id: 'tomTomIncidents',
    name: 'TomTom Incidents',
    tiles: ['https://api.tomtom.com/traffic/map/4/tile/incidents/relative/{z}/{x}/{y}.png?key={key}'],
    requiresKey: true,
  },
  hereFlow: {
    id: 'hereFlow',
    name: 'HERE Traffic Flow',
    tiles: ['https://traffic.maps.cit.api.here.com/traffic/6.1/tile/8/flow/{z}/{x}/{y}/8?app_id={key}'],
    requiresKey: true,
  },
};

/** 疊加層圖層 ID 前綴 */
const OVERLAY_PREFIX = 'map-overlay-';

/**
 * 取代 URL 中的 {key} 佔位符
 */
const resolveTileUrl = (url: string, apiKey?: string): string => {
  if (apiKey) return url.replace(/{key}/g, apiKey);
  return url;
};

/** 自訂疊加層來源 ID */
const CUSTOM_OVERLAY_ID = '__custom__';

/**
 * 地圖疊加層
 * 根據 selectedMapOverlay 設定啟用對應的 raster 疊加層
 */
export const MapOverlay: React.FC = () => {
  const { map, mapReady } = useMap();
  const selectedMapOverlay = useAttributePreference('selectedMapOverlay', null);
  const overlayApiKey = useAttributePreference('overlayApiKey', null);

  useEffect(() => {
    if (!mapReady) return;

    // 清除之前的疊加層
    const existingLayers = map.getStyle().layers?.filter(
      (l) => l.id?.startsWith(OVERLAY_PREFIX),
    ) ?? [];
    existingLayers.forEach((layer) => {
      const l = layer as { id: string; source?: string };
      if (l.id && map.getLayer(l.id)) {
        map.removeLayer(l.id);
      }
      // 移除對應 source
      const sourceId = l.source;
      if (sourceId && map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });

    if (!selectedMapOverlay) return;

    const overlayValue = String(selectedMapOverlay);
    let overlaySource: OverlaySource | null;

    // 自訂疊加層
    if (overlayValue.startsWith('http')) {
      overlaySource = {
        id: CUSTOM_OVERLAY_ID,
        name: 'Custom Overlay',
        tiles: [selectedMapOverlay],
      };
    } else {
      overlaySource = OVERLAY_SOURCES[selectedMapOverlay] ?? null;
    }

    if (!overlaySource) return;

    const sourceId = `${OVERLAY_PREFIX}${overlaySource.id}`;
    const layerId = `${sourceId}-raster`;

    const tiles = overlaySource.tiles.map((url) => {
      const resolved = resolveTileUrl(url, overlayApiKey ? String(overlayApiKey) : undefined);
      return resolved;
    });

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'raster',
        tiles,
        tileSize: 256,
        attribution: overlaySource.attribution,
      });

      map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: { 'raster-opacity': 0.6 },
      });
    }

    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch { /* ignore */ }
    };
  }, [map, mapReady, selectedMapOverlay, overlayApiKey]);

  return null;
};
