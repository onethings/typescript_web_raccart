/**
 * 路徑回放頁面
 *
 * 播放裝置的歷史軌跡，含播放控制、時間軸、速度控制。
 * 對應 FRONTME.md 9.4 ReplayPage 章節。
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Slider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppStore';
import { useAsyncTask } from '../../hooks/useAsyncTask';
import { MapView } from '../../map/core/MapView';
import { MapPositions } from '../../map/main/MapPositions';
import { MapCamera } from '../../map/main/MapCamera';
import { MapRoutePath } from '../../map/main/MapRoutePath';
import { MapRoutePoints } from '../../map/main/MapRoutePoints';
import type { Position } from '../../types/models';
import { getPositions } from '../../api/endpoints';

/** 回放速度選項 */
const SPEED_OPTIONS = [1, 2, 5, 10];

/**
 * 路徑回放頁面
 */
export const ReplayPage: React.FC = () => {
  const navigate = useNavigate();
  const devices = useAppSelector((state) => state.devices.items);

  const [deviceId, setDeviceId] = useState<number | ''>('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** 載入位置資料 */
  useAsyncTask(
    async ({ signal }) => {
      if (!deviceId) return;
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();
      const response = await getPositions({ deviceId: Number(deviceId), from, to }, signal);
      setPositions(response.data.sort((a, b) => new Date(a.fixTime || '').getTime() - new Date(b.fixTime || '').getTime()));
      setCurrentIndex(0);
    },
    [deviceId],
  );

  /** 播放控制 */
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= positions.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, positions.length]);

  const currentPosition = positions[currentIndex];
  const deviceList = useMemo(
    () => Object.values(devices).sort((a, b) => a.name.localeCompare(b.name)),
    [devices],
  );

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Route Replay</Typography>
          <Box sx={{ ml: 2, minWidth: 200 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Device</InputLabel>
              <Select value={deviceId} label="Device" onChange={(e) => setDeviceId(Number(e.target.value) || '')}>
                {deviceList.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 地圖 */}
      <Box sx={{ height: 'calc(100% - 112px)' }}>
        <MapView>
          {positions.length > 1 && (
            <>
              <MapRoutePath positions={positions} />
              <MapRoutePoints positions={positions} showSpeedControl />
            </>
          )}
          {currentPosition && (
            <>
              <MapPositions positions={[currentPosition]} />
              <MapCamera latitude={currentPosition.latitude} longitude={currentPosition.longitude} zoom={14} />
            </>
          )}
        </MapView>
      </Box>

      {/* 控制列 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
        <IconButton onClick={() => setCurrentIndex(Math.max(0, currentIndex - 10))}>
          <SkipPreviousIcon />
        </IconButton>
        <IconButton onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton onClick={() => setCurrentIndex(Math.min(positions.length - 1, currentIndex + 10))}>
          <SkipNextIcon />
        </IconButton>

        <Slider
          sx={{ flex: 1 }}
          value={currentIndex}
          min={0}
          max={Math.max(0, positions.length - 1)}
          onChange={(_, val) => setCurrentIndex(val as number)}
        />

        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            {SPEED_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s}x</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="caption">
          {currentIndex + 1}/{positions.length}
        </Typography>
      </Box>
    </>
  );
};
