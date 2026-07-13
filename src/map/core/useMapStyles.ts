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
  /** API key 屬性名稱（若 unavailable 則跳轉到使用者頁面填寫此屬性） */
  attribute?: string;
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
      { id: 'googleRoad', name: 'Google Roads', available: hasKey('googleKey'), attribute: 'googleKey' },
      { id: 'googleSatellite', name: 'Google Satellite', available: hasKey('googleKey'), attribute: 'googleKey' },
      { id: 'googleHybrid', name: 'Google Hybrid', available: hasKey('googleKey'), attribute: 'googleKey' },
      { id: 'mapTilerBasic', name: 'MapTiler Basic', available: hasKey('mapTilerKey'), attribute: 'mapTilerKey' },
      { id: 'mapTilerHybrid', name: 'MapTiler Hybrid', available: hasKey('mapTilerKey'), attribute: 'mapTilerKey' },
      { id: 'bingRoad', name: 'Bing Roads', available: hasKey('bingMapsKey'), attribute: 'bingMapsKey' },
      { id: 'bingAerial', name: 'Bing Aerial', available: hasKey('bingMapsKey'), attribute: 'bingMapsKey' },
      { id: 'bingHybrid', name: 'Bing Hybrid', available: hasKey('bingMapsKey'), attribute: 'bingMapsKey' },
      { id: 'tomTomBasic', name: 'TomTom Basic', available: hasKey('tomTomKey'), attribute: 'tomTomKey' },
      { id: 'tomTomNight', name: 'TomTom Night', available: hasKey('tomTomKey'), attribute: 'tomTomKey' },
      { id: 'hereBasic', name: 'HERE Basic', available: hasKey('hereKey'), attribute: 'hereKey' },
      { id: 'hereHybrid', name: 'HERE Hybrid', available: hasKey('hereKey'), attribute: 'hereKey' },
      { id: 'hereSatellite', name: 'HERE Satellite', available: hasKey('hereKey'), attribute: 'hereKey' },
      { id: 'mapboxStreets', name: 'Mapbox Streets', available: hasKey('mapboxAccessToken'), attribute: 'mapboxAccessToken' },
      { id: 'ordnanceSurvey', name: 'Ordnance Survey', available: true, attribute: 'ordnanceSurveyKey' },
      { id: 'custom', name: 'Custom Map', available: !!server?.mapUrl },
    ];
  }, [server]);
};
