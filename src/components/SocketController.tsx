/**
 * WebSocket 控制器
 * 
 * 管理與 Traccar 伺服器的 WebSocket 即時連線。
 * 處理裝置更新、位置更新、事件通知、通訊日誌。
 * 對應 FRONTME.md 17.1 SocketController 章節。
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { useAsyncTask, useCatchCallback } from '../hooks/useAsyncTask';
import { devicesActions, sessionActions, eventsActions } from '../store';
import { useAttributePreference } from '../utils/preferences';
import { formatNotificationTitle } from '../utils/formatter';
import type { SocketMessage, LogEntry } from '../types/ui';
import type { Event } from '../types/models';
import { getDevices, getPositions } from '../api/endpoints';

/** WebSocket 登出代碼 */
const LOGOUT_CODE = 4000;

/** 事件通知顯示時間 */
const SNACKBAR_DURATION = 2750;

/**
 * WebSocket 控制器
 * 處理即時資料推送與重連邏輯
 */
export const SocketController: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const authenticated = useAppSelector((state) => Boolean(state.session.user));
  const includeLogs = useAppSelector((state) => state.session.includeLogs);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; show: boolean }>>([]);

  /** 播放事件提示音 */
  const playAlarmSound = useCallback((events: Event[]) => {
    const alarmEvents = events.filter(
      (e) => e.type === 'alarm' || e.type === 'ignitionOn' || e.type === 'ignitionOff',
    );
    if (alarmEvents.length === 0) return;

    // 嘗試播放 alarm.mp3，若失敗則使用 Web Audio API 產生提示音
    const audio = new Audio('/alarm.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Web Audio API 備援方案
      try {
        const ctx = new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext as typeof AudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
      } catch { /* 音效不可用 */ }
    });
  }, []);

  /** 清除重連計時器 */
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  /** 處理 WebSocket 訊息 */
  const handleMessage = useCallback(
    (data: SocketMessage) => {
      if (data.devices) {
        dispatch(devicesActions.update(data.devices));
      }
      if (data.positions) {
        dispatch(sessionActions.updatePositions(data.positions));
      }
      if (data.events) {
        dispatch(eventsActions.add(data.events));
        // 播放事件提示音
        playAlarmSound(data.events);
        // 顯示通知
        setNotifications(
          data.events.map((event) => ({
            id: event.id,
            message: event.attributes?.message as string || event.type,
            show: true,
          })),
        );
      }
      if (data.logs) {
        dispatch(sessionActions.updateLogs(data.logs));
      }
    },
    [dispatch],
  );

  /** 建立 WebSocket 連線 */
  const connectSocket = useCallback(() => {
    clearReconnectTimeout();
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      socketRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/api/socket`);
    socketRef.current = socket;

    socket.onopen = () => {
      dispatch(sessionActions.updateSocket(true));
    };

    socket.onclose = async (event) => {
      dispatch(sessionActions.updateSocket(false));
      if (event.code === LOGOUT_CODE) return;

      // 重新取得最新資料
      try {
        const devicesResponse = await getDevices();
        if (socketRef.current !== socket) return;
        if (devicesResponse.status === 200) {
          dispatch(devicesActions.update(devicesResponse.data));
        }

        const positionsResponse = await getPositions();
        if (socketRef.current !== socket) return;
        if (positionsResponse.status === 200) {
          dispatch(sessionActions.updatePositions(positionsResponse.data));
        }
      } catch {
        // 忽略錯誤
      }

      if (socketRef.current !== socket) return;

      // 60 秒後重連
      clearReconnectTimeout();
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connectSocket();
      }, 60000);
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as SocketMessage;
        handleMessage(data);
      } catch {
        // 忽略解析錯誤
      }
    };
  }, [clearReconnectTimeout, dispatch, handleMessage]);

  const connectSocketRef = useRef(connectSocket);
  connectSocketRef.current = connectSocket;

  // 認證後建立 WebSocket
  useAsyncTask(
    async ({ signal }) => {
      if (authenticated) {
        const response = await getDevices({ signal });
        if (response.status === 200) {
          dispatch(devicesActions.refresh(response.data));
        }
        connectSocket();
        return () => {
          clearReconnectTimeout();
          socketRef.current?.close(LOGOUT_CODE);
        };
      }
      return null;
    },
    [authenticated, dispatch, clearReconnectTimeout, connectSocket],
  );

  // 切換日誌
  useEffect(() => {
    socketRef.current?.send(JSON.stringify({ logs: includeLogs }));
  }, [includeLogs]);

  // 頁面 focus 時檢查連線
  useEffect(() => {
    if (!authenticated) return;
    const reconnectIfNeeded = () => {
      const socket = socketRef.current;
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        connectSocketRef.current();
      } else if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.send('{}');
        } catch {
          // 測試連線
        }
      }
    };

    window.addEventListener('focus', reconnectIfNeeded);
    return () => window.removeEventListener('focus', reconnectIfNeeded);
  }, [authenticated]);

  return (
    <Snackbar
      open={notifications.some((n) => n.show)}
      autoHideDuration={SNACKBAR_DURATION}
      message={notifications.find((n) => n.show)?.message}
      onClose={() => setNotifications([])}
    />
  );
};
