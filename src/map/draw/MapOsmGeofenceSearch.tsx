/**
 * OSM 圍欄搜尋元件
 *
 * 使用 Overpass API 查詢 OpenStreetMap 行政邊界/地標，
 * 顯示在地圖上並可加入圍欄。
 * 支援節點數調整，避免數據過多。
 * 對應 FRONTME.md 11.8 MapOsmGeofenceSearch 章節。
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  IconButton,
  Popover,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Box,
  Typography,
  Slider,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';
import { useCatch } from '../../hooks/useAsyncTask';
import { geoJsonToWkt } from './MapGeofenceEdit';
import { fetchOrThrow } from '../../utils/fetchOrThrow';
import type { FeatureCollection, Polygon } from 'geojson';

// 預設節點數上限
const DEFAULT_MAX_NODES = 100;
const MIN_NODES = 10;
const MAX_NODES = 500;

/** 搜尋結果 */
interface OsmSearchResult {
  displayName: string;
  osmType: string;
  osmId: number;
  category: string;
}

/** 延遲工具 */
const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * 簡化多邊形節點（均勻取樣）
 */
const simplifyCoords = (coords: [number, number][], maxNodes: number): [number, number][] => {
  if (coords.length <= maxNodes) return coords;
  const step = coords.length / maxNodes;
  const result: [number, number][] = [];
  for (let i = 0; i < maxNodes; i++) {
    const idx = Math.min(Math.floor(i * step), coords.length - 1);
    result.push(coords[idx]);
  }
  if (result.length > 0) {
    const first = result[0];
    const last = result[result.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      result.push(first);
    }
  }
  return result;
};

/** 更新地圖上的預覽圖層 */
const updatePreviewLayer = (
  map: maplibregl.Map,
  coords: [number, number][],
  featureName: string,
) => {
  const sourceId = 'osm-geofence-preview';
  const fillLayerId = 'osm-geofence-preview-fill';
  const lineLayerId = 'osm-geofence-preview-line';

  try {
    if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
    if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  } catch { /* ignore */ }

  const geometry: Polygon = { type: 'Polygon', coordinates: [coords] };
  const feature: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry, properties: { name: featureName } },
    ],
  };

  map.addSource(sourceId, { type: 'geojson', data: feature });
  map.addLayer({
    id: fillLayerId, type: 'fill', source: sourceId,
    paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.2 },
  });
  map.addLayer({
    id: lineLayerId, type: 'line', source: sourceId,
    paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-dasharray': [4, 2] },
  });
};

/**
 * OSM 圍欄搜尋元件
 * 搜尋地名並顯示其 OSM 邊界，可調整節點數並加入圍欄
 */
