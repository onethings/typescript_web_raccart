/**
 * 應用程式入口點
 * 
 * 渲染階層（由外到內）:
 * ErrorBoundary → Provider (Redux) → LocalizationProvider → AppThemeProvider
 * → CssBaseline → ServerProvider → BrowserRouter → Navigation → ErrorHandler
 * 
 * 對應 FRONTME.md 1. 應用程式進入點 章節。
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import store from './store';
import { LocalizationProvider } from './i18n/LocalizationProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorHandler } from './components/ErrorHandler';
import { ServerProvider } from './components/ServerProvider';
import { AppThemeProvider } from './theme/AppThemeProvider';
import Navigation from './Navigation';
import preloadImages from './map/core/preloadImages';

// 在應用啟動時預載地圖圖示（背景執行，不阻塞渲染）
preloadImages().catch((err) => console.warn('preloadImages failed:', err));

// 隱藏 .loader DOM 元素（由 index.html 定義的 CSS loading spinner）
const hideLoader = () => {
  const loader = document.querySelector<HTMLElement>('.loader');
  if (loader) loader.style.display = 'none';
};

/**
 * 應用程式根元件
 * 組合所有全域 Provider
 */
const AppRoot: React.FC = () => {
  // 元件掛載後隱藏 loader
  React.useEffect(() => { hideLoader(); }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <LocalizationProvider>
          <AppThemeProvider>
            <CssBaseline />
            <ServerProvider>
              <BrowserRouter>
                <Navigation />
              </BrowserRouter>
              <ErrorHandler />
            </ServerProvider>
          </AppThemeProvider>
        </LocalizationProvider>
      </Provider>
    </ErrorBoundary>
  );
};

// 掛載到 DOM
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<AppRoot />);
}
