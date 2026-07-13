/**
 * 通知規則編輯/新增頁面
 *
 * 設定通知類型、警示、傳送管道、指令、日曆、圍欄等。
 * 對應 FRONTME.md 7.8 NotificationPage 章節。
 */

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from 'tss-react/mui';
import { EditItemView } from '../../components/common/EditItemView';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useCatch, useAsyncTask } from '../../hooks/useAsyncTask';
import { prefixString } from '../../utils/stringUtils';
import { fetchOrThrow } from '../../utils/fetchOrThrow';
import type { Notification, NotificationType, Geofence, Calendar } from '../../types/models';
import { getNotificationTypes } from '../../api/endpoints';

const useStyles = makeStyles()((theme) => ({
  details: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
}));

const defaultNotification: Notification = {
  id: 0,
  type: '',
  always: false,
  notificators: 'web',
  attributes: {},
};

const alarmKeys = [
  { key: 'sos', name: 'alarmSos' },
  { key: 'geofence', name: 'alarmGeofence' },
  { key: 'battery', name: 'alarmBattery' },
  { key: 'speed', name: 'alarmSpeed' },
  { key: 'remove', name: 'alarmRemove' },
  { key: 'powerCut', name: 'alarmPowerCut' },
];

export const NotificationPage: React.FC = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const [item, setItem] = useState<Notification | null>(null);
  const [types, setTypes] = useState<NotificationType[]>([]);
  const [notificators, setNotificators] = useState<{ type: string }[]>([]);
  const [commands, setCommands] = useState<{ id: number; description: string }[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);

  // 載入選項資料
  useAsyncTask(async ({ signal }) => {
    const [typesRes, notifRes, cmdRes, calRes, geoRes] = await Promise.all([
      getNotificationTypes(),
      fetchOrThrow('/api/notifications/notificators', { signal }).then((r) => r.json()),
      fetchOrThrow('/api/commands', { signal }).then((r) => r.json()),
      fetchOrThrow('/api/calendars', { signal }).then((r) => r.json()),
      fetchOrThrow('/api/geofences', { signal }).then((r) => r.json()),
    ]);
    if (!signal.aborted) {
      setTypes(typesRes.data);
      setNotificators(notifRes);
      setCommands(cmdRes);
      setCalendars(calRes);
      setGeofences(geoRes);
    }
  }, []);

  /** 取得 item 的 attribute */
  const getAttr = (key: string, defaultValue?: unknown) => {
    const attrs = (item?.attributes as Record<string, unknown>) || {};
    return key in attrs ? attrs[key] : defaultValue;
  };

  /** 設定 item 的 attribute */
  const setAttr = (key: string, value: unknown) => {
    if (!item) return;
    setItem({
      ...item,
      attributes: { ...(item.attributes as Record<string, unknown> || {}), [key]: value },
    });
  };

  /** 刪除 item 的 attribute */
  const removeAttr = (key: string) => {
    if (!item) return;
    const attrs = { ...(item.attributes as Record<string, unknown> || {}) };
    delete attrs[key];
    setItem({ ...item, attributes: attrs });
  };

  /** 測試通知 */
  const handleTest = useCatch(async () => {
    if (!item?.notificators) return;
    await Promise.all(
      item.notificators.split(/[, ]+/).map(async (notificator) => {
        await fetchOrThrow(`/api/notifications/test/${notificator}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }),
    );
  });

  /** 驗證 */
  const validate = (): boolean => {
    if (!item) return false;
    return !!(
      item.type &&
      item.notificators &&
      (!item.notificators.includes('command') || item.commandId)
    );
  };

  return (
    <EditItemView<Notification>
      endpoint="notifications"
      item={item}
      setItem={setItem}
      defaultItem={defaultNotification}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedNotification']}
    >
      {item && (
        <>
          {/* ==================== Required ==================== */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <FormControl size="small">
                <InputLabel>{t('sharedType')}</InputLabel>
                <Select
                  label={t('sharedType')}
                  value={item.type}
                  onChange={(e) => setItem({ ...item, type: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>{t('sharedDisabled')}</em>
                  </MenuItem>
                  {types.map((nt) => (
                    <MenuItem key={nt.type} value={nt.type}>
                      {t(prefixString('event', nt.type))}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {item.type === 'alarm' && (
                <FormControl size="small">
                  <InputLabel>{t('sharedAlarms')}</InputLabel>
                  <Select
                    label={t('sharedAlarms')}
                    multiple
                    value={
                      getAttr('alarms')
                        ? String(getAttr('alarms')).split(/[, ]+/)
                        : []
                    }
                    onChange={(e) => {
                      const selected = e.target.value as string[];
                      setAttr('alarms', selected.join(','));
                    }}
                  >
                    {alarmKeys.map((alarm) => (
                      <MenuItem key={alarm.key} value={alarm.key}>
                        {t(alarm.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl size="small">
                <InputLabel>{t('notificationNotificators')}</InputLabel>
                <Select
                  label={t('notificationNotificators')}
                  multiple
                  value={item.notificators ? item.notificators.split(/[, ]+/) : []}
                  onChange={(e) => {
                    const selected = e.target.value as string[];
                    setItem({ ...item, notificators: selected.join(',') });
                  }}
                >
                  {notificators.map((n) => (
                    <MenuItem key={n.type} value={n.type}>
                      {t(prefixString('notificator', n.type))}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {item.notificators?.includes('command') && (
                <FormControl size="small">
                  <InputLabel>{t('sharedSavedCommand')}</InputLabel>
                  <Select
                    label={t('sharedSavedCommand')}
                    value={item.commandId || ''}
                    onChange={(e) => setItem({ ...item, commandId: Number(e.target.value) })}
                  >
                    {commands.map((cmd) => (
                      <MenuItem key={cmd.id} value={cmd.id}>
                        {cmd.description || `#${cmd.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                variant="outlined"
                color="primary"
                onClick={handleTest}
                disabled={!item.notificators}
              >
                {t('sharedTestNotificators')}
              </Button>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!item.always}
                      onChange={(e) => setItem({ ...item, always: e.target.checked })}
                    />
                  }
                  label={t('notificationAlways')}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* ==================== Extra ==================== */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedExtra')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                size="small"
                value={item.description || ''}
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                label={t('sharedDescription')}
              />

              <FormControl size="small">
                <InputLabel>{t('sharedCalendar')}</InputLabel>
                <Select
                  label={t('sharedCalendar')}
                  value={item.calendarId || ''}
                  onChange={(e) => setItem({ ...item, calendarId: Number(e.target.value) || undefined })}
                >
                  <MenuItem value="">{t('sharedDisabled')}</MenuItem>
                  {calendars.map((cal) => (
                    <MenuItem key={cal.id} value={cal.id}>
                      {cal.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {['geofenceEnter', 'geofenceExit'].includes(item.type) && (
                <FormControl size="small">
                  <InputLabel>{t('sharedGeofences')}</InputLabel>
                  <Select
                    label={t('sharedGeofences')}
                    multiple
                    value={
                      getAttr('geofenceIds')
                        ? String(getAttr('geofenceIds')).split(',')
                        : []
                    }
                    onChange={(e) => {
                      const selected = e.target.value as string[];
                      if (selected.length > 0) {
                        setAttr('geofenceIds', selected.join(','));
                      } else {
                        removeAttr('geofenceIds');
                      }
                    }}
                  >
                    {geofences.map((geo) => (
                      <MenuItem key={geo.id} value={String(geo.id)}>
                        {geo.name || `#${geo.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!getAttr('priority', false)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAttr('priority', true);
                        } else {
                          removeAttr('priority');
                        }
                      }}
                    />
                  }
                  label={t('sharedPriority')}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};
