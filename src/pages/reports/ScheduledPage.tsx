/**
 * 排程報表管理頁面
 *
 * 檢視、刪除已排程的報表。
 * 對應 FRONTME.md 8.11 ScheduledPage 章節。
 */

import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { makeStyles } from 'tss-react/mui';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useCatch } from '../../hooks/useAsyncTask';
import { useAsyncTask } from '../../hooks/useAsyncTask';
import { useCatch } from '../../hooks/useAsyncTask';
import { deleteScheduledReport } from '../../api/endpoints';

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  tableContainer: { flex: 1, overflow: 'auto' },
}));

interface ScheduledReport {
  id: number;
  type: string;
  description?: string;
  calendarId?: number;
  /** 翻譯類型 */
  typeDisplay?: string;
}

/** 報表類型對映 */
const REPORT_TYPE_MAP: Record<string, string> = {
  events: 'Events',
  route: 'Route',
  summary: 'Summary',
  trips: 'Trips',
  stops: 'Stops',
};

/** 排程報表管理頁面 */
export const ScheduledPage: React.FC = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const [reports, setReports] = useState<ScheduledReport[]>([]);

  // 載入排程報表
  useAsyncTask(
    async ({ signal }) => {
      try {
        const res = await fetch('/api/reports', { signal });
        if (res.ok) {
          const data = await res.json();
          setReports(
            (data as ScheduledReport[]).map((r) => ({
              ...r,
              typeDisplay: REPORT_TYPE_MAP[r.type] || r.type,
            })),
          );
        }
      } catch { /* ignore */ }
    },
    [],
  );

  /** 刪除排程 */
  const handleDelete = useCatch(async (id: number) => {
    await deleteScheduledReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  });

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['Scheduled Reports']}>
      <div className={classes.root}>
        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Calendar ID</TableCell>
                <TableCell width={80}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>{report.typeDisplay}</TableCell>
                  <TableCell>{report.description || '-'}</TableCell>
                  <TableCell>{report.calendarId ?? '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleDelete(report.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    <Typography variant="body2">
                      {t('reportScheduled') || 'No scheduled reports'}
                    </Typography>
                    <Typography variant="caption">
                      {t('sharedSchedulePrompt') || 'Schedule reports from individual report pages'}
                    </Typography>
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
