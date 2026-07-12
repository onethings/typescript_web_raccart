/**
 * 通知規則編輯/新增頁面
 * 對應 FRONTME.md 7.8 NotificationPage 章節。
 */

import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditItemView } from '../../components/common/EditItemView';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useCatch, useAsyncTask } from '../../hooks/useAsyncTask';
import type { Notification, NotificationType } from '../../types/models';
import { getNotificationTypes, testNotification } from '../../api/endpoints';

const defaultNotification: Notification = {
  id: 0,
  type: '',
  always: false,
  notificators: 'web',
};

export const NotificationPage: React.FC = () => {
  const t = useTranslation();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [types, setTypes] = useState<NotificationType[]>([]);

  useAsyncTask(async ({ signal }) => {
    const res = await getNotificationTypes();
    if (!signal.aborted) setTypes(res.data);
  }, []);

  const handleTest = useCatch(async () => {
    if (notification?.notificators) {
      await testNotification(notification.notificators.split(',')[0]);
    }
  });

  return (
    <EditItemView<Notification>
      endpoint="notifications"
      item={notification}
      setItem={setNotification}
      defaultItem={defaultNotification}
      validate={() => !!notification?.type}
      menu={<SettingsMenu />}
      breadcrumbs={['sharedNotifications', notification?.id ? 'Edit' : 'New']}
    >
      {notification && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Required</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <TextField size="small" label="Type" value={notification.type} onChange={(e) => setNotification({ ...notification, type: e.target.value })} required />
                <TextField size="small" label="Notificators (comma separated)" value={notification.notificators || ''} onChange={(e) => setNotification({ ...notification, notificators: e.target.value })} helperText="e.g. web,mail,sms" />
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Test</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Button variant="outlined" onClick={handleTest}>Send Test Notification</Button>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};
