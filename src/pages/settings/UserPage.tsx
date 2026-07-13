/**
 * 使用者編輯/新增頁面
 *
 * 管理使用者資訊、偏好、位置、權限、屬性、Token。
 * 支援從偏好設定頁面跳轉至指定屬性（?attribute=xxx）。
 * 對應 FRONTME.md 7.4 UserPage 章節。
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormGroup,
  Button,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CachedIcon from '@mui/icons-material/Cached';
import CloseIcon from '@mui/icons-material/Close';
import { makeStyles } from 'tss-react/mui';
import { EditItemView } from '../../components/common/EditItemView';
import { EditAttributesAccordion } from '../../components/common/EditAttributesAccordion';
import { PasswordField } from '../../components/common/PasswordField';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useMapStyles } from '../../map/core/useMapStyles';
import { map } from '../../map/core/MapView';
import { useCommonUserAttributes } from '../../attributes/useCommonUserAttributes';
import { useUserAttributes } from '../../attributes/useUserAttributes';
import { useAdministrator, useRestriction, useManager } from '../../utils/permissions';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useCatch } from '../../hooks/useAsyncTask';
import { sessionActions } from '../../store';
import { fetchOrThrow } from '../../utils/fetchOrThrow';
import type { User } from '../../types/models';

const useStyles = makeStyles()((theme) => ({
  details: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
}));

const defaultUser: Record<string, unknown> = {};

/** 使用者編輯頁面 */
export const UserPage: React.FC = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const manager = useManager();
  const fixedEmail = useRestriction('fixedEmail');

  const currentUser = useAppSelector((state) => state.session.user)!;
  const server = useAppSelector((state) => state.session.server);

  const registrationEnabled = server?.registration;
  const openIdForced = (server?.attributes as Record<string, unknown>)?.openIdForce as boolean | undefined;
  const totpEnable = (server?.attributes as Record<string, unknown>)?.totpEnable as boolean | undefined;
  const totpForce = (server?.attributes as Record<string, unknown>)?.totpForce as boolean | undefined;

  const mapStyles = useMapStyles();
  const commonUserAttributes = useCommonUserAttributes();
  const userAttrs = useUserAttributes();

  const { id } = useParams();
  const [item, setItem] = useState<Record<string, unknown> | null>(
    id === String(currentUser.id) ? (currentUser as unknown as Record<string, unknown>) : null,
  );

  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeToken, setRevokeToken] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const attribute = searchParams.get('attribute');
  const [requiredExpanded] = useState(() => !attribute);

  // 處理從偏好設定跳轉過來的 API key 屬性
  useEffect(() => {
    if (item && attribute) {
      const attrs = (item.attributes as Record<string, unknown>) || {};
      if (!(attribute in attrs)) {
        setItem({
          ...item,
          attributes: { ...attrs, [attribute]: '' },
        });
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('attribute');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [item, searchParams, setSearchParams, attribute]);

  /** 刪除帳號 */
  const handleDelete = useCatch(async () => {
    if (deleteEmail === currentUser.email) {
      setDeleteFailed(false);
      await fetchOrThrow(`/api/users/${currentUser.id}`, { method: 'DELETE' });
      navigate('/login');
      dispatch(sessionActions.updateUser(null));
    } else {
      setDeleteFailed(true);
    }
  });

  /** 產生 TOTP Key */
  const handleGenerateTotp = useCatch(async () => {
    const response = await fetchOrThrow('/api/users/totp', { method: 'POST' });
    setItem({ ...item, totpKey: await response.text() });
  });

  /** 關閉撤銷 Token 對話框 */
  const closeRevokeDialog = () => {
    setRevokeDialogOpen(false);
    setRevokeToken('');
  };

  /** 撤銷 Token */
  const handleRevokeToken = useCatch(async () => {
    await fetchOrThrow('/api/session/token/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: revokeToken }).toString(),
    });
    closeRevokeDialog();
  });

  /** 儲存成功回呼 */
  const onItemSaved = (result: Record<string, unknown>) => {
    if (result.id === currentUser.id) {
      dispatch(sessionActions.updateUser(result as unknown as User));
    }
  };

  /** 驗證 */
  const validate = (): boolean => {
    if (!item) return false;
    const i = item as Record<string, unknown>;
    return !!(
      i.name &&
      i.email &&
      (i.id || i.password || openIdForced) &&
      (admin || !totpForce || i.totpKey)
    );
  };

  /** 取得 item 屬性值 */
  const getAttr = (key: string, defaultValue: unknown = '') => {
    const attrs = (item?.attributes as Record<string, unknown>) || {};
    return key in attrs ? attrs[key] : defaultValue;
  };

  /** 設定 item 屬性值 */
  const setAttr = (key: string, value: unknown) => {
    if (!item) return;
    setItem({
      ...item,
      attributes: { ...(item.attributes as Record<string, unknown> || {}), [key]: value },
    });
  };

  return (
    <EditItemView
      endpoint="users"
      item={item}
      setItem={setItem}
      defaultItem={defaultUser}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsUser']}
    >
      {item && (
        <>
          {/* ==================== Required ==================== */}
          <Accordion defaultExpanded={requiredExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                size="small"
                value={(item.name as string) || ''}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                label={t('sharedName')}
              />
              <TextField
                size="small"
                value={(item.email as string) || ''}
                onChange={(e) => setItem({ ...item, email: e.target.value })}
                label={t('userEmail')}
                disabled={fixedEmail && item.id === currentUser.id}
              />
              {!openIdForced && (
                <PasswordField
                  size="small"
                  value={(item.password as string) || ''}
                  onChange={(e) => setItem({ ...item, password: e.target.value })}
                  label={t('userPassword')}
                />
              )}
              {totpEnable && (
                <FormControl size="small">
                  <InputLabel>{t('loginTotpKey')}</InputLabel>
                  <OutlinedInput
                    readOnly
                    label={t('loginTotpKey')}
                    value={(item.totpKey as string) || ''}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end" onClick={handleGenerateTotp}>
                          <CachedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => setItem({ ...item, totpKey: null })}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              )}
            </AccordionDetails>
          </Accordion>

          {/* ==================== Preferences ==================== */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedPreferences')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                size="small"
                value={(item.phone as string) || ''}
                onChange={(e) => setItem({ ...item, phone: e.target.value })}
                label={t('sharedPhone')}
              />
              <FormControl size="small">
                <InputLabel>{t('mapDefault')}</InputLabel>
                <Select
                  label={t('mapDefault')}
                  value={(item.map as string) || 'locationIqStreets'}
                  onChange={(e) => setItem({ ...item, map: e.target.value })}
                >
                  {mapStyles
                    .filter((style) => style.available)
                    .map((style) => (
                      <MenuItem key={style.id} value={style.id}>
                        <Typography component="span">{style.name}</Typography>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>{t('settingsCoordinateFormat')}</InputLabel>
                <Select
                  label={t('settingsCoordinateFormat')}
                  value={(item.coordinateFormat as string) || 'dd'}
                  onChange={(e) => setItem({ ...item, coordinateFormat: e.target.value })}
                >
                  <MenuItem value="dd">{t('sharedDecimalDegrees')}</MenuItem>
                  <MenuItem value="ddm">{t('sharedDegreesDecimalMinutes')}</MenuItem>
                  <MenuItem value="dms">{t('sharedDegreesMinutesSeconds')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>{t('settingsSpeedUnit')}</InputLabel>
                <Select
                  label={t('settingsSpeedUnit')}
                  value={getAttr('speedUnit', 'kn')}
                  onChange={(e) => setAttr('speedUnit', e.target.value)}
                >
                  <MenuItem value="kn">{t('sharedKn')}</MenuItem>
                  <MenuItem value="kmh">{t('sharedKmh')}</MenuItem>
                  <MenuItem value="mph">{t('sharedMph')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>{t('settingsDistanceUnit')}</InputLabel>
                <Select
                  label={t('settingsDistanceUnit')}
                  value={getAttr('distanceUnit', 'km')}
                  onChange={(e) => setAttr('distanceUnit', e.target.value)}
                >
                  <MenuItem value="km">{t('sharedKm')}</MenuItem>
                  <MenuItem value="mi">{t('sharedMi')}</MenuItem>
                  <MenuItem value="nmi">{t('sharedNmi')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>{t('settingsAltitudeUnit')}</InputLabel>
                <Select
                  label={t('settingsAltitudeUnit')}
                  value={getAttr('altitudeUnit', 'm')}
                  onChange={(e) => setAttr('altitudeUnit', e.target.value)}
                >
                  <MenuItem value="m">{t('sharedMeters')}</MenuItem>
                  <MenuItem value="ft">{t('sharedFeet')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>{t('settingsVolumeUnit')}</InputLabel>
                <Select
                  label={t('settingsVolumeUnit')}
                  value={getAttr('volumeUnit', 'ltr')}
                  onChange={(e) => setAttr('volumeUnit', e.target.value)}
                >
                  <MenuItem value="ltr">{t('sharedLiter')}</MenuItem>
                  <MenuItem value="usGal">{t('sharedUsGallon')}</MenuItem>
                  <MenuItem value="impGal">{t('sharedImpGallon')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>{t('sharedTimezone')}</InputLabel>
                <Select
                  label={t('sharedTimezone')}
                  value={getAttr('timezone', '')}
                  onChange={(e) => setAttr('timezone', e.target.value)}
                >
                  <MenuItem value="">{t('sharedDisabled')}</MenuItem>
                  {Intl.supportedValuesOf?.('timeZone')?.map((tz) => (
                    <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                  )) || (
                    <MenuItem value="UTC">UTC</MenuItem>
                  )}
                </Select>
              </FormControl>
              <TextField
                size="small"
                value={(item.poiLayer as string) || ''}
                onChange={(e) => setItem({ ...item, poiLayer: e.target.value })}
                label={t('mapPoiLayer')}
              />
            </AccordionDetails>
          </Accordion>

          {/* ==================== Location ==================== */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedLocation')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                size="small"
                type="number"
                value={(item.latitude as number) || 0}
                onChange={(e) => setItem({ ...item, latitude: Number(e.target.value) })}
                label={t('positionLatitude')}
              />
              <TextField
                size="small"
                type="number"
                value={(item.longitude as number) || 0}
                onChange={(e) => setItem({ ...item, longitude: Number(e.target.value) })}
                label={t('positionLongitude')}
              />
              <TextField
                size="small"
                type="number"
                value={(item.zoom as number) || 0}
                onChange={(e) => setItem({ ...item, zoom: Number(e.target.value) })}
                label={t('serverZoom')}
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  const center = map.getCenter();
                  setItem({
                    ...item,
                    latitude: Number(center.lat.toFixed(6)),
                    longitude: Number(center.lng.toFixed(6)),
                    zoom: Number(map.getZoom().toFixed(1)),
                  });
                }}
              >
                {t('mapCurrentLocation')}
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* ==================== Permissions ==================== */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedPermissions')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                size="small"
                label={t('userExpirationTime')}
                type="date"
                value={
                  item.expirationTime
                    ? String(item.expirationTime).split('T')[0]
                    : '2099-01-01'
                }
                onChange={(e) => {
                  if (e.target.value) {
                    setItem({ ...item, expirationTime: new Date(e.target.value).toISOString() });
                  }
                }}
                disabled={!manager}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                size="small"
                type="number"
                value={(item.deviceLimit as number) ?? 0}
                onChange={(e) => setItem({ ...item, deviceLimit: Number(e.target.value) })}
                label={t('userDeviceLimit')}
                disabled={!admin}
              />
              <TextField
                size="small"
                type="number"
                value={(item.userLimit as number) ?? 0}
                onChange={(e) => setItem({ ...item, userLimit: Number(e.target.value) })}
                label={t('userUserLimit')}
                disabled={!admin}
              />
              <Button variant="outlined" color="primary" onClick={() => setRevokeDialogOpen(true)}>
                {t('userRevokeToken')}
              </Button>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!item.disabled}
                      onChange={(e) => setItem({ ...item, disabled: e.target.checked })}
                    />
                  }
                  label={t('sharedDisabled')}
                  disabled={!manager}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!item.administrator}
                      onChange={(e) => setItem({ ...item, administrator: e.target.checked })}
                    />
                  }
                  label={t('userAdmin')}
                  disabled={!admin}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!item.readonly}
                      onChange={(e) => setItem({ ...item, readonly: e.target.checked })}
                    />
                  }
                  label={t('serverReadonly')}
                  disabled={!manager}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!item.deviceReadonly}
                      onChange={(e) => setItem({ ...item, deviceReadonly: e.target.checked })}
                    />
                  }
                  label={t('userDeviceReadonly')}
                  disabled={!manager}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!item.limitCommands}
                      onChange={(e) => setItem({ ...item, limitCommands: e.target.checked })}
                    />
                  }
                  label={t('userLimitCommands')}
                  disabled={!manager}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!item.disableReports}
                      onChange={(e) => setItem({ ...item, disableReports: e.target.checked })}
                    />
                  }
                  label={t('userDisableReports')}
                  disabled={!manager}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!item.fixedEmail}
                      onChange={(e) => setItem({ ...item, fixedEmail: e.target.checked })}
                    />
                  }
                  label={t('userFixedEmail')}
                  disabled={!manager}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* ==================== Attributes ==================== */}
          <EditAttributesAccordion
            attributes={(item.attributes as Record<string, unknown>) || {}}
            onChange={(attributes) => setItem({ ...item, attributes })}
            title={t('sharedAttributes')}
            definitions={{ ...commonUserAttributes, ...userAttrs }}
            focusAttribute={attribute || undefined}
          />

          {/* ==================== Delete Account ==================== */}
          {registrationEnabled && item.id === currentUser.id && !manager && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" color="error">
                  {t('userDeleteAccount')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  size="small"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  label={t('userEmail')}
                  error={deleteFailed}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  startIcon={<DeleteForeverIcon />}
                >
                  {t('userDeleteAccount')}
                </Button>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}

      {/* ==================== Revoke Token Dialog ==================== */}
      <Dialog open={revokeDialogOpen} onClose={closeRevokeDialog} fullWidth maxWidth="xs">
        <DialogContent className={classes.details}>
          <TextField
            size="small"
            value={revokeToken}
            onChange={(e) => setRevokeToken(e.target.value)}
            label={t('userToken')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRevokeDialog} color="primary">
            {t('sharedCancel')}
          </Button>
          <Button onClick={handleRevokeToken} color="primary" variant="contained" disabled={!revokeToken}>
            {t('userRevokeToken')}
          </Button>
        </DialogActions>
      </Dialog>
    </EditItemView>
  );
};
