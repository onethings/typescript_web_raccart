/**
 * 簡易導航列元件
 *
 * 用於非主頁面的頂部 AppBar 導航。
 * 對應 FRONTME.md 12.13 NavBar 章節。
 */

import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { BackIcon } from './BackIcon';

interface NavBarProps {
  title: string;
  backNavigate?: string;
  children?: React.ReactNode;
}

/**
 * 簡易導航列
 * 返回按鈕 + 標題 + 自訂操作按鈕
 */
export const NavBar: React.FC<NavBarProps> = ({ title, backNavigate, children }) => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <IconButton edge="start" onClick={() => navigate(backNavigate ?? -1 as unknown as string)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
          {title}
        </Typography>
        {children}
      </Toolbar>
    </AppBar>
  );
};
