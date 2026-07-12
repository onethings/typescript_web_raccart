/**
 * 設定頁面側邊導航選單
 *
 * 包含偏好設定、通知、使用者、裝置、圍欄、群組等選單項目。
 * 對應 FRONTME.md 7.1 SettingsMenu 章節。
 */

import React from 'react';
import { Divider, List } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import DrawIcon from '@mui/icons-material/Draw';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import TodayIcon from '@mui/icons-material/Today';
import SendIcon from '@mui/icons-material/Send';
import DnsIcon from '@mui/icons-material/Dns';
import HelpIcon from '@mui/icons-material/Help';
import PaymentIcon from '@mui/icons-material/Payment';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppStore';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useAdministrator, useManager, useRestriction } from '../../utils/permissions';
import { MenuItem } from './MenuItem';

/** 設定頁面側邊選單 */
export const SettingsMenu: React.FC = () => {
  const t = useTranslation();
  const location = useLocation();

  const readonly = useRestriction('readonly');
  const admin = useAdministrator();
  const manager = useManager();
  const userId = useAppSelector((state) => state.session.user?.id);
  const supportLink = useAppSelector(
    (state) => state.session.server?.attributes?.support as string | undefined,
  );
  const billingLink = useAppSelector(
    (state) => state.session.user?.attributes?.billingLink as string | undefined,
  );

  return (
    <>
      <List>
        <MenuItem
          title={t('sharedPreferences')}
          link="/settings/preferences"
          icon={<TuneIcon />}
          selected={location.pathname === '/settings/preferences'}
        />
        {!readonly && (
          <>
            <MenuItem
              title={t('sharedNotifications')}
              link="/settings/notifications"
              icon={<NotificationsIcon />}
              selected={location.pathname.startsWith('/settings/notification')}
            />
            <MenuItem
              title={t('settingsUser')}
              link={`/settings/user/${userId}`}
              icon={<PersonIcon />}
              selected={location.pathname === `/settings/user/${userId}`}
            />
            <MenuItem
              title={t('deviceTitle')}
              link="/settings/devices"
              icon={<DnsIcon />}
              selected={location.pathname.startsWith('/settings/device') && !location.pathname.includes('/connections') && !location.pathname.includes('/command')}
            />
            <MenuItem
              title={t('sharedGeofences')}
              link="/geofences"
              icon={<DrawIcon />}
              selected={location.pathname.startsWith('/settings/geofence')}
            />
            <MenuItem
              title={t('settingsGroups')}
              link="/settings/groups"
              icon={<FolderIcon />}
              selected={location.pathname.startsWith('/settings/group')}
            />
            <MenuItem
              title={t('sharedDrivers')}
              link="/settings/drivers"
              icon={<PersonIcon />}
              selected={location.pathname.startsWith('/settings/driver')}
            />
            <MenuItem
              title={t('sharedCalendars')}
              link="/settings/calendars"
              icon={<TodayIcon />}
              selected={location.pathname.startsWith('/settings/calendar')}
            />
            <MenuItem
              title={t('sharedComputedAttributes')}
              link="/settings/attributes"
              icon={<CalculateIcon />}
              selected={location.pathname.startsWith('/settings/attribute')}
            />
            <MenuItem
              title={t('sharedMaintenance')}
              link="/settings/maintenances"
              icon={<BuildIcon />}
              selected={location.pathname.startsWith('/settings/maintenance')}
            />
            <MenuItem
              title={t('sharedSavedCommands')}
              link="/settings/commands"
              icon={<SendIcon />}
              selected={location.pathname.startsWith('/settings/command')}
            />
          </>
        )}
        {billingLink && (
          <MenuItem title="Billing" link={billingLink} icon={<PaymentIcon />} external />
        )}
        {supportLink && (
          <MenuItem title="Support" link={supportLink} icon={<HelpIcon />} external />
        )}
      </List>
      {manager && (
        <>
          <Divider />
          <List>
            <MenuItem
              title="Announcement"
              link="/settings/announcement"
              icon={<CampaignIcon />}
              selected={location.pathname === '/settings/announcement'}
            />
            {admin && (
              <MenuItem
                title={t('settingsServer')}
                link="/settings/server"
                icon={<SettingsIcon />}
                selected={location.pathname === '/settings/server'}
              />
            )}
            <MenuItem
              title={t('settingsUsers')}
              link="/settings/users"
              icon={<PeopleIcon />}
              selected={location.pathname.startsWith('/settings/user') && !location.pathname.includes(`/settings/user/${userId}`)}
            />
          </List>
        </>
      )}
    </>
  );
};
