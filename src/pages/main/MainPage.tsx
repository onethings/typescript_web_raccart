/**
 * 主頁面（即時追蹤地圖）
 *
 * 整合地圖、裝置列表、狀態卡片、底部導航。
 * 對應 FRONTME.md 4.1 MainPage 章節。
 */

import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { devicesActions } from '../../store';
import { useAttributePreference } from '../../utils/preferences';
import type { Position } from '../../types/models';
import { StatusCard } from '../../components/common/StatusCard';
import { BottomMenu } from '../../components/common/BottomMenu';
import { DeviceList } from '../../components/common/DeviceList';
import { EventsDrawer } from '../../components/common/EventsDrawer';
import { MainToolbar } from '../../main/MainToolbar';
import { useFilter } from '../../main/useFilter';
import type { DeviceFilter } from '../../main/useFilter';

const MainMap = lazy(() => import('./MainMap').then((m) => ({ default: m.MainMap })));

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: `calc(100% - ${theme.spacing(3)})`,
      width: theme.dimensions.drawerWidthDesktop,
      margin: theme.spacing(1.5),
      zIndex: 3,
    },
    [theme.breakpoints.down('md')]: { height: '100%', width: '100%' },
  },
  header: { pointerEvents: 'auto', zIndex: 6 },
  deviceArea: {
    pointerEvents: 'auto',
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
  footer: { pointerEvents: 'auto', zIndex: 5 },
}));

/**
 * 主頁面
 * GPS 追蹤系統的首頁
 */
export const MainPage: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const selectedDeviceId = useAppSelector((state) => state.devices.selectedId);
  const positions = useAppSelector((state) => state.session.positions);
  const devices = useAppSelector((state) => state.devices.items);

  const mapOnSelect = useAttributePreference('mapOnSelect', true);
  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);

  // 篩選狀態
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<DeviceFilter>({ statuses: [], groups: [], geofences: [] });
  const [filterSort, setFilterSort] = useState('');
  const [filterMap, setFilterMap] = useState(false);
  const [filteredDevices, setFilteredDevices] = useState<Record<string, unknown>[]>([]);
  const [filteredPositionsArray, setFilteredPositions] = useState<Position[]>([]);

  // 篩選邏輯
  useFilter(keyword, filter, filterSort, filterMap, positions, setFilteredDevices, setFilteredPositions);

  React.useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) setDevicesOpen(false);
  }, [desktop, mapOnSelect, selectedDeviceId]);

  const onEventsClick = useCallback(() => { setEventsOpen(true); }, []);

  const filteredPositions = useMemo(
    () => filteredPositionsArray.length > 0 ? filteredPositionsArray : Object.values(positions).filter(Boolean),
    [filteredPositionsArray, positions],
  );
  const selectedPosition = selectedDeviceId ? positions[selectedDeviceId] : undefined;

  return (
    <div className={classes.root}>
      {desktop && (
        <Suspense fallback={null}>
          <MainMap
            filteredPositions={filteredPositions}
            selectedPosition={selectedPosition}
            onEventsClick={onEventsClick}
          />
        </Suspense>
      )}
      <div className={classes.sidebar}>
        <Paper square elevation={3} className={classes.header}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
          />
        </Paper>
        <div className={classes.deviceArea}>
          <DeviceList devices={filteredDevices.length > 0
            ? Object.fromEntries(filteredDevices.map((d) => [(d as { id: number }).id, d]))
            : (devices ?? {})}
          />
        </div>
        {!desktop && (
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <Suspense fallback={null}>
              <MainMap
                filteredPositions={filteredPositions}
                selectedPosition={selectedPosition}
                onEventsClick={onEventsClick}
              />
            </Suspense>
          </div>
        )}
        {desktop && (
          <div className={classes.footer}>
            <BottomMenu />
          </div>
        )}
      </div>
      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
          desktopPadding={desktop ? parseInt(String(theme.dimensions.drawerWidthDesktop), 10) : 0}
        />
      )}
      {/* 事件抽屜 */}
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
    </div>
  );
};
