/**
 * 地圖樣式定義 Hook
 *
 * 定義 22 種地圖服務提供商的樣式設定。
 * 對應 FRONTME.md 11.2 useMapStyles 章節。
 */

import { useMemo } from 'react';
import { useAppSelector } from '../../hooks/useAppStore';

/** 地圖樣式定義 */
export interface MapStyleDef {
  id: string;
  name: string;
  available: boolean;
}

/**
 * 地圖樣式 Hook
 * 根據伺服器設定回傳可用的地圖樣式列表
 */
export const useMapStyles = (): MapStyleDef[] => {
  const server = useAppSelector((state) => state.session.server);

  return useMemo(() => {
    const hasKey = (key: string): boolean => {
      const serverAttrs = server?.attributes as Record<string, unknown> | undefined;
      return !!serverAttrs?.[key];
    };

    return [
      { id: 'openFreeMap', name: 'OpenFreeMap', available: true },
      { id: 'locationIqStreets', name: 'LocationIQ Streets', available: true },
      { id: 'locationIqDark', name: 'LocationIQ Dark', available: true },
      { id: 'osm', name: 'OpenStreetMap', available: true },
      { id: 'openTopoMap', name: 'OpenTopoMap', available: true },
      { id: 'carto', name: 'CartoDB', available: true },
      { id: 'googleRoad', name: 'Google Roads', available: hasKey('googleKey') },
      { id: 'googleSatellite', name: 'Google Satellite', available: hasKey('googleKey') },
      { id: 'googleHybrid', name: 'Google Hybrid', available: hasKey('googleKey') },
      { id: 'mapTilerBasic', name: 'MapTiler Basic', available: hasKey('mapTilerKey') },
      { id: 'mapTilerHybrid', name: 'MapTiler Hybrid', available: hasKey('mapTilerKey') },
      { id: 'bingRoad', name: 'Bing Roads', available: hasKey('bingMapsKey') },
      { id: 'bingAerial', name: 'Bing Aerial', available: hasKey('bingMapsKey') },
      { id: 'bingHybrid', name: 'Bing Hybrid', available: hasKey('bingMapsKey') },
      { id: 'tomTomBasic', name: 'TomTom Basic', available: hasKey('tomTomKey') },
      { id: 'tomTomNight', name: 'TomTom Night', available: hasKey('tomTomKey') },
      { id: 'hereBasic', name: 'HERE Basic', available: hasKey('hereKey') },
      { id: 'hereHybrid', name: 'HERE Hybrid', available: hasKey('hereKey') },
      { id: 'hereSatellite', name: 'HERE Satellite', available: hasKey('hereKey') },
      { id: 'mapboxStreets', name: 'Mapbox Streets', available: hasKey('mapboxAccessToken') },
      { id: 'ordnanceSurvey', name: 'Ordnance Survey', available: true },
      { id: 'custom', name: 'Custom Map', available: !!server?.mapUrl },
    ];
  }, [server]);
};
