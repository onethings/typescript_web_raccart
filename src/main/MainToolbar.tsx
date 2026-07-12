/**
 * 主頁面工具列元件
 *
 * 包含裝置列表切換、關鍵字搜尋、篩選面板（狀態/群組/圍欄/排序/地圖篩選）。
 * 對應 FRONTME.md 4.2 MainToolbar 章節。
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Toolbar,
  IconButton,
  OutlinedInput,
  InputAdornment,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
  ListItemButton,
  ListItemText,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import MapIcon from '@mui/icons-material/Map';
import DnsIcon from '@mui/icons-material/Dns';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation, useLocalization } from '../i18n/LocalizationProvider';
import { useDeviceReadonly } from '../utils/permissions';
import { useAppSelector } from '../hooks/useAppStore';
import type { DeviceFilter } from './useFilter';

const useStyles = makeStyles()((theme) => ({
  toolbar: { display: 'flex', gap: theme.spacing(1) },
  filterPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    width: 360,
  },
}));

interface MainToolbarProps {
  filteredDevices: Record<string, unknown>[];
  devicesOpen: boolean;
  setDevicesOpen: (open: boolean) => void;
  keyword: string;
  setKeyword: (kw: string) => void;
  filter: DeviceFilter;
  setFilter: (f: DeviceFilter) => void;
  filterSort: string;
  setFilterSort: (s: string) => void;
  filterMap: boolean;
  setFilterMap: (m: boolean) => void;
}

/**
 * 主頁面工具列
 * 搜尋/篩選裝置、切換裝置列表顯示
 */
