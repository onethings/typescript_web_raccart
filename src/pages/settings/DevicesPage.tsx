/**
 * 裝置列表頁面
 *
 * 管理所有裝置，支援搜尋、無限滾動、Excel 匯出、全部/管理裝置切換。
 * 對應 FRONTME.md 7.5 DevicesPage 章節。
 */

import React, { useState, useCallback, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableFooter,
  Button,
  FormControlLabel,
  Switch,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { useTheme } from '@mui/material/styles';
import { useAppSelector } from '../../hooks/useAppStore';
import { useAsyncTask, useScrollToLoad, PAGE_SIZE } from '../../hooks/useAsyncTask';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { SettingsMenu } from '../../components/common/SettingsMenu';
import { SearchHeader } from '../../components/common/SearchHeader';
import { TableShimmer } from '../../components/common/TableShimmer';
import { CollectionActions } from '../../components/common/CollectionActions';
import { CollectionFab } from '../../components/common/CollectionFab';
import { AddressValue } from '../../components/common/AddressValue';
import { DeviceUsersValue } from '../../components/common/DeviceUsersValue';
import { useDeviceReadonly, useManager } from '../../utils/permissions';
import { usePreference } from '../../utils/preferences';
import { usePersistedState } from '../../utils/usePersistedState';
import { formatStatus, formatTime } from '../../utils/formatter';
import { fetchOrThrow } from '../../utils/fetchOrThrow';
import { exportExcel } from '../../utils/exportExcel';
import type { Device } from '../../types/models';

const useStyles = () => ({
  table: { minWidth: 900 },
  columnAction: { width: 100, textAlign: 'right' as const },
});

/** 裝置列表頁面 */
export const DevicesPage: React.FC = () => {
  const t = useTranslation();
  const styles = useStyles();
  const navigate = useNavigate();
  const theme = useTheme();

  const groups = useAppSelector((state) => state.groups.items);
  const positions = useAppSelector((state) => state.session.positions);

  const manager = useManager();
  const deviceReadonly = useDeviceReadonly();
  const coordinateFormat = usePreference('coordinateFormat', 'dd');

  const [reloadKey, reload] = useReducer((k: number) => k + 1, 0);
  const [items, setItems] = useState<Device[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAll, setShowAll] = usePersistedState('showAllDevices', false);
  const [hasMore, setHasMore] = useState(true);

  /** 載入裝置 */
  const loadItems = useCallback(
    async (offset: number, signal?: AbortSignal) => {
      const params = new URLSearchParams({ all: String(showAll), limit: String(PAGE_SIZE), offset: String(offset) });
      if (searchKeyword) {
        params.append('keyword', searchKeyword);
      }
      const response = await fetchOrThrow(`/api/devices?${params.toString()}`, { signal });
      const data: Device[] = await response.json();
      setItems((prev) => (offset ? [...prev, ...data] : data));
      setHasMore(data.length >= PAGE_SIZE);
    },
    [searchKeyword, showAll],
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

  /** 匯出 Excel */
  const handleExport = useCallback(async () => {
    const columns = [
      { header: t('sharedName'), key: 'name' },
      { header: t('deviceIdentifier'), key: 'uniqueId' },
      { header: t('groupParent'), key: 'group' },
      { header: t('sharedPhone'), key: 'phone' },
      { header: t('deviceModel'), key: 'model' },
      { header: t('deviceContact'), key: 'contact' },
      { header: t('userExpirationTime'), key: 'expiration' },
      { header: t('deviceStatus'), key: 'status' },
    ];
    const data = items.map((item) => ({
      name: item.name,
      uniqueId: item.uniqueId,
      group: item.groupId ? groups[item.groupId]?.name : '',
      phone: item.phone || '',
      model: item.model || '',
      contact: item.contact || '',
      expiration: formatTime(item.expirationTime, 'date'),
      status: formatStatus(item.status, t),
    }));
    await exportExcel(columns, data, 'devices', t('deviceTitle'));
  }, [items, groups, t]);

  const tableColumns = manager ? 9 : 8;

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
      <SearchHeader onSearch={handleSearch} defaultValue={searchKeyword} />
      <Table sx={styles.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('deviceIdentifier')}</TableCell>
            <TableCell>{t('groupParent')}</TableCell>
            <TableCell>{t('sharedPhone')}</TableCell>
            <TableCell>{t('deviceModel')}</TableCell>
            <TableCell>{t('deviceContact')}</TableCell>
            <TableCell>{t('userExpirationTime')}</TableCell>
            <TableCell>{t('positionAddress')}</TableCell>
            {manager && <TableCell>{t('settingsUsers')}</TableCell>}
            <TableCell sx={styles.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.uniqueId}</TableCell>
              <TableCell>{item.groupId ? groups[item.groupId]?.name : null}</TableCell>
              <TableCell>{item.phone}</TableCell>
              <TableCell>{item.model}</TableCell>
              <TableCell>{item.contact}</TableCell>
              <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
              <TableCell>
                {positions[item.id] && (
                  <AddressValue
                    latitude={positions[item.id].latitude}
                    longitude={positions[item.id].longitude}
                    address={positions[item.id]?.address}
                  />
                )}
              </TableCell>
              {manager && (
                <TableCell>
                  <DeviceUsersValue deviceId={item.id} />
                </TableCell>
              )}
              <TableCell sx={styles.columnAction} padding="none">
                <CollectionActions
                  editPath={`/settings/device/${item.id}`}
                  onDelete={async () => {
                    await fetchOrThrow(`/api/devices/${item.id}`, { method: 'DELETE' });
                    reload();
                  }}
                  customActions={[
                    {
                      key: 'connections',
                      label: t('sharedConnections'),
                      icon: <LinkIcon fontSize="small" />,
                      onClick: () => navigate(`/settings/device/${item.id}/connections`),
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
          {hasMore && (
            <>
              <TableShimmer columns={tableColumns} />
              <TableRow ref={items.length > 0 ? sentinelRef : undefined}>
                <TableCell colSpan={tableColumns + 1} sx={{ p: 0 }} />
              </TableRow>
            </>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>
              <Button onClick={handleExport} variant="text">
                {t('reportExport')}
              </Button>
            </TableCell>
            <TableCell colSpan={tableColumns} align="right">
              <FormControlLabel
                control={
                  <Switch
                    checked={showAll}
                    onChange={(e) => setShowAll(e.target.checked)}
                    size="small"
                  />
                }
                label={t('notificationAlways')}
                labelPlacement="start"
                disabled={!manager}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab link="/settings/device" />
    </PageLayout>
  );
};
