/**
 * RTL 感知返回箭頭
 * 對應 FRONTME.md 12.2 BackIcon 章節。
 */

import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLocalization } from '../../i18n/LocalizationProvider';

/** RTL 感知的返回箭頭圖示 */
export const BackIcon: React.FC = () => {
  const { direction } = useLocalization();
  return direction === 'rtl' ? <ArrowForwardIcon /> : <ArrowBackIcon />;
};
