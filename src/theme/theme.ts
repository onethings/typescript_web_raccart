/**
 * MUI 主題設定
 * 
 * 支援深色模式、自訂主要色、次要色、RTL。
 * 對應 FRONTME.md 15. 主題與樣式 章節。
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';
import { grey, green, indigo } from '@mui/material/colors';
import type { Server } from '../types/models';
import type { ThemeDimensions } from '../types/ui';

// ==================== 尺寸定義 ====================

/** 主題尺寸常數 */
export const dimensions: ThemeDimensions = {
  sidebarWidth: '28%',
  sidebarWidthTablet: '52px',
  drawerWidthDesktop: '360px',
  drawerWidthTablet: '320px',
  drawerHeightPhone: '250px',
  filterFormWidth: '160px',
  eventsDrawerWidth: '320px',
  bottomBarHeight: 56,
  popupMapOffset: 300,
  popupMaxWidth: 288,
  popupImageHeight: 144,
  cardContentMaxHeight: '40vh',
  qrCodeSize: 192,
};

// ==================== 顏色驗證 ====================

const validatedColor = (color: string | undefined | null): string | null =>
  color && /^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null;

// ==================== 主題工廠 ====================

/**
 * 建立 MUI 主題
 * 
 * @param server - 伺服器設定（含 colorPrimary/colorSecondary/darkMode）
 * @param darkMode - 是否深色模式
 * @param direction - 文字方向
 * @returns MUI theme 物件
 */
export const createAppTheme = (
  server: Server | null,
  darkMode: boolean,
  direction: 'ltr' | 'rtl',
) => {
  const palette: ThemeOptions['palette'] = {
    mode: darkMode ? 'dark' : 'light',
    background: {
      default: darkMode ? grey[900] : grey[50],
    },
    primary: {
      main: validatedColor(server?.attributes?.colorPrimary as string) ||
        (darkMode ? indigo[200] : indigo[900]),
    },
    secondary: {
      main: validatedColor(server?.attributes?.colorSecondary as string) ||
        (darkMode ? green[200] : green[800]),
    },
    neutral: {
      main: grey[500],
    },
    geometry: {
      main: '#1976d2',
    },
    alwaysDark: {
      main: darkMode ? '#ffffff' : '#000000',
    },
  };

  return createTheme({
    typography: {
      fontFamily: 'Roboto, Segoe UI, Helvetica Neue, Arial, sans-serif',
    },
    palette,
    direction,
    dimensions,
  } as ThemeOptions & { dimensions: ThemeDimensions });
};

/**
 * 擴充 MUI 主題以支援自訂屬性
 */
declare module '@mui/material/styles' {
  interface Theme {
    dimensions: ThemeDimensions;
  }
  interface Palette {
    neutral: Palette['primary'];
    geometry: Palette['primary'];
    alwaysDark: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
    geometry?: PaletteOptions['primary'];
    alwaysDark?: PaletteOptions['primary'];
  }
}
