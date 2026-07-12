/**
 * 影片串流頁面
 *
 * 檢視裝置的即時視訊串流（HLS 協定）。
 * 對應 FRONTME.md 9.7 StreamPage 章節。
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppStore';
import { useCatch } from '../../hooks/useAsyncTask';
import { sendCommand } from '../../api/endpoints';

/** 影片串流頁面 */
export const StreamPage: React.FC = () => {
  const navigate = useNavigate();
  const devices = useAppSelector((state) => state.devices.items);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [deviceId, setDeviceId] = useState<number | ''>('');
  const [channel, setChannel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const deviceList = Object.values(devices).sort((a, b) => a.name.localeCompare(b.name));

  /** 開始串流 */
  const handleStart = useCatch(async () => {
    if (!deviceId) return;
    // 發送 videoStart 指令
    await sendCommand({
      type: 'videoStart',
      deviceId: Number(deviceId),
      attributes: { channel },
    });

    // 設定 HLS 串流
    const streamUrl = `/api/stream/${deviceId}/${channel}/live.m3u8`;
    if (videoRef.current) {
      // 嘗試使用原生 HLS 播放
      videoRef.current.src = streamUrl;
      videoRef.current.play();
    }
    setIsPlaying(true);
  });

  /** 停止串流 */
  const handleStop = useCatch(async () => {
    if (!deviceId) return;
    await sendCommand({
      type: 'videoStop',
      deviceId: Number(deviceId),
      attributes: { channel },
    });

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    setIsPlaying(false);
  });

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Video Stream</Typography>
          <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>Device</InputLabel>
            <Select value={deviceId} label="Device" onChange={(e) => setDeviceId(Number(e.target.value) || '')}>
              {deviceList.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100, mr: 2 }}>
            <InputLabel>Channel</InputLabel>
            <Select value={channel} label="Channel" onChange={(e) => setChannel(Number(e.target.value))}>
              {[1, 2, 3, 4].map((ch) => (
                <MenuItem key={ch} value={ch}>{ch}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {!isPlaying ? (
            <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handleStart} disabled={!deviceId}>
              Play
            </Button>
          ) : (
            <Button variant="outlined" color="error" startIcon={<StopIcon />} onClick={handleStop}>
              Stop
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ height: 'calc(100% - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
        {isPlaying ? (
          <video
            ref={videoRef}
            controls
            autoPlay
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        ) : (
          <Typography color="grey.500">
            Select a device and click Play to start video stream
          </Typography>
        )}
      </Box>
    </>
  );
};
