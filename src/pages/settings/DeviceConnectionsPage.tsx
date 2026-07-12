/**
 * 裝置關聯頁面
 *
 * 管理裝置與圍欄、通知、駕駛、計算屬性、指令、保養的關聯。
 * 對應 FRONTME.md 7.18 DeviceConnectionsPage 章節。
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from 'tss-react/mui';
import { useAppSelector } from '../../hooks/useAppStore';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { LinkField } from '../../components/common/LinkField';

const useStyles = makeStyles()((theme) => ({
  container: { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3) },
  section: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' },
}));

/**
 * 裝置關聯頁面
 */
export const DeviceConnectionsPage: React.FC = () => {
  const { classes } = useStyles();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useTranslation();

  const device = useAppSelector((state) =>
    id ? state.devices.items[Number(id)] : undefined,
  );

  const basePath = `/api/permissions`;
  const deviceId = Number(id);

  const buildLinkedUrl = (entity: string) =>
    `${basePath}?deviceId=${deviceId}&${entity}Id=0`;

  if (!device) return null;

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['deviceTitle', device.name, 'Connections']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{device.name} - Connections</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.section}>
              <LinkField
                label="Geofences"
                endpointAll="/api/geofences"
                endpointLinked={buildLinkedUrl('geofence')}
                baseId={deviceId}
                keyBase="deviceId"
                keyLink="geofenceId"
              />
              <LinkField
                label="Notifications"
                endpointAll="/api/notifications"
                endpointLinked={buildLinkedUrl('notification')}
                baseId={deviceId}
                keyBase="deviceId"
                keyLink="notificationId"
              />
              <LinkField
                label="Drivers"
                endpointAll="/api/drivers"
                endpointLinked={buildLinkedUrl('driver')}
                baseId={deviceId}
                keyBase="deviceId"
                keyLink="driverId"
              />
              <LinkField
                label="Computed Attributes"
                endpointAll="/api/attributes/computed"
                endpointLinked={buildLinkedUrl('attribute')}
                baseId={deviceId}
                keyBase="deviceId"
                keyLink="attributeId"
              />
              <LinkField
                label="Commands"
                endpointAll="/api/commands"
                endpointLinked={buildLinkedUrl('command')}
                baseId={deviceId}
                keyBase="deviceId"
                keyLink="commandId"
              />
              <LinkField
                label="Maintenance"
                endpointAll="/api/maintenance"
                endpointLinked={buildLinkedUrl('maintenance')}
                baseId={deviceId}
                keyBase="deviceId"
                keyLink="maintenanceId"
              />
            </div>
          </AccordionDetails>
        </Accordion>

        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 16 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>{t('sharedCancel')}</Button>
        </div>
      </Container>
    </PageLayout>
  );
};
