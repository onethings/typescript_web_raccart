/**
 * 事件報表頁面
 *
 * 查詢事件記錄，支援欄位選擇、匯出、排程。
 * 對應 FRONTME.md 8.5 EventReportPage 章節。
 */

import React, { useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Checkbox, ListItemText, MenuItem, FormControl, InputLabel, Select,
  SelectChangeEvent, OutlinedInput,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { ReportFilter } from '../../components/common/ReportFilter';
import { useReportData } from '../../hooks/useReportData';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Event } from '../../types/models';
import type { ReportParams } from '../../types/ui';
import { getEventReport } from '../../api/endpoints';
import { formatTime, formatNotificationTitle } from '../../utils/formatter';

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  tableContainer: { flex: 1, overflow: 'auto' },
  filterRow: { display: 'flex', gap: theme.spacing(2), padding: theme.spacing(0, 2, 2, 2), alignItems: 'center' },
}));

const ALL_COLUMNS = ['eventTime', 'type', 'deviceId', 'geofenceId', 'maintenanceId', 'address'] as const;
type ColumnKey = typeof ALL_COLUMNS[number];

/** 欄位 key → 翻譯 key 對映 */
const COLUMN_TRANS_KEYS: Record<string, string> = {
  eventTime: 'positionFixTime',
  type: 'sharedType',
  deviceId: 'reportDeviceName',
  geofenceId: 'sharedGeofence',
  maintenanceId: 'sharedMaintenance',
  address: 'positionAddress',
};

/** 事件報表頁面 */
export const EventReportPage: React.FC = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const [data, setData] = useState<Event[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<ColumnKey[]>(['eventTime', 'type', 'deviceId']);
  const [loading, handleShow] = useReportData(
    async (params: ReportParams, signal) => {
      const res = await getEventReport(params, signal);
      setData(res.data);
    },
  );

  const handleExport = useCallback((params: ReportParams & { format: ExportFormat }) => {
    // Excel/CSV export handled by server endpoints
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
      ...(params.deviceIds.length ? { deviceId: params.deviceIds.join(',') } : {}),
    });
    window.open(`/api/reports/events/${params.format}?${query}`, '_blank');
  }, []);

  const renderCellValue = (event: Event, col: ColumnKey): string => {
    switch (col) {
      case 'eventTime': return formatTime(event.eventTime);
      case 'type': return formatNotificationTitle(t, event);
      case 'deviceId': return String(event.deviceId ?? '-');
      case 'geofenceId': return String(event.geofenceId ?? '-');
      case 'maintenanceId': return String(event.maintenanceId ?? '-');
      case 'address': return (event.attributes as Record<string, string>)?.address || '-';
      default: return '-';
    }
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportEvents']}>
      <div className={classes.root}>
        <ReportFilter deviceType="multiple" onShow={handleShow} onExport={handleExport} loading={loading} />

        <div className={classes.filterRow}>
          <FormControl size="small" sx={{ minWidth: 300 }}>
            <InputLabel>{t('sharedColumns')}</InputLabel>
            <Select
              multiple
              value={selectedColumns}
              onChange={(e: SelectChangeEvent<ColumnKey[]>) => setSelectedColumns(e.target.value as ColumnKey[])}
              input={<OutlinedInput label={t('sharedColumns')} />}
              renderValue={(selected) => selected.map((col) => t(COLUMN_TRANS_KEYS[col] || col)).join(', ')}
            >
              {ALL_COLUMNS.map((col) => (
                <MenuItem key={col} value={col}>
                  <Checkbox checked={selectedColumns.includes(col)} />
                  <ListItemText primary={t(COLUMN_TRANS_KEYS[col] || col)} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {selectedColumns.map((col) => (
                  <TableCell key={col}>{t(COLUMN_TRANS_KEYS[col] || col)}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((event) => (
                <TableRow key={event.id} hover>
                  {selectedColumns.map((col) => (
                    <TableCell key={col}>{renderCellValue(event, col)}</TableCell>
                  ))}
                </TableRow>
              ))}
              {data.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={selectedColumns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {t('reportSelectPrompt') || 'Select device(s) and time range, then click Show'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </PageLayout>
  );
};
