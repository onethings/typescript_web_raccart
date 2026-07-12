/**
 * 計算屬性列表頁面
 * 對應 FRONTME.md 7.10 ComputedAttributesPage 章節。
 */

import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { CollectionPage, CollectionColumn } from '../../components/common/CollectionPage';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Attribute } from '../../types/models';
import { getAttributes, deleteAttribute } from '../../api/endpoints';

export const ComputedAttributesPage: React.FC = () => {
  const t = useTranslation();
  const columns: CollectionColumn<Attribute>[] = [
    { id: 'description', label: 'Description', render: (a) => a.description },
    { id: 'attribute', label: 'Attribute', render: (a) => a.attribute },
    { id: 'expression', label: 'Expression', render: (a) => a.expression },
    { id: 'type', label: 'Type', render: (a) => a.type },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedComputedAttributes']}>
      <CollectionPage<Attribute>
        title="Computed Attributes"
        addPath="/settings/attribute"
        editPath={(id) => `/settings/attribute/${id}`}
        fetchData={async ({ limit, offset, keyword }) => {
          const res = await getAttributes({ limit, offset, keyword });
          return res.data;
        }}
        deleteItem={async (id) => { await deleteAttribute(id); }}
        columns={columns}
      />
    </PageLayout>
  );
};
