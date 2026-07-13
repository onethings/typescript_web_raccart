/**
 * 地圖疊加層選項定義 Hook
 *
 * 提供偏好設定頁面使用的疊加層選項列表。
 * 對應 FRONTME.md 11.9 MapOverlay 章節。
 */

import { useMemo } from 'react';
import { useAppSelector } from '../../hooks/useAppStore';

export interface MapOverlayDef {
  id: string;
  title: string;
  available: boolean;
  /** API key 屬性名稱（若 unavailable 則跳轉到使用者頁面填寫此屬性） */
  attribute?: string;
}

/**
 * 地圖疊加層 Hook
 * 根據伺服器設定回傳可用的疊加層選項列表
 */
export const useMapOverlays = (): MapOverlayDef[] => {
  const server = useAppSelector((state) => state.session.server);

  return useMemo(() => {
    const serverAttrs = server?.attributes as Record<string, unknown> | undefined;
    const googleKey = serverAttrs?.googleKey as string | undefined;
    const openWeatherKey = serverAttrs?.openWeatherKey as string | undefined;
    const tomTomKey = serverAttrs?.tomTomKey as string | undefined;
    const hereKey = serverAttrs?.hereKey as string | undefined;
    const overlayUrl = server?.overlayUrl as string | undefined;

    return [
      { id: 'googleTraffic', title: 'Google Traffic', available: Boolean(googleKey), attribute: 'googleKey' },
      { id: 'openSeaMap', title: 'Open Sea Map', available: true },
      { id: 'openRailwayMap', title: 'Open Railway Map', available: true },
      { id: 'openWeatherClouds', title: 'Weather Clouds', available: Boolean(openWeatherKey), attribute: 'openWeatherKey' },
      { id: 'openWeatherPrecipitation', title: 'Weather Precipitation', available: Boolean(openWeatherKey), attribute: 'openWeatherKey' },
      { id: 'openWeatherPressure', title: 'Weather Pressure', available: Boolean(openWeatherKey), attribute: 'openWeatherKey' },
      { id: 'openWeatherWind', title: 'Weather Wind', available: Boolean(openWeatherKey), attribute: 'openWeatherKey' },
      { id: 'openWeatherTemperature', title: 'Weather Temperature', available: Boolean(openWeatherKey), attribute: 'openWeatherKey' },
      { id: 'tomTomFlow', title: 'TomTom Traffic Flow', available: Boolean(tomTomKey), attribute: 'tomTomKey' },
      { id: 'tomTomIncidents', title: 'TomTom Incidents', available: Boolean(tomTomKey), attribute: 'tomTomKey' },
      { id: 'hereFlow', title: 'HERE Traffic Flow', available: Boolean(hereKey), attribute: 'hereKey' },
      { id: 'custom', title: 'Custom Overlay', available: Boolean(overlayUrl) },
    ];
  }, [server]);
};
