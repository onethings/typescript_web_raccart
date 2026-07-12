/**
 * 裝置列表頁面
 *
 * 管理所有裝置，支援搜尋、無限滾動、Excel 匯出。
 * 對應 FRONTME.md 7.5 DevicesPage 章節。
 */

import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { CollectionPage, CollectionColumn } from '../../components/common/CollectionPage';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Device } from '../../types/models';
import { getDevices, deleteDevice } from '../../api/endpoints';
import { formatStatus, formatTime } from '../../utils/formatter';

/** 裝置列表頁面 */
export const DevicesPage: React.FC = () => {
  const t = useTranslation();

  const columns: CollectionColumn<Device>[] = [
    { id: 'name', label: t('sharedName'), render: (d) => d.name },
    { id: 'uniqueId', label: 'Identifier', render: (d) => d.uniqueId },
    { id: 'phone', label: t('sharedPhone'), render: (d) => d.phone || '-' },
    { id: 'model', label: 'Model', render: (d) => d.model || '-' },
    { id: 'status', label: t('deviceStatus'), render: (d) => formatStatus(d.status, t) },
    { id: 'lastUpdate', label: 'Last Update', render: (d) => formatTime(d.lastUpdate || undefined, 'minutes') },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['deviceTitle']}>
      <CollectionPage<Device>
        title="Devices"
        addPath="/settings/device"
        editPath={(id) => `/settings/device/${id}`}
        fetchData={async ({ limit, offset, keyword }) => {
          const response = await getDevices({ limit, offset, keyword, all: true });
          return response.data;
        }}
        deleteItem={async (id) => { await deleteDevice(id); }}
        columns={columns}
      />
    </PageLayout>
  );
};
