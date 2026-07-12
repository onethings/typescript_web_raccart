/**
 * PWA 更新控制器元件
 *
 * 監聽 Service Worker 更新事件，提示使用者重新整理。
 * 對應 FRONTME.md 16.4 UpdateController 章節。
 */

import React, { useEffect, useState } from 'react';
import {
  Snackbar,
  Alert,
  Button,
} from '@mui/material';

/**
 * PWA 更新控制器
 * 當偵測到 Service Worker 更新時顯示 Snackbar 提示
 */
export const UpdateController: React.FC = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 監聽 service worker 更新事件
    const handleStateChange = () => {
      navigator.serviceWorker?.getRegistration().then((reg) => {
        if (reg?.waiting) {
          setWaitingWorker(reg.waiting);
          setShow(true);
        }
      });
    };

    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    // 監聽自訂更新事件（由 vite-plugin-pwa 觸發）
    const handleSWUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail as ServiceWorker | undefined;
      if (detail) {
        setWaitingWorker(detail);
        setShow(true);
      }
    };

    window.addEventListener('sw.updated', handleSWUpdated);

    return () => {
      window.removeEventListener('sw.updated', handleSWUpdated);
    };
  }, []);

  const handleUpdate = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShow(false);
  };

  return (
    <Snackbar
      open={show}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={() => setShow(false)}
    >
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={handleUpdate}>
            Update
          </Button>
        }
      >
        A new version is available. Click Update to refresh.
      </Alert>
    </Snackbar>
  );
};
