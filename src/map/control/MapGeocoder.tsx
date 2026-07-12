/**
 * 地址搜尋控制項
 *
 * 使用 Nominatim OpenStreetMap 進行地址搜尋，縮放至結果。
 * 對應 FRONTME.md 11.6 MapGeocoder 章節。
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
} from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import maplibregl from 'maplibre-gl';
import { useMap } from '../core/MapView';

interface GeocoderResult {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
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
 * 地址搜尋控制項
 * 使用 Nominatim API 搜尋地址並縮放地圖
 */
export const MapGeocoder: React.FC = () => {
  const { map, mapReady } = useMap();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocoderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /** 搜尋地址 */
  const searchAddress = useCallback(
    debounce(async (q: string) => {
      if (!q || q.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
        );
        if (res.ok) {
          setResults(await res.json());
        }
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300),
    [],
  );

  /** 選取結果 */
  const handleSelect = (result: GeocoderResult) => {
    if (!mapReady) return;
    const lng = parseFloat(result.lon);
    const lat = parseFloat(result.lat);
    map.flyTo({ center: [lng, lat], zoom: 14, duration: 1000 });
    setAnchorEl(null);
    setQuery('');
    setResults([]);
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
          top: 48,
          right: 8,
          zIndex: 10,
          bgcolor: 'background.paper',
          boxShadow: 1,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        size="small"
      >
        <TravelExploreIcon />
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => { setAnchorEl(null); setResults([]); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 1, width: 320 }}>
          <TextField
            inputRef={inputRef}
            size="small"
            fullWidth
            placeholder="Search address..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              searchAddress(e.target.value);
            }}
            slotProps={{
              input: {
                endAdornment: loading ? <CircularProgress size={20} /> : null,
              },
            }}
          />
          {results.length > 0 && (
            <List dense>
              {results.map((result, idx) => (
                <ListItemButton key={idx} onClick={() => handleSelect(result)}>
                  <ListItemText
                    primary={result.display_name}
                    primaryTypographyProps={{ variant: 'body2', noWrap: false }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};
