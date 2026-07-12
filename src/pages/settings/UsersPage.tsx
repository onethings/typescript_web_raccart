/**
 * 使用者列表頁面（管理員/管理者專用）
 *
 * 管理所有使用者，支援搜尋、無限滾動、模擬登入。
 * 對應 FRONTME.md 7.4 UsersPage 章節。
 */

import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { CollectionPage, CollectionColumn } from '../../components/common/CollectionPage';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { User } from '../../types/models';
import { getUsers, deleteUser } from '../../api/endpoints';
import { formatTime } from '../../utils/formatter';

/** 使用者列表頁面 */
export const UsersPage: React.FC = () => {
  const t = useTranslation();

  const columns: CollectionColumn<User>[] = [
    { id: 'name', label: t('sharedName'), render: (u) => u.name },
    { id: 'email', label: 'Email', render: (u) => u.email },
    { id: 'admin', label: 'Admin', render: (u) => (u.administrator ? 'Yes' : 'No') },
    { id: 'disabled', label: 'Disabled', render: (u) => (u.disabled ? 'Yes' : 'No') },
    { id: 'expiration', label: 'Expiration', render: (u) => (u.expirationTime ? formatTime(u.expirationTime, 'date') : '-') },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsUsers']}>
      <CollectionPage<User>
        title="Users"
        addPath="/settings/user"
        editPath={(id) => `/settings/user/${id}`}
        fetchData={async ({ limit, offset, keyword }) => {
          const response = await getUsers({ limit, offset, keyword });
          return response.data;
        }}
        deleteItem={async (id) => { await deleteUser(id); }}
        columns={columns}
      />
    </PageLayout>
  );
};
