/**
 * 圖表報表頁面
 *
 * 使用 Recharts 繪製位置資料圖表，支援多 Y 軸欄位選擇。
 * 對應 FRONTME.md 8.4 ChartReportPage 章節。
 */

import React, { useState, useMemo } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Chip,
  OutlinedInput, Checkbox, ListItemText, SelectChangeEvent,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Brush,
} from 'recharts';
import { PageLayout } from '../../components/common/PageLayout';
import { ReportsMenu } from '../../components/common/ReportsMenu';
import { ReportFilter } from '../../components/common/ReportFilter';
import { useReportData } from '../../hooks/useReportData';
import type { Position } from '../../types/models';
import type { ReportParams } from '../../types/ui';
import { getPositions } from '../../api/endpoints';
import { formatTime } from '../../utils/formatter';

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', display: 'flex', flexDirection: 'column' },
  chartContainer: { flex: 1, padding: theme.spacing(2), minHeight: 0 },
  controls: { display: 'flex', gap: theme.spacing(2), padding: theme.spacing(0, 2, 2, 2) },
}));

const CHART_FIELDS = [
  { key: 'speed', label: 'Speed', color: '#8884d8' },
  { key: 'altitude', label: 'Altitude', color: '#82ca9d' },
  { key: 'course', label: 'Course', color: '#ffc658' },
  { key: 'accuracy', label: 'Accuracy', color: '#ff7300' },
];

/** 圖表報表頁面 */
export const ChartReportPage: React.FC = () => {
  const { classes } = useStyles();
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>(['speed']);
  const [loading, handleShow] = useReportData(
    async (params: ReportParams, signal) => {
      const res = await getPositions({ deviceId: params.deviceIds[0], from: params.from, to: params.to }, signal);
      setPositions(res.data);
    },
  );

  /** 轉換為 Recharts 資料格式 */
  const chartData = useMemo(
    () =>
      positions.map((p) => {
        const point: Record<string, unknown> = {
          time: p.fixTime ? formatTime(p.fixTime, 'minutes') : '',
        };
        CHART_FIELDS.forEach((f) => {
          point[f.key] = (p as Record<string, unknown>)[f.key] ?? null;
        });
        return point;
      }),
    [positions],
  );

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportChart']}>
      <div className={classes.root}>
        <ReportFilter deviceType="single" onShow={handleShow} loading={loading} />

        <div className={classes.controls}>
          <FormControl size="small" sx={{ minWidth: 300 }}>
            <InputLabel>Chart Fields</InputLabel>
            <Select
              multiple
              value={selectedFields}
              onChange={(e: SelectChangeEvent<string[]>) => setSelectedFields(e.target.value as string[])}
              input={<OutlinedInput label="Chart Fields" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((key) => (
                    <Chip key={key} label={CHART_FIELDS.find((f) => f.key === key)?.label || key} size="small" />
                  ))}
                </Box>
              )}
            >
              {CHART_FIELDS.map((f) => (
                <MenuItem key={f.key} value={f.key}>
                  <Checkbox checked={selectedFields.includes(f.key)} />
                  <ListItemText primary={f.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className={classes.chartContainer}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Brush dataKey="time" height={30} stroke="#8884d8" />
                {CHART_FIELDS.filter((f) => selectedFields.includes(f.key)).map((f) => (
                  <Line
                    key={f.key}
                    type="monotone"
                    dataKey={f.key}
                    stroke={f.color}
                    dot={false}
                    name={f.label}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.secondary' }}>
              {loading ? 'Loading...' : 'Select a device and time range, then click Show'}
            </Box>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
