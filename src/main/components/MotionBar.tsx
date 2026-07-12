/**
 * 運動狀態條元件
 *
 * 顯示裝置過去 24 小時的移動（綠色）/停止（紅色）時間條。
 * 對應 FRONTME.md 5.4 MotionBar 章節。
 */

import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { useAppSelector } from '../../hooks/useAppStore';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'inline-flex',
    width: theme.spacing(16),
    height: theme.spacing(1),
    backgroundColor: theme.palette.action.disabledBackground,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  moving: {
    backgroundColor: theme.palette.success.light,
    transition: 'flex-grow 0.3s ease',
  },
  stopped: {
    backgroundColor: theme.palette.error.light,
    transition: 'flex-grow 0.3s ease',
  },
}));

interface MotionBarProps {
  /** 裝置 ID */
  deviceId: number;
}

/**
 * 運動狀態條
 * 顯示裝置在過去 24 小時內的移動/停止比例
 */
export const MotionBar: React.FC<MotionBarProps> = ({ deviceId }) => {
  const { classes } = useStyles();
  const segments = useAppSelector((state) => state.motion?.items?.[deviceId] || []);

  if (segments.length === 0) {
    return <span className={classes.root} />;
  }

  return (
    <span className={classes.root}>
      {segments.map((segment, index) => (
        <span
          key={index}
          style={{
            flexGrow: segment.value,
            minWidth: segments.length > 16 ? 0 : 4,
          }}
          className={segment.type === 'moving' ? classes.moving : classes.stopped}
        />
      ))}
    </span>
  );
};
