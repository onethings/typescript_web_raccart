/**
 * 通知規則列表頁面
 *
 * 顯示所有通知規則，支援搜尋、無限滾動、新增/編輯/刪除。
 * 對應 FRONTME.md 7.8 NotificationsPage 章節。
 */

import React, { useState, useCallback, useReducer } from 'react';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from '@mui/material';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { SearchHeader } from '../../components/common/SearchHeader';
import { TableShimmer } from '../../components/common/TableShimmer';
import { CollectionActions } from '../../components/common/CollectionActions';
import { CollectionFab } from '../../components/common/CollectionFab';
import { useAsyncTask, useScrollToLoad, PAGE_SIZE } from '../../hooks/useAsyncTask';
import { formatBoolean } from '../../utils/formatter';
import { prefixString } from '../../utils/stringUtils';
import { fetchOrThrow } from '../../utils/fetchOrThrow';
import type { Notification } from '../../types/models';

const useStyles = () => {
  const styles = {
    table: { minWidth: 650 },
    columnAction: { width: 100, textAlign: 'right' as const },
  };
  return styles;
};

/** 格式化逗號分隔的列表，每項加上前綴後翻譯 */
const formatList = (prefix: string, value: string | undefined | null, t: (key: string) => string): string => {
  if (!value) return '';
  return value
    .split(/[, ]+/)
    .filter(Boolean)
    .map((it) => t(prefixString(prefix, it)))
    .join(', ');
};

export const NotificationsPage: React.FC = () => {
  const t = useTranslation();
  const styles = useStyles();

  const [reloadKey, reload] = useReducer((k: number) => k + 1, 0);
  const [items, setItems] = useState<Notification[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hasMore, setHasMore] = useState(true);

  /** 載入通知 */
  const loadItems = useCallback(
    async (offset: number, signal?: AbortSignal) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
      if (searchKeyword) {
        params.append('keyword', searchKeyword);
      }
      const response = await fetchOrThrow(`/api/notifications?${params.toString()}`, { signal });
      const data: Notification[] = await response.json();
      setItems((prev) => (offset ? [...prev, ...data] : data));
      setHasMore(data.length >= PAGE_SIZE);
    },
    [searchKeyword],
  );

  // 初始載入
  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setItems([]);
      await loadItems(0, signal);
    },
    [reloadKey, loadItems],
  );

  // 無限滾動
  const sentinelRef = useScrollToLoad(hasMore ? () => loadItems(items.length) : undefined);

  /** 搜尋回呼 */
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedNotifications']}>
      <SearchHeader onSearch={handleSearch} defaultValue={searchKeyword} />
      <Table sx={styles.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedDescription')}</TableCell>
            <TableCell>{t('notificationType')}</TableCell>
            <TableCell>{t('notificationAlways')}</TableCell>
            <TableCell>{t('sharedAlarms')}</TableCell>
            <TableCell>{t('notificationNotificators')}</TableCell>
            <TableCell sx={styles.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.description || '-'}</TableCell>
              <TableCell>{t(prefixString('event', item.type))}</TableCell>
              <TableCell>{formatBoolean(!!item.always, t)}</TableCell>
              <TableCell>
                {item.attributes
                  ? formatList('alarm', (item.attributes as Record<string, unknown>)?.alarms as string, t)
                  : '-'}
              </TableCell>
              <TableCell>{formatList('notificator', item.notificators, t)}</TableCell>
              <TableCell sx={styles.columnAction} padding="none">
                <CollectionActions
                  editPath={`/settings/notification/${item.id}`}
                  onDelete={() => {
                    fetchOrThrow(`/api/notifications/${item.id}`, { method: 'DELETE' }).then(() => reload());
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
          {hasMore && (
            <>
              <TableShimmer columns={5} />
              <TableRow ref={items.length > 0 ? sentinelRef : undefined}>
                <TableCell colSpan={6} sx={{ p: 0 }} />
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
      <CollectionFab link="/settings/notification" />
    </PageLayout>
  );
};
