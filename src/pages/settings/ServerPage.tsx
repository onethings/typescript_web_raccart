/**
 * 伺服器設定頁面（管理員專用）
 *
 * 編輯伺服器全域設定，包含偏好、伺服器選項、屬性。
 * 對應 FRONTME.md 7.3 ServerPage 章節。
 */

import React, { useState } from 'react';
import {
  Container,
  Button,
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useCatch, useAsyncTask } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { sessionActions } from '../../store';
import type { Server } from '../../types/models';
import { getServer as fetchServer, updateServer } from '../../api/endpoints';

const useStyles = makeStyles()((theme) => ({
  container: { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3) },
  section: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
  buttons: { display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing(3), gap: theme.spacing(2) },
}));

const defaultServer: Server = { id: 0, registration: false, readonly: false, deviceReadonly: false, limitCommands: false, forceSettings: false, openIdEnabled: false, openIdForce: false };

/** 伺服器設定頁面 */
export const ServerPage: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const [server, setServer] = useState<Server | null>(null);

  useAsyncTask(
    async ({ signal }) => {
      if (!server) {
        const response = await fetchServer(signal);
        setServer(response.data);
      }
    },
    [server],
  );

  const handleSave = useCatch(async () => {
    if (!server) return;
    const response = await updateServer(server);
    dispatch(sessionActions.updateServer(response.data));
    navigate(-1);
  });

  const update = <K extends keyof Server>(key: K, value: Server[K]) => {
    if (server) setServer({ ...server, [key]: value });
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsServer']}>
      <Container maxWidth="xs" className={classes.container}>
        {server && (
          <>
            {/* 偏好設定 */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Preferences</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.section}>
                  <TextField size="small" label="Map URL" value={server.mapUrl || ''} onChange={(e) => update('mapUrl', e.target.value)} />
                  <TextField size="small" label="POI Layer" value={server.poiLayer || ''} onChange={(e) => update('poiLayer', e.target.value)} />
                  <TextField size="small" label="Bing Key" value={server.bingKey || ''} onChange={(e) => update('bingKey', e.target.value)} />
                </div>
              </AccordionDetails>
            </Accordion>

            {/* 伺服器設定 */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Server</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.section}>
                  <FormControlLabel control={<Switch checked={!!server.registration} onChange={(e) => update('registration', e.target.checked)} />} label="Registration" />
                  <FormControlLabel control={<Switch checked={!!server.readonly} onChange={(e) => update('readonly', e.target.checked)} />} label="Readonly" />
                  <FormControlLabel control={<Switch checked={!!server.deviceReadonly} onChange={(e) => update('deviceReadonly', e.target.checked)} />} label="Device Readonly" />
                  <FormControlLabel control={<Switch checked={!!server.forceSettings} onChange={(e) => update('forceSettings', e.target.checked)} />} label="Force Settings" />
                  <FormControl size="small">
                    <InputLabel>Coordinate Format</InputLabel>
                    <Select value={server.coordinateFormat || 'dd'} label="Coordinate Format" onChange={(e) => update('coordinateFormat', e.target.value)}>
                      <MenuItem value="dd">DD</MenuItem>
                      <MenuItem value="ddm">DDM</MenuItem>
                      <MenuItem value="dms">DMS</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </AccordionDetails>
            </Accordion>

            <div className={classes.buttons}>
              <Button variant="outlined" onClick={() => navigate(-1)}>{t('sharedCancel')}</Button>
              <Button variant="contained" onClick={handleSave}>{t('sharedSave')}</Button>
            </div>
          </>
        )}
      </Container>
    </PageLayout>
  );
};
