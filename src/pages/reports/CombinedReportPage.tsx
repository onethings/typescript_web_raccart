/**
 * 綜合報表頁面
 *
 * 同時顯示事件 + 路線的地圖報表。
 * 對應 FRONTME.md 8.3 CombinedReportPage 章節。
 */

import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { ReportFilter } from '../../components/common/ReportFilter';
import { useReportData } from '../../hooks/useReportData';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { MapView } from '../../map/core/MapView';
import { MapRouteCoordinates } from '../../map/main/MapRouteCoordinates';
import { MapMarkers } from '../../map/main/MapMarkers';
import { MapCamera } from '../../map/main/MapCamera';
import { useReportStyles } from '../../reports/common/useReportStyles';
import { ColumnSelect } from '../../reports/components/ColumnSelect';
import type { CombinedReportItem, Event } from '../../types/models';
import type { ReportParams } from '../../types/ui';
import { prefixString } from '../../utils/stringUtils';
import { getCombinedReport } from '../../api/endpoints';

const EVENT_COLUMNS = [
  { id: 'deviceId', label: 'reportDeviceName' },
  { id: 'eventType', label: 'sharedType' },
  { id: 'eventTime', label: 'reportStartTime' },
  { id: 'geofenceId', label: 'sharedGeofence' },
  { id: 'maintenanceId', label: 'sharedMaintenance' },
  { id: 'attributes', label: 'sharedAttributes' },
];

/** 綜合報表頁面 */
export const CombinedReportPage: React.FC = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();
  const [reportData, setReportData] = useState<CombinedReportItem[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['deviceId', 'eventType', 'servertime']);
  const [loading, handleShow] = useReportData(
    async (params: ReportParams, signal) => {
      const res = await getCombinedReport(params, signal);
      setReportData(res.data);
    },
  );

  // 提取所有路線座標
  const routeCoordinates = useMemo(() => {
    const coords: [number, number][] = [];
    reportData.forEach((item) => {
      if (item.route) {
        item.route.forEach(([lng, lat]) => coords.push([lng, lat]));
      }
      item.positions?.forEach((pos) => {
        coords.push([pos.longitude, pos.latitude]);
      });
    });
    return coords;
  }, [reportData]);

  // 提取所有事件位置作為標記
  const markers = useMemo(() => {
    const result: Array<{ latitude: number; longitude: number; title: string }> = [];
    reportData.forEach((item) => {
      item.positions?.forEach((pos) => {
        result.push({
          latitude: pos.latitude,
          longitude: pos.longitude,
          title: `Device #${pos.deviceId}`,
        });
      });
    });
    return result;
  }, [reportData]);

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportCombined']}>
      <div className={classes.root}>
        <ReportFilter
          deviceType="multiple"
          onShow={handleShow}
          loading={loading}
        />
        {/* 地圖 */}
        <div className={classes.mapContainer}>
          <MapView>
            {routeCoordinates.length > 0 && (
              <MapRouteCoordinates name="Route" coordinates={routeCoordinates} />
            )}
            {markers.length > 0 && (
              <MapMarkers markers={markers} showTitles />
            )}
            <MapCamera coordinates={routeCoordinates} />
          </MapView>
        </div>
        {/* 欄位選擇 */}
        <ColumnSelect
          title={t('sharedColumns')}
          columns={EVENT_COLUMNS.map((c) => ({ ...c, label: t(c.label) }))}
          selected={selectedColumns}
          onChange={setSelectedColumns}
        />
        {/* 表格 */}
        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {selectedColumns.map((col) => {
                  const def = EVENT_COLUMNS.find((c) => c.id === col);
                  return <TableCell key={col}>{t(def?.label || col)}</TableCell>;
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((item) =>
                (item.events ?? []).map((evt, idx) => (
                  <TableRow key={`${item.deviceId}-${idx}`}>
                    {selectedColumns.map((col) => {
                      let content: React.ReactNode = '-';
                      switch (col) {
                        case 'deviceId':
                          content = `${t('reportDeviceName')} #${item.deviceId}`;
                          break;
                        case 'eventType':
                          content = t(prefixString('event', evt.type));
                          break;
                        case 'eventTime':
                          content = evt.eventTime ? new Date(evt.eventTime).toLocaleString() : '-';
                          break;
                        case 'geofenceId':
                          content = evt.geofenceId ?? '-';
                          break;
                        case 'maintenanceId':
                          content = evt.maintenanceId ?? '-';
                          break;
                        case 'attributes':
                          content = evt.attributes ? JSON.stringify(evt.attributes).substring(0, 50) : '-';
                          break;
                      }
                      return <TableCell key={col}>{content}</TableCell>;
                    })}
                  </TableRow>
                )),
              )}
              {reportData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={selectedColumns.length} align="center">
                    {loading ? t('sharedLoading') : t('reportSelectPrompt') || 'Select device and time range, then click Show'}
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
