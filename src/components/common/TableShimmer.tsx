/**
 * 表格骨架載入元件
 *
 * 表格載入中顯示 3 行骨架。
 * 對應 FRONTME.md 12.23 TableShimmer 章節。
 */

import React from 'react';
import { TableRow, TableCell, Skeleton } from '@mui/material';

interface TableShimmerProps {
  /** 表格欄位數 */
  columns: number;
  /** 骨架行數 */
  rows?: number;
}

/** 表格骨架載入 */
export const TableShimmer: React.FC<TableShimmerProps> = ({ columns, rows = 3 }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <TableRow key={rowIdx}>
        {Array.from({ length: columns }).map((_, colIdx) => (
          <TableCell key={colIdx}>
            <Skeleton width={colIdx === 0 ? '60%' : '80%'} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);
