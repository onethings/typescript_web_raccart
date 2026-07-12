/**
 * 位置模擬器頁面
 *
 * 點擊地圖模擬裝置位置發送（使用 OSMAnd 協定）。
 * 對應 FRONTME.md 9.6 EmulatorPage 章節。
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppStore';
import { MapView, useMap } from '../../map/core/MapView';
import { MapPositions } from '../../map/main/MapPositions';
import { MapCamera } from '../../map/main/MapCamera';

const PROTOCOL = window.location.protocol === 'https:' ? 'https' : 'http';
const PORT = 5055;

/** 地圖點擊處理元件 */
const MapClickHandler: React.FC<{
  deviceId: number | '';
  onPositionSent: (lat: number, lng: number) => void;
}> = ({ deviceId, onPositionSent }) => {
  const { map, mapReady } = useMap();
  const handlerRef = useRef<((e: { lngLat: { lat: number; lng: number } }) => void) | null>(null);

  useEffect(() => {
    if (!mapReady || !deviceId) return;

    const handler = async (e: { lngLat: { lat: number; lng: number } }) => {
      const { lat, lng } = e.lngLat;
      const params = new URLSearchParams({
        id: String(deviceId),
        lat: String(lat),
        lon: String(lng),
        timestamp: new Date().toISOString(),
      });
      const url = PROTOCOL === 'https'
        ? `${window.location.origin}/api/emulator?${params}`
        : `http://localhost:${PORT}?${params}`;
      await fetch(url, { method: 'POST', mode: 'no-cors' });
      onPositionSent(lat, lng);
    };

    handlerRef.current = handler;
    map.on('click', handler);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('click', handler);
      map.getCanvas().style.cursor = '';
    };
  }, [map, mapReady, deviceId, onPositionSent]);

  return null;
};

/** 位置模擬器頁面 */
export const EmulatorPage: React.FC = () => {
  const navigate = useNavigate();
  const devices = useAppSelector((state) => state.devices.items);
  const positions = useAppSelector((state) => state.session.positions);

  const [deviceId, setDeviceId] = useState<number | ''>('');
  const [lastSent, setLastSent] = useState<{ lat: number; lng: number } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const deviceList = Object.values(devices).sort((a, b) => a.name.localeCompare(b.name));
  const devicePosition = deviceId ? positions[deviceId] : undefined;

  const handlePositionSent = useCallback((lat: number, lng: number) => {
    setLastSent({ lat, lng });
    setSnackbarOpen(true);
  }, []);

  // 位置列表（用於地圖顯示）
  const allPositions = devicePosition ? [devicePosition] : [];

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Position Emulator</Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Device</InputLabel>
            <Select value={deviceId} label="Device" onChange={(e) => setDeviceId(Number(e.target.value) || '')}>
              {deviceList.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name} ({d.uniqueId})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Box sx={{ height: 'calc(100% - 64px)', position: 'relative' }}>
        <MapView>
          <MapClickHandler deviceId={deviceId} onPositionSent={handlePositionSent} />
          <MapPositions positions={allPositions} />
          {lastSent && <MapCamera latitude={lastSent.lat} longitude={lastSent.lng} zoom={14} />}
        </MapView>

        {deviceId && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.9)',
              p: 2,
              borderRadius: 1,
              boxShadow: 1,
              pointerEvents: 'none',
            }}
          >
            <Typography variant="body2">
              Click on the map to send position
            </Typography>
            {lastSent && (
              <Typography variant="caption" color="textSecondary">
                Last: {lastSent.lat.toFixed(5)}, {lastSent.lng.toFixed(5)}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={1500} message="Position sent" onClose={() => setSnackbarOpen(false)} />
    </>
  );
};
