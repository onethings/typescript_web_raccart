/**
 * 運動控制器
 *
 * 計算裝置過去 24 小時的移動/停止分段資料。
 * 對應 FRONTME.md 17.3 MotionController 與 5.4 MotionBar 章節。
 */

import React from 'react';
import dayjs from 'dayjs';
import { useAppDispatch } from '../hooks/useAppStore';
import { motionActions } from '../store';
import { useAttributePreference } from '../utils/preferences';
import { useAsyncTask } from '../hooks/useAsyncTask';
import type { MotionSegment } from '../types/ui';
import type { Event } from '../types/models';

/**
 * 建立運動分段
 * 將事件轉換為時間分段
 */
const buildSegments = (
  events: Event[],
  fromTimestamp: number,
  toTimestamp: number,
): MotionSegment[] => {
  const segments: MotionSegment[] = [];
  let cursor = fromTimestamp;
  const firstEvent = events.length > 0 ? events[0] : null;
  let state: 'moving' | 'stopped' = 'stopped';

  if (firstEvent && firstEvent.type === 'deviceStopped') {
    state = 'moving';
  }

  events.forEach((event) => {
    const timestamp = dayjs(event.eventTime).valueOf();
    const clampedTimestamp = Math.max(fromTimestamp, Math.min(toTimestamp, timestamp));
    if (clampedTimestamp > cursor) {
      segments.push({ type: state, value: clampedTimestamp - cursor });
    }
    state = event.type === 'deviceMoving' ? 'moving' : 'stopped';
    cursor = clampedTimestamp;
  });

  if (toTimestamp > cursor) {
    segments.push({ type: state, value: toTimestamp - cursor });
  }

  if (segments.length === 0) {
    return [{ type: 'stopped', value: 1 }];
  }

  return segments;
};

/** 運動控制器 */
export const MotionController: React.FC = () => {
  const dispatch = useAppDispatch();
  const deviceSecondary = useAttributePreference('deviceSecondary', '');

  useAsyncTask(
    async ({ signal }) => {
      if (deviceSecondary !== 'motion') {
        dispatch(motionActions.clear());
        return;
      }

      let active = true;

      const refreshMotion = async () => {
        const to = dayjs();
        const from = to.subtract(24, 'hour');
        const query = new URLSearchParams({
          from: from.toISOString(),
          to: to.toISOString(),
        });
        query.append('type', 'deviceMoving');
        query.append('type', 'deviceStopped');

        const response = await fetch(`/api/reports/events?${query.toString()}`, {
          headers: { Accept: 'application/json' },
          signal,
        });
        const events: Event[] = await response.json();

        const groupedEvents: Record<number, Event[]> = {};
        events.forEach((event) => {
          if (event.deviceId != null) {
            if (!groupedEvents[event.deviceId]) {
              groupedEvents[event.deviceId] = [];
            }
            groupedEvents[event.deviceId].push(event);
          }
        });

        const nextMotion: Record<number, MotionSegment[]> = {};
        Object.entries(groupedEvents).forEach(([deviceId, deviceEvents]) => {
          nextMotion[Number(deviceId)] = buildSegments(
            deviceEvents,
            from.valueOf(),
            to.valueOf(),
          );
        });

        if (active) {
          dispatch(motionActions.set(nextMotion));
        }
      };

      await refreshMotion();
      const interval = setInterval(refreshMotion, 5 * 60 * 1000);

      return () => {
        active = false;
        clearInterval(interval);
      };
    },
    [deviceSecondary, dispatch],
  );

  return null;
};
