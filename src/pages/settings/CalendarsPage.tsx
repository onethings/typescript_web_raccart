/**
 * 日曆列表頁面
 * 對應 FRONTME.md 7.12 CalendarsPage 章節。
 */

import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { CollectionPage, CollectionColumn } from '../../components/common/CollectionPage';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Calendar } from '../../types/models';
import { getCalendars, deleteCalendar } from '../../api/endpoints';

export const CalendarsPage: React.FC = () => {
  const t = useTranslation();
  const columns: CollectionColumn<Calendar>[] = [
    { id: 'name', label: t('sharedName'), render: (c) => c.name },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedCalendars']}>
      <CollectionPage<Calendar>
        title="Calendars"
        addPath="/settings/calendar"
        editPath={(id) => `/settings/calendar/${id}`}
        fetchData={async ({ limit, offset, keyword }) => {
          const res = await getCalendars({ limit, offset, keyword });
          return res.data;
        }}
        deleteItem={async (id) => { await deleteCalendar(id); }}
        columns={columns}
      />
    </PageLayout>
  );
};
