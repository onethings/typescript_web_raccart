/**
 * 事件通知切換按鈕元件
 *
 * 在地圖上顯示事件通知的開關按鈕。
 * 對應 FRONTME.md 11.6 MapNotification 章節。
 */

import React, { useState } from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { useAppSelector } from '../../hooks/useAppStore';

interface MapNotificationProps {
  /** 通知切換回呼 */
  onToggle?: (enabled: boolean) => void;
}

/**
 * 事件通知切換按鈕
 * 顯示在右下角，切換事件通知的啟用/停用
 */
export const MapNotification: React.FC<MapNotificationProps> = ({ onToggle }) => {
  const [enabled, setEnabled] = useState(false);
  const eventCount = useAppSelector((state) => state.events.items.length);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onToggle?.(newState);
  };

  return (
    <Tooltip title={enabled ? 'Disable Notifications' : 'Enable Notifications'}>
      <IconButton
        onClick={handleToggle}
        sx={{
          position: 'absolute',
          bottom: 80,
          right: 8,
          zIndex: 10,
          bgcolor: 'background.paper',
          boxShadow: 1,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        size="small"
      >
        <Badge badgeContent={enabled ? eventCount : 0} color="error" max={99}>
          {enabled ? <NotificationsIcon /> : <NotificationsOffIcon />}
        </Badge>
      </IconButton>
    </Tooltip>
  );
};
