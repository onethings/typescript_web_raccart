/**
 * 使用者偏好設定頁面
 *
 * 管理使用者個人偏好：Token、地圖、裝置顯示、事件音效、外觀。
 * 對應 FRONTME.md 7.14 PreferencesPage 章節。
 */

import React, { useState } from 'react';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useCatch } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { sessionActions } from '../../store';
import { updateUser, generateToken } from '../../api/endpoints';

const useStyles = makeStyles()((theme) => ({
  container: { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3) },
  section: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
  buttons: { display: 'flex', justifyContent: 'flex-end', marginTop: theme.spacing(3) },
}));

/** 偏好設定頁面 */
export const PreferencesPage: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const user = useAppSelector((state) => state.session.user)!;
  const [userState, setUserState] = useState({ ...user });
  const [token, setToken] = useState('');
  const [tokenExpiration, setTokenExpiration] = useState('');

  const updateField = (key: string, value: unknown) => {
    setUserState((prev) => ({ ...prev, [key]: value }));
  };

  /** 儲存偏好設定 */
  const handleSave = useCatch(async () => {
    const response = await updateUser(user.id, userState);
    dispatch(sessionActions.updateUser(response.data));
  });

  /** 產生 Token */
  const handleGenerateToken = useCatch(async () => {
    const response = await generateToken(tokenExpiration || undefined);
    setToken(response.data);
  });

  const server = useAppSelector((state) => state.session.server);
  const versionInfo = `${server?.version || 'N/A'}`;

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedPreferences']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Preferences</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.section}>
              <FormControl size="small">
                <InputLabel>Coordinate Format</InputLabel>
                <Select value={userState.coordinateFormat || 'dd'} label="Coordinate Format" onChange={(e) => updateField('coordinateFormat', e.target.value)}>
                  <MenuItem value="dd">DD</MenuItem>
                  <MenuItem value="ddm">DDM</MenuItem>
                  <MenuItem value="dms">DMS</MenuItem>
                </Select>
              </FormControl>
              <TextField size="small" label="Token" value={token} slotProps={{ input: { readOnly: true } }} />
              <TextField size="small" type="datetime-local" label="Token Expiration" value={tokenExpiration} onChange={(e) => setTokenExpiration(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              <Button variant="outlined" size="small" onClick={handleGenerateToken}>Generate Token</Button>
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Appearance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.section}>
              <FormControlLabel
                control={<Switch checked={!!userState.attributes?.darkMode} onChange={(e) => updateField('attributes', { ...userState.attributes, darkMode: e.target.checked })} />}
                label="Dark Mode"
              />
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Version Info</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">Server: {versionInfo}</Typography>
          </AccordionDetails>
        </Accordion>

        <div className={classes.buttons}>
          <Button variant="contained" onClick={handleSave}>{t('sharedSave')}</Button>
        </div>
      </Container>
    </PageLayout>
  );
};
