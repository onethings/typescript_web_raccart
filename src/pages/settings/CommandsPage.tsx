/**
 * 已儲存指令列表頁面
 * 對應 FRONTME.md 7.9 CommandsPage 章節。
 */

import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { CollectionPage, CollectionColumn } from '../../components/common/CollectionPage';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Command } from '../../types/models';
import { getCommands, deleteCommand } from '../../api/endpoints';

export const CommandsPage: React.FC = () => {
  const t = useTranslation();
  const columns: CollectionColumn<Command>[] = [
    { id: 'description', label: 'Description', render: (c) => c.description || '-' },
    { id: 'type', label: 'Type', render: (c) => c.type },
    { id: 'textChannel', label: 'Send SMS', render: (c) => (c.textChannel ? 'Yes' : 'No') },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedSavedCommands']}>
      <CollectionPage<Command>
        title="Commands"
        addPath="/settings/command"
        editPath={(id) => `/settings/command/${id}`}
        fetchData={async ({ limit, offset, keyword }) => {
          const res = await getCommands({ limit, offset, keyword });
          return res.data;
        }}
        deleteItem={async (id) => { await deleteCommand(id); }}
        columns={columns}
      />
    </PageLayout>
  );
};
