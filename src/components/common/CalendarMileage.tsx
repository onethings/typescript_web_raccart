/**
 * 日曆里程元件
 *
 * 顯示當月每日里程，支援月份切換、資料綬存。
 * 對應 FRONTME.md 日曆里程章節。
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, IconButton, Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';
import { useTranslation } from '../../i18n/LocalizationProvider';
import { useAttributePreference } from '../../utils/preferences';
import { distanceFromMeters } from '../../utils/converter';
import type { ReportSummary } from '../../types/models';

// ==================== 綬存設定 ====================

const CACHE_PREFIX = 'mileage_cache_';
const CACHE_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 天

interface DayCache {
  distance: number;
  cachedAt: number;
}

/** 綬存鍵值（含 deviceId） */
const cacheKey = (year: number, month: number, deviceId?: number): string =>
  `${CACHE_PREFIX}${deviceId ?? 'all'}_${year}_${month}`;

/** 從綬存讀取指定月份的資料 */
const loadCache = (year: number, month: number, deviceId?: number): Record<string, DayCache> => {
  try {
    const raw = localStorage.getItem(cacheKey(year, month, deviceId));
    if (raw) return JSON.parse(raw) as Record<string, DayCache>;
  } catch { /* ignore */ }
  return {};
};

/** 寫入綬存 */
const saveCache = (year: number, month: number, data: Record<string, DayCache>, deviceId?: number) => {
  try {
    localStorage.setItem(cacheKey(year, month, deviceId), JSON.stringify(data));
  } catch { /* ignore */ }
};

// ==================== 樣式 ====================

const useStyles = makeStyles()((theme) => ({
  // 完整面板模式
  container: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  // 工具列模式
  toolbarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    cursor: 'pointer',
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  // 共用
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  monthTitle: {
    fontWeight: 500,
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
  },
  navButton: {
    padding: theme.spacing(0.5),
  },
  list: {
    overflow: 'auto',
    flex: 1,
    maxHeight: 400,
  },
  // 工具列水平日期樣式
  compactScroll: {
    display: 'flex',
    overflow: 'auto',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 0.5),
    '&::-webkit-scrollbar': {
      height: 3,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.divider,
      borderRadius: 2,
    },
  },
  dateItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    padding: theme.spacing(0.3, 0.6),
    borderRadius: theme.shape.borderRadius,
    cursor: 'default',
    backgroundColor: theme.palette.action.hover,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
  dateItemToday: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  dateItemSelected: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    outline: `2px solid ${theme.palette.primary.dark}`,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  dateItemDim: {
    opacity: 0.5,
    '&:hover': {
      opacity: 0.8,
    },
  },
  dateItemDay: {
    fontWeight: 600,
    fontSize: '0.85rem',
    lineHeight: 1.3,
  },
  dateItemMileage: {
    fontSize: '0.65rem',
    lineHeight: 1.2,
    opacity: 0.8,
    whiteSpace: 'nowrap',
  },
  // 完整面板樣式
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  dateNumber: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.3,
    minWidth: 24,
  },
  mileageText: {
    fontSize: '0.75rem',
    lineHeight: 1.3,
    color: theme.palette.text.secondary,
  },
  loadingText: {
    fontSize: '0.75rem',
    lineHeight: 1.3,
    color: theme.palette.text.disabled,
    fontStyle: 'italic',
  },
  noData: {
    textAlign: 'center',
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontSize: '0.85rem',
  },
  errorText: {
    textAlign: 'center',
    padding: theme.spacing(2),
    color: theme.palette.error.main,
    fontSize: '0.85rem',
  },
}));

// ==================== 主元件 ====================

interface CalendarMileageProps {
  /** 精簡模式：水平日期列表直接顯示在 toolbar 上 */
  compact?: boolean;
  /** 指定裝置 ID（為空時彙總所有裝置） */
  deviceId?: number;
  /** 當顯示天數變化時回呼（用於父層判斷是否為完整月份） */
  onDaysChange?: (isFullMonth: boolean) => void;
  /** 點擊某日期時回呼（用於加載該日路線） */
  onDateSelect?: (date: string) => void;
}

/**
 * 日曆里程元件
 * 顯示月曆每日里程（每月 1 號到當日）
 */
