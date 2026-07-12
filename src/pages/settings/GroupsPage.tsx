/**
 * 群組列表頁面
 * 對應 FRONTME.md 7.6 GroupsPage 章節。
 */

import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { CollectionPage, CollectionColumn } from '../../components/common/CollectionPage';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Group } from '../../types/models';
import { getGroups, deleteGroup } from '../../api/endpoints';

export const GroupsPage: React.FC = () => {
  const t = useTranslation();
  const columns: CollectionColumn<Group>[] = [
    { id: 'name', label: t('sharedName'), render: (g) => g.name },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsGroups']}>
      <CollectionPage<Group>
        title="Groups"
        addPath="/settings/group"
        editPath={(id) => `/settings/group/${id}`}
        fetchData={async ({ limit, offset, keyword }) => {
          const res = await getGroups({ limit, offset, keyword });
          return res.data;
        }}
        deleteItem={async (id) => { await deleteGroup(id); }}
        columns={columns}
      />
    </PageLayout>
  );
};
