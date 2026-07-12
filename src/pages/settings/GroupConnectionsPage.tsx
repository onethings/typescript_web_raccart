/**
 * 群組關聯頁面
 *
 * 管理群組與圍欄、通知、駕駛、計算屬性、指令、保養的關聯。
 * 對應 FRONTME.md 7.18 GroupConnectionsPage 章節。
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
import { useAppSelector } from '../../hooks/useAppStore';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { LinkField } from '../../components/common/LinkField';

/** 群組關聯頁面 */
export const GroupConnectionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const group = useAppSelector((state) => (id ? state.groups.items[Number(id)] : undefined));
  const groupId = Number(id);

  if (!group) return null;

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsGroups', group.name, 'Connections']}>
      <Container maxWidth="xs" sx={{ py: 3 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{group.name} - Connections</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <LinkField label="Geofences" endpointAll="/api/geofences" endpointLinked={`/api/permissions?groupId=${groupId}&geofenceId=0`} baseId={groupId} keyBase="groupId" keyLink="geofenceId" />
              <LinkField label="Notifications" endpointAll="/api/notifications" endpointLinked={`/api/permissions?groupId=${groupId}&notificationId=0`} baseId={groupId} keyBase="groupId" keyLink="notificationId" />
              <LinkField label="Drivers" endpointAll="/api/drivers" endpointLinked={`/api/permissions?groupId=${groupId}&driverId=0`} baseId={groupId} keyBase="groupId" keyLink="driverId" />
              <LinkField label="Commands" endpointAll="/api/commands" endpointLinked={`/api/permissions?groupId=${groupId}&commandId=0`} baseId={groupId} keyBase="groupId" keyLink="commandId" />
              <LinkField label="Maintenance" endpointAll="/api/maintenance" endpointLinked={`/api/permissions?groupId=${groupId}&maintenanceId=0`} baseId={groupId} keyBase="groupId" keyLink="maintenanceId" />
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
