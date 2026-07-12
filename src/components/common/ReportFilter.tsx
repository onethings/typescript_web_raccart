/**
 * 通用報表篩選器
 *
 * 提供裝置/群組選擇、時間區段、匯出/排程按鈕。
 * 對應 FRONTME.md 8.2 ReportFilter 章節。
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import dayjs from 'dayjs';
import { useAppSelector } from '../../hooks/useAppStore';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { SelectField } from './SelectField';
import { SplitButton } from './SplitButton';
import type { ExportFormat, ReportParams } from '../../types/ui';

const useStyles = makeStyles()((theme) => ({
  filter: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    alignItems: 'center',
  },
  filterItem: {
    minWidth: 200,
    flex: 1,
  },
}));

/** 時間區段選項 */
type PeriodOption = 'today' | 'yesterday' | 'thisWeek' | 'previousWeek' | 'thisMonth' | 'previousMonth' | 'custom';

interface ReportFilterProps {
  /** 裝置類型: 'single' | 'multiple' | 'none' */
  deviceType?: 'single' | 'multiple' | 'none';
  /** 顯示報表回呼 */
  onShow: (params: ReportParams) => void;
  /** 匯出報表回呼 */
  onExport?: (params: ReportParams & { format: ExportFormat }) => void;
  /** 排程報表回呼 */
  onSchedule?: (deviceIds: number[], groupIds: number[], schedule: { description?: string; calendarId?: number; attributes?: Record<string, unknown> }) => void;
  /** 載入中 */
  loading?: boolean;
  /** 可用匯出格式 */
  formats?: ExportFormat[];
  /** 子元件 */
  children?: React.ReactNode;
}

/**
 * 通用報表篩選器
 */
export const ReportFilter: React.FC<ReportFilterProps> = ({
  deviceType = 'single',
  onShow,
  onExport,
  onSchedule,
  loading = false,
  formats = ['xlsx', 'csv', 'gpx', 'kml', 'kmz'],
  children,
}) => {
  const { classes } = useStyles();
  const t = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const devices = useAppSelector((state) => state.devices.items);
  const groups = useAppSelector((state) => state.groups.items);

  const deviceList = useMemo(
    () => [
      ...(deviceType === 'multiple' ? [{ id: 'all' as const, name: t('notificationAlways') }] : []),
      ...Object.values(devices).sort((a, b) => a.name.localeCompare(b.name)).map((d) => ({ id: d.id, name: d.name })),
    ],
    [devices, t, deviceType],
  );

  const groupList = useMemo(
    () => Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)),
    [groups],
  );

  const deviceIds: (number | 'all')[] = useMemo(
    () => searchParams.getAll('deviceId').map((it) => (it === 'all' ? 'all' : Number(it))),
    [searchParams],
  );
  const groupIds: number[] = useMemo(() => searchParams.getAll('groupId').map(Number), [searchParams]);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const [period, setPeriod] = useState<PeriodOption>('today');
  const [customFrom, setCustomFrom] = useState(() => dayjs().subtract(1, 'hour').format('YYYY-MM-DDTHH:mm'));
  const [customTo, setCustomTo] = useState(() => dayjs().format('YYYY-MM-DDTHH:mm'));

  const disabled = deviceType === 'single' && !deviceIds.length ||
    deviceType === 'multiple' && !deviceIds.length && !groupIds.length;

  /** 顯示報表 */
  const showReport = useCallback(() => {
    let selectedFrom: dayjs.Dayjs;
    let selectedTo: dayjs.Dayjs;

    switch (period) {
      case 'today':
        selectedFrom = dayjs().startOf('day');
        selectedTo = dayjs().endOf('day');
        break;
      case 'yesterday':
        selectedFrom = dayjs().subtract(1, 'day').startOf('day');
        selectedTo = dayjs().subtract(1, 'day').endOf('day');
        break;
      case 'thisWeek':
        selectedFrom = dayjs().startOf('week');
        selectedTo = dayjs().endOf('week');
        break;
      case 'previousWeek':
        selectedFrom = dayjs().subtract(1, 'week').startOf('week');
        selectedTo = dayjs().subtract(1, 'week').endOf('week');
        break;
      case 'thisMonth':
        selectedFrom = dayjs().startOf('month');
        selectedTo = dayjs().endOf('month');
        break;
      case 'previousMonth':
        selectedFrom = dayjs().subtract(1, 'month').startOf('month');
        selectedTo = dayjs().subtract(1, 'month').endOf('month');
        break;
      default:
        selectedFrom = dayjs(customFrom);
        selectedTo = dayjs(customTo);
    }

    const newParams = new URLSearchParams(searchParams);
    newParams.set('from', selectedFrom.toISOString());
    newParams.set('to', selectedTo.toISOString());
    setSearchParams(newParams, { replace: true });
  }, [period, customFrom, customTo, searchParams, setSearchParams]);

  // URL 參數變更時自動觸發查詢
  useEffect(() => {
    if (fromParam && toParam) {
      onShow({
        deviceIds: deviceIds.filter((id): id is number => id !== 'all'),
        groupIds,
        from: fromParam,
        to: toParam,
      });
    }
  }, [deviceIds, groupIds, fromParam, toParam]);

  return (
    <div className={classes.filter}>
      {deviceType !== 'none' && (
        <div className={classes.filterItem}>
          <SelectField
            label={t('reportDevice')}
            data={deviceList}
            value={deviceType === 'multiple' ? deviceIds : deviceIds[0]}
            onChange={(val) => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('deviceId');
              newParams.delete('from');
              newParams.delete('to');
              if (deviceType === 'multiple' && Array.isArray(val)) {
                val.forEach((v) => newParams.append('deviceId', String(v)));
              } else if (val != null) {
                newParams.set('deviceId', String(val));
              }
              setSearchParams(newParams, { replace: true });
            }}
            multiple={deviceType === 'multiple'}
            includeAll={deviceType === 'multiple'}
          />
        </div>
      )}
      <FormControl size="small" className={classes.filterItem}>
        <InputLabel>Period</InputLabel>
        <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value as PeriodOption)}>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="yesterday">Yesterday</MenuItem>
          <MenuItem value="thisWeek">This Week</MenuItem>
          <MenuItem value="previousWeek">Previous Week</MenuItem>
          <MenuItem value="thisMonth">This Month</MenuItem>
          <MenuItem value="previousMonth">Previous Month</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
        </Select>
      </FormControl>
      {period === 'custom' && (
        <>
          <TextField size="small" type="datetime-local" label="From" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" type="datetime-local" label="To" value={customTo} onChange={(e) => setCustomTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        </>
      )}
      <SplitButton
        options={{
          json: t('reportShow'),
          ...(onExport ? Object.fromEntries(formats.map((f) => [f, `${t('reportExport')} (${f.toUpperCase()})`])) : {}),
          print: t('reportPrint'),
        }}
        onClick={(type) => {
          if (type === 'json') showReport();
          else if (type === 'print') window.print();
          else if (onExport) onExport({ deviceIds: deviceIds.filter((id): id is number => id !== 'all'), groupIds, from: fromParam || '', to: toParam || '', format: type as ExportFormat });
        }}
        disabled={disabled || loading}
      />
      {children}
    </div>
  );
};
