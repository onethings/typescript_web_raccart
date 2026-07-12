/**
 * 摘要報表頁面
 *
 * 每日或整體摘要統計（距離、速度、油耗、引擎時數）。
 * 對應 FRONTME.md 8.9 SummaryReportPage 章節。
 */

import React, { useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, FormControlLabel } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { ReportFilter } from '../../components/common/ReportFilter';
import { useReportData } from '../../hooks/useReportData';
import { useTranslation } from '../../i18n/LocalizationProvider';
import type { ReportSummary } from '../../types/models';
import type { ReportParams } from '../../types/ui';
import { getSummaryReport } from '../../api/endpoints';

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  tableContainer: { flex: 1, overflow: 'auto' },
  controls: { display: 'flex', gap: theme.spacing(2), padding: theme.spacing(0, 2, 2, 2), alignItems: 'center' },
}));

const COLUMNS: { key: keyof ReportSummary; label: string; tKey: string; fmt: (v: number | undefined) => string }[] = [
  { key: 'deviceName', label: 'Device', tKey: 'reportDeviceName', fmt: (v) => v != null ? String(v) : '-' },
  { key: 'maxSpeed', label: 'Max Speed', tKey: 'reportMaximumSpeed', fmt: (v) => v != null ? v.toFixed(1) : '-' },
  { key: 'averageSpeed', label: 'Avg Speed', tKey: 'reportAverageSpeed', fmt: (v) => v != null ? v.toFixed(1) : '-' },
  { key: 'distance', label: 'Distance', tKey: 'sharedDistance', fmt: (v) => v != null ? (v / 1000).toFixed(2) : '-' },
  { key: 'spentFuel', label: 'Fuel', tKey: 'reportSpentFuel', fmt: (v) => v != null ? v.toFixed(1) : '-' },
  { key: 'engineHours', label: 'Engine Hours', tKey: 'reportEngineHours', fmt: (v) => v != null ? String(v) : '-' },
];

/** 摘要報表頁面 */
export const SummaryReportPage: React.FC = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const [data, setData] = useState<ReportSummary[]>([]);
  const [daily, setDaily] = useState(false);
  const dailyRef = useRef(daily);
  dailyRef.current = daily;

  const [loading, handleShow] = useReportData(
    async (params: ReportParams, signal) => {
      const res = await getSummaryReport({ ...params, daily: dailyRef.current }, signal);
      setData(res.data);
    },
  );

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportSummary']}>
      <div className={classes.root}>
        <ReportFilter deviceType="multiple" onShow={handleShow} loading={loading} />

        <div className={classes.controls}>
          <FormControlLabel
            control={<Switch checked={daily} onChange={(e) => setDaily(e.target.checked)} />}
            label="Daily"
          />
        </div>

        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>{COLUMNS.map((c) => <TableCell key={c.key}>{c.label}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  {COLUMNS.map((c) => (
                    <TableCell key={c.key}>
                      {c.key === 'deviceName'
                        ? row.deviceName || `Device #${row.deviceId}`
                        : c.fmt(row[c.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {data.length === 0 && !loading && (
                <TableRow><TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>{t('reportSelectPrompt') || 'Select device(s) and time range'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </PageLayout>
  );
};
