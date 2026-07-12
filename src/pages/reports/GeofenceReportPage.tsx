/**
 * 圍欄報表頁面
 *
 * 查詢裝置進出圍欄的記錄。
 * 對應 FRONTME.md 8.6 GeofenceReportPage 章節。
 */

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { ReportFilter } from '../../components/common/ReportFilter';
import { useReportData } from '../../hooks/useReportData';
import type { ReportGeofences } from '../../types/models';
import type { ReportParams } from '../../types/ui';
import { getGeofenceReport } from '../../api/endpoints';
import { formatTime } from '../../utils/formatter';

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  tableContainer: { flex: 1, overflow: 'auto' },
}));

const COLUMNS: { key: keyof ReportGeofences; label: string }[] = [
  { key: 'deviceName', label: 'Device' }, { key: 'geofenceId', label: 'Geofence' },
  { key: 'startTime', label: 'Start Time' }, { key: 'endTime', label: 'End Time' },
];

/** 圍欄報表頁面 */
export const GeofenceReportPage: React.FC = () => {
  const { classes } = useStyles();
  const [data, setData] = useState<ReportGeofences[]>([]);
  const [loading, handleShow] = useReportData(
    async (params: ReportParams, signal) => {
      const res = await getGeofenceReport(params, signal);
      setData(res.data);
    },
  );

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['sharedGeofences']}>
      <div className={classes.root}>
        <ReportFilter deviceType="multiple" onShow={handleShow} loading={loading} />
        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>{COLUMNS.map((c) => <TableCell key={c.key}>{c.label}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.deviceName || `Device #${row.deviceId}`}</TableCell>
                  <TableCell>{row.geofenceId ?? '-'}</TableCell>
                  <TableCell>{formatTime(row.startTime)}</TableCell>
                  <TableCell>{formatTime(row.endTime)}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && !loading && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Select device(s) and time range</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </PageLayout>
  );
};
