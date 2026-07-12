/**
 * App 主題提供者
 * 
 * 根據伺服器設定、深色模式偏好、語系方向動態建立 MUI 主題。
 * 對應 FRONTME.md 15.4 AppThemeProvider 章節。
 */

import React, { useMemo } from 'react';
import { ThemeProvider, useMediaQuery } from '@mui/material';
import { useAppSelector } from '../hooks/useAppStore';
import { useLocalization } from '../i18n/LocalizationProvider';
import { createAppTheme } from './theme';

/**
 * 應用程式主題提供者
 * 包裹整個應用，提供動態主題
 */
export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const server = useAppSelector((state) => state.session.server);
  const { direction } = useLocalization();

  const serverDarkMode = server?.attributes?.darkMode as boolean | undefined;
  const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkMode = serverDarkMode !== undefined ? serverDarkMode : preferDarkMode;

  const theme = useMemo(
    () => createAppTheme(server, darkMode, direction),
    [server, darkMode, direction],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
