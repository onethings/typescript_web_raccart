/**
 * 稽核日誌頁面（管理員專用）
 *
 * 檢視所有使用者的操作記錄。
 * 對應 FRONTME.md 8.13 AuditPage 章節。
 */

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { ReportFilter } from '../../components/common/ReportFilter';
import { useReportData } from '../../hooks/useReportData';
import type { Action } from '../../types/models';
import type { ReportParams } from '../../types/ui';
import { getAudit } from '../../api/endpoints';
import { formatTime } from '../../utils/formatter';

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  tableContainer: { flex: 1, overflow: 'auto' },
}));

const COLUMNS: { key: keyof Action; label: string }[] = [
  { key: 'actionTime', label: 'Time' }, { key: 'userId', label: 'User ID' },
  { key: 'userEmail', label: 'Email' }, { key: 'actionType', label: 'Action Type' },
  { key: 'objectType', label: 'Object Type' }, { key: 'objectId', label: 'Object ID' },
  { key: 'address', label: 'Address' },
];

/** 稽核日誌頁面 */
export const AuditPage: React.FC = () => {
  const { classes } = useStyles();
  const [data, setData] = useState<Action[]>([]);
  const [loading, handleShow] = useReportData(
    async (params: ReportParams, signal) => {
      const res = await getAudit(params.from, params.to);
      setData(res.data);
    },
  );

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['Audit']}>
      <div className={classes.root}>
        <ReportFilter deviceType="none" onShow={handleShow} loading={loading} />
        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableCell key={col.key}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={row.id || idx} hover>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key}>
                      {col.key === 'actionTime'
                        ? formatTime(row.actionTime)
                        : (row[col.key] ?? '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {data.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Select a time range and click Show
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
