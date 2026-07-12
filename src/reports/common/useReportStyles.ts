/**
 * 報表頁面共用樣式 Hook
 *
 * 提供報表頁面一致的 CSS-in-JS 樣式。
 * 對應 FRONTME.md 8.3 useReportStyles 章節。
 */

import { makeStyles } from 'tss-react/mui';

/**
 * 報表頁面共用樣式 Hook
 * 提供地圖、表格、篩選面板的標準間距與版面
 */
export const useReportStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: theme.spacing(1),
  },
  filterSection: {
    flexShrink: 0,
  },
  mapContainer: {
    flex: 1,
    minHeight: 200,
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
  },
  tableContainer: {
    flexShrink: 0,
    maxHeight: 300,
    overflow: 'auto',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  splitContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    gap: theme.spacing(0.5),
  },
  summaryCards: {
    display: 'flex',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
    '& > *': {
      flex: '1 1 160px',
      minWidth: 140,
    },
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    color: theme.palette.text.secondary,
  },
}));
