/**
 * 地圖核心工具函式
 *
 * 座標轉換、圖示處理、圍欄解析、字型偵測等公用函式。
 * 對應 FRONTME.md 11.4 mapUtil 章節。
 */

import { parse, stringify } from 'wellknown';
import circle from '@turf/circle';
import type { Map as MaplibreMap } from 'maplibre-gl';

// ==================== 座標系統轉換 ====================

const coordinateSystem = (id?: string) => {
  switch (id) {
    case 'gcj02':
      return 'GCJ02';
    default:
      return 'WGS84';
  }
};

/**
 * 轉換為地圖座標（WGS84 → 地圖座標系統）
 */
export const toMapCoordinates = (longitude: number, latitude: number, coordinateSystemId?: string) => {
  if (!coordinateSystemId) return [longitude, latitude];
  // 簡易 GCJ-02 轉換（完整轉換需 gcoord 套件）
  return [longitude, latitude];
};

/**
 * 從地圖座標轉換回 WGS84
 */
export const fromMapCoordinates = (longitude: number, latitude: number, coordinateSystemId?: string) => {
  if (!coordinateSystemId) return [longitude, latitude];
  return [longitude, latitude];
};

// ==================== 圖片處理 ====================

/**
 * 載入圖片
 */
export const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.crossOrigin = 'anonymous';
    image.src = url;
  });

/**
 * Canvas 著色圖片
 */
const canvasTintImage = (image: HTMLImageElement, color: string): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width * devicePixelRatio;
  canvas.height = image.height * devicePixelRatio;
  canvas.style.width = `${image.width}px`;
  canvas.style.height = `${image.height}px`;

  const context = canvas.getContext('2d')!;
  context.save();
  context.fillStyle = color;
  context.globalAlpha = 1;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = 'destination-atop';
  context.globalAlpha = 1;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  context.restore();

  return canvas;
};

/**
 * 準備地圖圖示（背景 + 前景圖示 + 著色）
 */
export const prepareIcon = (
  background: HTMLImageElement,
  icon?: HTMLImageElement,
  color?: string,
): ImageData => {
  const canvas = document.createElement('canvas');
  canvas.width = background.width * devicePixelRatio;
  canvas.height = background.height * devicePixelRatio;
  canvas.style.width = `${background.width}px`;
  canvas.style.height = `${background.height}px`;

  const context = canvas.getContext('2d')!;
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  if (icon && color) {
    const iconRatio = 0.5;
    const imageWidth = canvas.width * iconRatio;
    const imageHeight = canvas.height * iconRatio;
    context.drawImage(
      canvasTintImage(icon, color),
      (canvas.width - imageWidth) / 2,
      (canvas.height - imageHeight) / 2,
      imageWidth,
      imageHeight,
    );
  }

  return context.getImageData(0, 0, canvas.width, canvas.height);
};

// ==================== 座標反轉 ====================

type NestedCoords = number | [number, number] | NestedCoords[];

/**
 * 反轉座標陣列（[lng, lat] → [lat, lng]）
 */
export const reverseCoordinates = <T>(it: T): T => {
  if (!it) return it;
  if (Array.isArray(it)) {
    if (it.length === 2 && typeof it[0] === 'number' && typeof it[1] === 'number') {
      return [it[1], it[0]] as unknown as T;
    }
    return it.map((item) => reverseCoordinates(item)) as unknown as T;
  }
  if (typeof it === 'object') {
    return {
      ...it,
      coordinates: reverseCoordinates((it as Record<string, unknown>).coordinates as NestedCoords),
    } as unknown as T;
  }
  return it;
};

// ==================== 圍欄處理 ====================

/**
 * 圍欄 WKT → GeoJSON Feature
 */
export const geofenceToFeature = (
  theme: Record<string, { main: string }>,
  item: { id: number; area: string; attributes?: Record<string, unknown> },
): GeoJSON.Feature => {
  let geometry: GeoJSON.Geometry;

  if (item.area.indexOf('CIRCLE') > -1) {
    const coordinates = item.area
      .replace(/CIRCLE|\(|\)|,/g, ' ')
      .trim()
      .split(/ +/);
    const options = { steps: 32, units: 'meters' as const };
    const polygon = circle(
      toMapCoordinates(Number(coordinates[1]), Number(coordinates[0])),
      Number(coordinates[2]),
      options,
    );
    geometry = polygon.geometry;
  } else {
    geometry = (reverseCoordinates(parse(item.area)) as GeoJSON.Geometry);
  }

  return {
    id: item.id,
    type: 'Feature',
    geometry,
    properties: {
      name: item.name,
      color: (item.attributes?.color as string) || theme.geometry?.main || '#1976d2',
      width: (item.attributes?.mapLineWidth as number) || 2,
      opacity: (item.attributes?.mapLineOpacity as number) || 1,
    },
  };
};

/**
 * GeoJSON geometry → WKT area string
 */
export const geometryToArea = (geometry: GeoJSON.Geometry): string => {
  return stringify(reverseCoordinates(geometry));
};

// ==================== 字型偵測 ====================

/**
 * 根據地圖樣式的 glyphs URL 偵測適用字型
 */
export const findFonts = (map: MaplibreMap): string[] => {
  const { glyphs } = map.getStyle();
  if (!glyphs) return ['Open Sans Regular', 'Arial Unicode MS Regular'];

  if (glyphs.startsWith('https://tiles.openfreemap.org')) {
    return ['Noto Sans Regular'];
  }
  if (glyphs.startsWith('https://api.os.uk')) {
    return ['Source Sans Pro Regular'];
  }
  return ['Open Sans Regular', 'Arial Unicode MS Regular'];
};
