/**
 * 位置標記圖層元件
 *
 * 使用 MapLibre symbol layers 繪製裝置位置標記，支援叢集、方向箭頭。
 * 對應 FRONTME.md 11.5 MapPositions 章節。
 */

import React, { useEffect, useRef, useId } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';
import { useAppSelector } from '../../hooks/useAppStore';
import { useAttributePreference } from '../../utils/preferences';
import { mapIconKey } from '../core/preloadImages';
import { formatTime } from '../../utils/formatter';
import { findFonts } from '../core/mapUtil';

interface MapPositionsProps {
  positions: { id: number; deviceId: number; latitude: number; longitude: number; fixTime?: string; course?: number }[];
  onMarkerClick?: (positionId: number, deviceId: number) => void;
  selectedPosition?: { id?: number; deviceId?: number };
  showStatus?: boolean;
  disabled?: boolean;
}

/**
 * 位置標記圖層
 * 使用 MapLibre symbol layers + 預載入圖示
 */
export const MapPositions: React.FC<MapPositionsProps> = ({
  positions,
  onMarkerClick,
  selectedPosition,
  showStatus = false,
  disabled = false,
}) => {
  const { map, mapReady } = useMap();
  const id = useId();
  const devices = useAppSelector((state) => state.devices.items);
  const desktop = useMediaQuery('(min-width: 960px)');
  const iconScale = useAttributePreference('iconScale', desktop ? 0.75 : 1);
  const titleField = useAttributePreference('mapTitle', 'name');

  const onMouseEnter = () => { map.getCanvas().style.cursor = 'pointer'; };
  const onMouseLeave = () => { map.getCanvas().style.cursor = ''; };

  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  useEffect(() => {
    if (!mapReady) return;

    // 建立 GeoJSON source
    const sourceId = id;
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      // 裝置圖示圖層
      map.addLayer({
        id: sourceId,
        type: 'symbol',
        source: sourceId,
        filter: ['!has', 'point_count'],
        layout: {
          'icon-image': '{category}-{color}',
          'icon-size': iconScale,
          'icon-allow-overlap': true,
          'text-field': `{${titleField}}`,
          'text-allow-overlap': true,
          'text-anchor': 'bottom',
          'text-offset': [0, -2 * iconScale],
          'text-font': findFonts(map),
          'text-size': 12,
          'symbol-sort-key': ['get', 'id'],
        },
        paint: {
          'text-halo-color': 'white',
          'text-halo-width': 1,
        },
      });

      // 滑鼠事件
      map.on('mouseenter', sourceId, onMouseEnter);
      map.on('mouseleave', sourceId, onMouseLeave);
      if (!disabled) {
        map.on('click', sourceId, (e) => {
          if (disabledRef.current) return;
          e.preventDefault();
          const feature = e.features?.[0];
          if (feature && onMarkerClick) {
            const props = feature.properties as Record<string, unknown>;
            onMarkerClick(props.id as number, props.deviceId as number);
          }
        });
      }
    }

    return () => {
      try {
        map.off('mouseenter', sourceId, onMouseEnter);
        map.off('mouseleave', sourceId, onMouseLeave);
        map.off('click', sourceId, () => {});
        if (map.getLayer(sourceId)) map.removeLayer(sourceId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch { /* ignore */ }
    };
  }, [id, mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // 更新資料
  useEffect(() => {
    if (!mapReady) return;
    const source = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const features = positions.map((position) => {
      const device = devices[position.deviceId] as { name?: string; category?: string; status?: string } | undefined;
      const color = showStatus
        ? (device?.status === 'online' ? 'success' : device?.status === 'offline' ? 'error' : 'neutral')
        : 'neutral';
      return {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [position.longitude, position.latitude] },
        properties: {
          id: position.id,
          deviceId: position.deviceId,
          name: device?.name || `Device #${position.deviceId}`,
          category: mapIconKey(device?.category),
          color,
          fixTime: formatTime(position.fixTime, 'seconds'),
        },
      };
    });

    source.setData({ type: 'FeatureCollection', features });
  }, [positions, id, mapReady, devices, showStatus, titleField]);

  return null;
};

// 輔助：useMediaQuery 內聯版本
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState(() => window.matchMedia(query).matches);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
};

