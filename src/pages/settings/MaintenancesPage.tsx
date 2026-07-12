/**
 * 保養規則列表頁面
 * 對應 FRONTME.md 7.11 MaintenancesPage 章節。
 */

import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { CollectionPage, CollectionColumn } from '../../components/common/CollectionPage';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Maintenance } from '../../types/models';
import { getMaintenances, deleteMaintenance } from '../../api/endpoints';

export const MaintenancesPage: React.FC = () => {
  const t = useTranslation();
  const columns: CollectionColumn<Maintenance>[] = [
    { id: 'name', label: t('sharedName'), render: (m) => m.name },
    { id: 'type', label: 'Type', render: (m) => m.type },
    { id: 'start', label: 'Start', render: (m) => String(m.start ?? '-') },
    { id: 'period', label: 'Period', render: (m) => String(m.period ?? '-') },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedMaintenance']}>
      <CollectionPage<Maintenance>
        title="Maintenance"
        addPath="/settings/maintenance"
        editPath={(id) => `/settings/maintenance/${id}`}
        fetchData={async ({ limit, offset, keyword }) => {
          const res = await getMaintenances({ limit, offset, keyword });
          return res.data;
        }}
        deleteItem={async (id) => { await deleteMaintenance(id); }}
        columns={columns}
      />
    </PageLayout>
  );
};
