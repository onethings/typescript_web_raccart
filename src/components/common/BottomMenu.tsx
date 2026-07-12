/**
 * 手機版底部導航選單
 *
 * 提供地圖、報表、設定、帳號/登出等導航。
 * 對應 FRONTME.md 12.3 BottomMenu 章節。
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  Typography,
  Badge,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useRestriction } from '../../utils/permissions';
import { sessionActions } from '../../store';
import { logout } from '../../api/endpoints';

export const BottomMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const disableReports = useRestriction('disableReports');
  const user = useAppSelector((state) => state.session.user);
  const socket = useAppSelector((state) => state.session.socket);
  const selectedDeviceId = useAppSelector((state) => state.devices.selectedId);
  const devices = useAppSelector((state) => state.devices.items);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  /** 目前選取標籤 */
  const currentSelection = (): string | undefined => {
    if (location.pathname === `/settings/user/${user?.id}`) return 'account';
    if (location.pathname.startsWith('/settings')) return 'settings';
    if (location.pathname.startsWith('/reports')) return 'reports';
    if (location.pathname === '/') return 'map';
    return undefined;
  };

  const handleAccount = () => {
    setAnchorEl(null);
    navigate(`/settings/user/${user?.id}`);
  };

  /** 登出 */
  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      await logout();
    } catch {
      // 忽略錯誤
    }
    dispatch(sessionActions.updateUser(null));
    navigate('/login');
  };

  const handleSelection = (_: React.SyntheticEvent, value: string) => {
    switch (value) {
      case 'map':
        navigate('/');
        break;
      case 'reports': {
        const id = selectedDeviceId || Object.keys(devices)[0];
        navigate(id ? `/reports/combined?deviceId=${id}` : '/reports/combined');
        break;
      }
      case 'settings':
        navigate('/settings/preferences?menu=true');
        break;
      case 'account':
        setAnchorEl(_.currentTarget as HTMLElement);
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  return (
    <Paper square elevation={3}>
      <BottomNavigation value={currentSelection()} onChange={handleSelection} showLabels>
        <BottomNavigationAction
          label={t('mapTitle')}
          icon={
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <MapIcon />
            </Badge>
          }
          value="map"
        />
        {!disableReports && (
          <BottomNavigationAction
            label={t('reportTitle')}
            icon={<DescriptionIcon />}
            value="reports"
          />
        )}
        {!readonly && (
          <BottomNavigationAction
            label={t('settingsTitle')}
            icon={<SettingsIcon />}
            value="settings"
          />
        )}
        {readonly ? (
          <BottomNavigationAction
            label={t('loginLogout')}
            icon={<ExitToAppIcon />}
            value="logout"
          />
        ) : (
          <BottomNavigationAction
            label={t('settingsUser')}
            icon={<PersonIcon />}
            value="account"
          />
        )}
      </BottomNavigation>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleAccount}>
          <Typography color="textPrimary">{t('settingsUser')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography color="error">{t('loginLogout')}</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
};
