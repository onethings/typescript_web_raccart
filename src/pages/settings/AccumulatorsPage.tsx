/**
 * 裝置累計器編輯頁面
 *
 * 編輯裝置的總里程 (totalDistance) 與引擎時數 (hours)。
 * 對應 FRONTME.md 7.15 AccumulatorsPage 章節。
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from 'tss-react/mui';
import { useAppSelector } from '../../hooks/useAppStore';
import { useCatch } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { distanceToMeters } from '../../utils/converter';
import { updateDeviceAccumulators } from '../../api/endpoints';
import type { DistanceUnit } from '../../types/ui';

const useStyles = makeStyles()((theme) => ({
  container: { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3) },
  section: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
  buttons: { display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing(3), gap: theme.spacing(2) },
}));

/**
 * 裝置累計器編輯頁面
 */
export const AccumulatorsPage: React.FC = () => {
  const { classes } = useStyles();
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();

  const device = useAppSelector((state) =>
    deviceId ? state.devices.items[Number(deviceId)] : undefined,
  );

  const [totalDistance, setTotalDistance] = useState('0');
  const [hours, setHours] = useState('0');

  const handleSave = useCatch(async () => {
    if (!deviceId) return;
    const distanceMeters = distanceToMeters(parseFloat(totalDistance) || 0, 'km' as DistanceUnit);
    await updateDeviceAccumulators(Number(deviceId), {
      deviceId: Number(deviceId),
      totalDistance: distanceMeters,
      hours: parseFloat(hours) || 0,
    });
    navigate(-1);
  });

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['deviceTitle', 'Accumulators']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{device?.name || `Device #${deviceId}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.section}>
              <TextField
                size="small"
                label="Total Distance (km)"
                type="number"
                value={totalDistance}
                onChange={(e) => setTotalDistance(e.target.value)}
              />
              <TextField
                size="small"
                label="Hours"
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
          </AccordionDetails>
        </Accordion>

        <div className={classes.buttons}>
          <Button variant="outlined" onClick={() => navigate(-1)}>{t('sharedCancel')}</Button>
          <Button variant="contained" onClick={handleSave}>{t('sharedSave')}</Button>
        </div>
      </Container>
    </PageLayout>
  );
};
