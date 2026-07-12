/**
 * 駕駛列表頁面
 * 對應 FRONTME.md 7.13 DriversPage 章節。
 */

import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { CollectionPage, CollectionColumn } from '../../components/common/CollectionPage';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Driver } from '../../types/models';
import { getDrivers, deleteDriver } from '../../api/endpoints';

export const DriversPage: React.FC = () => {
  const t = useTranslation();
  const columns: CollectionColumn<Driver>[] = [
    { id: 'name', label: t('sharedName'), render: (d) => d.name },
    { id: 'uniqueId', label: 'Identifier', render: (d) => d.uniqueId },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedDrivers']}>
      <CollectionPage<Driver>
        title="Drivers"
        addPath="/settings/driver"
        editPath={(id) => `/settings/driver/${id}`}
        fetchData={async ({ limit, offset, keyword }) => {
          const res = await getDrivers({ limit, offset, keyword });
          return res.data;
        }}
        deleteItem={async (id) => { await deleteDriver(id); }}
        columns={columns}
      />
    </PageLayout>
  );
};
