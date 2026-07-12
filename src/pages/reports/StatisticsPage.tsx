/**
 * 伺服器統計頁面（管理員專用）
 *
 * 查看伺服器使用統計資料：活躍使用者/裝置、請求數、訊息量。
 * 對應 FRONTME.md 8.12 StatisticsPage 章節。
 */

import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { ReportFilter } from '../../components/common/ReportFilter';
import { useReportData } from '../../hooks/useReportData';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { Statistics } from '../../types/models';
import type { ReportParams } from '../../types/ui';
import { getStatistics } from '../../api/endpoints';
import { formatTime } from '../../utils/formatter';

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  tableContainer: { flex: 1, overflow: 'auto' },
  statCard: {
    display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
    padding: theme.spacing(2), margin: theme.spacing(1), minWidth: 120,
    borderRadius: theme.shape.borderRadius, backgroundColor: theme.palette.action.hover,
  },
  statValue: { fontSize: '1.5rem', fontWeight: 700 },
  statLabel: { fontSize: '0.75rem', color: theme.palette.text.secondary, textTransform: 'uppercase' as const },
}));

const STAT_COLUMNS: { key: keyof Statistics; label: string; tKey: string }[] = [
  { key: 'captureTime', label: 'Time', tKey: 'reportStartTime' },
  { key: 'activeUsers', label: 'Active Users', tKey: 'reportTitle' },
  { key: 'activeDevices', label: 'Active Devices', tKey: 'reportDeviceName' },
  { key: 'requests', label: 'Requests', tKey: 'reportTitle' },
  { key: 'messagesReceived', label: 'Messages Received', tKey: 'reportTitle' },
  { key: 'messagesStored', label: 'Messages Stored', tKey: 'reportTitle' },
];

/** 伺服器統計頁面 */
export const StatisticsPage: React.FC = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const [data, setData] = useState<Statistics[]>([]);
  const [loading, handleShow] = useReportData(
    async (params: ReportParams, signal) => {
      const res = await getStatistics(params.from, params.to);
      setData(res.data);
    },
  );

  // 計算摘要
  const totalActiveUsers = data.reduce((s, r) => s + (r.activeUsers || 0), 0);
  const totalActiveDevices = data.reduce((s, r) => s + (r.activeDevices || 0), 0);
  const totalRequests = data.reduce((s, r) => s + (r.requests || 0), 0);

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['Statistics']}>
      <div className={classes.root}>
        <ReportFilter deviceType="none" onShow={handleShow} loading={loading} />

        {data.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', px: 2, pb: 2 }}>
            <div className={classes.statCard}>
              <span className={classes.statValue}>{totalActiveUsers}</span>
              <span className={classes.statLabel}>Active Users</span>
            </div>
            <div className={classes.statCard}>
              <span className={classes.statValue}>{totalActiveDevices}</span>
              <span className={classes.statLabel}>Active Devices</span>
            </div>
            <div className={classes.statCard}>
              <span className={classes.statValue}>{totalRequests.toLocaleString()}</span>
              <span className={classes.statLabel}>Total Requests</span>
            </div>
          </Box>
        )}

        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {STAT_COLUMNS.map((col) => (
                  <TableCell key={col.key}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  {STAT_COLUMNS.map((col) => (
                    <TableCell key={col.key}>
                      {col.key === 'captureTime'
                        ? formatTime(row.captureTime)
                        : (row[col.key] ?? '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {data.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={STAT_COLUMNS.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {t('reportSelectPrompt') || 'Select a time range and click Show'}
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
