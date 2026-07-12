/**
 * 裝置列表元件（虛擬滾動）
 *
 * 使用 react-window 實現高效能的虛擬滾動裝置列表。
 * 對應 FRONTME.md 5.1 DeviceList 與 5.2 DeviceRow 章節。
 */

import React, { useEffect, useReducer, useMemo, useRef, useState } from 'react';
import { List } from 'react-window';
import {
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import { makeStyles } from 'tss-react/mui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { devicesActions } from '../../store';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { formatAlarm, formatBoolean, formatPercentage, formatStatus, getStatusColor } from '../../utils/formatter';

dayjs.extend(relativeTime);

const ROW_HEIGHT = 72;

const useStyles = makeStyles()((theme) => ({
  list: { height: '100%', direction: theme.direction },
  listInner: { position: 'relative', margin: theme.spacing(1.5, 0) },
  icon: { width: 25, height: 25, filter: 'brightness(0) invert(1)' },
  success: { color: theme.palette.success.main },
  warning: { color: theme.palette.warning.main },
  error: { color: theme.palette.error.main },
  neutral: { color: theme.palette.neutral.main },
  selected: { backgroundColor: theme.palette.action.selected },
}));

/** 引擎圖示（內嵌 SVG，支援顏色） */
const EngineIcon: React.FC<{ width?: number; height?: number; className?: string }> = ({ width = 20, height = 20, className }) => (
  <svg width={width} height={height} viewBox="0 0 32 32" className={className}>
    <path fill="currentColor" d="M13.778 6.667v2.222h3.333v2.222h2.222v-2.222h3.333v-2.222h-8.889zM13.778 13.333c-0.3 0-0.579 0.121-0.79 0.321l-1.888 1.901h-2.878c-0.611 0-1.111 0.5-1.111 1.111v6.667c0 0.611 0.5 1.111 1.111 1.111h1.888l3.056 2.033c0.178 0.122 0.39 0.189 0.612 0.189h5.556c0.244 0 0.477-0.077 0.666-0.221l4.444-3.333c0.278-0.211 0.445-0.545 0.445-0.89v-7.778c0-0.611-0.5-1.111-1.111-1.111h-10zM27.111 14.444v6.667h2.222v-6.667h-2.222zM17.111 15.556v3.333h2.222l-3.333 5.556v-3.333h-2.222l3.333-5.556zM2.667 16.667v5.556h2.222v-5.556h-2.222z" />
  </svg>
);

/** 單一裝置列 */
const DeviceRow: React.FC<{
  ariaAttributes: Record<string, unknown>;
  index: number;
  style: React.CSSProperties;
  devices: Record<string, unknown>[];
  onSelect: (id: number) => void;
  selectedId: number | null;
  classes: Record<string, string>;
}> = ({ index, style, devices: devicesArray, onSelect, selectedId, classes }) => {
  const item = devicesArray[index] as unknown as { id: number; name: string; status: string; lastUpdate?: string; category?: string; attributes?: Record<string, unknown> };
  const position = useAppSelector((state) => state.session.positions[item.id]);
  const t = useTranslation();

  const statusColor = getStatusColor(item.status);
  const statusText = item.status === 'online' ? formatStatus(item.status, t) : item.lastUpdate ? dayjs(item.lastUpdate).fromNow() : formatStatus(item.status, t);

  return (
    <div style={style}>
      <ListItemButton
        onClick={() => onSelect(item.id)}
        selected={selectedId === item.id}
        className={selectedId === item.id ? classes.selected : undefined}
      >
        <ListItemAvatar>
          <Avatar>
            <div className={classes.icon} style={{ backgroundColor: statusColor === 'success' ? '#4caf50' : statusColor === 'error' ? '#f44336' : '#9e9e9e', borderRadius: '50%', width: 25, height: 25 }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={item.name}
          secondary={
            <Typography variant="body2" color={statusColor === 'success' ? 'success' : statusColor === 'error' ? 'error' : 'textSecondary'}>
              {statusText}
            </Typography>
          }
          slotProps={{
            primary: { noWrap: true } as Record<string, unknown>,
            secondary: { noWrap: true } as Record<string, unknown>,
          }}
        />
        {position?.attributes && (position.attributes as Record<string, unknown>).alarm && (
          <Tooltip title={`Alarm: ${formatAlarm(String((position.attributes as Record<string, unknown>).alarm), t)}`}>
            <IconButton size="small">
              <ErrorIcon fontSize="small" className={classes.error} />
            </IconButton>
          </Tooltip>
        )}
        {position?.attributes && 'ignition' in (position.attributes as Record<string, unknown>) && (
          <Tooltip title={`${t('positionIgnition')}: ${formatBoolean(Boolean((position.attributes as Record<string, unknown>).ignition), t)}`}>
            <IconButton size="small">
              {(position.attributes as Record<string, unknown>).ignition ? (
                <EngineIcon className={classes.success} />
              ) : (
                <EngineIcon className={classes.neutral} />
              )}
            </IconButton>
          </Tooltip>
        )}
        {position?.attributes && 'batteryLevel' in (position.attributes as Record<string, unknown>) && (
          <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(Number((position.attributes as Record<string, unknown>).batteryLevel))}`}>
            <IconButton size="small">
              {(Number((position.attributes as Record<string, unknown>).batteryLevel) > 70 &&
                ((position.attributes as Record<string, unknown>).charge ?
                  <BatteryChargingFullIcon fontSize="small" className={classes.success} /> :
                  <BatteryFullIcon fontSize="small" className={classes.success} />
                )) ||
                (Number((position.attributes as Record<string, unknown>).batteryLevel) > 30 &&
                  ((position.attributes as Record<string, unknown>).charge ?
                    <BatteryCharging60Icon fontSize="small" className={classes.warning} /> :
                    <Battery60Icon fontSize="small" className={classes.warning} />
                  )) ||
                ((position.attributes as Record<string, unknown>).charge ?
                  <BatteryCharging20Icon fontSize="small" className={classes.error} /> :
                  <Battery20Icon fontSize="small" className={classes.error} />
                )}
            </IconButton>
          </Tooltip>
        )}
      </ListItemButton>
    </div>
  );
};

interface DeviceListProps {
  devices: Record<string, unknown>;
}

/** 裝置列表（虛擬滾動） */
export const DeviceList: React.FC<DeviceListProps> = ({ devices }) => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((state) => state.devices.selectedId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(400);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // 根據容器高度調整列表高度
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        if (parent) {
          const newHeight = parent.clientHeight;
          if (newHeight > 0) {
            setListHeight(newHeight);
          }
        }
      }
    };
    // 延遲測量以確保版面已計算完成
    const timer = setTimeout(updateHeight, 100);
    updateHeight();
    window.addEventListener('resize', updateHeight);
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, []);

  // 每 60 秒強制重新渲染（更新相對時間）
  useEffect(() => {
    const interval = setInterval(forceUpdate, 60000);
    return () => clearInterval(interval);
  }, []);

  const devicesArray = useMemo(() => Object.values(devices ?? {}), [devices]);
  const handleSelect = (id: number) => dispatch(devicesActions.selectId(id));

  const itemData = useMemo(() => ({
    devices: devicesArray,
    onSelect: handleSelect,
    selectedId,
    classes,
  }), [devicesArray, handleSelect, selectedId, classes]);

  return (
    <div ref={containerRef} style={{ height: '100%' }}>
      <List
        className={classes.list}
        height={listHeight}
        rowCount={devicesArray.length}
        rowHeight={ROW_HEIGHT}
        rowProps={itemData}
        overscanCount={5}
        rowComponent={DeviceRow}
      />
    </div>
  );
};
