/**
 * POI 圖層元件（KML/KMZ）
 *
 * 從 poiLayer 偏好設定的 URL 載入 KML/KMZ 檔案並顯示在地圖上。
 * 支援 GCJ-02 座標轉換。
 * 對應 FRONTME.md 11.7 PoiMap 章節。
 */

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';
import { useAttributePreference } from '../../utils/preferences';

/**
 * KML/KMZ 解析器
 * 將 KML 字串轉換為 GeoJSON FeatureCollection
 */
const parseKmlToGeoJson = (kmlText: string): GeoJSON.FeatureCollection => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(kmlText, 'text/xml');
  const features: GeoJSON.Feature[] = [];

  // 解析 Placemark
  xml.querySelectorAll('Placemark').forEach((placemark) => {
    const name = placemark.querySelector('name')?.textContent || '';
    const description = placemark.querySelector('description')?.textContent || '';

    // 點
    const point = placemark.querySelector('Point');
    if (point) {
      const coords = point.querySelector('coordinates')?.textContent?.trim();
      if (coords) {
        const [lng, lat] = coords.split(',').map(Number);
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: { name, description },
        });
      }
    }

    // 線
    const line = placemark.querySelector('LineString');
    if (line) {
      const coords = line.querySelector('coordinates')?.textContent?.trim();
      if (coords) {
        const points: [number, number][] = coords.split(/\s+/).map((c) => {
          const [lng, lat] = c.split(',').map(Number);
          return [lng, lat];
        });
        features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: points },
          properties: { name, description },
        });
      }
    }

    // 多邊形
    const polygon = placemark.querySelector('Polygon');
    if (polygon) {
      const outerRing = polygon.querySelector('outerBoundaryIs coordinates')?.textContent?.trim();
      if (outerRing) {
        const points: [number, number][] = outerRing.split(/\s+/).map((c) => {
          const [lng, lat] = c.split(',').map(Number);
          return [lng, lat];
        });
        features.push({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [points] },
          properties: { name, description },
        });
      }
    }
  });

  return { type: 'FeatureCollection', features };
};

/**
 * GCJ-02 → WGS-84 座標轉換（近似）
 * 中國大陸地區使用的 GCJ-02 偏移量約 100-700m
 */
const gcj02ToWgs84 = (lng: number, lat: number): [number, number] => {
  // 粗略近似轉換
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  const dLat = transformLat(lng - 105.0, lat - 35.0);
  const dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const dLat2 = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
  const dLng2 = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return [lng - dLng2, lat - dLat2];
};

const transformLat = (x: number, y: number): number => {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320.0 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
  return ret;
};

const transformLng = (x: number, y: number): number => {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
  return ret;
};

/**
 * 轉換 GeoJSON 座標（支援 GCJ-02 → WGS-84）
 */
const convertCoords = (geojson: GeoJSON.FeatureCollection, gcj02: boolean): GeoJSON.FeatureCollection => {
  if (!gcj02) return geojson;

  return {
    ...geojson,
    features: geojson.features.map((feature) => {
      if (feature.geometry.type === 'Point') {
        const coords = (feature.geometry as GeoJSON.Point).coordinates;
        const [lng, lat] = gcj02ToWgs84(coords[0], coords[1]);
        return { ...feature, geometry: { ...feature.geometry, coordinates: [lng, lat] } };
      }
      if (feature.geometry.type === 'LineString') {
        const coords = (feature.geometry as GeoJSON.LineString).coordinates as [number, number][];
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: coords.map(([lng, lat]) => gcj02ToWgs84(lng, lat)),
          },
        };
      }
      if (feature.geometry.type === 'Polygon') {
        const coords = (feature.geometry as GeoJSON.Polygon).coordinates as [number, number][][];
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: coords.map((ring) => ring.map(([lng, lat]) => gcj02ToWgs84(lng, lat))),
          },
        };
      }
      return feature;
    }),
  };
};

const POI_SOURCE_ID = 'poi-source';
const POI_FILL_LAYER_ID = 'poi-fill';
const POI_LINE_LAYER_ID = 'poi-line';
const POI_POINT_LAYER_ID = 'poi-point';

/**
 * POI 圖層
 * 從設定 URL 載入 KML/KMZ 並顯示
 */
export const PoiMap: React.FC = () => {
  const { map, mapReady } = useMap();
  const poiLayer = useAttributePreference('poiLayer', null);
  const addedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!mapReady) return;

    // 清除舊圖層
    if (addedRef.current) {
      try {
        if (map.getLayer(POI_POINT_LAYER_ID)) map.removeLayer(POI_POINT_LAYER_ID);
        if (map.getLayer(POI_LINE_LAYER_ID)) map.removeLayer(POI_LINE_LAYER_ID);
        if (map.getLayer(POI_FILL_LAYER_ID)) map.removeLayer(POI_FILL_LAYER_ID);
        if (map.getSource(POI_SOURCE_ID)) map.removeSource(POI_SOURCE_ID);
      } catch { /* ignore */ }
      addedRef.current = false;
    }

    if (!poiLayer) return;

    const url = String(poiLayer);
    const isGcj02 = url.includes('gcj-02') || url.includes('gcj02');

    // 中止前次請求
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    fetch(url, { signal: abortRef.current.signal })
      .then((res) => res.text())
      .then((text) => {
        let geojson: GeoJSON.FeatureCollection;

        if (url.endsWith('.kmz')) {
          // 簡化 KMZ → 視為文字（實際應使用 JSZip 解壓）
          geojson = parseKmlToGeoJson(text);
        } else {
          // KML
          geojson = parseKmlToGeoJson(text);
        }

        geojson = convertCoords(geojson, isGcj02);

        if (geojson.features.length === 0) return;
        if (!map.getSource(POI_SOURCE_ID)) {
          map.addSource(POI_SOURCE_ID, { type: 'geojson', data: geojson });

          map.addLayer({
            id: POI_FILL_LAYER_ID,
            type: 'fill',
            source: POI_SOURCE_ID,
            filter: ['==', '$type', 'Polygon'],
            paint: {
              'fill-color': '#9c27b0',
              'fill-opacity': 0.2,
              'fill-outline-color': '#9c27b0',
            },
          });

          map.addLayer({
            id: POI_LINE_LAYER_ID,
            type: 'line',
            source: POI_SOURCE_ID,
            filter: ['==', '$type', 'LineString'],
            paint: {
              'line-color': '#9c27b0',
              'line-width': 2,
              'line-dasharray': [3, 3],
            },
          });

          map.addLayer({
            id: POI_POINT_LAYER_ID,
            type: 'circle',
            source: POI_SOURCE_ID,
            filter: ['==', '$type', 'Point'],
            paint: {
              'circle-color': '#9c27b0',
              'circle-radius': 5,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            },
          });

          addedRef.current = true;
        }
      })
      .catch(() => { /* 忽略中止錯誤 */ });

    return () => {
      if (abortRef.current) abortRef.current.abort();
      try {
        if (map.getLayer(POI_POINT_LAYER_ID)) map.removeLayer(POI_POINT_LAYER_ID);
        if (map.getLayer(POI_LINE_LAYER_ID)) map.removeLayer(POI_LINE_LAYER_ID);
        if (map.getLayer(POI_FILL_LAYER_ID)) map.removeLayer(POI_FILL_LAYER_ID);
        if (map.getSource(POI_SOURCE_ID)) map.removeSource(POI_SOURCE_ID);
      } catch { /* ignore */ }
      addedRef.current = false;
    };
  }, [map, mapReady, poiLayer]);

  return null;
};
