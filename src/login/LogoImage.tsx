/**
 * Logo 圖片元件
 *
 * 顯示 Traccar 品牌 Logo。
 * 對應 FRONTME.md 3.6 LogoImage 章節。
 */

import React from 'react';
import { Box } from '@mui/material';
import logoSvg from '../resources/images/logo.svg';

interface LogoImageProps {
  /** Logo 高度，預設 40 */
  height?: number;
}

/**
 * Logo 圖片
 * 顯示 Traccar 品牌標誌
 */
export const LogoImage: React.FC<LogoImageProps> = ({ height = 40 }) => (
  <Box
    component="img"
    src={logoSvg}
    alt="Traccar"
    sx={{ height, width: 'auto', objectFit: 'contain' }}
  />
);
