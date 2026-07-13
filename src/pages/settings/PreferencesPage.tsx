/**
 * 使用者偏好設定頁面
 *
 * 管理使用者個人偏好：地圖、裝置、音效、Token、系統資訊。
 * 對應 FRONTME.md 7.14 PreferencesPage 章節。
 */

import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormGroup,
  OutlinedInput,
  InputAdornment,
  Autocomplete,
  createFilterOptions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CachedIcon from '@mui/icons-material/Cached';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useCatch } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { SelectField } from '../../components/common/SelectField';
import { sessionActions } from '../../store';
import { updateUser, generateToken } from '../../api/endpoints';
import { usePositionAttributes } from '../../attributes/usePositionAttributes';
import { useMapStyles } from '../../map/core/useMapStyles';
import { useMapOverlays } from '../../map/overlay/useMapOverlays';
import { useAdministrator, useRestriction } from '../../utils/permissions';
import { fetchOrThrow } from '../../utils/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  container: { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3) },
  details: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
  buttons: { display: 'flex', gap: theme.spacing(1), justifyContent: 'flex-end', marginTop: theme.spacing(3) },
  verticalActions: { display: 'flex', flexDirection: 'column', gap: theme.spacing(0.5) },
}));

const deviceFieldKeys = [
  { id: 'name', nameKey: 'sharedName' },
  { id: 'uniqueId', nameKey: 'deviceIdentifier' },
  { id: 'phone', nameKey: 'sharedPhone' },
  { id: 'model', nameKey: 'deviceModel' },
  { id: 'contact', nameKey: 'deviceContact' },
  { id: 'geofenceIds', nameKey: 'sharedGeofence' },
  { id: 'driverUniqueId', nameKey: 'sharedDriver' },
  { id: 'motion', nameKey: 'positionMotion' },
];

const alarmKeys = [
  { key: 'sos', name: 'alarmSos' },
  { key: 'geofence', name: 'alarmGeofence' },
  { key: 'battery', name: 'alarmBattery' },
  { key: 'speed', name: 'alarmSpeed' },
  { key: 'remove', name: 'alarmRemove' },
  { key: 'powerCut', name: 'alarmPowerCut' },
];

