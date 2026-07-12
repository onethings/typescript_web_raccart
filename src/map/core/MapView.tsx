/**
 * MapLibre GL 地圖檢視元件
 *
 * 建立單例 map 實例，管理地圖生命週期、樣式切換、圖示載入。
 * 對應 FRONTME.md 11.1 MapView 章節。
 */

import React, { useRef, useLayoutEffect, useEffect, useState, useMemo, createContext, useContext } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppSelector } from '../../hooks/useAppStore';
import { useAttributePreference, usePreference } from '../../utils/preferences';
import { mapImages } from './preloadImages';

// ==================== 全域單例 Map ====================

/** 地圖容器 DOM 元素 */
const mapContainer = document.createElement('div');
mapContainer.style.width = '100%';
mapContainer.style.height = '100%';

/** 全域 MapLibre 實例 */
export const map = new maplibregl.Map({
  container: mapContainer,
  attributionControl: false,
});

/** 地圖就緒狀態管理 */
let mapReady = false;
const readyListeners = new Set<(ready: boolean) => void>();

const addReadyListener = (listener: (ready: boolean) => void) => {
  readyListeners.add(listener);
  listener(mapReady);
};

const removeReadyListener = (listener: (ready: boolean) => void) => {
  readyListeners.delete(listener);
};

const updateReady = (value: boolean) => {
  mapReady = value;
  readyListeners.forEach((listener) => listener(value));
};

// ==================== Map Context ====================

interface MapContextValue {
  map: maplibregl.Map;
  mapReady: boolean;
}

const MapContext = createContext<MapContextValue>({ map, mapReady: false });

/** 取得地圖實例的 hook */
export const useMap = () => useContext(MapContext);

// ==================== 地圖樣式設定 ====================

/** 預設 OpenStreetMap 樣式 */
const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
};

// ==================== MapView Component ====================

interface MapViewProps {
  children?: React.ReactNode;
}

/**
 * MapLibre GL 地圖檢視元件
 *
 * 功能：
 * - 建立單例 map（整個應用共用一個 MapLibre 實例）
 * - 管理地圖生命週期
 * - 支援地圖樣式切換
 * - 載入地圖圖示
 * - 通知子元件地圖就緒
 */
export const MapView: React.FC<MapViewProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const themeDir = useAppSelector((state) => (state.session.server?.attributes as Record<string, unknown>)?.direction as string | undefined);

  const selectedMapStyle = useAttributePreference('selectedMapStyle', 'osm');

  // 初始化地圖控制項
  useEffect(() => {
    const attribution = new maplibregl.AttributionControl({ compact: true });
    const navigation = new maplibregl.NavigationControl();
    map.addControl(attribution, 'bottom-right');
    map.addControl(navigation, 'top-right');

    return () => {
      map.removeControl(navigation);
      map.removeControl(attribution);
    };
  }, []);

  // 設定地圖樣式
  useEffect(() => {
    updateReady(false);
    map.setStyle(OSM_STYLE, { diff: false });

    const checkLoaded = () => {
      if (map.loaded()) {
        // 樣式載入完成後，將預載入的圖示加入地圖
        Object.entries(mapImages).forEach(([key, data]) => {
          if (!map.hasImage(key) && data instanceof ImageData) {
            try { map.addImage(key, data); } catch { /* ignore */ }
          }
        });
        updateReady(true);
      } else {
        setTimeout(checkLoaded, 33);
      }
    };
    map.once('styledata', checkLoaded);

    // 監聽缺少圖示事件
    const onImageMissing = (e: { id: string }) => {
      if (!map.hasImage(e.id)) {
        const img = mapImages[e.id];
        if (img instanceof ImageData) {
          try { map.addImage(e.id, img); return; } catch { /* ignore */ }
        }
        // fallback: 灰色圓圈
        const size = 20;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
        ctx.fill();
        try { map.addImage(e.id, canvas); } catch { /* ignore */ }
      }
    };
    map.on('styleimagemissing', onImageMissing);

    return () => {
      map.off('styleimagemissing', onImageMissing);
      map.off('styledata', checkLoaded);
    };
  }, [selectedMapStyle]);

  // 監聽地圖就緒狀態
  useEffect(() => {
    const listener = (r: boolean) => setReady(r);
    addReadyListener(listener);
    return () => removeReadyListener(listener);
  }, []);

  // 將地圖容器附加到 DOM
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.appendChild(mapContainer);
      map.resize();
    }
    return () => {
      if (el) {
        el.removeChild(mapContainer);
      }
    };
  }, [containerRef]);

  const contextValue = useMemo(() => ({ map, mapReady: ready }), [ready]);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={containerRef}>
      <MapContext.Provider value={contextValue}>
        {ready && children}
      </MapContext.Provider>
    </div>
  );
};
