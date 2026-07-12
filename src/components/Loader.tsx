/**
 * 載入中元件
 * 
 * 顯示/隱藏 DOM spinner。
 * 對應 FRONTME.md Loader 章節。
 */

import React, { useEffect } from 'react';

/**
 * 載入中指示器
 * 控制 document 中的 .loader 元素顯示
 */
export const Loader: React.FC = () => {
  useEffect(() => {
    const loader = document.querySelector('.loader') as HTMLElement | null;
    if (loader) {
      loader.style.display = '';
    }
    return () => {
      if (loader) {
        loader.style.display = 'none';
      }
    };
  }, []);

  return null;
};
