/**
 * 通知規則列表頁面
 * 對應 FRONTME.md 7.8 NotificationsPage 章節。
 */

import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { CollectionPage, CollectionColumn } from '../../components/common/CollectionPage';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Notification } from '../../types/models';
import { getNotifications, deleteNotification } from '../../api/endpoints';

export const NotificationsPage: React.FC = () => {
  const t = useTranslation();
  const columns: CollectionColumn<Notification>[] = [
    { id: 'type', label: 'Type', render: (n) => n.type },
    { id: 'description', label: 'Description', render: (n) => n.description || '-' },
    { id: 'always', label: 'Always', render: (n) => (n.always ? 'Yes' : 'No') },
    { id: 'notificators', label: 'Notificators', render: (n) => n.notificators || '-' },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedNotifications']}>
      <CollectionPage<Notification>
        title="Notifications"
        addPath="/settings/notification"
        editPath={(id) => `/settings/notification/${id}`}
        fetchData={async ({ limit, offset, keyword }) => {
          const res = await getNotifications({ limit, offset, keyword });
          return res.data;
        }}
        deleteItem={async (id) => { await deleteNotification(id); }}
        columns={columns}
      />
    </PageLayout>
  );
};
