/**
 * 排程報表輔助函式
 *
 * 建立/更新/刪除排程報表。
 * 對應 FRONTME.md 8.3 scheduleReport 章節。
 */

import { getScheduledReports, createScheduledReport, updateScheduledReport, deleteScheduledReport } from '../../api/endpoints';
import type { ScheduledReport } from '../../types/models';

export interface ScheduleReportParams {
  type: string;
  deviceId?: number;
  groupId?: number;
  period: string;
  email: boolean;
  web: boolean;
}

/**
 * 建立排程報表
 */
export const createSchedule = async (params: ScheduleReportParams): Promise<ScheduledReport> => {
  const res = await createScheduledReport(params);
  return res.data;
};

/**
 * 更新排程報表
 */
export const updateSchedule = async (id: number, params: Partial<ScheduleReportParams>): Promise<ScheduledReport> => {
  const res = await updateScheduledReport(id, params);
  return res.data;
};

/**
 * 刪除排程報表
 */
export const removeSchedule = async (id: number): Promise<void> => {
  await deleteScheduledReport(id);
};

/**
 * 取得所有排程報表
 */
export const getSchedules = async (): Promise<ScheduledReport[]> => {
  const res = await getScheduledReports();
  return res.data;
};
