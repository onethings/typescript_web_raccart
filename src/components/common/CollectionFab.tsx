/**
 * 浮動新增按鈕（FAB）
 *
 * 用於列表頁面右下角的「新增」按鈕。
 * 對應 FRONTME.md 7.19 CollectionFab 章節。
 */

import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

interface CollectionFabProps {
  /** 點擊後導向的路徑 */
  link: string;
  /** 提示文字 */
  title?: string;
}

/** 浮動新增按鈕 */
export const CollectionFab: React.FC<CollectionFabProps> = ({ link, title = 'Add' }) => {
  const navigate = useNavigate();

  return (
    <Tooltip title={title}>
      <Fab
        color="primary"
        onClick={() => navigate(link)}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>
    </Tooltip>
  );
};