/** 偏好設定頁面 */
export const PreferencesPage: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const user = useAppSelector((state) => state.session.user)!;
  const server = useAppSelector((state) => state.session.server);
  const socket = useAppSelector((state) => state.session.socket);

  const admin = useAdministrator();
  const readonly = useRestriction('readonly');

  const userAttributes = user.attributes as Record<string, unknown> | undefined;
  const [attributes, setAttributes] = useState<Record<string, unknown>>(
    userAttributes ? { ...userAttributes } : {},
  );

  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiration, setTokenExpiration] = useState(() =>
    dayjs().add(1, 'week').locale('en').format('YYYY-MM-DD'),
  );

  const mapStyles = useMapStyles();
  const mapOverlays = useMapOverlays();
  const positionAttributes = usePositionAttributes(t);
  const filter = createFilterOptions<{ inputValue?: string; name?: string }>();

  const versionApp = import.meta.env.VITE_APP_VERSION || 'N/A';
  const versionServer = server?.version || '-';

  /** 更新 attributes */
  const setAttribute = (key: string, value: unknown) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  /** 產生 Token */
  const handleGenerateToken = useCatch(async () => {
    const expiration = dayjs(tokenExpiration, 'YYYY-MM-DD').toISOString();
    const response = await fetchOrThrow('/api/session/token', {
      method: 'POST',
      body: new URLSearchParams(`expiration=${expiration}`),
    });
    setToken(await response.text());
  });

  /** 儲存偏好設定 */
  const handleSave = useCatch(async () => {
    const response = await fetchOrThrow(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, attributes }),
    });
    dispatch(sessionActions.updateUser(await response.json()));
    navigate(-1);
  });

  /** 重新啟動伺服器（管理員限定） */
  const handleReboot = useCatch(async () => {
    const response = await fetch('/api/server/reboot', { method: 'POST' });
    throw new Error(response.statusText);
  });

  const positionItemsDefault = ['fixTime', 'address', 'speed', 'totalDistance'];
  const positionItemsValue = (attributes.positionItems as string | undefined)?.split(',') || positionItemsDefault;

  /** 取得 mapStyles 的可用 id 列表 */
  const activeMapStylesDefault = ['locationIqStreets', 'locationIqDark', 'openFreeMap'];
  const activeMapStylesValue = (attributes.activeMapStyles as string | undefined)?.split(',') || activeMapStylesDefault;

  const selectedMapOverlayValue = (attributes.selectedMapOverlay as string | undefined)?.split(',') || [];

  const soundEventsValue = (attributes.soundEvents as string | undefined)?.split(',') || [];
  const soundAlarmsValue = (attributes.soundAlarms as string | undefined)?.split(',') || ['sos'];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedPreferences']}>
      <Container maxWidth="xs" className={classes.container}>
        {!readonly && (
          <>
            {/* ==================== Map ==================== */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('mapTitle')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <FormControl size="small">
                  <InputLabel>{t('mapActive')}</InputLabel>
                  <Select
                    label={t('mapActive')}
                    value={activeMapStylesValue}
                    multiple
                    onChange={(e, child) => {
                      if (!child || !('props' in child) || !child.props) return;
                      const clicked = mapStyles.find((s) => s.id === child.props.value);
                      if (!clicked) return;
                      if (clicked.available) {
                        const selected = e.target.value as string[];
                        setAttribute('activeMapStyles', selected.join(','));
                      } else if (clicked.id !== 'custom' && clicked.attribute) {
                        const query = new URLSearchParams({ attribute: clicked.attribute });
                        navigate(`/settings/user/${user.id}?${query.toString()}`);
                      }
                    }}
                  >
                    {mapStyles.map((style) => (
                      <MenuItem key={style.id} value={style.id}>
                        <Typography
                          component="span"
                          color={style.available ? 'textPrimary' : 'error'}
                        >
                          {style.name}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>{t('mapOverlay')}</InputLabel>
                  <Select
                    label={t('mapOverlay')}
                    value={selectedMapOverlayValue}
                    multiple
                    onChange={(e, child) => {
                      if (!child || !('props' in child) || !child.props) return;
                      const clicked = mapOverlays.find((o) => o.id === child.props.value);
                      if (!clicked) return;
                      if (clicked.available) {
                        const selected = e.target.value as string[];
                        setAttribute('selectedMapOverlay', selected.join(','));
                      } else if (clicked.id !== 'custom' && clicked.attribute) {
                        const query = new URLSearchParams({ attribute: clicked.attribute });
                        navigate(`/settings/user/${user.id}?${query.toString()}`);
                      }
                    }}
                  >
                    {mapOverlays.map((overlay) => (
                      <MenuItem key={overlay.id} value={overlay.id}>
                        <Typography
                          component="span"
                          color={overlay.available ? 'textPrimary' : 'error'}
                        >
                          {overlay.title}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Autocomplete
                  multiple
                  freeSolo
                  size="small"
                  options={positionAttributes.map((attr) => attr.key)}
                  getOptionLabel={(option) => {
                    if (typeof option === 'object' && option !== null && 'inputValue' in option) {
                      return (option as { inputValue: string }).inputValue;
                    }
                    const attr = positionAttributes.find((a) => a.key === option);
                    return attr?.name || String(option);
                  }}
                  value={positionItemsValue}
                  onChange={(_, newValue) => {
                    setAttribute(
                      'positionItems',
                      newValue
                        .map((x: string | { inputValue: string }) =>
                          typeof x === 'string' ? x : x.inputValue,
                        )
                        .join(','),
                    );
                  }}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    if (params.inputValue && !options.includes(params.inputValue)) {
                      filtered.push({
                        inputValue: params.inputValue,
                        name: `${t('sharedAdd')} "${params.inputValue}"`,
                      } as unknown as string);
                    }
                    return filtered;
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label={t('attributePopupInfo')} size="small" />
                  )}
                />

                <FormControl size="small">
                  <InputLabel>{t('mapLiveRoutes')}</InputLabel>
                  <Select
                    label={t('mapLiveRoutes')}
                    value={attributes.mapLiveRoutes || 'none'}
                    onChange={(e) => setAttribute('mapLiveRoutes', e.target.value)}
                  >
                    <MenuItem value="none">{t('sharedDisabled')}</MenuItem>
                    <MenuItem value="selected">{t('deviceSelected')}</MenuItem>
                    <MenuItem value="all">{t('notificationAlways')}</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>{t('mapDirection')}</InputLabel>
                  <Select
                    label={t('mapDirection')}
                    value={attributes.mapDirection || 'selected'}
                    onChange={(e) => setAttribute('mapDirection', e.target.value)}
                  >
                    <MenuItem value="none">{t('sharedDisabled')}</MenuItem>
                    <MenuItem value="selected">{t('deviceSelected')}</MenuItem>
                    <MenuItem value="all">{t('notificationAlways')}</MenuItem>
                  </Select>
                </FormControl>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          attributes.hasOwnProperty('mapFollow')
                            ? Boolean(attributes.mapFollow)
                            : false
                        }
                        onChange={(e) => setAttribute('mapFollow', e.target.checked)}
                      />
                    }
                    label={t('deviceFollow')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          attributes.hasOwnProperty('mapCluster')
                            ? Boolean(attributes.mapCluster)
                            : true
                        }
                        onChange={(e) => setAttribute('mapCluster', e.target.checked)}
                      />
                    }
                    label={t('mapClustering')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          attributes.hasOwnProperty('mapOnSelect')
                            ? Boolean(attributes.mapOnSelect)
                            : true
                        }
                        onChange={(e) => setAttribute('mapOnSelect', e.target.checked)}
                      />
                    }
                    label={t('mapOnSelect')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          attributes.hasOwnProperty('showGeofences')
                            ? Boolean(attributes.showGeofences)
                            : true
                        }
                        onChange={(e) => setAttribute('showGeofences', e.target.checked)}
                      />
                    }
                    label={t('attributeShowGeofences')}
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* ==================== Device ==================== */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('deviceTitle')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <FormControl size="small">
                  <InputLabel>{t('devicePrimaryInfo')}</InputLabel>
                  <Select
                    label={t('devicePrimaryInfo')}
                    value={attributes.devicePrimary || 'name'}
                    onChange={(e) => setAttribute('devicePrimary', e.target.value)}
                  >
                    {deviceFieldKeys.map((field) => (
                      <MenuItem key={field.id} value={field.id}>
                        {t(field.nameKey)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel>{t('deviceSecondaryInfo')}</InputLabel>
                  <Select
                    label={t('deviceSecondaryInfo')}
                    value={attributes.deviceSecondary || ''}
                    onChange={(e) => setAttribute('deviceSecondary', e.target.value)}
                  >
                    <MenuItem value="">{t('sharedDisabled')}</MenuItem>
                    {deviceFieldKeys.map((field) => (
                      <MenuItem key={field.id} value={field.id}>
                        {t(field.nameKey)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* ==================== Sound ==================== */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('sharedSound')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <SelectField
                  multiple
                  label={t('eventsSoundEvents')}
                  value={soundEventsValue}
                  onChange={(value) => {
                    const val = Array.isArray(value) ? value : [];
                    setAttribute('soundEvents', val.join(','));
                  }}
                  data={[]}
                />
                <FormControl size="small">
                  <InputLabel>{t('eventsSoundAlarms')}</InputLabel>
                  <Select
                    label={t('eventsSoundAlarms')}
                    value={soundAlarmsValue}
                    multiple
                    onChange={(e) => {
                      const selected = e.target.value as string[];
                      setAttribute('soundAlarms', selected.join(','));
                    }}
                  >
                    {alarmKeys.map((alarm) => (
                      <MenuItem key={alarm.key} value={alarm.key}>
                        {t(alarm.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>
          </>
        )}

        {/* ==================== User Token ==================== */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{t('userToken')}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <TextField
              size="small"
              label={t('userExpirationTime')}
              type="date"
              value={tokenExpiration}
              onChange={(e) => {
                setTokenExpiration(e.target.value);
                setToken(null);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl size="small">
              <OutlinedInput
                multiline
                rows={4}
                readOnly
                value={token || ''}
                placeholder={t('userToken')}
                endAdornment={
                  <InputAdornment position="end">
                    <div className={classes.verticalActions}>
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={handleGenerateToken}
                        disabled={!!token}
                      >
                        <CachedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={() => navigator.clipboard.writeText(token || '')}
                        disabled={!token}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </InputAdornment>
                }
              />
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {!readonly && (
          <>
            {/* ==================== Info ==================== */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('sharedInfoTitle')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  size="small"
                  value={versionApp}
                  label={t('settingsAppVersion')}
                  slotProps={{ input: { readOnly: true } }}
                />
                <TextField
                  size="small"
                  value={versionServer}
                  label={t('settingsServerVersion')}
                  slotProps={{ input: { readOnly: true } }}
                />
                <TextField
                  size="small"
                  value={socket ? t('deviceStatusOnline') : t('deviceStatusOffline')}
                  label={t('settingsConnection')}
                  slotProps={{ input: { readOnly: true } }}
                />
                <Button variant="outlined" color="primary" onClick={() => navigate('/emulator')}>
                  {t('sharedEmulator')}
                </Button>
                {admin && (
                  <Button variant="outlined" color="error" onClick={handleReboot}>
                    {t('serverReboot')}
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>

            {/* ==================== Buttons ==================== */}
            <div className={classes.buttons}>
              <Button type="button" color="primary" variant="outlined" onClick={() => navigate(-1)}>
                {t('sharedCancel')}
              </Button>
              <Button type="button" color="primary" variant="contained" onClick={handleSave}>
                {t('sharedSave')}
              </Button>
            </div>
          </>
        )}
      </Container>
    </PageLayout>
  );
};
