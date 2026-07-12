/**
 * 使用者關聯頁面
 *
 * 管理使用者與裝置、群組、圍欄、通知、日曆、被管理使用者、計算屬性、駕駛的關聯。
 * 對應 FRONTME.md 7.18 UserConnectionsPage 章節。
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
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { LinkField } from '../../components/common/LinkField';

/** 使用者關聯頁面 */
export const UserConnectionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const userId = Number(id);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsUser', `User #${id}`, 'Connections']}>
      <Container maxWidth="xs" sx={{ py: 3 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>User #{id} - Connections</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <LinkField label="Devices" endpointAll="/api/devices" endpointLinked={`/api/permissions?userId=${userId}&deviceId=0`} baseId={userId} keyBase="userId" keyLink="deviceId" />
              <LinkField label="Groups" endpointAll="/api/groups" endpointLinked={`/api/permissions?userId=${userId}&groupId=0`} baseId={userId} keyBase="userId" keyLink="groupId" />
              <LinkField label="Geofences" endpointAll="/api/geofences" endpointLinked={`/api/permissions?userId=${userId}&geofenceId=0`} baseId={userId} keyBase="userId" keyLink="geofenceId" />
              <LinkField label="Notifications" endpointAll="/api/notifications" endpointLinked={`/api/permissions?userId=${userId}&notificationId=0`} baseId={userId} keyBase="userId" keyLink="notificationId" />
              <LinkField label="Calendars" endpointAll="/api/calendars" endpointLinked={`/api/permissions?userId=${userId}&calendarId=0`} baseId={userId} keyBase="userId" keyLink="calendarId" />
              <LinkField label="Managed Users" endpointAll="/api/users" endpointLinked={`/api/permissions?userId=${userId}&managedUserId=0`} baseId={userId} keyBase="userId" keyLink="managedUserId" />
              <LinkField label="Computed Attributes" endpointAll="/api/attributes/computed" endpointLinked={`/api/permissions?userId=${userId}&attributeId=0`} baseId={userId} keyBase="userId" keyLink="attributeId" />
              <LinkField label="Drivers" endpointAll="/api/drivers" endpointLinked={`/api/permissions?userId=${userId}&driverId=0`} baseId={userId} keyBase="userId" keyLink="driverId" />
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
