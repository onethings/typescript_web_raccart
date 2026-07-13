/**
 * MapboxDraw 主題樣式（MapLibre GL v5+ 相容）
 *
 * MapLibre GL v5+ 要求 literal 陣列需要以 ["literal", [...]] 包裝。
 * 此檔案從 @mapbox/mapbox-gl-draw/src/lib/theme.js 修改而來。
 */

const blue = '#3bb2d0';
const orange = '#fbb03b';
const white = '#fff';
const gray = '#fbb03b'; // 與 orange 相同，保留原始定義

import type { Style } from 'maplibre-gl';

const drawTheme: Style[] = [
  // Polygons - Solid fill
  {
    id: 'gl-draw-polygon-fill',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': ['case', ['==', ['get', 'active'], 'true'], orange, blue],
      'fill-opacity': 0.1,
    },
  },
  // Polygon outline
  {
    id: 'gl-draw-polygon-stroke',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['case', ['==', ['get', 'active'], 'true'], orange, blue],
      'line-dasharray': ['literal', [0.2, 2]],
      'line-width': 2,
    },
  },
  // Lines (active/inactive)
  {
    id: 'gl-draw-lines',
    type: 'line',
    filter: ['any', ['==', '$type', 'LineString'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['case', ['==', ['get', 'active'], 'true'], orange, blue],
      'line-dasharray': [
        'case',
        ['==', ['get', 'active'], 'true'],
        ['literal', [0.2, 2]],
        ['literal', [2, 0]],
      ],
      'line-width': 2,
    },
  },
  // Points - outer circle
  {
    id: 'gl-draw-point-outer',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 7, 5],
      'circle-color': white,
    },
  },
  // Points - inner circle
  {
    id: 'gl-draw-point-inner',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': ['case', ['==', ['get', 'active'], 'true'], orange, blue],
    },
  },
  // Vertex - outer
  {
    id: 'gl-draw-vertex-outer',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['!=', 'mode', 'simple_select']],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 7, 5],
      'circle-color': white,
    },
  },
  // Vertex - inner
  {
    id: 'gl-draw-vertex-inner',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['!=', 'mode', 'simple_select']],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': orange,
    },
  },
  // Midpoint
  {
    id: 'gl-draw-midpoint',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 3,
      'circle-color': orange,
    },
  },
  // Line guides (while drawing)
  {
    id: 'gl-draw-line-guides',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'simple_select']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': orange,
      'line-dasharray': ['literal', [0.3, 1.5]],
      'line-width': 1,
    },
  },
  // Point guide (while drawing)
  {
    id: 'gl-draw-point-guide',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'vertex'], ['!=', 'meta', 'midpoint'], ['!=', 'mode', 'simple_select']],
    paint: {
      'circle-radius': 3,
      'circle-color': orange,
    },
  },
  // Cold/hot line dash arrays are used for selection highlights
  // These are patched to use ["literal", ...] for MapLibre v5+ compatibility
  {
    id: 'gl-draw-line-cold',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'false']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': blue,
      'line-dasharray': ['literal', [2, 0]],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-hot',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': orange,
      'line-dasharray': ['literal', [0.2, 2]],
      'line-width': 2,
    },
  },
  // Polygon fill cold/hot
  {
    id: 'gl-draw-polygon-cold',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'false']],
    paint: {
      'fill-color': blue,
      'fill-opacity': 0.05,
    },
  },
  {
    id: 'gl-draw-polygon-hot',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
    paint: {
      'fill-color': orange,
      'fill-opacity': 0.1,
    },
  },
  // Trash point (for delete while drawing)
  {
    id: 'gl-draw-trash',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'trash']],
    paint: {
      'circle-radius': 4,
      'circle-color': gray,
    },
  },
];

export default drawTheme;
