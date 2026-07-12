/**
 * 路線報表頁面
 *
 * 顯示裝置的位置路線軌跡，含地圖與可選欄位表格。
 * 對應 FRONTME.md 8.7 PositionsReportPage 章節。
 */

import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box,
  Checkbox, ListItemText, MenuItem, FormControl, InputLabel, Select,
  SelectChangeEvent, OutlinedInput,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { ReportFilter } from '../../components/common/ReportFilter';
import { useReportData } from '../../hooks/useReportData';
import { MapView } from '../../map/core/MapView';
import { MapPositions } from '../../map/main/MapPositions';
import { MapCamera } from '../../map/main/MapCamera';
import { MapRoutePath } from '../../map/main/MapRoutePath';
import type { Position } from '../../types/models';
import type { ReportParams } from '../../types/ui';
import { getPositions } from '../../api/endpoints';
import { formatTime, formatSpeed, formatAltitude, formatCourse, formatCoordinate } from '../../utils/formatter';
import { useAttributePreference } from '../../utils/preferences';
import type { SpeedUnit, AltitudeUnit, CoordinateFormat } from '../../types/ui';

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  mapContainer: { height: 300, minHeight: 200 },
  tableContainer: { flex: 1, overflow: 'auto' },
  controls: { display: 'flex', gap: theme.spacing(2), padding: theme.spacing(0, 2, 2, 2) },
}));

const POSITION_COLUMNS = [
  { key: 'fixTime', label: 'Time' }, { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' }, { key: 'speed', label: 'Speed' },
  { key: 'altitude', label: 'Altitude' }, { key: 'course', label: 'Course' },
  { key: 'address', label: 'Address' }, { key: 'accuracy', label: 'Accuracy' },
] as const;

/** 路線報表頁面 */
export const PositionsReportPage: React.FC = () => {
  const { classes } = useStyles();
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['fixTime', 'latitude', 'longitude', 'speed']);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [loading, handleShow] = useReportData(
    async (params: ReportParams, signal) => {
      const res = await getPositions({ deviceId: params.deviceIds[0], from: params.from, to: params.to }, signal);
      setPositions(res.data);
    },
  );
  const speedUnit = useAttributePreference<SpeedUnit>('speedUnit', 'kn');
  const altitudeUnit = useAttributePreference<AltitudeUnit>('altitudeUnit', 'm');
  const coordFormat = useAttributePreference<CoordinateFormat>('coordinateFormat', 'dd');

  const renderCell = (pos: Position, key: string): string => {
    switch (key) {
      case 'fixTime': return formatTime(pos.fixTime);
      case 'latitude': return pos.latitude != null ? formatCoordinate('latitude', pos.latitude, coordFormat) : '-';
      case 'longitude': return pos.longitude != null ? formatCoordinate('longitude', pos.longitude, coordFormat) : '-';
      case 'speed': return pos.speed != null ? formatSpeed(pos.speed, speedUnit, (k: string) => k) : '-';
      case 'altitude': return pos.altitude != null ? formatAltitude(pos.altitude, altitudeUnit, (k: string) => k) : '-';
      case 'course': return pos.course != null ? `${formatCourse(pos.course)} (${pos.course}°)` : '-';
      case 'address': return pos.address || '-';
      case 'accuracy': return pos.accuracy != null ? `${pos.accuracy.toFixed(1)} m` : '-';
      default: return '-';
    }
  };

  const selectedPosition = selectedPositionId
    ? positions.find((p) => p.id === selectedPositionId)
    : undefined;

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportPositions']}>
      <div className={classes.root}>
        <ReportFilter deviceType="single" onShow={handleShow} loading={loading} />

        <div className={classes.mapContainer}>
          <MapView>
            {positions.length > 1 && <MapRoutePath positions={positions} />}
            <MapPositions
              positions={positions}
              selectedPosition={selectedPosition}
              onMarkerClick={(_, id) => setSelectedPositionId(id)}
            />
            {positions.length > 0 && (
              <MapCamera
                positions={selectedPosition ? [selectedPosition] : positions.slice(0, 1)}
              />
            )}
          </MapView>
        </div>

        <div className={classes.controls}>
          <FormControl size="small" sx={{ minWidth: 300 }}>
            <InputLabel>Columns</InputLabel>
            <Select
              multiple
              value={selectedColumns}
              onChange={(e: SelectChangeEvent<string[]>) => setSelectedColumns(e.target.value as string[])}
              input={<OutlinedInput label="Columns" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {POSITION_COLUMNS.map((col) => (
                <MenuItem key={col.key} value={col.key}>
                  <Checkbox checked={selectedColumns.includes(col.key)} />
                  <ListItemText primary={col.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {selectedColumns.map((key) => (
                  <TableCell key={key}>{POSITION_COLUMNS.find((c) => c.key === key)?.label || key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.map((pos) => (
                <TableRow
                  key={pos.id}
                  hover
                  selected={selectedPositionId === pos.id}
                  onClick={() => setSelectedPositionId(pos.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  {selectedColumns.map((key) => (
                    <TableCell key={key}>{renderCell(pos, key)}</TableCell>
                  ))}
                </TableRow>
              ))}
              {positions.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={selectedColumns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Select a device and time range, then click Show
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
