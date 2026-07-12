/**
 * 伺服器設定提供者
 * 
 * 載入伺服器設定並提供給子元件。
 * 對應 FRONTME.md 17.4 ServerProvider 章節。
 */

import React, { useState } from 'react';
import { Alert, IconButton } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { useAsyncTask } from '../hooks/useAsyncTask';
import { sessionActions } from '../store';
import { Loader } from './Loader';
import { getServer } from '../api/endpoints';

/**
 * 伺服器設定提供者
 * 取得伺服器設定後才渲染子元件
 */
export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((state) => !!state.session.server);
  const [error, setError] = useState<string | null>(null);

  useAsyncTask(
    async ({ signal }) => {
      if (!error) {
        try {
          const response = await getServer(signal);
          if (response.status === 200) {
            dispatch(sessionActions.updateServer(response.data));
          } else {
            throw new Error('無法取得伺服器資訊');
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : '連線失敗';
          setError(message);
        }
      }
    },
    [error, dispatch],
  );

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton color="inherit" size="small" onClick={() => setError(null)}>
            <ReplayIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!initialized) {
    return <Loader />;
  }

  return <>{children}</>;
};