export const MainToolbar: React.FC<MainToolbarProps> = ({
  filteredDevices,
  devicesOpen,
  setDevicesOpen,
  keyword,
  setKeyword,
  filter,
  setFilter,
  filterSort,
  setFilterSort,
  filterMap,
  setFilterMap,
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const groups = useAppSelector((state) => state.groups.items);
  const devices = useAppSelector((state) => state.devices.items);
  const devicesLoaded = useAppSelector((state) => state.devices.loaded);
  const geofences = useAppSelector((state) => state.geofences.items);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [devicesAnchorEl, setDevicesAnchorEl] = useState<HTMLElement | null>(null);

  const deviceStatusCount = (status: string): number =>
    Object.values(devices).filter((d) => d.status === status).length;

  const hasActiveFilter =
    filter.statuses.length > 0 || filter.groups.length > 0 || filter.geofences.length > 0;

  return (
    <Toolbar ref={toolbarRef} className={classes.toolbar}>
      {/* 裝置列表切換 */}
      <IconButton edge="start" onClick={() => setDevicesOpen(!devicesOpen)}>
        {devicesOpen ? <MapIcon /> : <DnsIcon />}
      </IconButton>

      {/* 搜尋輸入框 */}
      <OutlinedInput
        ref={inputRef}
        placeholder={t('sharedSearchDevices')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setDevicesAnchorEl(toolbarRef.current)}
        onBlur={() => setTimeout(() => setDevicesAnchorEl(null), 200)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              size="small"
              edge="end"
              onClick={() => setFilterAnchorEl(inputRef.current)}
            >
              <Badge color="info" variant="dot" invisible={!hasActiveFilter}>
                <TuneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </InputAdornment>
        }
        size="small"
        fullWidth
      />

      {/* 裝置預覽 Popover（搜尋焦點時顯示前 3 筆） */}
      <Popover
        open={Boolean(devicesAnchorEl) && !devicesOpen}
        anchorEl={devicesAnchorEl}
        onClose={() => setDevicesAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        marginThreshold={0}
        slotProps={{
          paper: {
            style: {
              width: toolbarRef.current
                ? `calc(${toolbarRef.current.clientWidth}px - ${theme.spacing(4)})`
                : undefined,
            },
          },
        }}
        elevation={1}
        disableAutoFocus
        disableEnforceFocus
      >
        {filteredDevices.slice(0, 3).map((_, index) => (
          <ListItemButton key={(filteredDevices[index] as { id: number }).id}>
            <ListItemText
              primary={(filteredDevices[index] as { name?: string }).name ?? ''}
            />
          </ListItemButton>
        ))}
        {filteredDevices.length > 3 && (
          <ListItemButton
            alignItems="center"
            onClick={() => {
              setDevicesOpen(true);
              setDevicesAnchorEl(null);
            }}
          >
            <ListItemText
              primary={t('notificationAlways')}
              style={{ textAlign: 'center' }}
            />
          </ListItemButton>
        )}
      </Popover>

      {/* 篩選面板 Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <div className={classes.filterPanel}>
          <FormControl>
            <InputLabel>{t('deviceStatus')}</InputLabel>
            <Select
              label={t('deviceStatus')}
              value={filter.statuses}
              onChange={(e) =>
                setFilter({ ...filter, statuses: e.target.value as string[] })
              }
              multiple
            >
              <MenuItem value="online">
                {`${t('deviceStatusOnline')} (${deviceStatusCount('online')})`}
              </MenuItem>
              <MenuItem value="offline">
                {`${t('deviceStatusOffline')} (${deviceStatusCount('offline')})`}
              </MenuItem>
              <MenuItem value="unknown">
                {`${t('deviceStatusUnknown')} (${deviceStatusCount('unknown')})`}
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>{t('settingsGroups')}</InputLabel>
            <Select
              label={t('settingsGroups')}
              value={filter.groups}
              onChange={(e) =>
                setFilter({ ...filter, groups: e.target.value as number[] })
              }
              multiple
            >
              {Object.values(groups)
                .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
                .map((group) => (
                  <MenuItem key={group.id} value={group.id!}>
                    {group.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>{t('sharedGeofences')}</InputLabel>
            <Select
              label={t('sharedGeofences')}
              value={filter.geofences}
              onChange={(e) =>
                setFilter({ ...filter, geofences: e.target.value as number[] })
              }
              multiple
            >
              {Object.values(geofences)
                .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
                .map((gf) => (
                  <MenuItem key={gf.id} value={gf.id!}>
                    {gf.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>{t('sharedSortBy')}</InputLabel>
            <Select
              label={t('sharedSortBy')}
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
            >
              <MenuItem value="">{'\u00a0'}</MenuItem>
              <MenuItem value="name">{t('sharedName')}</MenuItem>
              <MenuItem value="lastUpdate">{t('deviceLastUpdate')}</MenuItem>
            </Select>
          </FormControl>

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterMap}
                  onChange={(e) => setFilterMap(e.target.checked)}
                />
              }
              label={t('sharedFilterMap')}
            />
          </FormGroup>
        </div>
      </Popover>

      {/* 新增裝置按鈕 */}
      <IconButton
        edge="end"
        onClick={() => navigate('/settings/device')}
        disabled={deviceReadonly}
      >
        <Tooltip
          open={!deviceReadonly && devicesLoaded && Object.keys(devices).length === 0}
          title={t('deviceRegisterFirst')}
          arrow
        >
          <AddIcon />
        </Tooltip>
      </IconButton>

      {/* 語言切換 */}
      <LanguageSwitcher />
    </Toolbar>
  );
};

// ==================== 語言切換器 ====================

const LanguageSwitcher: React.FC = () => {
  const { languages, language, setLocalLanguage } = useLocalization();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title="Language">
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <LanguageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ maxHeight: 300, overflow: 'auto', py: 1 }}>
          {Object.entries(languages).map(([code, meta]) => (
            <MenuItem
              key={code}
              selected={language === code}
              onClick={() => { setLocalLanguage(code); setAnchorEl(null); }}
              sx={{ minWidth: 200 }}
            >
              <Typography variant="body2" sx={{ mr: 1 }}>
                {code === 'en' ? '🇺🇸' : code === 'zh' ? '🇨🇳' : code === 'zh_TW' ? '🇹🇼' : ''}
              </Typography>
              <Typography variant="body2">{meta.name || code}</Typography>
            </MenuItem>
          ))}
        </Box>
      </Popover>
    </>
  );
};
