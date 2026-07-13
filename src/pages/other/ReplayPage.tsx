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
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppStore';
import { useAsyncTask } from '../../hooks/useAsyncTask';
import { MapView } from '../../map/core/MapView';
import { MapPositions } from '../../map/main/MapPositions';
import { MapCamera } from '../../map/main/MapCamera';
import { MapRoutePath } from '../../map/main/MapRoutePath';
import { MapRoutePoints } from '../../map/main/MapRoutePoints';
import { CalendarMileage } from '../../components/common/CalendarMileage';
import type { Position } from '../../types/models';
import { getPositions } from '../../api/endpoints';

/** 回放速度選項 */
const SPEED_OPTIONS = [1, 2, 5, 10];

/**
 * 路徑回放頁面
 */
export const ReplayPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const devices = useAppSelector((state) => state.devices.items);
  const selectedDeviceId = useAppSelector((state) => state.devices.selectedId);

  // 從 URL query params 或 Redux selectedId 取得預設裝置 ID
  const urlDeviceId = searchParams.get('deviceId');
  const urlId = urlDeviceId ? Number(urlDeviceId) : null;

  // 先初始化為空，等 devices 載入後再設定（避免 Select out-of-range 警告）
  const [deviceId, setDeviceId] = useState<number | ''>('');
  const defaultsSetRef = useRef(false);

  // devices 載入後，設定一次預設裝置 ID
  useEffect(() => {
    if (defaultsSetRef.current) return;
    const loadedDevices = Object.values(devices);
    if (loadedDevices.length === 0) return;

    const targetId = (urlId && devices[urlId]) ? urlId
      : (selectedDeviceId && devices[selectedDeviceId]) ? selectedDeviceId
      : loadedDevices[0]?.id;
    if (targetId) {
      setDeviceId(targetId);
      defaultsSetRef.current = true;
    }
  }, [devices, urlId, selectedDeviceId]);

  // 日曆是否顯示完整月份（非當月局部） — 用於隱藏標題釋放空間
  const [isFullMonth, setIsFullMonth] = useState(false);
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
          <IconButton edge="start" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mr: 2, display: isFullMonth ? 'none' : 'block' }}>Route Replay</Typography>
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
          <Box sx={{ ml: 2 }}>
            {deviceId ? (
              <CalendarMileage
                key={String(deviceId)}
                compact
                deviceId={Number(deviceId)}
                onDaysChange={setIsFullMonth}
                onDateSelect={(date) => {
                  // 停止播放，載入該日路線
                  setIsPlaying(false);
                  const from = dayjs(date).startOf('day').toISOString();
                  const to = dayjs(date).endOf('day').toISOString();
                  getPositions({ deviceId: Number(deviceId), from, to }).then((response) => {
                    setPositions(response.data.sort(
                      (a, b) => new Date(a.fixTime || '').getTime() - new Date(b.fixTime || '').getTime(),
                    ));
                    setCurrentIndex(0);
                  });
                }}
              />
            ) : null}
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