export const MapOsmGeofenceSearch: React.FC = () => {
  const { map } = useMap();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OsmSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingGeo, setFetchingGeo] = useState(false);
  const [selectedResult, setSelectedResult] = useState<OsmSearchResult | null>(null);
  const [maxNodes, setMaxNodes] = useState(DEFAULT_MAX_NODES);
  const rawCoordsRef = useRef<[number, number][]>([]);
  const maxNodesRef = useRef(DEFAULT_MAX_NODES);
  const inputRef = useRef<HTMLInputElement>(null);

  // 同步 maxNodes 到 ref
  maxNodesRef.current = maxNodes;

  // Overpass API 查詢邊界幾何
  const fetchGeometry = useCatch(async (result: OsmSearchResult) => {
    setFetchingGeo(true);
    setSelectedResult(result);

    try {
      // 使用更高效的 Overpass 查詢：只取 outer 的 way，不用 recurse
      // 先取得 relation 的 member ways，再查這些 ways 的完整節點
      const memberQuery = `[out:json];${result.osmType}(${result.osmId});out body;`;
      const memberRes = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(memberQuery)}`,
        { signal: AbortSignal.timeout(10000) },
      );
      if (!memberRes.ok) throw new Error(`Overpass error: ${memberRes.status}`);
      const memberData = await memberRes.json();

      // 收集所有 outer way 的 ID
      const mainEl = memberData.elements?.[0];
      let wayIds: number[] = [];

      if (mainEl?.type === 'relation' && mainEl.members) {
        wayIds = mainEl.members
          .filter((m: Record<string, unknown>) => m.type === 'way' && (m.role === 'outer' || !m.role))
          .map((m: Record<string, unknown>) => m.ref as number);
      } else if (mainEl?.type === 'way') {
        wayIds = [result.osmId];
      }

      if (wayIds.length === 0) throw new Error('No boundary ways found');

      // 批次查詢 way 的完整節點座標
      const wayQuery = `[out:json];way(id:${wayIds.slice(0, 20).join(',')});(._;>;);out geom;`;
      const wayRes = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(wayQuery)}`,
        { signal: AbortSignal.timeout(15000) },
      );
      if (!wayRes.ok) throw new Error(`Overpass error: ${wayRes.status}`);
      const wayData = await wayRes.json();

      // 提取節點座標
      const allCoords: [number, number][] = [];
      const wayElements = wayData.elements?.filter((e: Record<string, unknown>) => e.type === 'way') || [];

      for (const way of wayElements) {
        if (way.geometry) {
          const coords = (way.geometry as Array<Record<string, unknown>>)
            .map((g) => [g.lon as number, g.lat as number] as [number, number]);
          allCoords.push(...coords);
        } else if (way.nodes) {
          const nodeIds = way.nodes as number[];
          // 只取前 200 個節點以避免請求過大
          const batchIds = nodeIds.slice(0, 200);
          const nodeQuery = `[out:json];node(id:${batchIds.join(',')});out geom;`;
          const nodeRes = await fetch(
            `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(nodeQuery)}`,
            { signal: AbortSignal.timeout(10000) },
          );
          if (nodeRes.ok) {
            const nodeData = await nodeRes.json();
            const nodeMap = new Map<number, [number, number]>();
            (nodeData.elements || []).forEach((n: Record<string, unknown>) => {
              if (n.type === 'node') nodeMap.set(n.id as number, [n.lon as number, n.lat as number]);
            });
            const coords = nodeIds.map((id) => nodeMap.get(id)).filter(Boolean) as [number, number][];
            allCoords.push(...coords);
          }
        }
      }

      if (allCoords.length >= 3) {
        rawCoordsRef.current = allCoords;
        const name = result.displayName.split(',')[0];
        const simplified = simplifyCoords(allCoords, maxNodesRef.current);
        updatePreviewLayer(map, simplified, name);
        const bounds = simplified.reduce(
          (b, [lng, lat]) => b.extend([lng, lat]),
          new maplibregl.LngLatBounds(simplified[0], simplified[1]),
        );
        map.fitBounds(bounds, { padding: 50 });
      } else {
        throw new Error('Not enough coordinates');
      }
    } catch (error) {
      console.warn('[OSM Geofence] Failed to fetch geometry:', error);
      setSelectedResult(null);
    }
    setFetchingGeo(false);
  });

  // 節點數變更時重新簡化並縮放至圍欄範圍
  const handleNodesChange = useCallback((_: Event, value: number | number[]) => {
    const newMax = value as number;
    setMaxNodes(newMax);
    const raw = rawCoordsRef.current;
    if (raw.length >= 3 && selectedResult) {
      const simplified = simplifyCoords(raw, newMax);
      const name = selectedResult.displayName.split(',')[0];
      updatePreviewLayer(map, simplified, name);
      // 自動縮放至圍欄範圍
      const bounds = simplified.reduce(
        (b, [lng, lat]) => b.extend([lng, lat]),
        new maplibregl.LngLatBounds(simplified[0], simplified[1]),
      );
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [map, selectedResult]);

  // 加入為圍欄
  const handleAddGeofence = useCatch(async () => {
    const raw = rawCoordsRef.current;
    if (raw.length < 3) return;
    const simplified = simplifyCoords(raw, maxNodes);
    const name = selectedResult?.displayName.split(',')[0] || 'OSM Geofence';
    const geometry: Polygon = { type: 'Polygon', coordinates: [simplified] };
    const wkt = geoJsonToWkt({ type: 'Feature', geometry, properties: {} });

    const response = await fetchOrThrow('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, area: wkt }),
    });
    const item = await response.json();

    try {
      ['osm-geofence-preview-fill', 'osm-geofence-preview-line'].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource('osm-geofence-preview')) map.removeSource('osm-geofence-preview');
    } catch { /* ignore */ }

    rawCoordsRef.current = [];
    setSelectedResult(null);
    setAnchorEl(null);
    setQuery('');
    setResults([]);
    window.location.href = `/settings/geofence/${item.id}`;
  });

  // 搜尋 OSM 地點
  const searchOsm = useCallback(
    debounce(async (q: string) => {
      if (!q || q.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10&polygon_geojson=0&type=boundary`,
        );
        if (res.ok) {
          const data = await res.json();
          // 過濾有邊界的結果（行政區、地標等）
          const filtered = data
            .filter((item: Record<string, unknown>) =>
              ['administrative', 'boundary', 'area', 'landuse', 'leisure', 'natural'].includes(
                String(item.type || item.category || ''),
              ),
            )
            .map((item: Record<string, unknown>) => ({
              displayName: item.display_name as string,
              osmType: item.osm_type === 'relation' || item.osm_type === 'way' ? item.osm_type : 'relation',
              osmId: item.osm_id as number,
              category: item.type as string || item.category as string || '',
            }));
          setResults(filtered.length > 0 ? filtered : data.slice(0, 5).map(
            (item: Record<string, unknown>) => ({
              displayName: item.display_name as string,
              osmType: item.osm_type === 'relation' || item.osm_type === 'way' ? item.osm_type : 'relation',
              osmId: item.osm_id as number,
              category: item.type as string || item.category as string || '',
            }),
          ));
        }
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 500),
    [],
  );

  // 關閉時清除圖層
  const handleClose = () => {
    try {
      ['osm-geofence-preview-fill', 'osm-geofence-preview-line'].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource('osm-geofence-preview')) map.removeSource('osm-geofence-preview');
    } catch { /* ignore */ }
    rawCoordsRef.current = [];
    setAnchorEl(null);
    setResults([]);
    setSelectedResult(null);
    setQuery('');
  };

  return (
    <>
      <IconButton
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        sx={{
          position: 'absolute',
          top: 266,
          right: 8,
          zIndex: 10,
          bgcolor: 'background.paper',
          boxShadow: 1,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        size="small"
      >
        <SearchIcon />
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 1.5, width: 360, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            inputRef={inputRef}
            size="small"
            fullWidth
            placeholder="Search OSM geofence..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              searchOsm(e.target.value);
            }}
            slotProps={{
              input: {
                endAdornment: loading ? <CircularProgress size={20} /> : null,
              },
            }}
          />

          {/* 搜尋結果 */}
          {results.length > 0 && !selectedResult && (
            <List dense sx={{ maxHeight: 240, overflow: 'auto' }}>
              {results.map((result, idx) => (
                <ListItemButton
                  key={idx}
                  onClick={() => fetchGeometry(result)}
                  disabled={fetchingGeo}
                >
                  <ListItemText
                    primary={result.displayName.split(',')[0]}
                    secondary={result.displayName}
                    primaryTypographyProps={{ variant: 'body2', noWrap: false }}
                    secondaryTypographyProps={{ variant: 'caption', noWrap: false }}
                  />
                  {fetchingGeo && <CircularProgress size={16} />}
                </ListItemButton>
              ))}
            </List>
          )}

          {/* 節點數調整 */}
          {selectedResult && rawCoordsRef.current.length >= 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                {selectedResult.displayName.split(',')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Nodes: {maxNodes} (raw: {rawCoordsRef.current.length})
              </Typography>
              <Slider
                size="small"
                value={maxNodes}
                min={MIN_NODES}
                max={MAX_NODES}
                step={10}
                onChange={handleNodesChange}
              />
              <Button
                variant="contained"
                size="small"
                startIcon={<AddLocationIcon />}
                onClick={handleAddGeofence}
              >
                Add as Geofence
              </Button>
            </Box>
          )}

          {results.length === 0 && query.length >= 3 && !loading && !selectedResult && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1, textAlign: 'center' }}>
              No boundary results found
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  );
};
