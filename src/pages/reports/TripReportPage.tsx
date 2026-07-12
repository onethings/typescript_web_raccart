/**
 * 行程報表頁面
 *
 * 查詢裝置的移動行程記錄，含地圖路線。
 * 對應 FRONTME.md 8.10 TripReportPage 章節。
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
import { MapRoutePath } from '../../map/main/MapRoutePath';
import { MapMarkers } from '../../map/main/MapMarkers';
import { MapCamera } from '../../map/main/MapCamera';
import type { ReportTrips } from '../../types/models';
import type { ReportParams } from '../../types/ui';
import type { Position } from '../../types/models';
import { getTripReport } from '../../api/endpoints';
import { formatTime } from '../../utils/formatter';
import { useReportStyles } from '../../reports/common/useReportStyles';

const ROW_HEIGHT = 48;

const COLUMNS: { key: string; label: string; tKey: string }[] = [
  { key: 'deviceName', label: 'Device', tKey: 'reportDeviceName' },
  { key: 'startTime', label: 'Start Time', tKey: 'reportStartTime' },
  { key: 'startAddress', label: 'Start Address', tKey: 'reportStartAddress' },
  { key: 'endTime', label: 'End Time', tKey: 'reportEndTime' },
  { key: 'endAddress', label: 'End Address', tKey: 'reportEndAddress' },
  { key: 'distance', label: 'Distance', tKey: 'sharedDistance' },
  { key: 'averageSpeed', label: 'Avg Speed', tKey: 'reportAverageSpeed' },
  { key: 'maxSpeed', label: 'Max Speed', tKey: 'reportMaximumSpeed' },
  { key: 'duration', label: 'Duration', tKey: 'reportDuration' },
  { key: 'spentFuel', label: 'Fuel', tKey: 'reportSpentFuel' },
  { key: 'driverName', label: 'Driver', tKey: 'sharedDriver' },
];

/** 行程報表頁面 */
export const TripReportPage: React.FC = () => {
  const { classes: reportClasses } = useReportStyles();
  const t = useTranslation();
  const [data, setData] = useState<ReportTrips[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [loading, handleShow] = useReportData(
    async (params: ReportParams, signal) => {
      const res = await getTripReport(params, signal);
      setData(res.data);
    },
  );

  // 模擬行程位置資料（從 API 回傳中提取）
  const routePositions = useMemo((): Position[] => {
    if (selectedTrip == null) return [];
    const trip = data[selectedTrip];
    if (!trip) return [];
    // 如果 API 有回傳 positions 就使用，否則用起始/結束點
    if ((trip as Record<string, unknown>).positions) {
      return (trip as Record<string, unknown>).positions as Position[];
    }
    // 用起始結束點建立模擬位置
    if (trip.startLat != null && trip.startLon != null && trip.endLat != null && trip.endLon != null) {
      return [
        { id: 0, deviceId: trip.deviceId, latitude: trip.startLat, longitude: trip.startLon, fixTime: trip.startTime, speed: 0, course: 0, altitude: 0, accuracy: 0, protocol: '', attributes: {}, geofenceIds: [] },
        { id: 1, deviceId: trip.deviceId, latitude: trip.endLat, longitude: trip.endLon, fixTime: trip.endTime, speed: 0, course: 0, altitude: 0, accuracy: 0, protocol: '', attributes: {}, geofenceIds: [] },
      ];
    }
    return [];
  }, [data, selectedTrip]);

  const tripMarkers = useMemo(() => {
    if (!routePositions.length) return [];
    return routePositions.map((p, i) => ({
      latitude: p.latitude,
      longitude: p.longitude,
      title: i === 0 ? 'Start' : i === routePositions.length - 1 ? 'End' : '',
      image: i === 0 ? 'start-neutral' : i === routePositions.length - 1 ? 'finish-neutral' : undefined,
    }));
  }, [routePositions]);

  const renderValue = (row: ReportTrips, key: string): string => {
    switch (key) {
      case 'deviceName': return row.deviceName || `Device #${row.deviceId}`;
      case 'startTime': return formatTime(row.startTime);
      case 'endTime': return formatTime(row.endTime);
      case 'distance': return row.distance != null ? `${(row.distance / 1000).toFixed(2)} km` : '-';
      case 'averageSpeed': return row.averageSpeed != null ? `${row.averageSpeed.toFixed(1)} kn` : '-';
      case 'maxSpeed': return row.maxSpeed != null ? `${row.maxSpeed.toFixed(1)} kn` : '-';
      case 'duration': return row.duration != null ? `${Math.floor(row.duration / 60)} min` : '-';
      case 'spentFuel': return row.spentFuel != null ? `${row.spentFuel.toFixed(1)} L` : '-';
      case 'driverName': return row.driverName || '-';
      case 'startAddress': return row.startAddress || '-';
      case 'endAddress': return row.endAddress || '-';
      default: return '-';
    }
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTrips']}>
      <div className={reportClasses.root}>
        <ReportFilter deviceType="multiple" onShow={handleShow} loading={loading} />
        {/* 地圖 */}
        {routePositions.length > 0 && (
          <div className={reportClasses.mapContainer} style={{ height: 250 }}>
            <MapView>
              <MapRoutePath positions={routePositions} />
              <MapMarkers markers={tripMarkers} showTitles />
              <MapCamera positions={routePositions} />
            </MapView>
          </div>
        )}
        {/* 表格 */}
        <TableContainer className={reportClasses.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>{COLUMNS.map((c) => <TableCell key={c.key}>{c.label}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow
                  key={idx}
                  hover
                  selected={selectedTrip === idx}
                  onClick={() => setSelectedTrip(idx)}
                  sx={{ cursor: 'pointer', height: ROW_HEIGHT }}
                >
                  {COLUMNS.map((c) => (<TableCell key={c.key}>{renderValue(row, c.key)}</TableCell>))}
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
