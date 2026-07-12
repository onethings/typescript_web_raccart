/**
 * 停留報表頁面
 *
 * 查詢裝置的停留記錄。
 * 對應 FRONTME.md 8.8 StopReportPage 章節。
 */

import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { ReportFilter } from '../../components/common/ReportFilter';
import { useReportData } from '../../hooks/useReportData';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { MapView } from '../../map/core/MapView';
import { MapMarkers } from '../../map/main/MapMarkers';
import { MapCamera } from '../../map/main/MapCamera';
import type { ReportStops } from '../../types/models';
import type { ReportParams } from '../../types/ui';
import { getStopReport } from '../../api/endpoints';
import { formatTime } from '../../utils/formatter';

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  tableContainer: { flex: 1, overflow: 'auto' },
  mapContainer: { height: 250, minHeight: 200, flexShrink: 0 },
}));

const COLUMNS: { key: keyof ReportStops; label: string; tKey: string }[] = [
  { key: 'deviceName', label: 'Device', tKey: 'reportDeviceName' },
  { key: 'startTime', label: 'Start', tKey: 'reportStartTime' },
  { key: 'address', label: 'Address', tKey: 'positionAddress' },
  { key: 'duration', label: 'Duration', tKey: 'reportDuration' },
  { key: 'endTime', label: 'End', tKey: 'reportEndTime' },
  { key: 'engineHours', label: 'Engine Hours', tKey: 'reportEngineHours' },
  { key: 'spentFuel', label: 'Fuel', tKey: 'reportSpentFuel' },
];

export const StopReportPage: React.FC = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const [data, setData] = useState<ReportStops[]>([]);
  const [selectedStop, setSelectedStop] = useState<number | null>(null);
  const [loading, handleShow] = useReportData(
    async (params: ReportParams, signal) => {
      const res = await getStopReport(params, signal);
      setData(res.data);
    },
  );

  // 停留位置標記
  const stopMarkers = useMemo(() => {
    return data.map((row, idx) => ({
      latitude: row.latitude ?? row.startLat ?? 0,
      longitude: row.longitude ?? row.startLon ?? 0,
      title: row.address || `Stop #${idx + 1}`,
      image: selectedStop === idx ? 'marker-info' : 'default-neutral',
    }));
  }, [data, selectedStop]);

  const selectedMarker = selectedStop != null ? stopMarkers[selectedStop] : undefined;

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportStops']}>
      <div className={classes.root}>
        <ReportFilter deviceType="multiple" onShow={handleShow} loading={loading} />

        {/* 停留位置地圖 */}
        {stopMarkers.length > 0 && (
          <div className={classes.mapContainer}>
            <MapView>
              <MapMarkers markers={stopMarkers} showTitles />
              {selectedMarker && (
                <MapCamera latitude={selectedMarker.latitude} longitude={selectedMarker.longitude} zoom={14} />
              )}
            </MapView>
          </div>
        )}

        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>{COLUMNS.map((c) => <TableCell key={c.key}>{c.label}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow
                  key={idx}
                  hover
                  selected={selectedStop === idx}
                  onClick={() => setSelectedStop(idx)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{row.deviceName || `Device #${row.deviceId}`}</TableCell>
                  <TableCell>{formatTime(row.startTime)}</TableCell>
                  <TableCell>{row.address || '-'}</TableCell>
                  <TableCell>{row.duration != null ? `${Math.floor(row.duration / 60)} min` : '-'}</TableCell>
                  <TableCell>{formatTime(row.endTime)}</TableCell>
                  <TableCell>{row.engineHours ?? '-'}</TableCell>
                  <TableCell>{row.spentFuel != null ? `${row.spentFuel.toFixed(1)} L` : '-'}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && !loading && (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>{t('reportSelectPrompt') || 'Select device(s) and time range'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </PageLayout>
  );
};
