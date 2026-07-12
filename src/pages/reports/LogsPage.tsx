/**
 * 裝置通訊日誌頁面
 *
 * 即時檢視裝置的原始通訊協定資料。
 * 啟用 WebSocket 日誌串流，表格顯示 registered/unregistered 裝置。
 * 對應 FRONTME.md 8.14 LogsPage 章節。
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Typography,
  Box,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { sessionActions } from '../../store';
import type { LogEntry } from '../../types/ui';
import { useAsyncTask } from '../../hooks/useAsyncTask';
import { formatTime } from '../../utils/formatter';

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  toolbar: { display: 'flex', alignItems: 'center', gap: theme.spacing(2), padding: theme.spacing(2) },
  tableContainer: { flex: 1, overflow: 'auto' },
  statusRegistered: { color: theme.palette.success.main },
  statusUnregistered: { color: theme.palette.warning.main },
  protocol: { fontFamily: 'monospace', fontSize: '0.85rem' },
  data: { fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  count: { marginLeft: theme.spacing(2), color: theme.palette.text.secondary },
}));

/**
 * 裝置通訊日誌頁面
 * 顯示 WebSocket 推送的即時裝置通訊資料
 */
export const LogsPage: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const logs = useAppSelector((state) => state.session.logs);
  const includeLogs = useAppSelector((state) => state.session.includeLogs);
  const [paused, setPaused] = useState(false);
  const [displayLogs, setDisplayLogs] = useState<LogEntry[]>([]);

  // 啟用/停用日誌
  useEffect(() => {
    dispatch(sessionActions.enableLogs(true));
    return () => { dispatch(sessionActions.enableLogs(false)); };
  }, [dispatch]);

  // 管理顯示的日誌（最多保留 500 筆）
  useEffect(() => {
    if (!paused && logs.length > 0) {
      setDisplayLogs((prev) => {
        const combined = [...prev, ...logs.slice(prev.length)];
        return combined.slice(-500);
      });
    }
  }, [logs, paused]);

  /** 暫停/繼續 */
  const togglePause = useCallback(() => setPaused((p) => !p), []);

  /** 清除日誌 */
  const handleClear = useCallback(() => {
    setDisplayLogs([]);
    dispatch(sessionActions.enableLogs(false));
    setTimeout(() => dispatch(sessionActions.enableLogs(true)), 100);
  }, [dispatch]);

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['Logs']}>
      <div className={classes.root}>
        <div className={classes.toolbar}>
          <Button
            variant={paused ? 'contained' : 'outlined'}
            color="primary"
            startIcon={paused ? <PlayArrowIcon /> : <StopIcon />}
            onClick={togglePause}
          >
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClear}>
            Clear
          </Button>
          <Typography variant="body2" className={classes.count}>
            {displayLogs.length} entries
          </Typography>
        </div>

        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width={120}>Status</TableCell>
                <TableCell width={150}>Unique ID</TableCell>
                <TableCell width={100}>Protocol</TableCell>
                <TableCell>Data</TableCell>
                <TableCell width={80}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayLogs.slice().reverse().map((entry, idx) => (
                <TableRow key={`${entry.uniqueId}-${idx}`} hover>
                  <TableCell>
                    <span className={entry.status === 'registered' ? classes.statusRegistered : classes.statusUnregistered}>
                      {entry.status}
                    </span>
                  </TableCell>
                  <TableCell className={classes.protocol}>{entry.uniqueId}</TableCell>
                  <TableCell className={classes.protocol}>{entry.protocol}</TableCell>
                  <TableCell className={classes.data}>
                    <Tooltip title={entry.data} arrow>
                      <span>{entry.data}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {entry.status === 'unregistered' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/settings/device?uniqueId=${entry.uniqueId}`)}
                      >
                        Register
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {displayLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Waiting for device communication data...<br />
                    <Typography variant="caption">Ensure devices are sending data to the server</Typography>
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