export const CalendarMileage: React.FC<CalendarMileageProps> = ({ compact = false, deviceId, onDaysChange, onDateSelect }) => {
  const { classes } = useStyles();
  const t = useTranslation();
  const distanceUnit = useAttributePreference('distanceUnit', 'km');

  const now = dayjs();
  const [viewYear, setViewYear] = useState(now.year());
  const [viewMonth, setViewMonth] = useState(now.month()); // 0-based
  const [cache, setCache] = useState<Record<string, DayCache>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 目前月份的天數（1 ~ 今日 或 月底）
  const today = dayjs();
  const daysInView = useMemo(() => {
    if (viewYear === today.year() && viewMonth === today.month()) {
      return today.date();
    }
    return dayjs(new Date(viewYear, viewMonth + 1, 0)).date();
  }, [viewYear, viewMonth, today]);

  // 通知父層是否為完整月份
  useEffect(() => {
    onDaysChange?.(daysInView > 20);
  }, [daysInView, onDaysChange]);

  // 載入綬存
  useEffect(() => {
    setCache(loadCache(viewYear, viewMonth, deviceId));
  }, [viewYear, viewMonth, deviceId]);

  // 計算需要從 API 請求的天數
  const needFetch = useMemo(() => {
    const result: number[] = [];
    for (let d = 1; d <= daysInView; d += 1) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cached = cache[key];
      if (!cached || Date.now() - cached.cachedAt > CACHE_EXPIRY_MS) {
        result.push(d);
      }
    }
    return result;
  }, [viewYear, viewMonth, daysInView, cache]);

  // 從 API 取得每日里程
  const fetchData = useCallback(async () => {
    if (needFetch.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const from = dayjs(new Date(viewYear, viewMonth, 1)).toISOString();
      const to = dayjs(new Date(viewYear, viewMonth, daysInView)).endOf('day').toISOString();

      // 手動建 URL 避免 axios 序列化問題
      const query = new URLSearchParams({ from, to, daily: 'true' });
      if (deviceId) query.append('deviceId', String(deviceId));
      const response = await fetch(`/api/reports/summary?${query.toString()}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: (ReportSummary & { startTime?: string })[] = await response.json();

      // 依日期彙總里程
      const dailyMap: Record<string, number> = {};
      data.forEach((item) => {
        if (item.startTime && item.distance) {
          const dateKey = dayjs(item.startTime).format('YYYY-MM-DD');
          dailyMap[dateKey] = (dailyMap[dateKey] || 0) + item.distance;
        }
      });

      // 更新綬存
      const newCache = { ...cache };
      needFetch.forEach((d) => {
        const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        newCache[key] = {
          distance: dailyMap[key] || 0,
          cachedAt: Date.now(),
        };
      });
      setCache(newCache);
      saveCache(viewYear, viewMonth, newCache, deviceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mileage data');
    } finally {
      setLoading(false);
    }
  }, [viewYear, viewMonth, daysInView, cache, deviceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 月份名稱（多語言支援，依賴 dayjs locale）
  const monthLabel = dayjs(new Date(viewYear, viewMonth)).format('MMMM');

  // 導航到上個月
  const goPrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  // 導航到下個月（不可超過當月）
  const goNextMonth = useCallback(() => {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    if (nextYear > today.year() || (nextYear === today.year() && nextMonth > today.month())) {
      return; // 不可超過當月
    }
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth, viewYear, today]);

  // 格式化里程
  const formatMileage = (meters: number): string => {
    const value = distanceFromMeters(meters, distanceUnit as 'km' | 'mi' | 'nmi');
    const unitLabel = distanceUnit === 'km' ? 'km' : distanceUnit === 'mi' ? 'mi' : 'nmi';
    return `${Math.round(value)} ${unitLabel}`;
  };

  // 產生日期列表
  const dateRows = useMemo(() => {
    const rows: { day: number; key: string; distance?: number; cached?: boolean }[] = [];
    for (let d = 1; d <= daysInView; d += 1) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cached = cache[key];
      rows.push({
        day: d,
        key,
        distance: cached?.distance,
        cached: !!cached,
      });
    }
    return rows;
  }, [viewYear, viewMonth, daysInView, cache]);

  const showNextArrow = viewYear < today.year() || (viewYear === today.year() && viewMonth < today.month());

  // ====== 工具列精簡模式：水平日期列表 ======
  if (compact) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconButton size="small" className={classes.navButton} onClick={goPrevMonth}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5, whiteSpace: 'nowrap' }}>
            {monthLabel}
          </Typography>
          <IconButton
            size="small"
            className={classes.navButton}
            onClick={goNextMonth}
            disabled={!showNextArrow}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </div>
        <div className={classes.compactScroll}>
          {dateRows.map((row) => {
            const isToday = row.day === today.date() && viewYear === today.year() && viewMonth === today.month();
            const isSelected = selectedDate === row.key;
            let itemClass = classes.dateItem;
            if (isSelected) {
              itemClass = itemClass + ' ' + classes.dateItemSelected;
            } else if (isToday) {
              itemClass = itemClass + ' ' + classes.dateItemDim;
            }
            return (
              <div
                key={row.key}
                className={itemClass}
                onClick={() => {
                  setSelectedDate(row.key);
                  onDateSelect?.(row.key);
                }}
                style={{ cursor: onDateSelect ? 'pointer' : 'default' }}
              >
              <Typography className={classes.dateItemDay}>{row.day}</Typography>
              {row.cached && row.distance !== undefined ? (
                <Typography className={classes.dateItemMileage}>
                  {formatMileage(row.distance)}
                </Typography>
              ) : (
                <Typography className={classes.dateItemMileage} sx={{ opacity: 0.4 }}>
                  {loading ? '...' : '--'}
                </Typography>
              )}
            </div>
          );
        })}
      </div>
      </>
    );
  }

  // ====== 完整面板模式 ======
  return (
    <Paper className={classes.container} elevation={0} square>
      <div className={classes.header}>
        <IconButton size="small" className={classes.navButton} onClick={goPrevMonth}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography className={classes.monthTitle}>{monthLabel}</Typography>
        <IconButton
          size="small"
          className={classes.navButton}
          onClick={goNextMonth}
          disabled={!showNextArrow}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </div>
      <div className={classes.list}>
        {error && <div className={classes.errorText}>{error}</div>}
        {!error && dateRows.length === 0 && (
          <div className={classes.noData}>{t('sharedNoData')}</div>
        )}
        {dateRows.map((row) => (
          <div key={row.key} className={classes.dateRow}>
            <Typography className={classes.dateNumber}>{row.day}</Typography>
            {row.cached && row.distance !== undefined ? (
              <Typography className={classes.mileageText}>
                {formatMileage(row.distance)}
              </Typography>
            ) : (
              <Typography className={classes.loadingText}>
                {loading ? t('sharedLoading') : '\u00a0'}
              </Typography>
            )}
          </div>
        ))}
      </div>
    </Paper>
  );
};

export default CalendarMileage;
